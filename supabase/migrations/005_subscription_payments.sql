-- Subscription/payment records for the authenticated Mongo identity's
-- existing Supabase public.users profile. No Supabase Auth user is created.
BEGIN;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('demo', 'razorpay')),
  transaction_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL CHECK (currency = 'INR'),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  payment_status TEXT NOT NULL DEFAULT 'created'
    CHECK (payment_status IN ('created', 'paid', 'failed', 'cancelled', 'refunded')),
  subscription_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (subscription_status IN ('pending', 'active', 'halted', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  provider_subscription_id TEXT,
  provider_payment_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT subscriptions_plan_price_matches CHECK (
    (plan_type = 'monthly' AND amount_paise = 17900 AND billing_interval = 'monthly') OR
    (plan_type = 'annual' AND amount_paise = 129900 AND billing_interval = 'yearly')
  )
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON public.subscriptions (user_id, subscription_status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_reference
  ON public.subscriptions (transaction_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.subscriptions FROM anon, authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;

-- Atomically converts one backend-created DEMO transaction into a paid demo
-- record and active entitlement. Only the backend service role can call this.
CREATE OR REPLACE FUNCTION public.complete_demo_subscription(
  p_transaction_id TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  subscription_row public.subscriptions%ROWTYPE;
  expected_amount INTEGER;
  expected_interval TEXT;
  activation_time TIMESTAMPTZ := NOW();
  expiration_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO subscription_row
  FROM public.subscriptions
  WHERE transaction_id = p_transaction_id
    AND user_id = p_user_id
    AND provider = 'demo'
    AND transaction_id LIKE 'DEMO-%'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demo transaction not found';
  END IF;

  IF subscription_row.plan_type = 'monthly' THEN
    expected_amount := 17900;
    expected_interval := 'monthly';
    expiration_time := activation_time + INTERVAL '1 month';
  ELSIF subscription_row.plan_type = 'annual' THEN
    expected_amount := 129900;
    expected_interval := 'yearly';
    expiration_time := activation_time + INTERVAL '1 year';
  ELSE
    RAISE EXCEPTION 'Unsupported demo plan';
  END IF;

  IF subscription_row.amount_paise <> expected_amount
     OR subscription_row.currency <> 'INR'
     OR subscription_row.billing_interval <> expected_interval THEN
    RAISE EXCEPTION 'Demo transaction plan validation failed';
  END IF;

  -- Safe retry: return the original finalized transaction without extending
  -- its term or creating a second entitlement.
  IF subscription_row.payment_status = 'paid'
     AND subscription_row.subscription_status = 'active'
     AND subscription_row.expires_at > activation_time THEN
    RETURN to_jsonb(subscription_row);
  END IF;

  IF subscription_row.payment_status <> 'created'
     OR subscription_row.subscription_status <> 'pending' THEN
    RAISE EXCEPTION 'Demo transaction is not payable';
  END IF;

  UPDATE public.subscriptions
  SET payment_status = 'paid',
      subscription_status = 'active',
      activated_at = activation_time,
      expires_at = expiration_time,
      metadata = metadata || jsonb_build_object('demo', true)
  WHERE id = subscription_row.id
  RETURNING * INTO subscription_row;

  RETURN to_jsonb(subscription_row);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_demo_subscription(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_demo_subscription(TEXT, UUID) TO service_role;

COMMIT;
