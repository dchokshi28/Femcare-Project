from fastapi import FastAPI, HTTPException, Request, Header, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Literal
import joblib
import pandas as pd
import numpy as np
from datetime import date, datetime, timedelta, timezone
import os
from pathlib import Path
from urllib.parse import urlsplit
from supabase import create_client, Client
from dotenv import load_dotenv
import httpx
import re
import uuid
import asyncio
from collections import defaultdict
# Resolve secrets from this backend's own .env regardless of the launch directory.
BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env", override=False)

try:
    from .auth import authenticate, login_user, signup_user, update_profile, safe_user, save_supabase_profile_mapping
    from .provider_catalog import validate_provider
    from .payment_service import PaymentUnavailable, complete_demo_transaction, get_active_entitlement, get_latest_subscription, payment_mode, start_demo_transaction
    from .awareness_data import get_public_conditions, get_condition_details
except ImportError:  # `uvicorn main:app` when started inside backend/
    from auth import authenticate, login_user, signup_user, update_profile, safe_user, save_supabase_profile_mapping
    from provider_catalog import validate_provider
    from payment_service import PaymentUnavailable, complete_demo_transaction, get_active_entitlement, get_latest_subscription, payment_mode, start_demo_transaction
    from awareness_data import get_public_conditions, get_condition_details


# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Keep other proxy behavior intact, but send the configured Supabase host and
# Groq API directly when HTTP clients honor NO_PROXY/no_proxy.
supabase_host = urlsplit(SUPABASE_URL).hostname if SUPABASE_URL else None
direct_service_hosts = [host for host in (supabase_host, "api.groq.com") if host]
for proxy_bypass_variable in ("NO_PROXY", "no_proxy"):
    bypass_hosts = [
        entry.strip()
        for entry in os.getenv(proxy_bypass_variable, "").split(",")
        if entry.strip()
    ]
    existing_hosts = {entry.lower() for entry in bypass_hosts}
    for service_host in direct_service_hosts:
        if service_host.lower() not in existing_hosts:
            bypass_hosts.append(service_host)
            existing_hosts.add(service_host.lower())
    os.environ[proxy_bypass_variable] = ",".join(bypass_hosts)

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("WARNING: Supabase credentials not found. Database persistence will be disabled.")
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("Supabase client initialized")

# APP setup
app = FastAPI(
    title="AI Women's Reproductive Health API",
    description="Predicts PCOS, cycle irregularity and next cycle date based on user input data",
    version="1.1.0"
)


@app.on_event("startup")
def report_auth_readiness():
    # Report readiness without ever logging configuration values.
    try:
        from . import auth as auth_service
    except ImportError:  # `uvicorn main:app` from backend/
        import auth as auth_service
    print(f"MONGODB_URI configured: {bool(auth_service.MONGODB_URI)}")
    print(f"JWT_SECRET configured: {len(auth_service.JWT_SECRET) >= 32}")
    print(f"MongoDB connected: {auth_service.mongo_connected}")

# CORS configuration - Allow the entire frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []
    for err in errors:
        loc = [str(l) for l in err.get("loc", []) if l != "body"]
        field_str = " ".join(loc)
        msg = err.get("msg", "Invalid value")
        if field_str:
            messages.append(f"{field_str.capitalize()}: {msg}")
        else:
            messages.append(msg)
    detail_msg = ". ".join(messages) if messages else "Invalid request data."
    return JSONResponse(
        status_code=422,
        content={"detail": detail_msg, "errors": errors},
    )


@app.get("/")
def api_root():
    return {"status": "ok", "message": "FEMCARE API is running"}


@app.get("/favicon.ico", include_in_schema=False)
def api_favicon():
    return Response(content=b"", media_type="image/x-icon")


class SignupPayload(BaseModel):
    model_config = {"extra": "ignore"}
    email: str
    password: str = Field(min_length=8, max_length=128)
    name: Optional[str] = None
    age: Optional[int] = 25
    cycleLength: Optional[int] = 28
    cycle_length: Optional[int] = None
    lastPeriodDate: Optional[str] = None
    last_period_date: Optional[str] = None


class LoginPayload(BaseModel):
    model_config = {"extra": "ignore"}
    email: str
    password: str


@app.post("/api/auth/signup")
def auth_signup(payload: SignupPayload, response: Response):
    if not supabase:
        legacy_id = None
    else:
        legacy_id = None
        try:
            existing = supabase.table("users").select("id").eq("email", payload.email.strip().lower()).limit(1).execute()
            if existing.data:
                legacy_id = existing.data[0].get("id")
        except Exception:
            # Mapping is opportunistic; existing records remain untouched.
            pass
    raw_data = payload.model_dump()
    if raw_data.get("cycleLength") is None and raw_data.get("cycle_length") is not None:
        raw_data["cycleLength"] = raw_data["cycle_length"]
    if raw_data.get("lastPeriodDate") is None and raw_data.get("last_period_date") is not None:
        raw_data["lastPeriodDate"] = raw_data["last_period_date"]
    user = signup_user(raw_data, response, legacy_id)
    return {"user": user}


@app.post("/api/auth/login")
def auth_login(payload: LoginPayload, response: Response):
    return {"user": login_user(payload.model_dump(), response)}


@app.post("/api/auth/logout")
def auth_logout(response: Response):
    response.delete_cookie("femcare_session", path="/")
    return {"success": True}


@app.get("/api/auth/me")
def auth_me(request: Request):
    doc = authenticate(request, required=False)
    if not doc:
        return {"user": None}
    try:
        resolve_supabase_profile_id(doc)
    except HTTPException as error:
        # Mongo remains the authentication source of truth; Supabase profile
        # provisioning must not invalidate a valid Mongo session.
        print(f"Application profile provisioning unavailable: HTTP {error.status_code}")
    return {"user": safe_user(doc)}


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    cycle_length: Optional[int] = None
    last_period_date: Optional[str] = None


@app.patch("/api/auth/me")
def auth_update_me(payload: ProfileUpdate, request: Request):
    doc = authenticate(request)
    return {"user": update_profile(doc, payload.model_dump(exclude_none=True))}


def resolve_supabase_profile_id(auth_doc: dict) -> str:
    """Resolve or provision the stable application profile for a Mongo user."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Booking database is not available.")

    mongo_id = str(auth_doc.get("_id") or "")
    email = str(auth_doc.get("email") or "").strip().lower()
    if not mongo_id or not email:
        raise HTTPException(status_code=409, detail="This account cannot be linked to an application profile.")

    def link_existing_profile(profile: dict) -> str:
        profile_id = str(profile.get("id") or "")
        if not profile_id:
            raise HTTPException(status_code=503, detail="Application profile has no valid ID.")
        save_supabase_profile_mapping(auth_doc, profile_id)
        return profile_id

    try:
        # Reuse the account's previous application profile if the old mapping
        # still points to a real row, preserving all existing data references.
        legacy_id = auth_doc.get("legacySupabaseUserId")
        if legacy_id:
            legacy_rows = (
                supabase.table("users")
                .select("id,email")
                .eq("id", str(legacy_id))
                .limit(1)
                .execute()
            ).data or []
            if legacy_rows:
                return link_existing_profile(legacy_rows[0])

        # Match and persist an existing app profile by normalized email once.
        by_email = (
            supabase.table("users")
            .select("id,email")
            .ilike("email", email.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_"))
            .limit(2)
            .execute()
        ).data or []
        by_email = [
            row for row in by_email
            if str(row.get("email") or "").strip().lower() == email
        ]
        if len(by_email) > 1:
            raise HTTPException(status_code=409, detail="Multiple application profiles match this account.")
        if by_email:
            return link_existing_profile(by_email[0])

        # Provision one real profile for this authenticated Mongo identity.
        # UUIDv5 is deterministic for this Mongo ID; the profile and mapping
        # are persisted together, so later requests reuse the same public ID.
        profile_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"femcare:mongo-user:{mongo_id}"))
        age = auth_doc.get("age", 25)
        if not isinstance(age, int) or not 10 <= age <= 100:
            age = 25
        cycle_length = auth_doc.get("cycleLength", 28)
        if not isinstance(cycle_length, int) or not 21 <= cycle_length <= 45:
            cycle_length = 28
        last_period_date = auth_doc.get("lastPeriodDate")
        try:
            if last_period_date:
                date.fromisoformat(str(last_period_date))
        except ValueError:
            last_period_date = None
        profile_values = {
            "id": profile_id,
            "name": str(auth_doc.get("name") or email.split("@", 1)[0]).strip()[:120],
            "email": email,
            "age": age,
            "cycle_length": cycle_length,
            "last_period_date": last_period_date,
        }
        try:
            created = (
                supabase.table("users")
                .insert(profile_values)
                .select("id,email")
                .execute()
            ).data or []
        except Exception:
            # A concurrent request may have created this deterministic ID or
            # the insert response may have been lost after commit.
            retry = (supabase.table("users").select("id,email").eq("id", profile_id).limit(1).execute()).data or []
            if retry:
                return link_existing_profile(retry[0])
            retry = (
                supabase.table("users")
                .select("id,email")
                .ilike("email", email.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_"))
                .limit(1)
                .execute()
            ).data or []
            if retry and str(retry[0].get("email") or "").strip().lower() == email:
                return link_existing_profile(retry[0])
            raise
        if not created or str(created[0].get("id")) != profile_id:
            raise HTTPException(status_code=503, detail="Application profile provisioning did not complete.")
        save_supabase_profile_mapping(auth_doc, profile_id)
        return profile_id
    except HTTPException:
        raise
    except Exception as error:
        error_code = getattr(error, "code", None)
        print(f"Supabase profile lookup/provisioning failed: {type(error).__name__}; code={error_code or 'unavailable'}")
        if error_code == "23503":
            detail = "Supabase rejected the profile because of a foreign-key constraint. Apply supabase/migrations/004_decouple_users_from_supabase_auth.sql in the Femcare SQL Editor, then retry."
        elif error_code == "42703":
            detail = "Supabase public.users does not match the application schema. Check the public.users columns and apply the repository migrations."
        else:
            detail = "Supabase could not resolve the application profile. Check backend connectivity and the public.users schema, then retry."
        raise HTTPException(
            status_code=503,
            detail=detail,
        )


class DemoSubscriptionCheckoutRequest(BaseModel):
    plan: Literal["monthly", "annual"]

    class Config:
        extra = "forbid"


def _require_subscription_store() -> Client:
    if not supabase:
        raise HTTPException(status_code=503, detail="Subscription storage is unavailable.")
    return supabase


def _safe_subscription_error(error: Exception) -> str:
    """Return a useful database diagnostic without leaking configured secrets."""
    detail = str(getattr(error, "message", None) or error)
    for secret in (SUPABASE_SERVICE_ROLE_KEY, os.getenv("JWT_SECRET", ""), os.getenv("MONGODB_URI", "")):
        if secret:
            detail = detail.replace(secret, "[redacted]")
    return detail[:400]


@app.get("/api/subscriptions/payment-mode")
def subscription_payment_mode():
    """Expose only the active payment mode; never return payment credentials."""
    return {"mode": payment_mode()}


@app.get("/api/subscriptions/me")
def subscription_me(request: Request):
    store = _require_subscription_store()
    auth_doc = authenticate(request)
    profile_id = resolve_supabase_profile_id(auth_doc)
    try:
        entitlement = get_active_entitlement(store, profile_id)
        latest_sub = get_latest_subscription(store, profile_id)
    except Exception as error:
        code = getattr(error, "code", None)
        print(f"Subscription lookup failed: {type(error).__name__}; code={code or 'unavailable'}; detail={_safe_subscription_error(error)}")
        raise HTTPException(
            status_code=503,
            detail="Subscription storage is unavailable. Apply the subscription migration and retry.",
        )
    latest_info = None
    if latest_sub:
        latest_info = {
            "plan_type": latest_sub.get("plan_type"),
            "payment_status": latest_sub.get("payment_status"),
            "subscription_status": latest_sub.get("subscription_status"),
            "activated_at": latest_sub.get("activated_at"),
            "expires_at": latest_sub.get("expires_at"),
        }
    if not entitlement:
        return {"entitlement": None, "latest_subscription": latest_info}
    return {
        "entitlement": {
            "subscription": "premium",
            "plan_type": entitlement["plan_type"],
            "provider": entitlement["provider"],
            "payment_status": entitlement["payment_status"],
            "subscription_status": entitlement["subscription_status"],
            "activated_at": entitlement["activated_at"],
            "expires_at": entitlement["expires_at"],
        },
        "latest_subscription": latest_info,
    }


def check_user_subscription(request: Request) -> Optional[dict]:
    """Check if the requesting user has an active, paid, unexpired subscription.
    Never trusts client-supplied headers or flags. Enforces server-side database truth."""
    if not supabase:
        return None
    auth_doc = authenticate(request, required=False)
    if not auth_doc:
        return None
    try:
        profile_id = resolve_supabase_profile_id(auth_doc)
        return get_active_entitlement(supabase, profile_id)
    except Exception as error:
        print(f"Subscription check failed: {error}")
        return None


@app.get("/api/awareness/conditions")
def api_get_awareness_conditions():
    """Public educational list of common conditions with brief overviews."""
    return {"conditions": get_public_conditions()}


@app.get("/api/awareness/conditions/{condition_id}/details")
def api_get_condition_details(condition_id: str, request: Request):
    """Server-side protected endpoint for in-depth disease clinical details.
    Only users with an active verified paid subscription (Monthly or Annual) can access full clinical guidelines.
    Direct API requests without an active paid subscription are denied with 403 Forbidden.
    """
    auth_doc = authenticate(request, required=True)
    entitlement = check_user_subscription(request)
    if not entitlement:
        raise HTTPException(
            status_code=403,
            detail="Active Premium subscription required to access detailed condition guides.",
        )
    details = get_condition_details(condition_id)
    if not details:
        raise HTTPException(status_code=404, detail="Condition not found.")
    return {"condition": details, "entitlement": entitlement}


@app.get("/api/awareness/access-status")
def api_get_awareness_access_status(request: Request):
    """Server-side verified access status for Awareness content."""
    entitlement = check_user_subscription(request)
    return {
        "has_premium_access": bool(entitlement),
        "plan_type": entitlement.get("plan_type") if entitlement else None,
        "expires_at": entitlement.get("expires_at") if entitlement else None,
    }



@app.post("/api/subscriptions/demo/checkout")
def subscription_demo_checkout(payload: DemoSubscriptionCheckoutRequest, request: Request):
    store = _require_subscription_store()
    auth_doc = authenticate(request)
    profile_id = resolve_supabase_profile_id(auth_doc)
    try:
        transaction = start_demo_transaction(store, profile_id, payload.plan)
        transaction = complete_demo_transaction(store, profile_id, str(transaction["transaction_id"]))
    except PaymentUnavailable as error:
        raise HTTPException(status_code=503, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except Exception as error:
        code = getattr(error, "code", None)
        print(f"Demo checkout failed: {type(error).__name__}; code={code or 'unavailable'}; detail={_safe_subscription_error(error)}")
        raise HTTPException(
            status_code=503,
            detail="Demo checkout is unavailable. Apply the subscription migration and retry.",
        )
    if transaction.get("payment_status") != "paid" or transaction.get("subscription_status") != "active":
        raise HTTPException(status_code=503, detail="Demo checkout did not activate Premium.")
    return {
        "mode": "demo",
        "transaction": {
            "transaction_id": transaction.get("transaction_id"),
            "plan_type": transaction.get("plan_type"),
            "amount_paise": transaction.get("amount_paise"),
            "currency": transaction.get("currency"),
            "payment_status": transaction.get("payment_status"),
            "subscription_status": transaction.get("subscription_status"),
            "activated_at": transaction.get("activated_at"),
            "expires_at": transaction.get("expires_at"),
        },
        "entitlement": {
            "subscription": "premium",
            "plan_type": transaction.get("plan_type"),
            "subscription_status": transaction.get("subscription_status"),
            "expires_at": transaction.get("expires_at"),
        },
    }


ALLOWED_DATA_TABLES = {"users", "periods", "symptoms", "cycle_logs", "cycle_history", "health_assessments", "assessment_results", "bookings"}


class DataQuery(BaseModel):
    table: str
    action: str = "select"
    columns: str = "*"
    values: Optional[Any] = None
    filters: list[dict] = Field(default_factory=list)
    ordering: Optional[dict] = None
    limit: Optional[int] = None
    single: bool = False
    on_conflict: Optional[str] = None
    returning: bool = False


@app.post("/api/data/query")
def data_query(payload: DataQuery, request: Request):
    """Compatibility bridge for existing Supabase data features; ownership is server-enforced."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
    doc = authenticate(request)
    if payload.table not in ALLOWED_DATA_TABLES or payload.action not in {"select", "insert", "upsert", "update", "delete"}:
        raise HTTPException(status_code=400, detail="Unsupported data request.")
    allowed_columns = {
        "users": {"id", "email", "name", "age", "cycle_length", "last_period_date", "created_at"},
        "periods": {"id", "user_id", "start_date", "end_date", "flow", "notes", "created_at"},
        "symptoms": {"id", "user_id", "symptom_date", "symptom_name", "severity", "notes", "created_at"},
        "cycle_logs": {"id", "user_id", "log_date", "flow", "pain_level", "symptoms", "moods", "created_at"},
        "cycle_history": {"id", "user_id", "period_id", "cycle_start_date", "cycle_end_date", "cycle_length", "period_length", "created_at"},
        "health_assessments": {"id", "user_id", "age", "height_cm", "weight_kg", "cycle_length_days", "bleeding_days", "insulin_resistance", "periods_regular", "dark_patches_neck", "fast_food_frequent", "exercise_regularly", "family_history_pcos", "skip_periods_months", "excess_facial_hair", "severe_acne", "thyroid_status", "LH", "FSH", "LH_FSH_ratio", "lh", "fsh", "lh_fsh_ratio", "created_at"},
        "assessment_results": {"id", "assessment_id", "user_id", "pcos_detected", "confidence", "risk_level", "prediction_label", "message", "recommendation", "cycle_irregular", "created_at"},
        "bookings": {"id", "user_id", "provider_id", "hospital_name", "doctor_specialty", "appointment_date", "appointment_slot", "phone", "notes", "status", "created_at"},
    }
    normalized_columns = re.sub(r"\s+", " ", payload.columns).strip()
    embedded_cycle_projection = payload.table == "cycle_history" and bool(re.fullmatch(
        r"\*, periods \( id, start_date, end_date, flow, notes \)", normalized_columns
    ))
    if normalized_columns != "*" and not embedded_cycle_projection:
        selected = {part.strip() for part in normalized_columns.split(",")}
        if not selected or not selected.issubset(allowed_columns[payload.table]):
            raise HTTPException(status_code=400, detail="Invalid data selection.")
    query = supabase.table(payload.table)
    legacy_id = resolve_supabase_profile_id(doc)
    values = payload.values
    try:
        if payload.action == "select":
            query = query.select("*" if embedded_cycle_projection else payload.columns)
        elif payload.action == "insert":
            if payload.table == "users":
                raise HTTPException(status_code=403, detail="Profile creation is managed by authentication.")
            if isinstance(values, list):
                values = [{**row, "user_id": legacy_id} for row in values]
            else:
                values = {**(values or {}), "user_id": legacy_id}
            query = query.insert(values)
            if payload.returning: query = query.select(payload.columns)
        elif payload.action == "upsert":
            rows = values if isinstance(values, list) else [values or {}]
            values = [{**row, "user_id": legacy_id} for row in rows]
            conflict = "user_id,log_date" if payload.table == "cycle_logs" else "user_id"
            query = query.upsert(values, on_conflict=conflict)
            if payload.returning: query = query.select(payload.columns)
        elif payload.action == "update":
            if payload.table == "users":
                changes = values or {}
                mongo_changes = {}
                if "name" in changes: mongo_changes["name"] = changes["name"]
                if "age" in changes: mongo_changes["age"] = changes["age"]
                if "cycle_length" in changes: mongo_changes["cycle_length"] = changes["cycle_length"]
                if "last_period_date" in changes: mongo_changes["last_period_date"] = changes["last_period_date"]
                update_profile(doc, mongo_changes)
            safe_values = dict(values or {})
            safe_values.pop("user_id", None)
            safe_values.pop("id", None)
            query = query.update(safe_values)
            if payload.returning: query = query.select(payload.columns)
        else:
            query = query.delete()
            if payload.returning: query = query.select(payload.columns)

        for item in payload.filters:
            field, operator, value = item.get("field"), item.get("operator"), item.get("value")
            if not isinstance(field, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", field):
                continue
            if operator in {"eq", "gte", "lte", "gt", "lt"}:
                query = getattr(query, operator)(field, value)
            elif operator == "not_is":
                query = query.not_.is_(field, value)
        # Force an ownership predicate regardless of client-supplied filters.
        if payload.table == "users":
            query = query.eq("id", legacy_id)
        else:
            query = query.eq("user_id", legacy_id)
        if payload.ordering:
            query = query.order(payload.ordering["field"], desc=not payload.ordering.get("ascending", True))
        if payload.limit is not None:
            query = query.limit(max(0, min(payload.limit, 500)))
        result = query.execute()
        rows = result.data or []
        if embedded_cycle_projection and rows:
            period_ids = [row.get("period_id") for row in rows if row.get("period_id")]
            period_rows = []
            if period_ids:
                period_response = supabase.table("periods").select("id,start_date,end_date,flow,notes").eq("user_id", legacy_id).in_("id", period_ids).execute()
                period_rows = period_response.data or []
            period_by_id = {period["id"]: period for period in period_rows}
            for row in rows:
                row["periods"] = period_by_id.get(row.get("period_id"))
        if payload.single:
            if not rows:
                return {"data": None, "error": {"message": "No rows found", "code": "PGRST116"}}
            if len(rows) > 1:
                return {"data": None, "error": {"message": "Multiple rows found", "code": "PGRST116"}}
            return {"data": rows[0], "error": None}
        return {"data": rows, "error": None}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="The health data service is temporarily unavailable.")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. PCOS ML Model Artifacts
PCOS_MODEL_PATH = os.path.join(BASE_DIR, 'pcos_xgboost_model.json')
PCOS_FEATURES_PATH = os.path.join(BASE_DIR, 'pcos_features.pkl')
PCOS_IMPUTER_PATH = os.path.join(BASE_DIR, 'pcos_imputer.pkl')

pcos_model = None
pcos_features = []
pcos_imputer = None

try:
    import xgboost as xgb
    pcos_model = xgb.XGBClassifier()
    pcos_model.load_model(PCOS_MODEL_PATH)
    pcos_features = joblib.load(PCOS_FEATURES_PATH)
    pcos_imputer = joblib.load(PCOS_IMPUTER_PATH)
    print("PCOS XGBoost classifier and imputer loaded successfully")
except Exception as e:
    print(f"Warning: PCOS model could not be loaded: {e}. Falling back to heuristic logic.")
    pcos_model = None
    pcos_features = []
    pcos_imputer = None

# 2. Cycle Prediction ML Model Pipeline
CYCLE_MODEL_PATH = os.path.join(BASE_DIR, 'cycle_prediction_xgboost_pipeline.pkl')
cycle_model = None

try:
    cycle_model = joblib.load(CYCLE_MODEL_PATH)
    print("Cycle prediction XGBoost pipeline loaded successfully")
except Exception as e:
    print(f"Warning: Cycle prediction model could not be loaded: {e}.")
    cycle_model = None

# Backward compatibility references
model = pcos_model or cycle_model
feature_names = pcos_features

class HealthData(BaseModel):
    age: int = 25
    height_cm: float = 160.0
    weight_kg: float = 60.0
    cycle_length_days: int = Field(28, alias="cycleLength")
    bleeding_days: int = Field(5, alias="periodDuration")
    insulin_resistance: int = 0
    periods_regular: int = 1
    dark_patches_neck: int = 0
    fast_food_frequent: int = 0
    exercise_regularly: int = 1
    family_history_pcos: int = 0
    skip_periods_months: int = 0
    excess_facial_hair: int = 0
    severe_acne: int = 0
    thyroid_status: int = 0
    LH: float = 0.0
    FSH: float = 0.0
    LH_FSH_ratio: float = 0.0

    model_config = {
        "populate_by_name": True
    }

class CycleDateData(BaseModel):
    last_period_date: str
    average_cycle_length: int = 28

# --- Heuristic Fallback for Prediction ---
def get_heuristic_prediction(data: dict):
    # Heuristic logic similar to what was in app.py
    cycle_length = data.get('cycle_length_days', 28)
    age = data.get('age', 25)
    
    # Specific PCOS markers
    pcos_markers = 0
    if data.get('excess_facial_hair'): pcos_markers += 1
    if data.get('severe_acne'): pcos_markers += 1
    if data.get('dark_patches_neck'): pcos_markers += 1
    if not data.get('periods_regular'): pcos_markers += 1
    if data.get('skip_periods_months'): pcos_markers += 1
    if data.get('family_history_pcos'): pcos_markers += 0.5
    
    pcos_detected = pcos_markers >= 2
    confidence = min(pcos_markers * 20 + 20, 95) if pcos_detected else 85
    
    cycle_irregular = cycle_length < 21 or cycle_length > 35
    
    risk_level = "Low Risk"
    if pcos_detected:
        risk_level = "High Risk" if confidence > 75 else "Moderate Risk"
    
    return {
        "prediction": "High Risk" if pcos_detected else "Normal Cycle",
        "pcos_detected": pcos_detected,
        "confidence": round(confidence, 2),
        "cycle_irregular": cycle_irregular,
        "cycle_length_days": cycle_length,
        "risk_level": risk_level,
        "message": (
            "PCOS indicators detected. Please consult a healthcare professional."
            if pcos_detected else
            "No PCOS indicators detected. Maintain a healthy lifestyle."
        ),
        "recommendation": (
            "Significant irregularities or patterns detected. We recommend consulting with a healthcare professional for a detailed check-up."
            if pcos_detected else
            "Your cycle seems healthy and regular. Keep maintaining a balanced diet and regular exercise."
        )
    }

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "AI Women's Health API is running",
        "persistence_configured": supabase is not None,
        "model_loaded": (pcos_model is not None or cycle_model is not None or model is not None),
        "pcos_model_loaded": pcos_model is not None,
        "cycle_model_loaded": cycle_model is not None,
        "llm_available": LLM_AVAILABLE,
        "llm_provider": "groq" if LLM_AVAILABLE else None,
        "llm_model": GROQ_MODEL if LLM_AVAILABLE else None,
        "email_enabled": EMAIL_ENABLED,
    }

_user_assessment_locks = defaultdict(asyncio.Lock)

def get_user_assessment_lock(user_id: str) -> asyncio.Lock:
    return _user_assessment_locks[user_id]


@app.get("/api/assessment-eligibility")
async def get_assessment_eligibility(request: Request):
    """
    Check if the authenticated user is eligible to take a health assessment quiz.
    Every user account is allowed exactly 2 free quizzes in total across the Assessment feature.
    Subsequent quizzes require an active verified paid subscription.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    auth_doc = authenticate(request)
    user_id = resolve_supabase_profile_id(auth_doc)

    try:
        assessments_res = supabase.table("health_assessments").select("id").eq("user_id", user_id).execute()
        assessments = assessments_res.data or []
        used_count = len(assessments)
    except Exception as e:
        print(f"Failed to query existing user assessments for eligibility: {e}")
        used_count = 0

    entitlement = check_user_subscription(request)
    has_active_sub = bool(entitlement)
    free_limit = 2
    free_exhausted = used_count >= free_limit
    can_take_quiz = (not free_exhausted) or has_active_sub

    return {
        "can_take_quiz": can_take_quiz,
        "used_quizzes": used_count,
        "free_limit": free_limit,
        "free_exhausted": free_exhausted,
        "has_active_subscription": has_active_sub,
        "plan_type": entitlement.get("plan_type") if entitlement else None,
        "message": (
            "You've used your 2 free quizzes. Upgrade your subscription to continue."
            if (free_exhausted and not has_active_sub)
            else "Eligible to take assessment."
        ),
    }


# Endpoint for detailed Health Assessment
@app.post("/api/predict")
@app.post("/predict")
async def predict_pcos(data: HealthData, request: Request):
    """
    PCOS prediction endpoint with Supabase persistence, free quiz limit enforcement,
    and real XGBClassifier.
    Flow:
    1. Verify user authentication (optional for backward-compatible ML testing, required for user accounts)
    2. Check free quiz quota (2 free quizzes allowed for free users; subscribers follow plan)
    3. Save assessment INPUT to health_assessments table
    4. Run ML prediction (using trained PCOS XGBoost classifier and median imputer)
    5. Save assessment RESULT to assessment_results table
    6. Return prediction to frontend
    """
    
    # Extract user ID from authorization header or cookie (if provided)
    auth_doc = authenticate(request, required=False)
    user_id = None
    if auth_doc and supabase:
        try:
            user_id = resolve_supabase_profile_id(auth_doc)
        except HTTPException as error:
            print(f"Assessment profile unavailable: HTTP {error.status_code}")
    
    # Convert input to dict
    input_dict = data.dict(by_alias=False)
    
    # STEP 1: Save assessment input (if user is authenticated) under lock
    assessment_id = None
    if user_id and supabase:
        async with get_user_assessment_lock(user_id):
            try:
                existing_res = supabase.table("health_assessments").select("id").eq("user_id", user_id).execute()
                existing_assessments = existing_res.data or []
                used_count = len(existing_assessments)
            except Exception as e:
                print(f"Failed to query existing health assessments: {e}")
                used_count = 0

            if used_count >= 2:
                entitlement = check_user_subscription(request)
                if not entitlement:
                    raise HTTPException(
                        status_code=403,
                        detail="You've used your 2 free quizzes. Upgrade your subscription to continue."
                    )

            try:
                assessment_data = {
                    "user_id": user_id,
                    "age": input_dict.get("age"),
                    "height_cm": input_dict.get("height_cm"),
                    "weight_kg": input_dict.get("weight_kg"),
                    "cycle_length_days": input_dict.get("cycle_length_days"),
                    "bleeding_days": input_dict.get("bleeding_days"),
                    "insulin_resistance": input_dict.get("insulin_resistance"),
                    "periods_regular": input_dict.get("periods_regular"),
                    "dark_patches_neck": input_dict.get("dark_patches_neck"),
                    "fast_food_frequent": input_dict.get("fast_food_frequent"),
                    "exercise_regularly": input_dict.get("exercise_regularly"),
                    "family_history_pcos": input_dict.get("family_history_pcos"),
                    "skip_periods_months": input_dict.get("skip_periods_months"),
                    "excess_facial_hair": input_dict.get("excess_facial_hair"),
                    "severe_acne": input_dict.get("severe_acne"),
                    "thyroid_status": input_dict.get("thyroid_status"),
                    "lh": input_dict.get("LH") if input_dict.get("LH") is not None else input_dict.get("lh"),
                    "fsh": input_dict.get("FSH") if input_dict.get("FSH") is not None else input_dict.get("fsh"),
                    "lh_fsh_ratio": input_dict.get("LH_FSH_ratio") if input_dict.get("LH_FSH_ratio") is not None else input_dict.get("lh_fsh_ratio"),
                }
                # Filter out None values that aren't valid columns
                clean_assessment_data = {k: v for k, v in assessment_data.items() if v is not None}
                response = supabase.table("health_assessments").insert(clean_assessment_data).execute()
                if response.data and len(response.data) > 0:
                    assessment_id = response.data[0].get('id')
                    print(f"[OK] Assessment input saved: {assessment_id}")
            except Exception as e:
                print(f"Failed to save assessment input: {e}")
    
    # STEP 2: Run ML prediction using real PCOS classifier
    prediction_result = None
    if pcos_model and pcos_imputer and len(pcos_features) > 0:
        try:
            # Map frontend HealthData to the 42 features trained in PCOSmodel.ipynb
            pcos_row = {f: np.nan for f in pcos_features}
            pcos_row['age_yrs'] = input_dict.get('age', 25)
            pcos_row['weight_kg'] = input_dict.get('weight_kg', 60.0)
            pcos_row['height_cm'] = input_dict.get('height_cm', 160.0)
            ht = float(input_dict.get('height_cm', 160.0))
            wt = float(input_dict.get('weight_kg', 60.0))
            if ht > 0:
                pcos_row['bmi'] = wt / ((ht / 100.0) ** 2)
            # Cycle regularity: in dataset, 2 = regular, 4 = irregular
            pcos_row['cycle_regularity'] = 2 if input_dict.get('periods_regular', 1) else 4
            pcos_row['period_duration_days'] = input_dict.get('bleeding_days', 5)
            pcos_row['skin_darkening'] = input_dict.get('dark_patches_neck', 0)
            pcos_row['fast_food'] = input_dict.get('fast_food_frequent', 0)
            pcos_row['regular_exercise'] = input_dict.get('exercise_regularly', 1)
            pcos_row['hair_growth'] = input_dict.get('excess_facial_hair', 0)
            pcos_row['pimples'] = input_dict.get('severe_acne', 0)
            pcos_row['lh_miu_ml'] = input_dict.get('LH', 0.0)
            pcos_row['fsh_miu_ml'] = input_dict.get('FSH', 0.0)
            pcos_row['lh_fsh_ratio'] = input_dict.get('LH_FSH_ratio', 0.0)

            df_42 = pd.DataFrame([pcos_row])[pcos_features]
            imputed_array = pcos_imputer.transform(df_42)

            prediction = int(pcos_model.predict(imputed_array)[0])
            probability = pcos_model.predict_proba(imputed_array)[0]

            pcos_detected = bool(prediction == 1)
            confidence = float(probability[1] if pcos_detected else probability[0]) * 100

            prediction_result = {
                "prediction": "Possible PCOS" if pcos_detected else "Normal Cycle",
                "pcos_detected": pcos_detected,
                "confidence": round(confidence, 2),
                "cycle_irregular": data.cycle_length_days < 21 or data.cycle_length_days > 35,
                "cycle_length_days": data.cycle_length_days,
                "risk_level": "High Risk" if pcos_detected and confidence > 75 else "Moderate Risk" if pcos_detected else "Low Risk",
                "message": "PCOS indicators detected." if pcos_detected else "No PCOS indicators detected.",
                "recommendation": (
                    "Significant irregularities or patterns detected. We recommend consulting with a healthcare professional."
                    if pcos_detected else
                    "Your cycle seems healthy and regular. Keep maintaining a balanced diet and regular exercise."
                )
            }
        except Exception as e:
            print(f"PCOS ML Prediction error, falling back to heuristic: {e}")
            prediction_result = get_heuristic_prediction(input_dict)
    else:
        prediction_result = get_heuristic_prediction(input_dict)
    
    # STEP 3: Save assessment result (if we have assessment_id)
    if assessment_id and user_id and supabase and prediction_result:
        try:
            result_data = {
                "assessment_id": assessment_id,
                "user_id": user_id,
                "pcos_detected": prediction_result.get("pcos_detected"),
                "confidence": prediction_result.get("confidence"),
                "risk_level": prediction_result.get("risk_level"),
                "prediction_label": prediction_result.get("prediction"),
                "message": prediction_result.get("message"),
                "recommendation": prediction_result.get("recommendation"),
                "cycle_irregular": prediction_result.get("cycle_irregular")
            }
            supabase.table("assessment_results").insert(result_data).execute()
            print(f"[OK] Assessment result saved for assessment: {assessment_id}")
        except Exception as e:
            print(f"Failed to save assessment result: {e}")
    
    return prediction_result


# --- Core Cycle Prediction Handler (uses trained XGBRegressor pipeline) ---
def run_cycle_prediction(data: dict, request: Optional[Request] = None):
    # Normalize field aliases
    last_period_str = data.get("last_period_date") or data.get("lastPeriodDate")
    cycle_len = float(data.get("cycle_length") or data.get("cycleLength") or data.get("average_cycle_length") or 28.0)
    period_dur = float(data.get("period_duration") or data.get("periodDuration") or 5.0)

    # If last period date is missing from request body, attempt to check authenticated user
    if not last_period_str and request:
        try:
            auth_doc = authenticate(request, required=False)
            if auth_doc and auth_doc.get("last_period_date"):
                last_period_str = auth_doc.get("last_period_date")
        except Exception:
            pass

    if not last_period_str:
        return {
            "success": False,
            "error": "Missing last period date. Please log your last period start date to predict your next cycle.",
            "last_period_date": None,
            "next_period_date": None,
            "predicted_next_period_date": None,
            "predicted_cycle_length": None,
            "days_until": None
        }

    try:
        clean_date_str = str(last_period_str).split("T")[0]
        last_date = date.fromisoformat(clean_date_str)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid date format: '{last_period_str}'. Expected YYYY-MM-DD.")

    today = date.today()
    predicted_cycle_length = cycle_len
    model_used = "heuristic"

    if cycle_model is not None:
        try:
            # Map categorical values
            flow_val = str(data.get("flow") or "Medium").capitalize()
            if flow_val not in ['Heavy', 'Light', 'Medium']:
                flow_val = 'Light' if flow_val == 'Spotting' else 'Medium'

            # Map cramps from cramps or pain_level
            cramps_val = data.get("cramps")
            if not cramps_val and data.get("pain_level"):
                cramps_val = str(data.get("pain_level")).capitalize()
            if cramps_val not in ['Mild', 'Moderate', 'Severe']:
                cramps_val = None

            # Map mood
            mood_val = data.get("mood")
            if not mood_val and isinstance(data.get("moods"), list) and len(data.get("moods")) > 0:
                mood_first = str(data.get("moods")[0]).capitalize()
                mood_map = {'Happy': 'Happy', 'Sad': 'Sad', 'Sensitive': 'Anxious', 'Energetic': 'Happy'}
                mood_val = mood_map.get(mood_first, 'Neutral')
            if mood_val not in ['Anxious', 'Happy', 'Irritable', 'Neutral', 'Sad']:
                mood_val = None

            # Prepare 20-feature DataFrame matching CyclePred.ipynb training features
            df_input = pd.DataFrame([{
                'Cycle_Number': int(data.get("cycle_number") or 1),
                'Cycle_Length': cycle_len,
                'Period_Duration': period_dur,
                'Flow': flow_val,
                'Cramps': cramps_val,
                'Headache': data.get("headache"),
                'Bloating': data.get("bloating"),
                'Acne': data.get("acne"),
                'Fatigue': data.get("fatigue"),
                'Mood': mood_val,
                'Stress': data.get("stress"),
                'Sleep': data.get("sleep"),
                'Previous_Cycle_1': float(data.get("previous_cycle_1")) if data.get("previous_cycle_1") is not None else np.nan,
                'Previous_Cycle_2': float(data.get("previous_cycle_2")) if data.get("previous_cycle_2") is not None else np.nan,
                'Previous_Cycle_3': float(data.get("previous_cycle_3")) if data.get("previous_cycle_3") is not None else np.nan,
                'Previous_Cycle_Average': float(data.get("previous_cycle_average") or cycle_len),
                'Previous_Cycle_Std': float(data.get("previous_cycle_std") or 0.0),
                'Start_Month': last_date.month,
                'Start_Day': last_date.day,
                'Start_Weekday': last_date.weekday(),
            }])

            raw_prediction = float(cycle_model.predict(df_input)[0])
            # Plausibility clamp: 18 to 45 days
            predicted_cycle_length = max(18.0, min(45.0, raw_prediction))
            model_used = "xgboost_pipeline"
        except Exception as pred_err:
            print(f"Cycle ML prediction error, falling back to arithmetic: {pred_err}")
            predicted_cycle_length = cycle_len
            model_used = "heuristic"

    predicted_days = int(round(predicted_cycle_length))
    next_period = last_date + timedelta(days=predicted_days)
    days_until = (next_period - today).days
    is_regular = 21 <= predicted_cycle_length <= 35

    return {
        "success": True,
        "last_period_date": str(last_date),
        "next_period_date": str(next_period),
        "predicted_next_period_date": str(next_period),
        "predicted_cycle_length": round(predicted_cycle_length, 1),
        "days_until": days_until,
        "average_cycle_length": int(round(cycle_len)),
        "is_regular_cycle": is_regular,
        "cycle_status": "Regular" if is_regular else ("Short Cycle" if predicted_cycle_length < 21 else "Long Cycle"),
        "model_used": model_used,
        "unit": "days",
        "message": "Next cycle predicted successfully using XGBoost pipeline." if model_used == "xgboost_pipeline" else "Next cycle calculated using cycle average."
    }

# Endpoint for Next Period prediction (supporting all standard routes)
@app.post("/api/predict-cycle")
@app.post("/api/predict/cycle")
async def predict_cycle_endpoint(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    return run_cycle_prediction(body, request)

@app.post("/api/predict-due")
@app.post("/predict-due")
async def predict_cycle_due_endpoint(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    return run_cycle_prediction(body, request)

# Quiz Endpoint
@app.get("/api/quiz")
def get_quiz():
    return [
        {"id": 1, "question": "What is the average length of a menstrual cycle?", "options": ["21 days", "28 days", "35 days", "14 days"], "correctAnswer": 1},
        {"id": 2, "question": "Which hormone is primarily responsible for ovulation?", "options": ["Estrogen", "Progesterone", "Luteinizing Hormone (LH)", "Testosterone"], "correctAnswer": 2},
        {"id": 3, "question": "During which phase of the cycle is a person most fertile?", "options": ["Menstrual phase", "Follicular phase", "Ovulation phase", "Luteal phase"], "correctAnswer": 2},
        {"id": 4, "question": "What is a common symptom of PCOS?", "options": ["Regular periods", "Clear skin", "Irregular periods and excess hair growth", "High energy levels"], "correctAnswer": 2}
    ]

# Posts Endpoint
@app.get("/api/posts")
def get_posts():
    return [
        {
            "id": 1, "doctorName": "Dr. Sarah Johnson", "verified": True, "title": "Understanding Your Cycle Phases",
            "content": "Your menstrual cycle consists of four distinct phases: Menstrual, Follicular, Ovulation, and Luteal.",
            "likes": 124, "comments": 18, "profileImage": "https://images.unsplash.com/photo-1559839734-2b71f153678e?auto=format"
        },
        {
            "id": 2, "doctorName": "Dr. Amara Chen", "verified": True, "title": "Nutrition for Hormonal Balance",
            "content": "Eating a balanced diet rich in leafy greens and healthy fats can support hormonal health.",
            "likes": 89, "comments": 12, "profileImage": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format"
        }
    ]


# Supabase Auth email confirmation is retired; MongoDB accounts do not require it.
if __name__ == "__main__":
    import uvicorn
    # Using port 5000 as requested for unified service
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)


# ============================================================
# AI CHATBOT ENDPOINT
# ============================================================

try:
    from .femcare_chatbot import generate_response, FEMCARE_SYSTEM_PROMPT, LLM_AVAILABLE, GROQ_MODEL
    from .femcare_email import send_booking_confirmation, send_booking_cancellation, EMAIL_ENABLED
except ImportError:  # `uvicorn main:app` when started inside backend/
    from femcare_chatbot import generate_response, FEMCARE_SYSTEM_PROMPT, LLM_AVAILABLE, GROQ_MODEL
    from femcare_email import send_booking_confirmation, send_booking_cancellation, EMAIL_ENABLED

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

@app.post("/api/chat")
async def chat(request: Request, chat_request: ChatRequest):
    """
    FEMCARE AI Women's Health Chatbot
    Specialized assistant for reproductive and menstrual health
    
    Scope: Periods, cycles, symptoms, PCOS, fertility, reproductive health
    Rejects: Programming, technology, sports, general topics
    Safety: Recommends professional care for serious symptoms
    """
    
    user_message = chat_request.message.strip()
    user_context = chat_request.context or {}
    
    # Extract user ID from auth if available
    auth_doc = authenticate(request, required=False)
    user_id = None
    if auth_doc and supabase:
        try:
            user_id = resolve_supabase_profile_id(auth_doc)
        except HTTPException as error:
            print(f"Chat profile unavailable: HTTP {error.status_code}")
    if user_id and supabase:
        try:
                
                # Optionally enrich context with user's real data
                if supabase and user_id:
                    try:
                        # Get latest period
                        period_response = supabase.table("periods").select("*").eq("user_id", user_id).order("start_date", desc=True).limit(1).execute()
                        if period_response.data and len(period_response.data) > 0:
                            latest_period = period_response.data[0]
                            user_context["lastPeriod"] = latest_period.get("start_date")
                        
                        # Get recent symptoms
                        from datetime import datetime, timedelta
                        thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
                        symptom_response = supabase.table("symptoms").select("symptom_name,severity").eq("user_id", user_id).gte("symptom_date", thirty_days_ago).execute()
                        if symptom_response.data:
                            user_context["recentSymptoms"] = [f"{s.get('symptom_name')} ({s.get('severity')})" for s in symptom_response.data[:3]]
                    except:
                        pass  # Context enrichment is optional
        except:
            pass
    
    # Generate response using the FEMCARE chatbot system
    response_data = generate_response(user_message, user_context)
    
    # Add user_id to response for logging purposes
    response_data["user_id"] = user_id
    
    return response_data


# ============================================================
# BOOKING ENDPOINTS
# ============================================================

class BookingRequest(BaseModel):
    provider_id: str
    hospital: str
    doctor: str
    date: str
    slot: str
    phone: Optional[str] = None
    notes: Optional[str] = None


BOOKING_SLOTS = {
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
}

_user_booking_locks = defaultdict(asyncio.Lock)

def get_user_booking_lock(user_id: str) -> asyncio.Lock:
    return _user_booking_locks[user_id]


@app.get("/api/booking-eligibility")
async def get_booking_eligibility(request: Request):
    """
    Check if the authenticated user is eligible to book an appointment.
    Every user is allowed exactly 1 free booking slot.
    Additional bookings require an active paid subscription.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    auth_doc = authenticate(request)
    user_id = resolve_supabase_profile_id(auth_doc)

    try:
        user_bookings_res = supabase.table("bookings").select("id, status").eq("user_id", user_id).execute()
        user_bookings = user_bookings_res.data or []
        valid_bookings = [b for b in user_bookings if b.get("status") != "cancelled"]
        valid_count = len(valid_bookings)
    except Exception as e:
        print(f"Failed to query existing user bookings for eligibility: {e}")
        valid_count = 0

    entitlement = check_user_subscription(request)
    has_active_sub = bool(entitlement)
    free_booking_used = valid_count >= 1
    can_book = (not free_booking_used) or has_active_sub

    return {
        "can_book": can_book,
        "valid_bookings_count": valid_count,
        "free_limit": 1,
        "free_booking_used": free_booking_used,
        "has_active_subscription": has_active_sub,
        "plan_type": entitlement.get("plan_type") if entitlement else None,
        "message": (
            "Your free booking has been used. Upgrade your subscription to book another slot."
            if (free_booking_used and not has_active_sub)
            else "Eligible to book appointment."
        ),
    }


@app.post("/api/book-appointment")
async def book_appointment(booking: BookingRequest, request: Request):
    """
    Book appointment with Supabase persistence and user authentication.
    Enforces exactly one free booking slot per user account.
    Additional bookings require an active paid subscription.
    Sends FEMCARE appointment confirmation email after successful booking.
    Email failure never causes booking failure — booking is preserved.
    """
    
    # ── Authenticate user ────────────────────────────────────────────────────
    auth_doc = authenticate(request)
    user_id = resolve_supabase_profile_id(auth_doc)
    user_email = auth_doc["email"]
    user_name = auth_doc.get("name") or user_email.split("@")[0]
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    provider = validate_provider(booking.provider_id, booking.hospital, booking.doctor)
    provider_id = booking.provider_id

    try:
        appointment_date = date.fromisoformat(booking.date)
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="Appointment date must use YYYY-MM-DD format.")
    if appointment_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date cannot be in the past.")
    if booking.slot not in BOOKING_SLOTS:
        raise HTTPException(status_code=422, detail="Please select a valid appointment time slot.")

    # Concurrency lock per user to prevent simultaneous requests from claiming the free allowance
    async with get_user_booking_lock(user_id):
        # ── Verify Booking Quota & Subscription Eligibility ──────────────────
        try:
            user_bookings_res = supabase.table("bookings").select("id, status").eq("user_id", user_id).execute()
            user_bookings = user_bookings_res.data or []
            valid_bookings = [b for b in user_bookings if b.get("status") != "cancelled"]
        except Exception as e:
            print(f"Failed to query existing user bookings: {type(e).__name__}: {e}")
            raise HTTPException(status_code=503, detail="Could not verify booking eligibility. Please try again.")

        if len(valid_bookings) >= 1:
            entitlement = check_user_subscription(request)
            if not entitlement:
                raise HTTPException(
                    status_code=403,
                    detail="Your free booking has been used. Upgrade your subscription to book another slot.",
                )

        # Recheck availability at submission time. The database unique index remains
        # the final guard against two requests racing for the same slot.
        try:
            availability_response = supabase.rpc(
                'get_available_slots',
                {'p_provider_id': provider_id, 'p_date': booking.date},
            ).execute()
            matching_slot = next(
                (slot for slot in (availability_response.data or []) if slot.get('slot_time') == booking.slot),
                None,
            )
            if matching_slot is None:
                raise HTTPException(status_code=404, detail="Provider or appointment slot was not found.")
            if not matching_slot.get('is_available', False):
                raise HTTPException(status_code=409, detail="This time slot is already booked. Please select another slot.")
        except HTTPException:
            raise
        except Exception as e:
            print(f"Booking availability validation failed: {type(e).__name__}: {e}")
            raise HTTPException(status_code=503, detail="Could not verify appointment availability. Please try again.")

        # ── Insert booking ────────────────────────────────────────────────────────
        try:
            booking_data = {
                "user_id":          user_id,
                "provider_id":      provider_id,
                "hospital_name":    provider["name"],
                "doctor_specialty": provider["specialty"],
                "appointment_date": booking.date,
                "appointment_slot": booking.slot,
                "phone":            booking.phone,
                "notes":            booking.notes,
                "status":           "confirmed",
            }

            response = supabase.table("bookings").insert(booking_data).execute()

            if not (response.data and len(response.data) > 0):
                raise HTTPException(status_code=500, detail="Booking failed")

            created_booking = response.data[0]
            booking_id      = created_booking.get("id", "")

        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            print(f"Booking error: {error_msg}")
            if "unique_active_booking_slot" in error_msg or "duplicate key" in error_msg:
                raise HTTPException(
                    status_code=409,
                    detail="This time slot is already booked. Please select another slot."
                )
            raise HTTPException(status_code=500, detail=error_msg)

    # ── Send confirmation email (only after successful booking) ──────────────
    email_sent = False
    if user_email:
        try:
            email_sent = await send_booking_confirmation(
                to_email         = user_email,
                user_name        = user_name,
                hospital_name    = created_booking.get("hospital_name", provider["name"]),
                specialty        = created_booking.get("doctor_specialty", provider["specialty"]),
                appointment_date = created_booking.get("appointment_date", booking.date),
                appointment_slot = created_booking.get("appointment_slot", booking.slot),
                booking_id       = booking_id,
            )
        except Exception as e:
            print(f"Email send error (booking preserved): {e}")

    return {
        "success":    True,
        "booking":    created_booking,
        "email_sent": email_sent,
        "message":    "Appointment booked successfully",
    }


@app.get("/api/bookings")
async def get_bookings(request: Request):
    """
    Get all bookings for authenticated user with booking quota metadata.
    """
    auth_doc = authenticate(request)
    user_id = resolve_supabase_profile_id(auth_doc)
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Booking database is not available.")
    
    try:
        response = supabase.table("bookings").select("*").eq("user_id", user_id).order("appointment_date", desc=False).execute()
        all_bookings = response.data or []
        valid_bookings = [b for b in all_bookings if b.get("status") != "cancelled"]
        entitlement = check_user_subscription(request)
        has_active_sub = bool(entitlement)
        valid_count = len(valid_bookings)
        free_limit = 1
        free_used = valid_count >= free_limit

        return {
            "bookings": all_bookings,
            "can_book": (not free_used) or has_active_sub,
            "valid_bookings_count": valid_count,
            "free_limit": free_limit,
            "free_booking_used": free_used,
            "has_active_subscription": has_active_sub,
        }
    except Exception as e:
        print(f"Error fetching bookings: {type(e).__name__}: {e}")
        raise HTTPException(status_code=503, detail="Bookings are temporarily unavailable.")


# ============================================================
# BOOKING AVAILABILITY ENDPOINTS
# ============================================================

class AvailabilityRequest(BaseModel):
    provider_id: str
    date: str  # YYYY-MM-DD format

@app.post("/api/booking-availability")
async def get_availability(request: AvailabilityRequest):
    """
    Get available time slots for a specific provider and date
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    validate_provider(request.provider_id)
    
    try:
        # Call the database function to get availability
        response = supabase.rpc(
            'get_available_slots',
            {
                'p_provider_id': request.provider_id,
                'p_date': request.date
            }
        ).execute()
        
        return {
            "provider_id": request.provider_id,
            "date": request.date,
            "slots": response.data or []
        }
    except Exception as e:
        print(f"Error fetching availability: {e}")
        # Fallback: return all slots as available if function doesn't exist yet
        all_slots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
            '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
            '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
        ]
        
        # Check actual bookings
        try:
            bookings = supabase.table("bookings").select("appointment_slot").eq("provider_id", request.provider_id).eq("appointment_date", request.date).eq("status", "confirmed").execute()
            booked_slots = set(b['appointment_slot'] for b in bookings.data)
            
            slots = [
                {
                    "slot_time": slot,
                    "is_available": slot not in booked_slots,
                    "booked_count": 1 if slot in booked_slots else 0
                }
                for slot in all_slots
            ]
            
            return {
                "provider_id": request.provider_id,
                "date": request.date,
                "slots": slots
            }
        except Exception as inner_e:
            print(f"Fallback error: {inner_e}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/booking-stats")
async def get_booking_statistics(request: AvailabilityRequest):
    """
    Get booking statistics for a provider on a specific date
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    validate_provider(request.provider_id)
    
    try:
        response = supabase.rpc(
            'get_booking_stats',
            {
                'p_provider_id': request.provider_id,
                'p_date': request.date
            }
        ).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            return {
                "total_slots": 16,
                "booked_slots": 0,
                "available_slots": 16
            }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        # Fallback: count manually
        try:
            bookings = supabase.table("bookings").select("id").eq("provider_id", request.provider_id).eq("appointment_date", request.date).eq("status", "confirmed").execute()
            booked = len(bookings.data)
            return {
                "total_slots": 16,
                "booked_slots": booked,
                "available_slots": 16 - booked
            }
        except:
            return {
                "total_slots": 16,
                "booked_slots": 0,
                "available_slots": 16
            }


class CancelBookingRequest(BaseModel):
    booking_id: str

@app.post("/api/cancel-booking")
async def cancel_booking(request: Request, cancel_request: CancelBookingRequest):
    """
    Cancel a booking (sets status to cancelled) and sends cancellation email.
    Email failure never un-cancels the booking.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    # ── Authenticate ─────────────────────────────────────────────────────────
    auth_doc = authenticate(request)
    user_id = resolve_supabase_profile_id(auth_doc)
    user_email = auth_doc["email"]
    user_name = auth_doc.get("name") or user_email.split("@")[0]

    # ── Cancel in DB ──────────────────────────────────────────────────────────
    try:
        response = supabase.table("bookings") \
            .update({"status": "cancelled"}) \
            .eq("id", cancel_request.booking_id) \
            .eq("user_id", user_id) \
            .execute()

        if not (response.data and len(response.data) > 0):
            raise HTTPException(status_code=404, detail="Booking not found or already cancelled")

        cancelled_booking = response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        print(f"Cancel error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # ── Send cancellation email (after successful cancel) ────────────────────
    email_sent = False
    if user_email:
        try:
            email_sent = await send_booking_cancellation(
                to_email         = user_email,
                user_name        = user_name,
                hospital_name    = cancelled_booking.get("hospital_name", ""),
                specialty        = cancelled_booking.get("doctor_specialty", ""),
                appointment_date = cancelled_booking.get("appointment_date", ""),
                appointment_slot = cancelled_booking.get("appointment_slot", ""),
                booking_id       = cancelled_booking.get("id", ""),
            )
        except Exception as e:
            print(f"Cancellation email error (booking still cancelled): {e}")

    return {
        "success":    True,
        "message":    "Booking cancelled successfully",
        "booking":    cancelled_booking,
        "email_sent": email_sent,
    }
