"""Server-side subscription demo service.

Demo transactions are clearly marked and never contact Razorpay. Razorpay mode
is intentionally unavailable until its authenticated checkout/webhook flow is
implemented.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any


PLANS = {
    "monthly": {
        "amount_paise": 17_900,
        "currency": "INR",
        "billing_interval": "monthly",
        "duration_months": 1,
    },
    "annual": {
        "amount_paise": 129_900,
        "currency": "INR",
        "billing_interval": "yearly",
        "duration_months": 12,
    },
}


class PaymentUnavailable(RuntimeError):
    pass


def payment_mode() -> str:
    mode = os.getenv("PAYMENT_MODE", "disabled").strip().lower()
    return mode if mode in {"demo", "razorpay"} else "disabled"


def start_demo_transaction(supabase: Any, user_id: str, plan_type: str) -> dict:
    if payment_mode() != "demo":
        raise PaymentUnavailable("Demo checkout is disabled on this server.")
    plan = PLANS.get(plan_type)
    if plan is None:
        raise ValueError("Choose a valid subscription plan.")

    # The server chooses both the price and reference. No client-supplied
    # amount or user ID is accepted by this service.
    transaction_id = f"DEMO-{uuid.uuid4().hex.upper()}"
    record = {
        "user_id": user_id,
        "provider": "demo",
        "transaction_id": transaction_id,
        "plan_type": plan_type,
        "amount_paise": plan["amount_paise"],
        "currency": plan["currency"],
        "billing_interval": plan["billing_interval"],
        "payment_status": "created",
        "subscription_status": "pending",
    }
    response = supabase.table("subscriptions").insert(record).select(
        "id,transaction_id,plan_type,amount_paise,currency,billing_interval,payment_status,subscription_status,created_at"
    ).execute()
    rows = response.data or []
    if not rows:
        raise RuntimeError("Demo transaction was not created.")
    return rows[0]


def complete_demo_transaction(supabase: Any, user_id: str, transaction_id: str) -> dict:
    if payment_mode() != "demo":
        raise PaymentUnavailable("Demo checkout is disabled on this server.")
    response = supabase.rpc(
        "complete_demo_subscription",
        {"p_transaction_id": transaction_id, "p_user_id": user_id},
    ).execute()
    result = response.data
    if isinstance(result, list):
        result = result[0] if result else None
    if not isinstance(result, dict) or result.get("payment_status") != "paid" or result.get("subscription_status") != "active":
        raise RuntimeError("The demo transaction could not be finalized.")
    return result


def get_active_entitlement(supabase: Any, user_id: str) -> dict | None:
    if not user_id:
        return None
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    response = (
        supabase.table("subscriptions")
        .select("transaction_id,plan_type,amount_paise,currency,billing_interval,provider,payment_status,subscription_status,activated_at,expires_at")
        .eq("user_id", str(user_id))
        .eq("subscription_status", "active")
        .eq("payment_status", "paid")
        .gt("expires_at", now_iso)
        .order("activated_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None
    row = rows[0]
    # Defensive double-check on expires_at in Python
    exp = row.get("expires_at")
    if exp:
        try:
            exp_dt = datetime.fromisoformat(str(exp).replace("Z", "+00:00"))
            if exp_dt <= now_dt:
                return None
        except (ValueError, TypeError):
            return None
    else:
        return None
    return row


def get_latest_subscription(supabase: Any, user_id: str) -> dict | None:
    if not user_id:
        return None
    response = (
        supabase.table("subscriptions")
        .select("transaction_id,plan_type,amount_paise,currency,billing_interval,provider,payment_status,subscription_status,activated_at,expires_at,created_at")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None

