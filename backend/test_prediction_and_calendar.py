"""
Comprehensive Test Script for FemCare Cycle Prediction and Calendar Date Calculations
Validates:
1. Model loading (cycle XGBoost pipeline & PCOS model)
2. Health endpoints
3. Cycle prediction endpoints (/api/predict-cycle, /api/predict/cycle, /api/predict-due)
4. XGBoost ML model prediction vs mathematical fallback
5. Date calculation boundary cases (month shifts, leap years, year transitions)
6. PCOS prediction compatibility
"""

import sys
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient

from main import app, cycle_model, pcos_model, run_cycle_prediction

client = TestClient(app)

results = []

def record(name, passed, detail=""):
    results.append((name, passed, detail))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if detail:
        print(f"       -> {detail}")

print("\n" + "="*70)
print("RUNNING FEMCARE ML PREDICTION & CALENDAR INTEGRATION TEST SUITE")
print("="*70 + "\n")

# 1. Health Endpoints
r_health = client.get("/health")
h_json = r_health.json() if r_health.status_code == 200 else {}
record(
    "GET /health returns 200 with both models loaded",
    r_health.status_code == 200 and h_json.get("cycle_model_loaded") is True and h_json.get("pcos_model_loaded") is True,
    f"Status: {r_health.status_code}, Cycle loaded: {h_json.get('cycle_model_loaded')}, PCOS loaded: {h_json.get('pcos_model_loaded')}"
)

r_api_health = client.get("/api/health")
api_h_json = r_api_health.json() if r_api_health.status_code == 200 else {}
record(
    "GET /api/health returns 200 with models",
    r_api_health.status_code == 200 and api_h_json.get("model_loaded") is True,
    f"Status: {r_api_health.status_code}"
)

# 2. Cycle Prediction - Standard Case
cycle_payload = {
    "last_period_date": "2026-09-15",
    "cycle_length": 28,
    "period_duration": 5,
    "flow": "Medium",
    "pain_level": "Mild",
    "moods": ["happy"],
    "symptoms": ["Bloating"],
    "previous_cycle_1": 28,
    "previous_cycle_average": 28.0,
    "cycle_number": 1
}

r_pred = client.post("/api/predict-cycle", json=cycle_payload)
pred_json = r_pred.json() if r_pred.status_code == 200 else {}
record(
    "POST /api/predict-cycle returns 200 with ML prediction",
    r_pred.status_code == 200 and pred_json.get("success") is True and pred_json.get("model_used") == "xgboost_pipeline",
    f"Predicted Length: {pred_json.get('predicted_cycle_length')}, Next Date: {pred_json.get('next_period_date')}, Model: {pred_json.get('model_used')}"
)

# 3. Cycle Prediction - Alias Endpoint
r_pred_alias = client.post("/api/predict/cycle", json=cycle_payload)
record(
    "POST /api/predict/cycle alias returns 200",
    r_pred_alias.status_code == 200 and r_pred_alias.json().get("success") is True,
    f"Status: {r_pred_alias.status_code}"
)

# 4. Predict-Due Endpoints
due_payload = {
    "last_period_date": "2026-09-15",
    "average_cycle_length": 28
}
r_due1 = client.post("/api/predict-due", json=due_payload)
r_due2 = client.post("/predict-due", json=due_payload)
record(
    "POST /api/predict-due and /predict-due return 200",
    r_due1.status_code == 200 and r_due2.status_code == 200,
    f"Due1: {r_due1.json().get('predicted_next_period_date')}, Due2: {r_due2.json().get('predicted_next_period_date')}"
)

# 5. Month & Year Boundary Transitions
# Case A: Crossing Year Boundary (Dec 2026 -> Jan 2027)
pred_dec = run_cycle_prediction({
    "last_period_date": "2026-12-15",
    "cycle_length": 28,
    "period_duration": 5
})
next_date_dec = datetime.strptime(pred_dec["next_period_date"], "%Y-%m-%d").date()
record(
    "Date Calculation: Year Boundary (Dec 2026 -> Jan 2027)",
    next_date_dec.year == 2027 and next_date_dec.month == 1,
    f"Input: 2026-12-15 -> Next: {pred_dec['next_period_date']}"
)

# Case B: Leap Year (Feb 2028 has 29 days)
pred_leap = run_cycle_prediction({
    "last_period_date": "2028-02-10",
    "cycle_length": 28,
    "period_duration": 5
})
next_date_leap = datetime.strptime(pred_leap["next_period_date"], "%Y-%m-%d").date()
record(
    "Date Calculation: Leap Year Feb 2028 Handling",
    next_date_leap.year == 2028 and next_date_leap.month == 3,
    f"Input: 2028-02-10 -> Next: {pred_leap['next_period_date']} (Day: {next_date_leap.day})"
)

# Case C: 31-day month to next month (Oct 2026 -> Nov 2026)
pred_oct = run_cycle_prediction({
    "last_period_date": "2026-10-10",
    "cycle_length": 28,
    "period_duration": 5
})
next_date_oct = datetime.strptime(pred_oct["next_period_date"], "%Y-%m-%d").date()
record(
    "Date Calculation: 31-day month (Oct -> Nov)",
    next_date_oct.month == 11 and next_date_oct.day == 7,
    f"Input: 2026-10-10 -> Next: {pred_oct['next_period_date']}"
)

# 6. PCOS Prediction Endpoint Compatibility
pcos_payload = {
    "age": 24,
    "cycleLength": 32,
    "periodDuration": 5,
    "pain": "Moderate",
    "flow": "Heavy",
    "moods": ["sensitive"]
}
r_pcos = client.post("/api/predict", json=pcos_payload)
record(
    "POST /api/predict (PCOS model) returns 200 with valid probability",
    r_pcos.status_code == 200 and ("confidence" in r_pcos.json() or "pcos_detected" in r_pcos.json()),
    f"Status: {r_pcos.status_code}, Confidence: {r_pcos.json().get('confidence')}%, Risk: {r_pcos.json().get('risk_level')}, Detected: {r_pcos.json().get('pcos_detected')}"
)

# 7. Overall Summary
print("\n" + "="*70)
total_tests = len(results)
passed_tests = sum(1 for _, p, _ in results if p)
failed_tests = total_tests - passed_tests
print(f"RESULTS: {passed_tests}/{total_tests} passed ({failed_tests} failed)")
print("="*70 + "\n")

if failed_tests > 0:
    sys.exit(1)
else:
    sys.exit(0)
