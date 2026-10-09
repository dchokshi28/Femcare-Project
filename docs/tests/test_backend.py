import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_prediction(payload, description):
    print(f"Testing {description}...")
    try:
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    print("-" * 30)

# 1. Simulate Dashboard Request (Partial data, aliased fields)
dashboard_payload = {
    "age": 25,
    "cycleLength": 32,
    "periodDuration": 6,
    "pain": "Moderate",
    "flow": "Heavy",
    "moods": ["happy", "energetic"]
}

# 2. Simulate Health Assessment Request (Full data, internal field names)
assessment_payload = {
    "age": 22,
    "height_cm": 165,
    "weight_kg": 55,
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
    "thyroid_status": 0
}

if __name__ == "__main__":
    test_prediction(dashboard_payload, "Dashboard Request (Partial/Aliased)")
    test_prediction(assessment_payload, "Health Assessment Request (Full/Internal)")
