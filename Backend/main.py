# ============================================================
# FEMCARE BACKEND
# FastAPI + XGBoost
#
# Models:
# 1. PCOS XGBoost Classifier
# 2. Cycle XGBoost Regressor
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from xgboost import XGBClassifier


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="FemCare AI Backend",
    description="Backend API for PCOS screening and menstrual cycle prediction",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================
#
# This allows your React frontend to communicate with
# your FastAPI backend during development.
#
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

MODEL_DIR = BASE_DIR / "models"

if not MODEL_DIR.exists():
    MODEL_DIR = PROJECT_ROOT / "model"

MODEL_DIR = MODEL_DIR.resolve()


PCOS_MODEL_PATH = (
    MODEL_DIR / "pcos_xgboost_model.json"
)

PCOS_IMPUTER_PATH = (
    MODEL_DIR / "pcos_imputer.pkl"
)

PCOS_FEATURES_PATH = (
    MODEL_DIR / "pcos_features.pkl"
)

CYCLE_MODEL_PATH = (
    MODEL_DIR / "cycle_prediction_xgboost_pipeline.pkl"
)


# ============================================================
# GLOBAL MODEL VARIABLES
# ============================================================

pcos_model = None
pcos_imputer = None
pcos_features = None
cycle_model = None


# ============================================================
# LOAD MODELS
# ============================================================

def load_models():

    global pcos_model
    global pcos_imputer
    global pcos_features
    global cycle_model

    # --------------------------------------------------------
    # Check files
    # --------------------------------------------------------

    required_files = [
        PCOS_MODEL_PATH,
        PCOS_IMPUTER_PATH,
        PCOS_FEATURES_PATH,
        CYCLE_MODEL_PATH
    ]

    missing_files = [
        str(file_path)
        for file_path in required_files
        if not file_path.exists()
    ]

    if missing_files:
        raise FileNotFoundError(
            "Model files not found. Expected under: "
            f"{MODEL_DIR}. Missing: {missing_files}"
        )


    # --------------------------------------------------------
    # Load PCOS XGBoost model
    # --------------------------------------------------------

    pcos_model = XGBClassifier()

    pcos_model.load_model(
        str(PCOS_MODEL_PATH)
    )


    # --------------------------------------------------------
    # Load PCOS preprocessing
    # --------------------------------------------------------

    pcos_imputer = joblib.load(
        PCOS_IMPUTER_PATH
    )


    # --------------------------------------------------------
    # Load PCOS feature list
    # --------------------------------------------------------

    pcos_features = joblib.load(
        PCOS_FEATURES_PATH
    )


    # --------------------------------------------------------
    # Load Cycle prediction pipeline
    # --------------------------------------------------------

    try:
        cycle_model = joblib.load(
            CYCLE_MODEL_PATH
        )
    except Exception as exc:
        cycle_model = None
        print()
        print("=" * 60)
        print("CYCLE MODEL LOAD FAILED")
        print("=" * 60)
        print(f"Path: {CYCLE_MODEL_PATH}")
        print(f"Reason: {type(exc).__name__}: {exc}")
        print("=" * 60)
        print()


    print()
    print("=" * 60)
    print("ALL ML MODELS LOADED SUCCESSFULLY")
    print("=" * 60)
    print()
    print("PCOS model:")
    print("   ", PCOS_MODEL_PATH)
    print()
    print("PCOS features:")
    print("   ", len(pcos_features))
    print()
    print("Cycle model:")
    print("   ", CYCLE_MODEL_PATH)
    print()
    print("=" * 60)


# ============================================================
# LOAD MODELS WHEN SERVER STARTS
# ============================================================

try:

    load_models()

except Exception as error:

    print()
    print("=" * 60)
    print("MODEL LOADING ERROR")
    print("=" * 60)
    print(error)
    print("=" * 60)
    print()


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {

        "application": "FemCare AI Backend",

        "status": "running",

        "message":
            "FemCare backend is working successfully."

    }


# ============================================================
# HEALTH CHECK API
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "healthy",

        "pcos_model_loaded":
            pcos_model is not None,

        "pcos_imputer_loaded":
            pcos_imputer is not None,

        "pcos_features_loaded":
            pcos_features is not None,

        "cycle_model_loaded":
            cycle_model is not None

    }


# ============================================================
# PCOS REQUEST
# ============================================================
#
# IMPORTANT:
#
# Your trained PCOS model may contain more features than the
# simple user-facing fields below.
#
# Therefore this request accepts flexible feature values.
#
# The backend will construct the exact feature dataframe
# expected by your trained model.
#
# ============================================================

class PCOSRequest(BaseModel):

    data: dict


# ============================================================
# PCOS PREDICTION
# ============================================================

@app.post("/api/predict/pcos")
def predict_pcos(request: PCOSRequest):

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if pcos_model is None:

        raise HTTPException(
            status_code=500,
            detail="PCOS model is not loaded."
        )


    if pcos_imputer is None:

        raise HTTPException(
            status_code=500,
            detail="PCOS imputer is not loaded."
        )


    if pcos_features is None:

        raise HTTPException(
            status_code=500,
            detail="PCOS feature list is not loaded."
        )


    try:

        # ----------------------------------------------------
        # Get user data
        # ----------------------------------------------------

        user_data = request.data


        # ----------------------------------------------------
        # Convert dictionary into DataFrame
        # ----------------------------------------------------

        input_df = pd.DataFrame(
            [user_data]
        )


        # ----------------------------------------------------
        # Add missing model features
        # ----------------------------------------------------

        for feature in pcos_features:

            if feature not in input_df.columns:

                input_df[feature] = np.nan


        # ----------------------------------------------------
        # Keep EXACT training feature order
        # ----------------------------------------------------

        input_df = input_df[
            pcos_features
        ]


        # ----------------------------------------------------
        # Convert everything to numeric
        # ----------------------------------------------------

        input_df = input_df.apply(
            pd.to_numeric,
            errors="coerce"
        )


        # ----------------------------------------------------
        # Apply SAME imputer used during training
        # ----------------------------------------------------

        input_imputed = pcos_imputer.transform(
            input_df
        )


        # ----------------------------------------------------
        # MODEL PREDICTION
        # ----------------------------------------------------

        prediction = pcos_model.predict(
            input_imputed
        )[0]


        # ----------------------------------------------------
        # MODEL PROBABILITY
        # ----------------------------------------------------

        probability = pcos_model.predict_proba(
            input_imputed
        )[0][1]


        risk_score = (
            float(probability) * 100
        )


        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        if int(prediction) == 1:

            result = "Higher model-estimated PCOS risk"

        else:

            result = "Lower model-estimated PCOS risk"


        # ----------------------------------------------------
        # RETURN RESPONSE
        # ----------------------------------------------------

        return {

            "success": True,

            "prediction":
                int(prediction),

            "risk_score":
                round(
                    risk_score,
                    2
                ),

            "result":
                result,

            "disclaimer":
                "This is an AI-based screening result, "
                "not a medical diagnosis."

        }


    except Exception as error:

        raise HTTPException(

            status_code=400,

            detail={
                "success": False,
                "error": str(error)
            }

        )


# ============================================================
# CYCLE REQUEST
# ============================================================

class CycleRequest(BaseModel):

    cycle_number: int = Field(
        ...,
        ge=1
    )

    cycle_length: float = Field(
        ...,
        gt=0
    )

    period_duration: float = Field(
        ...,
        gt=0
    )

    flow: str

    cramps: str

    headache: str

    bloating: str

    acne: str

    fatigue: str

    mood: str

    stress: str

    sleep: str

    previous_cycle_1: Optional[float] = None

    previous_cycle_2: Optional[float] = None

    previous_cycle_3: Optional[float] = None

    previous_cycle_average: Optional[float] = None

    previous_cycle_std: Optional[float] = None

    start_month: int = Field(
        ...,
        ge=1,
        le=12
    )

    start_day: int = Field(
        ...,
        ge=1,
        le=31
    )

    start_weekday: int = Field(
        ...,
        ge=0,
        le=6
    )


# ============================================================
# CYCLE PREDICTION
# ============================================================

@app.post("/api/predict/cycle")
def predict_cycle(data: CycleRequest):

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if cycle_model is None:

        raise HTTPException(
            status_code=500,
            detail="Cycle prediction model is not loaded."
        )


    try:

        # ----------------------------------------------------
        # Convert request to DataFrame
        # ----------------------------------------------------

        input_df = pd.DataFrame(
            [data.model_dump()]
        )


        # ----------------------------------------------------
        # Predict
        # ----------------------------------------------------

        prediction = cycle_model.predict(
            input_df
        )[0]


        prediction = max(
            1.0,
            float(prediction)
        )


        prediction = round(
            prediction,
            2
        )


        # ----------------------------------------------------
        # Return result
        # ----------------------------------------------------

        return {

            "success": True,

            "predicted_cycle_length":
                prediction,

            "unit":
                "days",

            "message":
                "Next cycle length predicted successfully.",

            "disclaimer":
                "This is an estimated menstrual cycle "
                "prediction and is not medical advice."

        }


    except Exception as error:

        raise HTTPException(

            status_code=400,

            detail={
                "success": False,
                "error": str(error)
            }

        )


# ============================================================
# RUN INFORMATION
# ============================================================

@app.get("/api/info")
def api_info():

    return {

        "application":
            "FemCare AI Backend",

        "models": {

            "pcos":
                "XGBoost Classifier",

            "cycle":
                "XGBoost Regressor"

        },

        "endpoints": [

            "GET /",

            "GET /health",

            "GET /api/info",

            "POST /api/predict/pcos",

            "POST /api/predict/cycle"

        ]

    }