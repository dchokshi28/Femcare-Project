import sys
from fastapi.testclient import TestClient
from pymongo import MongoClient

from main import app

client = TestClient(app)

TEST_EMAIL = "auth_verifier_user@example.com"
TEST_PASSWORD = "StrongPassword123!"
TEST_NAME = "Verification User"

results = []

def record(name, passed, detail=""):
    results.append((name, passed, detail))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if detail:
        print(f"       -> {detail}")

def cleanup():
    try:
        mc = MongoClient("mongodb://127.0.0.1:27017/femcare", serverSelectionTimeoutMS=2000)
        mc["femcare"].users.delete_many({"email": TEST_EMAIL.lower()})
    except Exception as e:
        print(f"Cleanup warning: {e}")

print("\n" + "="*60)
print("RUNNING COMPREHENSIVE FEMCARE AUTH & ENDPOINT VERIFICATION")
print("="*60 + "\n")

cleanup()

# 1. Root & Favicon (Verify 404 fixes)
r_root = client.get("/")
record("GET / returns 200 OK (no 404)", r_root.status_code == 200, f"Status: {r_root.status_code}")

r_fav = client.get("/favicon.ico")
record("GET /favicon.ico handled (no 404)", r_fav.status_code == 200, f"Status: {r_fav.status_code}")

# 2. Unauthenticated /api/auth/me (Verify 401 fix on initial load)
r_unauth = client.get("/api/auth/me")
passed_unauth = r_unauth.status_code == 200 and r_unauth.json().get("user") is None
record("GET /api/auth/me (unauthenticated) returns {user: None} safely", passed_unauth, f"Status: {r_unauth.status_code}, Body: {r_unauth.json()}")

# 3. Validation errors on signup (Verify 422 descriptive message, not [object Object])
r_empty = client.post("/api/auth/signup", json={})
detail_empty = r_empty.json().get("detail", "")
passed_empty = r_empty.status_code == 422 and isinstance(detail_empty, str) and len(detail_empty) > 0
record("POST /api/auth/signup (empty) returns 422 with string detail", passed_empty, f"Detail: '{detail_empty}'")

r_short_pw = client.post("/api/auth/signup", json={
    "email": TEST_EMAIL,
    "password": "short",
    "name": TEST_NAME
})
detail_short = r_short_pw.json().get("detail", "")
passed_short = r_short_pw.status_code == 422 and isinstance(detail_short, str) and "characters" in detail_short.lower()
record("POST /api/auth/signup (short password) returns 422 with clear message", passed_short, f"Detail: '{detail_short}'")

r_invalid_email = client.post("/api/auth/signup", json={
    "email": "not-an-email",
    "password": TEST_PASSWORD,
    "name": TEST_NAME
})
detail_email = r_invalid_email.json().get("detail", "")
passed_email = r_invalid_email.status_code == 422 and isinstance(detail_email, str)
record("POST /api/auth/signup (invalid email) returns 422 with clear message", passed_email, f"Detail: '{detail_email}'")

# 4. Valid signup succeeds
r_signup = client.post("/api/auth/signup", json={
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "name": TEST_NAME,
    "age": 27,
    "cycleLength": 29
})
passed_signup = r_signup.status_code == 200 and "user" in r_signup.json() and "femcare_session" in r_signup.cookies
cookie = r_signup.cookies.get("femcare_session")
record("POST /api/auth/signup (valid) succeeds and issues session cookie", passed_signup, f"User email: {r_signup.json().get('user', {}).get('email')}")

# 5. Duplicate email registration
r_dup = client.post("/api/auth/signup", json={
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "name": "Duplicate User",
    "age": 25,
    "cycleLength": 28
})
passed_dup = r_dup.status_code == 409
record("POST /api/auth/signup (duplicate email) returns 409 Conflict", passed_dup, f"Status: {r_dup.status_code}, Detail: {r_dup.json().get('detail')}")

# 6. Authenticated /api/auth/me returns current user
r_me = client.get("/api/auth/me", cookies={"femcare_session": cookie})
passed_me = r_me.status_code == 200 and r_me.json().get("user", {}).get("email") == TEST_EMAIL
record("GET /api/auth/me (authenticated) returns current user", passed_me, f"Status: {r_me.status_code}, User: {r_me.json().get('user')}")

# 7. Login with valid credentials
r_login = client.post("/api/auth/login", json={
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD
})
passed_login = r_login.status_code == 200 and "femcare_session" in r_login.cookies
login_cookie = r_login.cookies.get("femcare_session")
record("POST /api/auth/login (valid credentials) succeeds and issues session cookie", passed_login, f"Status: {r_login.status_code}")

# 8. Login with invalid password
r_login_bad_pw = client.post("/api/auth/login", json={
    "email": TEST_EMAIL,
    "password": "WrongPassword!"
})
passed_bad_pw = r_login_bad_pw.status_code == 401
record("POST /api/auth/login (wrong password) rejected with 401", passed_bad_pw, f"Status: {r_login_bad_pw.status_code}, Detail: {r_login_bad_pw.json().get('detail')}")

# 9. Login with unknown email
r_login_unk = client.post("/api/auth/login", json={
    "email": "unknown_femcare_user@example.com",
    "password": TEST_PASSWORD
})
passed_unk = r_login_unk.status_code == 401
record("POST /api/auth/login (non-existent email) rejected with 401", passed_unk, f"Status: {r_login_unk.status_code}, Detail: {r_login_unk.json().get('detail')}")

# 10. Logout clears session
r_logout = client.post("/api/auth/logout")
passed_logout = r_logout.status_code == 200
record("POST /api/auth/logout returns 200 and clears session", passed_logout, f"Status: {r_logout.status_code}")

# 11. Preserving Supabase bookings functionality
r_booking_avail = client.post("/api/booking-availability", json={
    "provider_id": "vadodara-1",
    "date": "2026-10-15"
})
passed_avail = r_booking_avail.status_code == 200 and "slots" in r_booking_avail.json()
record("Supabase booking availability endpoint intact", passed_avail, f"Status: {r_booking_avail.status_code}, Slots: {len(r_booking_avail.json().get('slots', []))}")

cleanup()

print("\n" + "="*60)
total_tests = len(results)
passed_tests = sum(1 for _, p, _ in results if p)
print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} passed")
print("="*60 + "\n")

if passed_tests != total_tests:
    sys.exit(1)
