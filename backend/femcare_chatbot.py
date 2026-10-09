"""
FEMCARE AI Chatbot — Groq LLM Pipeline
Architecture:
  User Message
    → Scope Detection
    → Medical Urgency Check
    → FEMCARE Knowledge Retrieval
    → User's authenticated period/symptom context
    → Groq LLM (llama-3.1-8b-instant) with FEMCARE System Prompt
    → Response
"""

import os
from typing import Optional, Dict, Any, List, Tuple
from dotenv import load_dotenv
load_dotenv()

from groq import Groq
try:
    from .femcare_knowledge_base import detect_topic, get_knowledge
except ImportError:  # `uvicorn main:app` when started inside backend/
    from femcare_knowledge_base import detect_topic, get_knowledge

# ─────────────────────────────────────────────────────────────
# GROQ CLIENT
# ─────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

_groq_client: Optional[Groq] = None

def get_groq_client() -> Optional[Groq]:
    global _groq_client
    api_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
    if _groq_client is None and api_key:
        _groq_client = Groq(api_key=api_key)
    return _groq_client

LLM_AVAILABLE = bool(os.getenv("GROQ_API_KEY") or GROQ_API_KEY)

# ─────────────────────────────────────────────────────────────
# FEMCARE SYSTEM PROMPT
# ─────────────────────────────────────────────────────────────
FEMCARE_SYSTEM_PROMPT = """You are FEMCARE AI, a specialized women's menstrual and reproductive health assistant.

You are NOT a general-purpose AI assistant.

Your purpose is to provide basic, educational information about:
- Menstrual periods and menstrual cycles
- Period tracking and cycle length
- Period duration and flow
- PMS (premenstrual syndrome)
- Menstrual cramps and pain
- Bloating related to menstrual cycles
- Period-related headaches and fatigue
- Mood changes related to menstrual cycles
- Irregular periods and missed periods
- Heavy menstrual bleeding
- Light or short periods
- Menstrual hygiene and products
- Ovulation basics and fertile window
- Fertility basics
- General reproductive health
- Vaginal health basics
- Hormonal and reproductive health
- Pregnancy-related basic health information
- When to seek professional medical care for reproductive/menstrual concerns
- FemCare application features and navigation:
  * Menstrual cycle tracking and AI predictions ('Calendar' / 'Log Cycle' page)
  * Historical cycle trends and logs ('Period History' page)
  * AI Health Assessment for PCOS screening ('Assessment' page — includes 2 free quizzes per user)
  * Finding specialist care and booking appointments ('Bookings & Care' / 'Find Care' — includes 1 free booking slot per user)
  * Clinical awareness articles on reproductive health ('Awareness' page)
  * Subscription plans for continuing quizzes, appointments, and full awareness access

STRICT RESTRICTIONS:
- Do NOT answer questions unrelated to women's menstrual/reproductive health or FemCare application features.
- If asked about programming, technology, sports, weather, entertainment, recipes, general knowledge, or anything outside women's health and FemCare features, politely explain that you are specialized in women's menstrual and reproductive health and redirect the user.
- Do NOT act as a general AI assistant.

MEDICAL SAFETY RULES:
- Provide general educational information only — you are not a doctor.
- Do NOT diagnose medical conditions.
- Do NOT claim certainty about a user's health condition.
- Do NOT prescribe medication or specific treatments.
- Use cautious language: "may be", "could be", "possible causes include", "some people experience".
- For potentially serious symptoms (severe or sudden pain, extremely heavy bleeding, fainting, suspected pregnancy emergencies), recommend seeking appropriate medical care or emergency services immediately.

PERSONALIZATION:
- When the user's FEMCARE data is provided (period dates, cycle length, symptoms), use it to give contextually relevant educational guidance.
- Never invent personal health data that was not provided.
- Never reveal or reference any other user's information.

RESPONSE STYLE:
- Be clear, concise, and educational.
- Keep responses focused — 2 to 5 sentences for simple questions.
- Use plain language appropriate for a health-awareness app.
- Do not give lengthy medical lectures.
- Always be empathetic and respectful.

You are the FEMCARE women's health assistant. Stay within your specialized scope at all times."""

# ─────────────────────────────────────────────────────────────
# SCOPE DETECTION
# ─────────────────────────────────────────────────────────────

_OUT_OF_SCOPE = {
    "programming":  ["python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php",
                     "html", "css", "react", "vue", "angular", "node", "django", "flask",
                     "algorithm", "debug", "compile", "function", "class", "variable", "loop",
                     "array", "database query", "sql query", "api endpoint"],
    "technology":   ["computer", "laptop", "phone", "tablet", "software", "hardware", "wifi",
                     "internet", "website", "app development", "machine learning", "ai model",
                     "neural network", "data science"],
    "entertainment":["movie", "film", "song", "music", "game", "tv show", "celebrity", "actor",
                     "actress", "netflix", "youtube"],
    "sports":       ["cricket", "football", "soccer", "basketball", "tennis", "match score",
                     "team won", "league", "tournament", "player"],
    "weather":      ["weather", "temperature outside", "rain today", "forecast", "climate today"],
    "general":      ["tell me a joke", "write a joke", "funny story", "riddle", "write my resume",
                     "write an essay", "write a letter", "translate this", "what time is it"],
    "food":         ["recipe for", "how to cook", "best restaurant"],
}

_HEALTH_INDICATORS = [
    "period", "menstrual", "menstruation", "cycle", "bleeding", "flow", "spotting",
    "cramp", "cramping", "pms", "premenstrual", "bloat", "headache", "mood",
    "fatigue", "tired", "breast", "tender", "pcos", "endometriosis", "fibroid", "cyst",
    "ovulat", "fertile", "fertility", "pregnancy", "pregnant", "conceive",
    "vaginal", "vagina", "uterus", "ovary", "cervix", "reproductive", "hormone",
    "estrogen", "progesterone", "irregular", "discharge", "hygiene", "pad", "tampon",
    "menopause", "perimenopause", "contraception", "birth control",
    "lower abdomen", "pelvic", "belly pain", "stomach pain monthly",
    # FemCare Application & Navigation features
    "femcare", "feature", "booking", "book", "appointment", "doctor",
    "assessment", "quiz", "history", "tracking", "log cycle", "find care",
    "subscription", "plan",
]

def scope_check(message: str) -> Tuple[bool, str]:
    """
    Returns (is_out_of_scope, reason)
    Uses category detection. Health indicators override out-of-scope.
    """
    msg = message.lower()

    # If health indicator present → always in scope
    if any(kw in msg for kw in _HEALTH_INDICATORS):
        return False, ""

    # Check out-of-scope categories
    for category, keywords in _OUT_OF_SCOPE.items():
        if any(kw in msg for kw in keywords):
            return True, category

    return False, ""

def is_urgent(message: str) -> bool:
    urgent = [
        "severe", "extreme", "unbearable", "emergency",
        "faint", "fainting", "dizzy", "collapsed",
        "heavy bleeding", "soaking", "hemorrhag",
        "sudden pain", "sharp pain", "can't breathe",
        "shortness of breath", "unconscious",
    ]
    msg = message.lower()
    return any(kw in msg for kw in urgent)

# ─────────────────────────────────────────────────────────────
# KNOWLEDGE CONTEXT BUILDER
# ─────────────────────────────────────────────────────────────

def build_knowledge_context(message: str) -> str:
    """Retrieve relevant FEMCARE knowledge for the detected topic."""
    topic = detect_topic(message)
    if not topic:
        return ""

    knowledge = get_knowledge(topic)
    if not knowledge:
        return ""

    lines = [f"FEMCARE Knowledge Context [{topic.replace('_', ' ').title()}]:"]

    for key, value in knowledge.items():
        if isinstance(value, list):
            lines.append(f"  {key.replace('_', ' ').title()}: {', '.join(str(v) for v in value[:5])}")
        elif isinstance(value, dict):
            lines.append(f"  {key.replace('_', ' ').title()}:")
            for subk, subv in value.items():
                lines.append(f"    - {subk.replace('_', ' ').title()}: {subv}")
        else:
            lines.append(f"  {key.replace('_', ' ').title()}: {value}")

    return "\n".join(lines)


def build_user_context(user_context: Dict[str, Any]) -> str:
    """Build a concise context string from the authenticated user's FEMCARE data."""
    if not user_context:
        return ""

    parts = []

    if user_context.get("lastPeriod"):
        parts.append(f"Last period start date: {user_context['lastPeriod']}")

    if user_context.get("cycleLength"):
        parts.append(f"Average cycle length: {user_context['cycleLength']} days")

    if user_context.get("cycleDay"):
        parts.append(f"Current cycle day: {user_context['cycleDay']}")

    if user_context.get("phase"):
        parts.append(f"Current cycle phase: {user_context['phase']}")

    if user_context.get("recentSymptoms"):
        symptoms = user_context["recentSymptoms"]
        if isinstance(symptoms, list):
            parts.append(f"Recent symptoms (last 30 days): {', '.join(symptoms[:5])}")
        elif isinstance(symptoms, str):
            parts.append(f"Recent symptoms: {symptoms}")

    if not parts:
        return ""

    return "Authenticated User's FEMCARE Data:\n" + "\n".join(f"  - {p}" for p in parts)


# ─────────────────────────────────────────────────────────────
# MAIN RESPONSE GENERATOR
# ─────────────────────────────────────────────────────────────

def generate_response(
    message: str,
    user_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Full pipeline:
      1. Scope check
      2. Urgency check
      3. Knowledge retrieval
      4. User context
      5. Groq LLM call
      6. Return structured response
    """

    user_context = user_context or {}

    # ── Step 0: Empty message check ──────────────────────────
    if not message or not message.strip():
        return {
            "reply": (
                "Please ask a question about your menstrual cycle, reproductive health, "
                "or how to use FemCare features."
            ),
            "scope": "in_scope",
            "llm_used": False,
            "llm_provider": None,
            "llm_model": None,
        }

    # ── Step 1: Scope check ──────────────────────────────────
    out_of_scope, oos_category = scope_check(message)
    if out_of_scope:
        return {
            "reply": (
                "I'm FEMCARE AI, specialized in women's menstrual and reproductive health. "
                "I can help with questions about periods, menstrual cycles, PMS, cramps, "
                "ovulation, fertility basics, and related reproductive health topics. "
                "For other questions, please use a general assistant or search engine."
            ),
            "scope": "out_of_scope",
            "category": oos_category,
            "llm_used": False,
            "llm_provider": None,
            "llm_model": None,
        }

    # ── Step 2: Urgency check ────────────────────────────────
    if is_urgent(message):
        # Still send to LLM but include urgency instruction
        urgency_note = (
            "\n\nIMPORTANT: The user is describing potentially urgent symptoms. "
            "Your response MUST recommend seeking immediate medical attention or emergency care. "
            "Do not downplay the urgency."
        )
    else:
        urgency_note = ""

    # ── Step 3: Knowledge retrieval ──────────────────────────
    knowledge_context = build_knowledge_context(message)

    # ── Step 4: User context ─────────────────────────────────
    user_ctx_text = build_user_context(user_context)

    # ── Step 5: Check LLM availability ───────────────────────
    client = get_groq_client()

    if not client:
        # LLM not available — return explicit error, not silent fallback
        return {
            "reply": (
                "The FEMCARE AI assistant is temporarily unavailable (LLM service not configured). "
                "Please try again later or contact support."
            ),
            "scope": "in_scope",
            "llm_used": False,
            "llm_provider": "groq",
            "llm_model": GROQ_MODEL,
            "error": "GROQ_API_KEY not set — LLM unavailable",
        }

    # ── Step 6: Build messages for Groq ─────────────────────
    system_prompt = FEMCARE_SYSTEM_PROMPT + urgency_note

    # Construct the user turn content
    user_content_parts = [f"User Question: {message}"]

    if knowledge_context:
        user_content_parts.append(f"\n{knowledge_context}")

    if user_ctx_text:
        user_content_parts.append(f"\n{user_ctx_text}")

    user_content_parts.append(
        "\nUsing the FEMCARE knowledge context and user data above (if provided), "
        "give a clear, educational, medically cautious response focused on women's "
        "menstrual and reproductive health."
    )

    user_content = "\n".join(user_content_parts)

    # ── Step 7: Call Groq LLM ────────────────────────────────
    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_content},
            ],
            temperature=0.4,   # lower = more consistent, medically cautious
            max_tokens=400,
            top_p=0.9,
        )

        reply_text = completion.choices[0].message.content.strip()
        model_used = completion.model  # actual model confirmed by API

        return {
            "reply": reply_text,
            "scope": "in_scope",
            "llm_used": True,
            "llm_provider": "groq",
            "llm_model": model_used,
            "topic": detect_topic(message),
        }

    except Exception as e:
        # LLM call failed — return explicit failure, not a silent fallback
        error_str = str(e)
        return {
            "reply": (
                "I'm having trouble connecting to the AI service right now. "
                "Please try again in a moment."
            ),
            "scope": "in_scope",
            "llm_used": False,
            "llm_provider": "groq",
            "llm_model": GROQ_MODEL,
            "error": f"LLM_CALL_FAILED: {error_str}",
        }
