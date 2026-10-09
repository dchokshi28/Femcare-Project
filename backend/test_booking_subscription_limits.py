"""
Comprehensive Automated Test Suite for FemCare Free Booking Slot & Subscription Limits.
Validates all 9 required scenarios:
1. New user with no bookings -> first booking succeeds for free.
2. Same user -> second booking is blocked and upgrade prompt appears (403 Forbidden).
3. Different new user -> first booking succeeds for free (independent allowance).
4. User with an eligible active subscription -> additional booking follows plan limits.
5. User with an expired or failed subscription -> additional booking is blocked (403 Forbidden).
6. User refreshes or logs in again -> previous booking usage remains recorded.
7. User attempts to bypass the limit through a direct API request -> backend rejects it.
8. Two simultaneous booking requests cannot both bypass the free limit.
9. Existing bookings and provider availability remain intact.
"""

import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
from fastapi.testclient import TestClient
from pymongo import MongoClient

from main import app, supabase, resolve_supabase_profile_id

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
        user_doc = mc["femcare"].users.find_one({"email": email.lower()})
        if user_doc and supabase:
            uid = resolve_supabase_profile_id(user_doc)
            # Remove test bookings for this test user
            supabase.table("bookings").delete().eq("user_id", uid).execute()
        mc["femcare"].users.delete_many({"email": email.lower()})
    except Exception as e:
        print(f"Cleanup note: {e}")

print("\n" + "="*70)
print("RUNNING FEMCARE BOOKING SUBSCRIPTION LIMITS TEST SUITE")
print("="*70 + "\n")

target_date = (date.today() + timedelta(days=2)).isoformat()
provider_id = "vadodara-1"

# ── SCENARIO 1: New user with no bookings -> first booking succeeds for free ─
user1_email = f"book_test_user1_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user1_email)

res_u1_signup = client.post("/api/auth/signup", json={
    "email": user1_email,
    "password": "StrongPassword123!",
    "name": "Booking User One"
})
signup_u1_ok = res_u1_signup.status_code == 200

res_u1_eligibility = client.get("/api/booking-eligibility")
el_data1 = res_u1_eligibility.json() if res_u1_eligibility.status_code == 200 else {}

res_u1_book1 = client.post("/api/book-appointment", json={
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "09:00 AM",
    "phone": "+91 98765 43210",
    "notes": "First free booking test"
})
u1_book1_ok = res_u1_book1.status_code == 200 and res_u1_book1.json().get("success") is True

scenario1_passed = (
    signup_u1_ok and
    el_data1.get("can_book") is True and
    el_data1.get("free_booking_used") is False and
    u1_book1_ok
)
record(1, "New user with no bookings -> first booking succeeds for free", scenario1_passed,
       f"Signup: {res_u1_signup.status_code}, Eligibility can_book: {el_data1.get('can_book')}, Booking: {res_u1_book1.status_code}")

# ── SCENARIO 2: Same user -> second booking is blocked with upgrade prompt ──
res_u1_book2 = client.post("/api/book-appointment", json={
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "09:30 AM",
    "phone": "+91 98765 43210",
    "notes": "Attempt second booking on free tier"
})
detail_u1_book2 = res_u1_book2.json().get("detail", "") if res_u1_book2.status_code != 200 else ""

scenario2_passed = (
    res_u1_book2.status_code == 403 and
    "free booking has been used" in detail_u1_book2.lower()
)
record(2, "Same user -> second booking is blocked and upgrade prompt returned (403)", scenario2_passed,
       f"Status: {res_u1_book2.status_code}, Detail: '{detail_u1_book2}'")

# ── SCENARIO 3: Different new user -> first booking succeeds for free ────────
user2_client = TestClient(app)
user2_email = f"book_test_user2_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user2_email)

res_u2_signup = user2_client.post("/api/auth/signup", json={
    "email": user2_email,
    "password": "StrongPassword123!",
    "name": "Booking User Two"
})

res_u2_book1 = user2_client.post("/api/book-appointment", json={
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "10:00 AM",
    "phone": "+91 98765 43211",
    "notes": "User 2 first free booking"
})
u2_book1_ok = res_u2_book1.status_code == 200 and res_u2_book1.json().get("success") is True

scenario3_passed = (
    res_u2_signup.status_code == 200 and
    u2_book1_ok
)
record(3, "Different new user -> first booking succeeds for free (independent allowance)", scenario3_passed,
       f"User2 signup: {res_u2_signup.status_code}, User2 booking: {res_u2_book1.status_code}")

# ── SCENARIO 4: User with an eligible active subscription -> additional booking allowed ──
future_expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
active_entitlement_mock = {
    "subscription": "premium",
    "plan_type": "monthly",
    "provider": "razorpay",
    "payment_status": "paid",
    "subscription_status": "active",
    "activated_at": datetime.now(timezone.utc).isoformat(),
    "expires_at": future_expires
}

with patch("main.get_active_entitlement", return_value=active_entitlement_mock):
    res_u1_book_subscribed = client.post("/api/book-appointment", json={
        "provider_id": provider_id,
        "hospital": "BuildingRace Hospital",
        "doctor": "Gynecology & Obstetrics",
        "date": target_date,
        "slot": "10:30 AM",
        "phone": "+91 98765 43210",
        "notes": "Subscribed user additional booking"
    })
    scenario4_passed = (
        res_u1_book_subscribed.status_code == 200 and
        res_u1_book_subscribed.json().get("success") is True
    )
    record(4, "User with eligible active subscription -> additional booking follows plan limits", scenario4_passed,
           f"Status: {res_u1_book_subscribed.status_code}, Success: {res_u1_book_subscribed.json().get('success')}")

# ── SCENARIO 5: User with an expired or failed subscription -> additional booking blocked ──
with patch("main.get_active_entitlement", return_value=None):
    res_u1_book_expired = client.post("/api/book-appointment", json={
        "provider_id": provider_id,
        "hospital": "BuildingRace Hospital",
        "doctor": "Gynecology & Obstetrics",
        "date": target_date,
        "slot": "11:00 AM",
        "phone": "+91 98765 43210",
        "notes": "Expired subscription booking attempt"
    })
    scenario5_passed = (
        res_u1_book_expired.status_code == 403 and
        "free booking has been used" in res_u1_book_expired.json().get("detail", "").lower()
    )
    record(5, "User with expired or failed subscription -> additional booking is blocked (403)", scenario5_passed,
           f"Status: {res_u1_book_expired.status_code}, Detail: '{res_u1_book_expired.json().get('detail')}'")

# ── SCENARIO 6: User refreshes or logs in again -> previous booking usage remains recorded ──
# User 2 logs out and logs in again
user2_client.post("/api/auth/logout")
res_u2_relogin = user2_client.post("/api/auth/login", json={
    "email": user2_email,
    "password": "StrongPassword123!"
})
res_u2_check = user2_client.get("/api/booking-eligibility")
el_data2 = res_u2_check.json() if res_u2_check.status_code == 200 else {}

res_u2_blocked = user2_client.post("/api/book-appointment", json={
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "11:30 AM",
    "phone": "+91 98765 43211",
    "notes": "User 2 second attempt after relogin"
})

scenario6_passed = (
    res_u2_relogin.status_code == 200 and
    el_data2.get("free_booking_used") is True and
    el_data2.get("can_book") is False and
    res_u2_blocked.status_code == 403
)
record(6, "User refreshes or logs in again -> previous booking usage remains recorded", scenario6_passed,
       f"Relogin: {res_u2_relogin.status_code}, free_booking_used: {el_data2.get('free_booking_used')}, 2nd book: {res_u2_blocked.status_code}")

# ── SCENARIO 7: User attempts to bypass limit through direct API request -> rejected ──
# Direct request with forged client headers from free user
res_bypass_spoof = user2_client.post(
    "/api/book-appointment",
    json={
        "provider_id": provider_id,
        "hospital": "BuildingRace Hospital",
        "doctor": "Gynecology & Obstetrics",
        "date": target_date,
        "slot": "12:00 PM",
        "phone": "+91 98765 43211"
    },
    headers={
        "X-Subscription-Plan": "annual",
        "X-Is-Premium": "true"
    }
)

# Direct request unauthenticated
unauth_client = TestClient(app)
res_unauth = unauth_client.post("/api/book-appointment", json={
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "12:00 PM"
})

scenario7_passed = (
    res_bypass_spoof.status_code == 403 and
    res_unauth.status_code == 401
)
record(7, "Direct API requests cannot bypass limits (headers ignored, unauth 401)", scenario7_passed,
       f"Spoofed status: {res_bypass_spoof.status_code}, Unauth status: {res_unauth.status_code}")

# ── SCENARIO 8: Two simultaneous booking requests cannot both bypass free limit ──
user3_email = f"book_test_user3_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user3_email)

user3_client = TestClient(app)
res_u3_signup = user3_client.post("/api/auth/signup", json={
    "email": user3_email,
    "password": "StrongPassword123!",
    "name": "Concurrent Booking User"
})

payload_a = {
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "02:00 PM",
    "phone": "+91 98765 43212",
    "notes": "Concurrent test A"
}

payload_b = {
    "provider_id": provider_id,
    "hospital": "BuildingRace Hospital",
    "doctor": "Gynecology & Obstetrics",
    "date": target_date,
    "slot": "02:30 PM",
    "phone": "+91 98765 43212",
    "notes": "Concurrent test B"
}

def make_booking_req(payload):
    return user3_client.post("/api/book-appointment", json=payload)

with ThreadPoolExecutor(max_workers=2) as executor:
    future_a = executor.submit(make_booking_req, payload_a)
    future_b = executor.submit(make_booking_req, payload_b)
    res_a = future_a.result()
    res_b = future_b.result()

status_codes = sorted([res_a.status_code, res_b.status_code])
# One must be 200 (first free booking) and the second must be 403 (quota exceeded)
scenario8_passed = (status_codes == [200, 403])
record(8, "Two simultaneous booking requests cannot both bypass free limit", scenario8_passed,
       f"Responses: {status_codes[0]} and {status_codes[1]}")

# ── SCENARIO 9: Existing bookings and provider availability remain intact ──
res_avail = client.post("/api/booking-availability", json={
    "provider_id": provider_id,
    "date": target_date
})
avail_data = res_avail.json() if res_avail.status_code == 200 else {}
slots = avail_data.get("slots", [])

scenario9_passed = (
    res_avail.status_code == 200 and
    len(slots) == 16 and
    any(s.get("slot_time") == "09:00 AM" and s.get("is_available") is False for s in slots)
)
record(9, "Existing bookings and provider availability remain intact", scenario9_passed,
       f"Status: {res_avail.status_code}, Total slots: {len(slots)}")

# ── CLEANUP TEST DATA ────────────────────────────────────────────────────────
cleanup_user(user1_email)
cleanup_user(user2_email)
cleanup_user(user3_email)

print("\n" + "="*70)
total_tests = len(results)
passed_tests = sum(1 for r in results if r[2])
print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} SCENARIOS PASSED")
print("="*70 + "\n")

if passed_tests != total_tests:
    sys.exit(1)
else:
    print("ALL 9 BOOKING SUBSCRIPTION LIMIT SCENARIOS SUCCESSFULLY VERIFIED!")
    sys.exit(0)
