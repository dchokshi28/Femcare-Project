from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model if it exists
# Moving one level up to reach ml_models from backend folder
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'pcos_model.pkl')
model = None
try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("Model loaded successfully.")
    else:
        print(f"Model file not found at {MODEL_PATH}. Using heuristic logic instead.")
except Exception as e:
    print(f"Warning: Could not load model: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        # Features: Age, Cycle length, Period duration, Pain level, Flow intensity, Mood changes
        # Attempt to get values, using defaults if missing
        age = int(data.get('age', 25))
        cycle_length = int(data.get('cycleLength', 28))
        period_duration = int(data.get('periodDuration', 5))
        
        # Map frontend strings to numerical values
        pain_map = {'None': 1, 'Mild': 2, 'Moderate': 3, 'Severe': 5}
        pain_level = pain_map.get(data.get('pain', 'None'), 1)
        
        flow_map = {'Spotting': 1, 'Light': 1, 'Medium': 2, 'Heavy': 3}
        flow_intensity = flow_map.get(data.get('flow', 'Medium'), 2)
        
        mood_changes = len(data.get('moods', [])) + 1
        if mood_changes > 5: mood_changes = 5

        features = np.array([[age, cycle_length, period_duration, pain_level, flow_intensity, mood_changes]])
        
        prediction_idx = 0
        if model:
            try:
                prediction_idx = model.predict(features)[0]
            except Exception as e:
                print(f"Model prediction error: {e}")
                # Fallback to heuristics if model fails during prediction
                prediction_idx = -1
        else:
            prediction_idx = -1

        # Heuristic fallback if model is missing or fails
        if prediction_idx == -1:
            if cycle_length > 35 or (cycle_length < 24 and period_duration > 7) or pain_level == 5:
                prediction_idx = 2 # High Risk
            elif cycle_length > 31 or cycle_length < 26 or pain_level >= 3:
                prediction_idx = 1 # Possible Irregularity
            else:
                prediction_idx = 0 # Normal Cycle
        
        predictions = ["Normal Cycle", "Possible Irregularity", "High Risk"]
        recommendations = [
            "Your cycle seems healthy and regular. Keep maintaining a balanced diet and regular exercise.",
            "Some variations in your cycle were detected. Monitor your symptoms closely and ensure you get enough rest.",
            "Significant irregularities or patterns detected. We recommend consulting with a healthcare professional for a detailed check-up."
        ]
        
        result_idx = int(prediction_idx)
        if result_idx < 0 or result_idx >= len(predictions):
            result_idx = 0

        return jsonify({
            "prediction": predictions[result_idx],
            "recommendation": recommendations[result_idx]
        })
        
    except Exception as e:
        print(f"Processing error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model_loaded": model is not None})

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    quiz_data = [
        {
            "id": 1,
            "question": "What is the average length of a menstrual cycle?",
            "options": ["21 days", "28 days", "35 days", "14 days"],
            "correctAnswer": 1
        },
        {
            "id": 2,
            "question": "Which hormone is primarily responsible for ovulation?",
            "options": ["Estrogen", "Progesterone", "Luteinizing Hormone (LH)", "Testosterone"],
            "correctAnswer": 2
        },
        {
            "id": 3,
            "question": "During which phase of the cycle is a person most fertile?",
            "options": ["Menstrual phase", "Follicular phase", "Ovulation phase", "Luteal phase"],
            "correctAnswer": 2
        },
        {
            "id": 4,
            "question": "What is a common symptom of PCOS?",
            "options": ["Regular periods", "Clear skin", "Irregular periods and excess hair growth", "High energy levels"],
            "correctAnswer": 2
        }
    ]
    return jsonify(quiz_data)

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts_data = [
        {
            "id": 1,
            "doctorName": "Dr. Sarah Johnson",
            "profileImage": "https://images.unsplash.com/photo-1559839734-2b71f153678e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
            "verified": True,
            "title": "Understanding Your Cycle Phases",
            "content": "Your menstrual cycle is more than just your period. It consists of four distinct phases: Menstrual, Follicular, Ovulation, and Luteal. Tracking these can help you understand your energy levels and mood shifts throughout the month.",
            "likes": 124,
            "comments": 18
        },
        {
            "id": 2,
            "doctorName": "Dr. Amara Chen",
            "profileImage": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
            "verified": True,
            "title": "Nutrition for Hormonal Balance",
            "content": "Eating a balanced diet rich in leafy greens, healthy fats like avocado, and lean proteins can significantly support hormonal health. Reducing processed sugars may also help in managing PMS symptoms.",
            "likes": 89,
            "comments": 12
        },
        {
            "id": 3,
            "doctorName": "Dr. Maria Rodriguez",
            "profileImage": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
            "verified": True,
            "title": "Debunking PCOS Myths",
            "content": "PCOS is a common hormonal disorder, but many myths persist. It's not just about 'cysts' on ovaries; it's a metabolic and endocrine condition that can be managed with lifestyle changes and proper medical guidance.",
            "likes": 156,
            "comments": 24
        }
    ]
    return jsonify(posts_data)

if __name__ == '__main__':
    # Listen on all interfaces for easier local testing
    app.run(debug=True, port=5000)
