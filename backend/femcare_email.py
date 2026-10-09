"""
FEMCARE Email Service
=====================
Sends appointment confirmation and cancellation emails via Resend API.
Uses httpx (already in requirements) — no new package needed.

All email secrets are read from environment variables (server-side only).
Never expose RESEND_API_KEY to the frontend.

Setup:
  1. Get a free Resend API key at https://resend.com
  2. Set RESEND_API_KEY in backend/.env
  3. Set RESEND_FROM_EMAIL in backend/.env (or use default)
"""

import os
import httpx
from datetime import datetime

RESEND_API_KEY  = os.getenv("RESEND_API_KEY", "")
RESEND_FROM     = os.getenv("RESEND_FROM_EMAIL", "FEMCARE <onboarding@resend.dev>")
RESEND_API_URL  = "https://api.resend.com/emails"

EMAIL_ENABLED = bool(RESEND_API_KEY and not RESEND_API_KEY.startswith("re_placeholder"))


def _format_date(date_str: str) -> str:
    """Convert YYYY-MM-DD to 'Monday, September 2, 2026'. Cross-platform safe."""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        # %-d is Linux-only; use lstrip("0") for cross-platform day without leading zero
        day = str(d.day)  # no leading zero needed
        return d.strftime(f"%A, %B {day}, %Y")
    except Exception:
        return date_str


def _booking_id_short(booking_id: str) -> str:
    """Return last 8 chars of UUID for display."""
    return str(booking_id).upper()[-8:] if booking_id else "N/A"


# ─── HTML Email Templates ────────────────────────────────────────────────────

def _base_email(title: str, accent: str, body_html: str) -> str:
    """Shared responsive HTML wrapper."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ background: #F8F6FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #17213D; }}
    .wrapper {{ max-width: 600px; margin: 32px auto; padding: 0 16px; }}
    .card {{ background: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(23,33,61,0.08); }}
    .header {{ background: {accent}; padding: 32px 36px; }}
    .header-logo {{ font-family: Georgia, serif; font-style: italic; font-size: 28px; font-weight: 900; color: #17213D; letter-spacing: -0.04em; }}
    .header-logo span {{ color: #E95A7A; }}
    .header-title {{ margin-top: 12px; font-size: 22px; font-weight: 800; color: #17213D; }}
    .header-subtitle {{ margin-top: 4px; font-size: 13px; color: #17213D; opacity: 0.65; }}
    .body {{ padding: 32px 36px; }}
    .greeting {{ font-size: 16px; color: #17213D; margin-bottom: 20px; }}
    .section-title {{ font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #667085; margin-bottom: 12px; }}
    .detail-card {{ background: #F8F6FB; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px; border: 1px solid #F0EBF8; }}
    .detail-row {{ display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #EDE8F5; }}
    .detail-row:last-child {{ border-bottom: none; padding-bottom: 0; }}
    .detail-label {{ font-size: 12px; font-weight: 600; color: #667085; min-width: 120px; }}
    .detail-value {{ font-size: 13px; font-weight: 700; color: #17213D; text-align: right; max-width: 300px; }}
    .status-badge {{ display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }}
    .status-confirmed {{ background: #DCFCE7; color: #166534; }}
    .status-cancelled {{ background: #FEE2E2; color: #991B1B; }}
    .notice {{ background: #EFF6FF; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #1E40AF; margin-bottom: 20px; line-height: 1.5; }}
    .footer {{ background: #F8F6FB; padding: 24px 36px; text-align: center; }}
    .footer-brand {{ font-family: Georgia, serif; font-style: italic; font-size: 15px; font-weight: 900; color: #17213D; }}
    .footer-brand span {{ color: #E95A7A; }}
    .footer-text {{ margin-top: 6px; font-size: 12px; color: #667085; line-height: 1.5; }}
    .booking-id {{ font-family: 'Courier New', monospace; background: #F0EBF8; padding: 2px 8px; border-radius: 6px; font-size: 13px; font-weight: 700; color: #5B2D8E; letter-spacing: 0.08em; }}
    @media (max-width: 480px) {{
      .header {{ padding: 24px 20px; }}
      .body {{ padding: 24px 20px; }}
      .footer {{ padding: 20px; }}
      .detail-row {{ flex-direction: column; gap: 4px; }}
      .detail-value {{ text-align: left; }}
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      {body_html}
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:16px;">
      FEMCARE Women's Health Platform &nbsp;•&nbsp; This is an automated message.
    </p>
  </div>
</body>
</html>"""


def build_confirmation_email(
    user_name: str,
    hospital_name: str,
    specialty: str,
    appointment_date: str,
    appointment_slot: str,
    booking_id: str,
) -> tuple[str, str]:
    """
    Returns (subject, html) for a booking confirmation email.
    All values come from the verified server-side booking record.
    """
    formatted_date  = _format_date(appointment_date)
    display_id      = _booking_id_short(booking_id)
    display_name    = user_name or "Valued Patient"

    subject = f"FEMCARE Appointment Confirmed — {hospital_name}"

    body = f"""
      <div class="header" style="background: linear-gradient(135deg, #FDF2F8 0%, #F5F0F7 100%);">
        <div class="header-logo"><span>Fem</span>Care</div>
        <div class="header-title">✓ Appointment Confirmed</div>
        <div class="header-subtitle">Your booking has been successfully created</div>
      </div>

      <div class="body">
        <p class="greeting">Hello <strong>{display_name}</strong>,<br /><br />
        Your appointment has been successfully booked. Please see your details below.</p>

        <div class="section-title">Appointment Details</div>
        <div class="detail-card">
          <div class="detail-row">
            <span class="detail-label">Hospital / Clinic</span>
            <span class="detail-value">{hospital_name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Specialty</span>
            <span class="detail-value">{specialty}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{formatted_date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">{appointment_slot}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking Status</span>
            <span class="detail-value"><span class="status-badge status-confirmed">Confirmed</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value"><span class="booking-id">{display_id}</span></span>
          </div>
        </div>

        <div class="notice">
          📍 Please arrive a few minutes before your scheduled appointment time.<br />
          If you need to cancel, visit your <strong>FEMCARE Bookings</strong> page.
        </div>

        <p style="font-size:12px;color:#667085;line-height:1.6;">
          For urgent medical concerns, please seek appropriate emergency medical care immediately.
          This email is for appointment reference only and does not constitute medical advice.
        </p>
      </div>

      <div class="footer">
        <div class="footer-brand"><span>Fem</span>Care Women's Health</div>
        <div class="footer-text">
          AI-Powered Women's Reproductive Health Platform<br />
          This confirmation was sent to the email address associated with your FEMCARE account.
        </div>
      </div>
    """

    return subject, _base_email(subject, "#F5F0F7", body)


def build_cancellation_email(
    user_name: str,
    hospital_name: str,
    specialty: str,
    appointment_date: str,
    appointment_slot: str,
    booking_id: str,
) -> tuple[str, str]:
    """Returns (subject, html) for a booking cancellation email."""
    formatted_date  = _format_date(appointment_date)
    display_id      = _booking_id_short(booking_id)
    display_name    = user_name or "Valued Patient"

    subject = f"FEMCARE Appointment Cancelled — {hospital_name}"

    body = f"""
      <div class="header" style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);">
        <div class="header-logo"><span>Fem</span>Care</div>
        <div class="header-title">Appointment Cancelled</div>
        <div class="header-subtitle">Your booking has been cancelled</div>
      </div>

      <div class="body">
        <p class="greeting">Hello <strong>{display_name}</strong>,<br /><br />
        Your appointment has been cancelled as requested.</p>

        <div class="section-title">Cancelled Appointment</div>
        <div class="detail-card">
          <div class="detail-row">
            <span class="detail-label">Hospital / Clinic</span>
            <span class="detail-value">{hospital_name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Specialty</span>
            <span class="detail-value">{specialty}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{formatted_date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">{appointment_slot}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="status-badge status-cancelled">Cancelled</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value"><span class="booking-id">{display_id}</span></span>
          </div>
        </div>

        <div class="notice">
          🗓 You can book a new appointment anytime from your <strong>FEMCARE Bookings</strong> page.
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand"><span>Fem</span>Care Women's Health</div>
        <div class="footer-text">AI-Powered Women's Reproductive Health Platform</div>
      </div>
    """

    return subject, _base_email(subject, "#FEE2E2", body)


# ─── Send Function ───────────────────────────────────────────────────────────

async def send_email(to_email: str, subject: str, html: str) -> bool:
    """
    Send an email via Resend API using httpx (already in requirements).
    Returns True on success, False on failure.
    Never raises — caller must handle email_sent=False gracefully.
    """
    if not EMAIL_ENABLED:
        print(f"[EMAIL] Service not configured. Would send to {to_email}: {subject}")
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                RESEND_API_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": RESEND_FROM,
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
            )

        if response.status_code in (200, 201):
            print(f"[EMAIL] Sent successfully to {to_email}: {subject}")
            return True
        else:
            print(f"[EMAIL] Failed ({response.status_code}): {response.text}")
            return False

    except Exception as e:
        print(f"[EMAIL] Exception sending to {to_email}: {e}")
        return False


async def send_booking_confirmation(
    to_email: str,
    user_name: str,
    hospital_name: str,
    specialty: str,
    appointment_date: str,
    appointment_slot: str,
    booking_id: str,
) -> bool:
    subject, html = build_confirmation_email(
        user_name, hospital_name, specialty,
        appointment_date, appointment_slot, booking_id
    )
    return await send_email(to_email, subject, html)


async def send_booking_cancellation(
    to_email: str,
    user_name: str,
    hospital_name: str,
    specialty: str,
    appointment_date: str,
    appointment_slot: str,
    booking_id: str,
) -> bool:
    subject, html = build_cancellation_email(
        user_name, hospital_name, specialty,
        appointment_date, appointment_slot, booking_id
    )
    return await send_email(to_email, subject, html)
