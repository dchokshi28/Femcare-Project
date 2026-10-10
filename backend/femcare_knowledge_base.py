"""
FEMCARE Women's Reproductive Health Knowledge Base
Educational information for menstrual and reproductive health chatbot
Sources: General medical knowledge, public health guidelines
"""

KNOWLEDGE_BASE = {
    "menstrual_cycle": {
        "definition": "The menstrual cycle is the monthly hormonal cycle that prepares the body for pregnancy. It typically lasts 21-35 days, with 28 days being average.",
        "phases": [
            {"name": "Menstrual Phase", "days": "1-5", "description": "Period bleeding occurs as the uterine lining sheds."},
            {"name": "Follicular Phase", "days": "1-13", "description": "Estrogen rises, follicles mature in the ovaries."},
            {"name": "Ovulation", "days": "14", "description": "An egg is released from the ovary. This is the fertile window."},
            {"name": "Luteal Phase", "days": "15-28", "description": "Progesterone prepares the uterus for possible pregnancy."}
        ],
        "normal_range": "21-35 days",
        "average": "28 days"
    },
    
    "period_duration": {
        "normal_range": "3-7 days",
        "average": "5 days",
        "heavy_if": "Soaking through pads/tampons every 1-2 hours, passing large clots",
        "light_if": "Very short duration (1-2 days) or very light flow"
    },
    
    "cramps": {
        "medical_term": "Dysmenorrhea",
        "cause": "Uterine contractions caused by prostaglandins",
        "management": [
            "Heat therapy (heating pad, warm bath)",
            "Over-the-counter pain relievers (ibuprofen, naproxen)",
            "Light exercise and stretching",
            "Magnesium supplements",
            "Adequate hydration"
        ],
        "when_to_seek_care": "If cramps are severe, interfere with daily activities, or worsen over time"
    },
    
    "pms": {
        "definition": "Premenstrual Syndrome - physical and emotional symptoms before menstruation",
        "common_symptoms": [
            "Mood changes (irritability, anxiety, depression)",
            "Bloating and water retention",
            "Breast tenderness",
            "Fatigue",
            "Food cravings",
            "Headaches",
            "Sleep changes"
        ],
        "management": [
            "Regular exercise",
            "Balanced diet (reduce salt, caffeine, sugar)",
            "Adequate sleep",
            "Stress management",
            "Vitamin B6, calcium, magnesium supplements"
        ]
    },
    
    "irregular_periods": {
        "definition": "Menstrual cycles that vary significantly in length or skip months",
        "common_causes": [
            "Stress",
            "Significant weight changes",
            "PCOS (Polycystic Ovary Syndrome)",
            "Thyroid disorders",
            "Excessive exercise",
            "Hormonal imbalances",
            "Perimenopause"
        ],
        "when_to_seek_care": "If irregularity persists for several cycles or is accompanied by other symptoms"
    },
    
    "heavy_bleeding": {
        "medical_term": "Menorrhagia",
        "definition": "Abnormally heavy or prolonged menstrual bleeding",
        "signs": [
            "Soaking through pads/tampons every hour for several hours",
            "Passing blood clots larger than a quarter",
            "Bleeding for more than 7 days",
            "Symptoms of anemia (fatigue, weakness, shortness of breath)"
        ],
        "possible_causes": [
            "Hormonal imbalances",
            "Uterine fibroids",
            "Uterine polyps",
            "Bleeding disorders",
            "IUD complications"
        ],
        "when_to_seek_care": "Seek medical attention if experiencing heavy bleeding, especially with dizziness or fatigue"
    },
    
    "ovulation": {
        "definition": "The release of an egg from the ovary",
        "timing": "Typically occurs around day 14 of a 28-day cycle (mid-cycle)",
        "fertile_window": "5 days before ovulation and day of ovulation",
        "signs": [
            "Changes in cervical mucus (clear, stretchy, egg-white consistency)",
            "Mild abdominal pain or twinges (mittelschmerz)",
            "Slight increase in basal body temperature",
            "Increased libido",
            "Breast tenderness"
        ]
    },
    
    "pcos": {
        "full_name": "Polycystic Ovary Syndrome",
        "definition": "A hormonal disorder causing enlarged ovaries with small cysts",
        "common_symptoms": [
            "Irregular or absent periods",
            "Excess facial or body hair",
            "Acne",
            "Weight gain",
            "Thinning scalp hair",
            "Insulin resistance"
        ],
        "diagnosis": "Requires medical evaluation and testing",
        "management": "Lifestyle changes, medications; consult healthcare provider for personalized treatment"
    },
    
    "menstrual_hygiene": {
        "products": [
            "Pads/sanitary napkins - change every 4-6 hours",
            "Tampons - change every 4-8 hours, never exceed 8 hours",
            "Menstrual cups - can be worn up to 12 hours",
            "Period underwear - reusable, washable option"
        ],
        "hygiene_tips": [
            "Wash hands before and after changing products",
            "Change products regularly to prevent odor and infection",
            "Wash external genital area with mild soap and water",
            "Avoid douching or harsh soaps internally",
            "Dispose of products properly"
        ]
    },
    
    "warning_signs": {
        "seek_immediate_care": [
            "Extremely heavy bleeding (soaking through pad/tampon every hour)",
            "Severe, sudden pelvic or abdominal pain",
            "Fever with pelvic pain",
            "Fainting or severe dizziness",
            "Suspected pregnancy with severe pain or bleeding",
            "Severe allergic reaction to menstrual products"
        ],
        "consult_healthcare_provider": [
            "Persistent irregular periods",
            "Periods lasting longer than 7 days",
            "Severe cramps not relieved by over-the-counter medication",
            "Bleeding between periods",
            "Sudden changes in menstrual pattern",
            "Symptoms of anemia (extreme fatigue, weakness)"
        ]
    },
    
    "fertility_basics": {
        "fertile_window": "The 5-6 days when pregnancy is possible, ending on ovulation day",
        "peak_fertility": "2-3 days before ovulation",
        "factors_affecting_fertility": [
            "Age (fertility decreases with age, especially after 35)",
            "Ovulation regularity",
            "Overall health",
            "Weight (very low or high BMI)",
            "Smoking and alcohol use",
            "Stress"
        ],
        "tracking_methods": [
            "Basal body temperature tracking",
            "Ovulation predictor kits",
            "Cervical mucus monitoring",
            "Calendar method",
            "Fertility apps"
        ]
    },
    
    "pregnancy_basics": {
        "early_signs": [
            "Missed period",
            "Nausea (morning sickness)",
            "Breast tenderness and swelling",
            "Fatigue",
            "Frequent urination",
            "Light spotting (implantation bleeding)"
        ],
        "testing": "Home pregnancy tests are most accurate after a missed period",
        "when_to_see_doctor": "Schedule prenatal care appointment as soon as pregnancy is confirmed"
    },
    
    "femcare_features": {
        "title": "FemCare Application Features & Navigation",
        "features": {
            "period_tracking": "Track your cycle start/end dates, flow, pain level, symptoms, and moods via 'Log Cycle'. Machine learning models predict your next period date and cycle length.",
            "period_history": "View historical cycle trends, previous period durations, and logs in the 'Period History' section.",
            "health_assessment": "Take the 18-biomarker AI Health Assessment on the 'Assessment' page to screen for PCOS indicators. Each user receives 2 free quizzes, with continued access on an active subscription.",
            "find_care": "Find verified reproductive health providers and book appointment slots through 'Find Care'. Every account receives 1 free booking slot, with additional bookings on an active subscription.",
            "awareness": "Read clinical guides on PCOS, Endometriosis, Adenomyosis, and reproductive health in the 'Awareness' section.",
            "subscriptions": "Monthly and Annual plans provide continued assessment trials, additional appointments, and full clinical awareness guides."
        }
    }
}

# Semantic topic detection
TOPIC_PATTERNS = {
    "menstrual_cycle": ["cycle", "menstrual cycle", "how long", "cycle length", "regular cycle"],
    "period_duration": ["period last", "how long period", "period duration", "days of bleeding"],
    "cramps": ["cramp", "cramping", "period pain", "menstrual pain", "dysmenorrhea", "hurt", "ache"],
    "pms": ["pms", "premenstrual", "before period", "mood", "bloat", "irritable"],
    "irregular_periods": ["irregular", "skip period", "missed period", "inconsistent", "vary"],
    "heavy_bleeding": ["heavy", "heavy bleeding", "soaking", "clot", "menorrhagia"],
    "ovulation": ["ovulat", "fertile", "egg", "conceive"],
    "pcos": ["pcos", "polycystic"],
    "menstrual_hygiene": ["hygiene", "pad", "tampon", "cup", "product", "clean"],
    "warning_signs": ["severe", "emergency", "sudden", "extreme", "faint", "dizzy"],
    "fertility_basics": ["fertility", "pregnant", "trying to conceive", "ttc"],
    "pregnancy_basics": ["pregnancy", "pregnant", "conception", "baby"],
    "femcare_features": ["femcare", "feature", "how to book", "book appointment", "find care", "assessment", "quiz", "track period", "log cycle", "period history", "history", "subscription", "how do i use"]
}

def get_knowledge(topic):
    """Retrieve knowledge for a specific topic"""
    return KNOWLEDGE_BASE.get(topic, {})

def detect_topic(message):
    """Detect the most relevant topic from user message"""
    message_lower = message.lower()
    
    best_match = None
    max_score = 0
    
    for topic, patterns in TOPIC_PATTERNS.items():
        score = sum(1 for pattern in patterns if pattern in message_lower)
        if score > max_score:
            max_score = score
            best_match = topic
    
    return best_match if max_score > 0 else None
