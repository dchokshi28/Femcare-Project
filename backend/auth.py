"""MongoDB-backed authentication and signed cookie sessions for FEMCARE."""
from __future__ import annotations

import os
import re
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import HTTPException, Request, Response
from pymongo import ASCENDING, MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError

load_dotenv(Path(__file__).resolve().with_name(".env"), override=False)

logger = logging.getLogger("femcare.auth")
MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
JWT_ALGORITHM = "HS256"
SESSION_COOKIE = "femcare_session"
SESSION_HOURS = int(os.getenv("JWT_SESSION_HOURS", "24"))
password_hasher = PasswordHasher()
mongo_client = None
mongo_users = None
mongo_connected = False


def _safe_db_error(error: Exception) -> str:
    message = str(error)
    for sensitive in (MONGODB_URI, JWT_SECRET):
        if sensitive:
            message = message.replace(sensitive, "[redacted]")
    message = re.sub(r"mongodb(?:\+srv)?://[^\s\"']+", "mongodb://[redacted]", message, flags=re.IGNORECASE)
    return message[:400]


logger.info("MONGODB_URI configured: %s", bool(MONGODB_URI))
logger.info("JWT_SECRET configured: %s", len(JWT_SECRET) >= 32)

if MONGODB_URI:
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=4000)
        mongo_client.admin.command("ping")
        mongo_users = mongo_client[os.getenv("MONGODB_DATABASE", "femcare")]["users"]
        mongo_users.create_index([("email", ASCENDING)], unique=True)
        mongo_connected = True
        logger.info("MongoDB connection established and auth index is ready.")
    except Exception as error:
        # Keep non-auth APIs available; auth endpoints report a safe 503.
        logger.error("MongoDB initialization failed (%s): %s", type(error).__name__, _safe_db_error(error))
        if mongo_client:
            mongo_client.close()
        mongo_client = None
        mongo_users = None
else:
    logger.error("MongoDB initialization skipped: MONGODB_URI is not configured.")


@dataclass
class MongoUser:
    email: str
    passwordHash: str
    legacySupabaseUserId: Optional[str]
    name: str
    age: Optional[int] = 25
    cycleLength: Optional[int] = 28
    lastPeriodDate: Optional[str] = None
    createdAt: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_document(self) -> dict:
        return {
            "email": self.email,
            "passwordHash": self.passwordHash,
            "legacySupabaseUserId": self.legacySupabaseUserId,
            "name": self.name,
            "age": self.age,
            "cycleLength": self.cycleLength,
            "lastPeriodDate": self.lastPeriodDate,
            "createdAt": self.createdAt,
        }


def _require_configuration() -> Any:
    if len(JWT_SECRET) < 32:
        raise HTTPException(status_code=503, detail="Authentication is not configured on the server.")
    if mongo_users is None:
        raise HTTPException(status_code=503, detail="MongoDB is not configured or unavailable.")
    try:
        mongo_client.admin.command("ping")
    except PyMongoError as error:
        logger.error("MongoDB health check failed (%s): %s", type(error).__name__, _safe_db_error(error))
        raise HTTPException(status_code=503, detail="MongoDB is not configured or unavailable.")
    return mongo_users


def safe_user(doc: dict) -> dict:
    return {
        "id": doc.get("legacySupabaseUserId"),
        "legacySupabaseUserId": doc.get("legacySupabaseUserId"),
        "mongo_id": str(doc["_id"]),
        "email": doc["email"],
        "name": doc.get("name") or doc["email"].split("@")[0],
        "age": doc.get("age", 25),
        "cycle_length": doc.get("cycleLength", 28),
        "last_period_date": doc.get("lastPeriodDate"),
    }


def _issue_cookie(response: Response, doc: dict) -> None:
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    token = jwt.encode(
        {"sub": str(doc["_id"]), "iat": datetime.now(timezone.utc), "exp": expires},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    # When COOKIE_SECURE=true (production / Render), the frontend and backend
    # are on different origins (Vercel vs Render), so the browser requires
    # SameSite=None + Secure to send the HttpOnly cookie cross-origin.
    # In local dev (COOKIE_SECURE=false) SameSite=Lax is correct and avoids
    # browser warnings about insecure SameSite=None.
    _secure = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    _samesite = "none" if _secure else "lax"
    response.set_cookie(
        SESSION_COOKIE, token, httponly=True, secure=_secure,
        samesite=_samesite, path="/", max_age=SESSION_HOURS * 3600,
    )


def authenticate(request: Request, required: bool = True) -> Optional[dict]:
    """Resolve a request's cookie session to a current MongoDB user."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        auth = request.headers.get("authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth[7:].strip()
    if not token:
        if required:
            raise HTTPException(status_code=401, detail="Please sign in to continue.")
        return None
    if not JWT_SECRET or mongo_users is None:
        if required:
            _require_configuration()
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        doc = mongo_users.find_one({"_id": _object_id(payload.get("sub"))})
    except Exception:
        doc = None
    if not doc:
        if required:
            raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")
        return None
    return doc


def _object_id(value: Optional[str]):
    from bson import ObjectId
    if not value or not ObjectId.is_valid(value):
        raise ValueError("Invalid session subject")
    return ObjectId(value)


def signup_user(payload: dict, response: Response, legacy_user_id: Optional[str] = None) -> dict:
    users = _require_configuration()
    email = str(payload.get("email", "")).strip().lower()
    password = payload.get("password")
    # Normalise name: strip whitespace, fall back to email prefix when absent/empty.
    raw_name = payload.get("name")
    name = str(raw_name).strip() if raw_name is not None else ""
    if not name:
        name = email.split("@")[0]
    if len(name) > 120:
        raise HTTPException(status_code=422, detail="Name must be 120 characters or fewer.")
    raw_age = payload.get("age")
    age = 25 if raw_age is None or raw_age == "" else raw_age
    try:
        age = int(age)
    except (ValueError, TypeError):
        age = 25

    raw_cycle = payload.get("cycleLength")
    cycle_length = 28 if raw_cycle is None or raw_cycle == "" else raw_cycle
    try:
        cycle_length = int(cycle_length)
    except (ValueError, TypeError):
        cycle_length = 28

    try:
        doc = MongoUser(
            email=email,
            passwordHash=password_hasher.hash(password),
            name=name,
            age=age,
            cycleLength=cycle_length,
            lastPeriodDate=payload.get("lastPeriodDate"),
            # Keep the mapping empty until an actual public.users row is found.
            # A made-up UUID is not a valid Supabase application user.
            legacySupabaseUserId=legacy_user_id,
            createdAt=datetime.now(timezone.utc),
        ).to_document()
        result = users.insert_one(doc)
        doc["_id"] = result.inserted_id
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    except PyMongoError:
        raise HTTPException(status_code=503, detail="Could not create your account. Please try again later.")
    _issue_cookie(response, doc)
    return safe_user(doc)


def save_supabase_profile_mapping(doc: dict, profile_id: str) -> None:
    """Persist an already verified public.users.id mapping on the Mongo account."""
    users = _require_configuration()
    try:
        result = users.update_one(
            {"_id": doc["_id"]},
            {"$set": {"legacySupabaseUserId": profile_id}},
        )
    except PyMongoError as error:
        logger.error("Could not save Supabase profile mapping (%s)", type(error).__name__)
        raise HTTPException(status_code=503, detail="Your application profile link could not be saved.")
    if result.matched_count != 1:
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")
    doc["legacySupabaseUserId"] = profile_id


def login_user(payload: dict, response: Response) -> dict:
    users = _require_configuration()
    email = str(payload.get("email", "")).strip().lower()
    password = payload.get("password")
    doc = users.find_one({"email": email})
    if not doc or not isinstance(password, str):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    try:
        password_hasher.verify(doc["passwordHash"], password)
    except (VerificationError, InvalidHashError, VerifyMismatchError, KeyError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if password_hasher.check_needs_rehash(doc["passwordHash"]):
        users.update_one({"_id": doc["_id"]}, {"$set": {"passwordHash": password_hasher.hash(password)}})
    _issue_cookie(response, doc)
    return safe_user(doc)


def update_profile(doc: dict, changes: dict) -> dict:
    allowed = {"name", "age", "cycle_length", "last_period_date"}
    update = {}
    for key, value in changes.items():
        if key not in allowed:
            continue
        target = {"cycle_length": "cycleLength", "last_period_date": "lastPeriodDate"}.get(key, key)
        update[target] = value
    if update:
        try:
            mongo_users.update_one({"_id": doc["_id"]}, {"$set": update})
        except PyMongoError:
            raise HTTPException(status_code=503, detail="Profile could not be updated right now.")
    return safe_user(mongo_users.find_one({"_id": doc["_id"]}))
