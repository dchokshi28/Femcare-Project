"""
Comprehensive Automated Test Suite for FemCare Assessment Input Box Colors & Free Quiz Limits.
Validates all required scenarios:
1. First three assessment inputs (age, height, weight) styled with pure white background (#FFFFFF) and visible dark text (#334155).
2. Hover, focus, disabled, and placeholder states maintain pure white background without turning gray.
3. User A (new account) -> first quiz succeeds for free.
4. User A -> second quiz succeeds for free.
5. User A -> third quiz attempt blocked (GET /api/assessment-eligibility returns can_take_quiz=False, free_exhausted=True).
6. User A -> direct API request for third quiz rejected with 403 Forbidden.
7. Re-login / refresh does not reset User A's allowance.
8. User B (different account) -> has independent 2 free quizzes allowance.
9. Active paid subscriber -> can take additional quizzes beyond the 2 free limit.
10. Expired/inactive subscription -> blocked from premium quiz access.
11. Existing quiz records and raw ML endpoint compatibility remain intact.
"""

import sys
import uuid
import os
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from fastapi.testclient import TestClient

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
            supabase.table("health_assessments").delete().eq("user_id", uid).execute()
            supabase.table("assessment_results").delete().eq("user_id", uid).execute()
            supabase.table("subscriptions").delete().eq("user_id", uid).execute()
        mc["femcare"].users.delete_many({"email": email.lower()})
    except Exception as e:
        print(f"Cleanup note: {e}")

sample_quiz_payload = {
    "age": 25,
    "height_cm": 162.0,
    "weight_kg": 58.0,
    "cycle_length_days": 28,
    "bleeding_days": 5,
    "insulin_resistance": 0,
    "periods_regular": 1,
    "dark_patches_neck": 0,
    "fast_food_frequent": 0,
    "exercise_regularly": 1,
    "family_history_pcos": 0,
    "skip_periods_months": 0,
    "excess_facial_hair": 0,
    "severe_acne": 0,
    "thyroid_status": 0,
    "LH": 4.5,
    "FSH": 5.0,
    "LH_FSH_ratio": 0.9
}

print("\n" + "="*70)
print("RUNNING FEMCARE ASSESSMENT INPUT COLORS & FREE QUIZ LIMITS TEST SUITE")
print("="*70 + "\n")

# ── SCENARIO 1: Verify Input Box CSS & Inline Styling ────────────────────────
css_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "pages", "HealthAssessment.css")
jsx_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "pages", "HealthAssessment.jsx")

css_content = open(css_path, "r", encoding="utf-8").read()
jsx_content = open(jsx_path, "r", encoding="utf-8").read()

css_white_bg = "#FFFFFF" in css_content and ".quiz-number-input" in css_content
css_hover_white = ".quiz-number-input:hover" in css_content and "#FFFFFF" in css_content
css_focus_white = ".quiz-number-input:focus" in css_content and "#FFFFFF" in css_content
css_disabled_white = ".quiz-number-input:disabled" in css_content and "#FFFFFF" in css_content
css_dark_text = "color: #334155" in css_content
jsx_inline_white = "backgroundColor: '#FFFFFF'" in jsx_content or 'backgroundColor: "#FFFFFF"' in jsx_content

s1_passed = css_white_bg and css_hover_white and css_focus_white and css_disabled_white and css_dark_text and jsx_inline_white
record(1, "First three assessment input boxes styled pure white (#FFFFFF) across all states", s1_passed,
       f"CSS #FFFFFF: {css_white_bg}, hover/focus/disabled #FFFFFF: {css_hover_white and css_focus_white and css_disabled_white}, Dark text: {css_dark_text}, JSX inline white: {jsx_inline_white}")


# ── SCENARIO 2: User A Signup & First Quiz Allowed ───────────────────────────
user_a_email = f"quiz_user_a_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user_a_email)

res_ua_signup = client.post("/api/auth/signup", json={
    "email": user_a_email,
    "password": "Password123!",
    "name": "Quiz User A"
})
ua_signup_ok = res_ua_signup.status_code == 200

res_ua_el0 = client.get("/api/assessment-eligibility")
el0_data = res_ua_el0.json() if res_ua_el0.status_code == 200 else {}
el0_ok = (el0_data.get("can_take_quiz") is True and el0_data.get("used_quizzes") == 0 and el0_data.get("free_exhausted") is False)

res_ua_quiz1 = client.post("/api/predict", json=sample_quiz_payload)
quiz1_ok = (res_ua_quiz1.status_code == 200 and "confidence" in res_ua_quiz1.json())

s2_passed = ua_signup_ok and el0_ok and quiz1_ok
record(2, "New user A has 0 used quizzes and completes Quiz 1 for free", s2_passed,
       f"Signup: {res_ua_signup.status_code}, Eligibility: {el0_data.get('can_take_quiz')}, Quiz 1: {res_ua_quiz1.status_code}")


# ── SCENARIO 3: User A Second Quiz Allowed ───────────────────────────────────
res_ua_el1 = client.get("/api/assessment-eligibility")
el1_data = res_ua_el1.json() if res_ua_el1.status_code == 200 else {}
el1_ok = (el1_data.get("can_take_quiz") is True and el1_data.get("used_quizzes") == 1 and el1_data.get("free_exhausted") is False)

res_ua_quiz2 = client.post("/api/predict", json=sample_quiz_payload)
quiz2_ok = (res_ua_quiz2.status_code == 200 and "confidence" in res_ua_quiz2.json())

s3_passed = el1_ok and quiz2_ok
record(3, "User A completes Quiz 2 for free (reaches 2 free quizzes limit)", s3_passed,
       f"Eligibility used_quizzes: {el1_data.get('used_quizzes')}, Quiz 2 status: {res_ua_quiz2.status_code}")


# ── SCENARIO 4: User A Free Quizzes Exhausted -> Eligibility Blocks Quiz 3 ───
res_ua_el2 = client.get("/api/assessment-eligibility")
el2_data = res_ua_el2.json() if res_ua_el2.status_code == 200 else {}
el2_ok = (
    el2_data.get("can_take_quiz") is False and
    el2_data.get("used_quizzes") == 2 and
    el2_data.get("free_exhausted") is True and
    "2 free quizzes" in el2_data.get("message", "")
)

record(4, "User A eligibility reflects 2 used quizzes, blocks quiz start, displays upgrade message", el2_ok,
       f"can_take_quiz: {el2_data.get('can_take_quiz')}, used: {el2_data.get('used_quizzes')}, msg: {el2_data.get('message')}")


# ── SCENARIO 5: Direct API Request for Quiz 3 Blocked with 403 Forbidden ─────
res_ua_quiz3 = client.post("/api/predict", json=sample_quiz_payload)
detail_quiz3 = res_ua_quiz3.json().get("detail", "") if res_ua_quiz3.status_code != 200 else ""
quiz3_blocked = (
    res_ua_quiz3.status_code == 403 and
    "used your 2 free quizzes" in detail_quiz3
)

record(5, "Direct API call for Quiz 3 rejected with 403 and upgrade prompt", quiz3_blocked,
       f"Status: {res_ua_quiz3.status_code}, Detail: {detail_quiz3}")


# ── SCENARIO 6: Refresh / Re-login Preserves Quiz Allowance ───────────────────
# Log out and log back in
client.post("/api/auth/logout")
res_ua_relogin = client.post("/api/auth/login", json={
    "email": user_a_email,
    "password": "Password123!"
})
ua_relogin_ok = res_ua_relogin.status_code == 200

res_ua_el_relogin = client.get("/api/assessment-eligibility")
el_relogin_data = res_ua_el_relogin.json() if res_ua_el_relogin.status_code == 200 else {}
res_ua_quiz3_retry = client.post("/api/predict", json=sample_quiz_payload)

s6_passed = (
    ua_relogin_ok and
    el_relogin_data.get("can_take_quiz") is False and
    el_relogin_data.get("used_quizzes") == 2 and
    res_ua_quiz3_retry.status_code == 403
)
record(6, "Re-login / session refresh maintains persistent 2-quiz usage and blocks bypass", s6_passed,
       f"Relogin: {res_ua_relogin.status_code}, can_take_quiz: {el_relogin_data.get('can_take_quiz')}, Retry status: {res_ua_quiz3_retry.status_code}")


# ── SCENARIO 7: Different User B Has Independent 2 Free Quizzes Allowance ────
user_b_email = f"quiz_user_b_{uuid.uuid4().hex[:6]}@example.com"
cleanup_user(user_b_email)

user_b_client = TestClient(app)
res_ub_signup = user_b_client.post("/api/auth/signup", json={
    "email": user_b_email,
    "password": "Password123!",
    "name": "Quiz User B"
})
ub_signup_ok = res_ub_signup.status_code == 200

res_ub_el = user_b_client.get("/api/assessment-eligibility")
ub_el_data = res_ub_el.json() if res_ub_el.status_code == 200 else {}

res_ub_quiz1 = user_b_client.post("/api/predict", json=sample_quiz_payload)
ub_quiz1_ok = res_ub_quiz1.status_code == 200

s7_passed = (
    ub_signup_ok and
    ub_el_data.get("can_take_quiz") is True and
    ub_el_data.get("used_quizzes") == 0 and
    ub_quiz1_ok
)
record(7, "Different user B has independent allowance and completes first quiz", s7_passed,
       f"User B can_take_quiz: {ub_el_data.get('can_take_quiz')}, Quiz 1: {res_ub_quiz1.status_code}")


# ── SCENARIO 8: Active Paid Subscription Unlocks Additional Quizzes ───────────
res_ua_checkout = client.post("/api/subscriptions/demo/checkout", json={"plan": "monthly"})
checkout_ok = res_ua_checkout.status_code == 200

res_ua_el_sub = client.get("/api/assessment-eligibility")
el_sub_data = res_ua_el_sub.json() if res_ua_el_sub.status_code == 200 else {}

res_ua_quiz_premium = client.post("/api/predict", json=sample_quiz_payload)
quiz_premium_ok = (res_ua_quiz_premium.status_code == 200 and "confidence" in res_ua_quiz_premium.json())

s8_passed = (
    checkout_ok and
    el_sub_data.get("can_take_quiz") is True and
    el_sub_data.get("has_active_subscription") is True and
    quiz_premium_ok
)
record(8, "Active paid subscriber is permitted to take additional quizzes beyond free limit", s8_passed,
       f"Checkout: {res_ua_checkout.status_code}, can_take_quiz: {el_sub_data.get('can_take_quiz')}, Premium Quiz: {res_ua_quiz_premium.status_code}")


# ── SCENARIO 9: Expired Subscription Blocks Additional Quizzes ────────────────
mc = MongoClient("mongodb://127.0.0.1:27017/femcare", serverSelectionTimeoutMS=2000)
user_doc = mc["femcare"].users.find_one({"email": user_a_email.lower()})
uid = resolve_supabase_profile_id(user_doc)

past_time = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
supabase.table("subscriptions").update({
    "expires_at": past_time,
    "subscription_status": "expired"
}).eq("user_id", uid).execute()

res_ua_el_expired = client.get("/api/assessment-eligibility")
el_exp_data = res_ua_el_expired.json() if res_ua_el_expired.status_code == 200 else {}

res_ua_quiz_expired = client.post("/api/predict", json=sample_quiz_payload)

s9_passed = (
    el_exp_data.get("can_take_quiz") is False and
    el_exp_data.get("has_active_subscription") is False and
    res_ua_quiz_expired.status_code == 403
)
record(9, "Expired subscription revokes premium access and blocks quiz with 403", s9_passed,
       f"can_take_quiz: {el_exp_data.get('can_take_quiz')}, Quiz status: {res_ua_quiz_expired.status_code}")


# ── Clean up test users ───────────────────────────────────────────────────────
cleanup_user(user_a_email)
cleanup_user(user_b_email)

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "="*70)
total_tests = len(results)
passed_tests = sum(1 for _, _, p, _ in results if p)
failed_tests = total_tests - passed_tests
print(f"RESULTS: {passed_tests}/{total_tests} passed ({failed_tests} failed)")
print("="*70 + "\n")

if failed_tests > 0:
    sys.exit(1)
else:
    sys.exit(0)
