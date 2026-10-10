"""
Automated Verification Suite for FemCare Subscription Status and Awareness Page Access Control.
Tests all 10 required scenarios:
1. New user signs up -> no purchased paid plan.
2. New user opens Awareness -> free content is accessible.
3. New user tries to open premium-only content -> access is restricted (403 Forbidden).
4. User with a verified active eligible subscription -> permitted premium content is accessible (200 OK).
5. User with an expired subscription -> premium access is denied (403 Forbidden).
6. User with a pending or failed payment -> premium access is denied (403 Forbidden).
7. User logs out and another user logs in -> subscription state does not leak between accounts.
8. User refreshes the page -> subscription status remains correct.
9. Existing legitimate paid users retain their valid access.
10. Direct backend requests cannot bypass premium restrictions (server-side verification).
"""

import sys
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from pymongo import MongoClient
from unittest.mock import patch

from main import app, supabase
from payment_service import get_active_entitlement, get_latest_subscription

client = TestClient(app)

results = []

def record(scenario_num, name, passed, detail=""):
    results.append((scenario_num, name, passed, detail))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] Scenario {scenario_num}: {name}")
    if detail:
        print(f"       -> {detail}")

def cleanup_user(email: str):
    try:
        mc = MongoClient("mongodb://127.0.0.1:27017/femcare", serverSelectionTimeoutMS=2000)
        mc["femcare"].users.delete_many({"email": email.lower()})
    except Exception as e:
        print(f"Cleanup warning: {e}")

print("\n" + "="*70)
print("RUNNING FEMCARE SUBSCRIPTION & AWARENESS ACCESS CONTROL TEST SUITE")
print("="*70 + "\n")

# Scenario 1: New user signs up -> no purchased paid plan.
user1_email = f"scenario1_newuser_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user1_email)

res_signup = client.post("/api/auth/signup", json={
    "email": user1_email,
    "password": "StrongPassword123!",
    "name": "New Free User",
    "age": 24,
    "cycleLength": 28
})
user1_cookie = client.cookies.get("femcare_session")
signup_ok = res_signup.status_code == 200
user_data = res_signup.json().get("user", {})

# Check /api/subscriptions/me for newly registered user
res_sub_me = client.get("/api/subscriptions/me")
sub_me_data = res_sub_me.json() if res_sub_me.status_code == 200 else {}
entitlement = sub_me_data.get("entitlement")
latest_sub = sub_me_data.get("latest_subscription")

scenario1_passed = (
    signup_ok and
    res_sub_me.status_code == 200 and
    entitlement is None and
    latest_sub is None and
    user_data.get("is_premium") in (False, None)
)
record(1, "New user signs up -> no purchased paid plan", scenario1_passed,
       f"Signup code: {res_signup.status_code}, entitlement: {entitlement}, latest: {latest_sub}")

# Scenario 2: New user opens Awareness -> free content is accessible.
res_conditions = client.get("/api/awareness/conditions")
cond_data = res_conditions.json() if res_conditions.status_code == 200 else {}
conditions_list = cond_data.get("conditions", [])

res_access_status = client.get("/api/awareness/access-status")
access_data = res_access_status.json() if res_access_status.status_code == 200 else {}

scenario2_passed = (
    res_conditions.status_code == 200 and
    len(conditions_list) >= 4 and
    res_access_status.status_code == 200 and
    access_data.get("has_premium_access") is False
)
record(2, "New user opens Awareness -> free overview content is accessible", scenario2_passed,
       f"Conditions count: {len(conditions_list)}, has_premium_access: {access_data.get('has_premium_access')}")

# Scenario 3: New user tries to open premium-only content -> access is restricted (403 Forbidden).
res_premium_pcos = client.get("/api/awareness/conditions/pcos/details")
scenario3_passed = (
    res_premium_pcos.status_code == 403 and
    "Premium subscription required" in res_premium_pcos.json().get("detail", "")
)
record(3, "New user tries to open premium-only content -> 403 Forbidden with upgrade prompt", scenario3_passed,
       f"Status: {res_premium_pcos.status_code}, Detail: {res_premium_pcos.json().get('detail')}")

# Scenario 4: User with a verified active eligible subscription -> permitted premium content is accessible.
# Purchase a Monthly plan via demo checkout for user1
res_checkout = client.post("/api/subscriptions/demo/checkout", json={"plan": "monthly"})
checkout_ok = res_checkout.status_code == 200

res_sub_after_purchase = client.get("/api/subscriptions/me")
sub_after_data = res_sub_after_purchase.json() if res_sub_after_purchase.status_code == 200 else {}
active_entitlement = sub_after_data.get("entitlement")

res_premium_after_purchase = client.get("/api/awareness/conditions/pcos/details")
pcos_detail = res_premium_after_purchase.json().get("condition", {}) if res_premium_after_purchase.status_code == 200 else {}

scenario4_passed = (
    checkout_ok and
    active_entitlement is not None and
    active_entitlement.get("subscription_status") == "active" and
    active_entitlement.get("payment_status") == "paid" and
    res_premium_after_purchase.status_code == 200 and
    "symptoms" in pcos_detail and
    "treatment" in pcos_detail
)
record(4, "User with verified active subscription -> permitted premium content accessible", scenario4_passed,
       f"Status: {res_premium_after_purchase.status_code}, Plan: {active_entitlement.get('plan_type') if active_entitlement else None}")

# Scenario 5: User with an expired subscription -> premium access is denied.
# Mock get_active_entitlement to return None and latest_subscription to show expired
past_date = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
expired_sub_mock = {
    "subscription": "premium",
    "plan_type": "monthly",
    "provider": "razorpay",
    "payment_status": "paid",
    "subscription_status": "expired",
    "activated_at": (datetime.now(timezone.utc) - timedelta(days=35)).isoformat(),
    "expires_at": past_date
}

with patch("main.get_active_entitlement", return_value=None), \
     patch("main.get_latest_subscription", return_value=expired_sub_mock):
    res_sub_expired = client.get("/api/subscriptions/me")
    res_prem_expired = client.get("/api/awareness/conditions/pcos/details")
    res_status_expired = client.get("/api/awareness/access-status")

    scenario5_passed = (
        res_sub_expired.status_code == 200 and
        res_sub_expired.json().get("entitlement") is None and
        res_prem_expired.status_code == 403 and
        res_status_expired.json().get("has_premium_access") is False
    )
    record(5, "User with an expired subscription -> premium access denied (403)", scenario5_passed,
           f"Sub entitlement: {res_sub_expired.json().get('entitlement')}, Details code: {res_prem_expired.status_code}")

# Scenario 6: User with a pending or failed payment -> premium access is denied.
failed_payment_mock = {
    "plan_type": "monthly",
    "provider": "razorpay",
    "payment_status": "failed",
    "subscription_status": "pending",
    "activated_at": None,
    "expires_at": None
}

with patch("main.get_active_entitlement", return_value=None), \
     patch("main.get_latest_subscription", return_value=failed_payment_mock):
    res_sub_failed = client.get("/api/subscriptions/me")
    res_prem_failed = client.get("/api/awareness/conditions/pcos/details")

    scenario6_passed = (
        res_sub_failed.status_code == 200 and
        res_sub_failed.json().get("entitlement") is None and
        res_prem_failed.status_code == 403
    )
    record(6, "User with pending or failed payment -> premium access denied (403)", scenario6_passed,
           f"Sub entitlement: {res_sub_failed.json().get('entitlement')}, Details code: {res_prem_failed.status_code}")

# Scenario 7: User logs out and another user logs in -> subscription state does not leak between accounts.
# Logout user 1
res_logout = client.post("/api/auth/logout")

# Create user 2 (fresh free user)
user2_email = f"scenario7_freeuser_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user2_email)

res_signup2 = client.post("/api/auth/signup", json={
    "email": user2_email,
    "password": "StrongPassword123!",
    "name": "Second Free User"
})

res_sub_user2 = client.get("/api/subscriptions/me")
res_prem_user2 = client.get("/api/awareness/conditions/pcos/details")

scenario7_passed = (
    res_logout.status_code == 200 and
    res_sub_user2.json().get("entitlement") is None and
    res_prem_user2.status_code == 403
)
record(7, "User logs out and another user logs in -> zero state leakage", scenario7_passed,
       f"User2 sub: {res_sub_user2.json().get('entitlement')}, User2 premium code: {res_prem_user2.status_code}")

# Scenario 8: User refreshes the page -> subscription status remains correct.
res_refresh1 = client.get("/api/subscriptions/me")
res_refresh2 = client.get("/api/subscriptions/me")
res_refresh3 = client.get("/api/subscriptions/me")

scenario8_passed = (
    res_refresh1.status_code == 200 and
    res_refresh2.status_code == 200 and
    res_refresh3.status_code == 200 and
    res_refresh1.json() == res_refresh2.json() == res_refresh3.json()
)
record(8, "User refreshes the page -> subscription status remains consistent", scenario8_passed,
       f"Refreshes consistent: {scenario8_passed}")

# Scenario 9: Existing legitimate paid users retain their valid access.
# Verify that active entitlement logic preserves genuine subscriptions
future_date = (datetime.now(timezone.utc) + timedelta(days=200)).isoformat()
active_sub_mock = {
    "subscription": "premium",
    "plan_type": "annual",
    "provider": "razorpay",
    "payment_status": "paid",
    "subscription_status": "active",
    "activated_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
    "expires_at": future_date
}

with patch("main.get_active_entitlement", return_value=active_sub_mock):
    res_sub_active = client.get("/api/subscriptions/me")
    res_prem_active = client.get("/api/awareness/conditions/endometriosis/details")

    scenario9_passed = (
        res_sub_active.status_code == 200 and
        res_sub_active.json().get("entitlement") is not None and
        res_sub_active.json()["entitlement"]["plan_type"] == "annual" and
        res_prem_active.status_code == 200 and
        res_prem_active.json().get("condition", {}).get("name") == "Endometriosis"
    )
    record(9, "Existing legitimate paid users retain their valid access", scenario9_passed,
           f"Plan: {res_sub_active.json().get('entitlement', {}).get('plan_type')}, Endometriosis code: {res_prem_active.status_code}")

# Scenario 10: Direct backend requests cannot bypass premium restrictions.
# Make direct requests with no session cookies
unauth_client = TestClient(app)
res_direct_no_cookie = unauth_client.get("/api/awareness/conditions/pcos/details")

# Make direct request with spoofed client headers trying to bypass premium
res_direct_spoofed = unauth_client.get(
    "/api/awareness/conditions/pcos/details",
    headers={
        "X-Subscription-Plan": "annual",
        "X-Is-Premium": "true",
        "X-User-Role": "admin"
    }
)

scenario10_passed = (
    res_direct_no_cookie.status_code in (401, 403) and
    res_direct_spoofed.status_code in (401, 403)
)
record(10, "Direct backend requests cannot bypass restrictions (headers spoof ignored)", scenario10_passed,
       f"No cookie code: {res_direct_no_cookie.status_code}, Spoofed header code: {res_direct_spoofed.status_code}")

# Cleanup test accounts
cleanup_user(user1_email)
cleanup_user(user2_email)

print("\n" + "="*70)
total_tests = len(results)
passed_tests = sum(1 for r in results if r[2])
print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} SCENARIOS PASSED")
print("="*70 + "\n")

if passed_tests != total_tests:
    sys.exit(1)
else:
    print("ALL 10 SUBSCRIPTION & ACCESS CONTROL SCENARIOS SUCCESSFULLY VERIFIED!")
    sys.exit(0)
