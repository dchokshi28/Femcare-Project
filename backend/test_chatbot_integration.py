"""
Test suite for FemCare Chatbot and API Integration
Tests:
1. Menstrual health knowledge and LLM response generation
2. FemCare application navigation & feature guidance (bookings, assessments, cycle tracking)
3. Empty message handling
4. Out-of-scope rejection
5. Medical safety and emergency response
6. FastAPI /api/chat route integration via TestClient
"""

import os
from dotenv import load_dotenv
load_dotenv()

from femcare_chatbot import generate_response, scope_check, is_urgent
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_empty_message():
    print("\n--- Test: Empty Message ---")
    resp = generate_response("")
    assert resp["scope"] == "in_scope"
    assert resp["llm_used"] is False
    assert "Please ask a question" in resp["reply"]
    print("[PASS] Empty message correctly prompted user without calling LLM.")

def test_out_of_scope():
    print("\n--- Test: Out of Scope ---")
    resp = generate_response("Write a python quicksort script")
    assert resp["scope"] == "out_of_scope"
    assert resp["llm_used"] is False
    assert "FEMCARE AI" in resp["reply"]
    print("[PASS] Out of scope technical query rejected politely.")

def test_menstrual_health_query():
    print("\n--- Test: Menstrual Health Query ---")
    resp = generate_response("What is a normal menstrual cycle length?")
    assert resp["scope"] == "in_scope"
    assert len(resp["reply"]) > 20
    print(f"[PASS] Response received (LLM used={resp['llm_used']}, model={resp.get('llm_model')}):")
    print(f"  {resp['reply'][:150]}...")

def test_femcare_app_feature_query():
    print("\n--- Test: FemCare Feature & Booking Query ---")
    resp = generate_response("How do I book an appointment with a doctor on FemCare?")
    assert resp["scope"] == "in_scope"
    assert len(resp["reply"]) > 20
    assert any(w in resp["reply"].lower() for w in ["care", "book", "find", "slot", "appointment"])
    print(f"[PASS] FemCare feature response received:")
    print(f"  {resp['reply'][:150]}...")

def test_emergency_query():
    print("\n--- Test: Emergency / Urgency Query ---")
    resp = generate_response("I have severe sudden abdominal pain and feel like fainting")
    assert resp["scope"] == "in_scope"
    assert any(w in resp["reply"].lower() for w in ["emergency", "medical", "doctor", "immediate", "care"])
    print(f"[PASS] Emergency query received urgent medical safety advice:")
    print(f"  {resp['reply'][:150]}...")

def test_api_chat_endpoint():
    print("\n--- Test: FastAPI /api/chat Endpoint ---")
    response = client.post("/api/chat", json={
        "message": "How do I take the PCOS quiz?",
        "context": {"source": "widget_test"}
    })
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    print(f"[PASS] /api/chat endpoint returned 200 OK:")
    print(f"  {data['reply'][:150]}...")

if __name__ == "__main__":
    print("Starting FemCare Chatbot Integration Tests...")
    test_empty_message()
    test_out_of_scope()
    test_menstrual_health_query()
    test_femcare_app_feature_query()
    test_emergency_query()
    test_api_chat_endpoint()
    print("\nAll FemCare Chatbot Integration Tests Passed Successfully!")
