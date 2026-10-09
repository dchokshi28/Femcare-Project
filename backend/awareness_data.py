"""FEMCARE Awareness Content and Server-Side Entitlement Source of Truth.
Contains condition definitions and research-backed educational guides.
"""

CONDITIONS = {
    "pcos": {
        "id": "pcos",
        "name": "Polycystic Ovary Syndrome (PCOS)",
        "shortName": "PCOS",
        "category": "hormonal",
        "tagText": "Hormonal Health",
        "description": "A hormonal condition that can affect ovulation, periods, and androgen levels.",
        "what": "PCOS is a common hormonal disorder that can affect people with ovaries. It is associated with higher-than-usual levels of androgens (male hormones), irregular menstrual cycles, and the presence of small cysts on the ovaries in some cases.",
        "symptoms": [
            "Irregular, infrequent, or prolonged menstrual cycles",
            "Excess facial or body hair (hirsutism)",
            "Severe acne or oily skin",
            "Thinning hair on the scalp",
            "Weight changes or difficulty managing weight",
            "Darkened skin patches (acanthosis nigricans)",
            "Difficulty conceiving",
        ],
        "riskFactors": [
            "Family history of PCOS",
            "Insulin resistance or type 2 diabetes",
            "Obesity or being overweight",
            "Inflammation",
        ],
        "prevention": [
            "Maintaining a balanced diet and healthy weight",
            "Regular physical activity",
            "Managing blood sugar levels",
            "Regular check-ups if you have a family history",
        ],
        "screening": "PCOS is typically diagnosed through a combination of symptom review, physical examination, blood tests (hormone levels), and pelvic ultrasound. There is no single definitive test.",
        "treatment": "Treatment depends on symptoms and whether pregnancy is desired. Options may include lifestyle changes, hormonal contraceptives, medications to manage insulin resistance, or fertility treatments — all guided by a healthcare professional.",
        "whenToSeeDoctor": "Speak to a healthcare professional if your periods are consistently irregular, if you notice significant changes in hair, skin, or weight, or if you have difficulty conceiving.",
        "warningSigns": [
            "Sudden or severe pelvic pain",
            "Very heavy or prolonged bleeding",
            "Symptoms that significantly affect your daily life",
        ],
        "guides": [
            {"title": "Menstrual Cycle Tracking Guide", "text": "Tracking cycle phases and symptom fluctuations helps identify ovulation irregularities typical in PCOS."}
        ],
    },
    "endometriosis": {
        "id": "endometriosis",
        "name": "Endometriosis",
        "shortName": "Endometriosis",
        "category": "reproductive",
        "tagText": "Reproductive Health",
        "description": "A condition where tissue similar to the uterine lining grows outside the uterus.",
        "what": "Endometriosis occurs when tissue resembling the endometrium (the lining of the uterus) grows outside the uterus — commonly on the ovaries, fallopian tubes, or tissue lining the pelvis. This tissue responds to the menstrual cycle and can cause inflammation and scarring.",
        "symptoms": [
            "Painful periods (dysmenorrhea) — often worse over time",
            "Pelvic pain outside of periods",
            "Pain during or after intercourse",
            "Pain during bowel movements or urination",
            "Heavy or irregular bleeding",
            "Difficulty conceiving",
            "Fatigue, bloating, nausea especially during periods",
        ],
        "riskFactors": [
            "Family history of endometriosis",
            "Starting periods at a young age",
            "Short menstrual cycles (less than 27 days)",
            "Heavy or prolonged menstrual periods",
        ],
        "prevention": "There is no known way to prevent endometriosis. Early diagnosis and symptom management can help reduce its impact on quality of life.",
        "screening": "Endometriosis is often diagnosed through symptom review and pelvic examination. Laparoscopy (a minor surgical procedure) is the definitive diagnostic method. Imaging may support diagnosis.",
        "treatment": "Treatment may include pain management, hormonal therapy, or surgery depending on severity and individual goals. A gynaecologist can help determine the most appropriate approach.",
        "whenToSeeDoctor": "See a doctor if you experience painful periods that worsen over time, chronic pelvic pain, or pain that interferes with your daily activities.",
        "warningSigns": [
            "Severe pelvic pain that is sudden or significantly worsening",
            "Fainting or inability to stand due to pain",
            "Very heavy bleeding (soaking a pad/tampon hourly)",
        ],
        "guides": [
            {"title": "Pelvic Pain Management Guide", "text": "Keeping a daily pain and cycle log provides critical diagnostic evidence for gynecological consultations."}
        ],
    },
    "cervical-cancer": {
        "id": "cervical-cancer",
        "name": "Cervical Cancer Awareness",
        "shortName": "Cervical Health",
        "category": "cancer",
        "tagText": "Cancer Awareness",
        "description": "One of the most preventable cancers with regular screening and HPV vaccination.",
        "what": "Cervical cancer develops in the cervix (the lower part of the uterus connecting to the vagina). Most cases are caused by persistent infection with high-risk human papillomavirus (HPV) strains. It develops slowly over many years, making early detection through screening highly effective.",
        "symptoms": [
            "Early stages typically cause NO symptoms — this is why screening is essential",
            "Abnormal vaginal bleeding between periods or after intercourse",
            "Unusual vaginal discharge (watery, pink, or foul-smelling)",
            "Pelvic pain or pain during intercourse",
            "Bleeding after menopause",
        ],
        "riskFactors": [
            "Persistent HPV infection (the primary cause)",
            "Not having regular cervical screening tests",
            "Smoking",
            "Weakened immune system",
            "Early sexual activity or multiple partners",
        ],
        "prevention": [
            "HPV vaccination (most effective when given before sexual debut, but beneficial up to age 26-45)",
            "Regular Pap smear / cervical cytology tests",
            "HPV DNA testing according to screening guidelines",
            "Using barrier protection during sexual activity",
            "Avoiding smoking",
        ],
        "screening": "Pap smears detect precancerous changes on the cervix before they turn into cancer. HPV tests check for high-risk HPV types. Guidelines generally recommend screening starting at age 21 or 25, depending on local protocols.",
        "treatment": "When found early, precancerous changes can be treated with minor procedures (LEEP, cryotherapy, cone biopsy) to prevent cancer from developing. Invasive cervical cancer treatment includes surgery, radiation, or chemotherapy.",
        "whenToSeeDoctor": "Schedule an immediate consultation if you have abnormal bleeding between periods, after sex, or post-menopause, or unusual persistent discharge.",
        "warningSigns": [
            "Post-coital or intermenstrual bleeding",
            "Unexplained weight loss with pelvic pain",
            "Persistent foul-smelling discharge",
        ],
        "guides": [
            {"title": "Cervical Screening & HPV Guide", "text": "Understanding Pap smear intervals and HPV vaccination timelines for proactive cervical health."}
        ],
    },
    "breast-cancer": {
        "id": "breast-cancer",
        "name": "Breast Cancer Awareness",
        "shortName": "Breast Health",
        "category": "cancer",
        "tagText": "Cancer Awareness",
        "description": "The most common cancer in women; early detection drastically improves outcomes.",
        "what": "Breast cancer begins when cells in breast tissue grow uncontrollably. Most begin in the ducts (ductal carcinoma) or lobules (lobular carcinoma). Early detection through breast self-awareness, clinical examinations, and mammography provides high cure rates.",
        "symptoms": [
            "A painless lump or thickening in the breast or armpit",
            "Change in size, shape, or appearance of the breast",
            "Dimpling, redness, or puckering of the breast skin",
            "Inverted or retracted nipple",
            "Nipple discharge (especially if bloody or clear from one breast)",
            "Persistent breast or armpit pain",
        ],
        "riskFactors": [
            "Age (risk increases with age)",
            "Family history of breast or ovarian cancer (BRCA1/BRCA2 gene mutations)",
            "Dense breast tissue",
            "Early menarche (before age 12) or late menopause (after 55)",
            "Lack of physical activity, alcohol consumption",
        ],
        "prevention": [
            "Regular physical activity and maintaining a healthy body weight",
            "Limiting alcohol intake",
            "Breastfeeding when possible",
            "Monthly breast self-awareness (checking for changes)",
            "Regular mammography screening as recommended for your age group",
        ],
        "screening": "Screening mammography is the standard tool for early detection before lumps can be felt. Clinical breast exams and ultrasound or MRI are used as complementary tools, especially for dense breasts or high-risk individuals.",
        "treatment": "Multimodal therapy depending on stage and subtype: surgery (lumpectomy or mastectomy), radiation therapy, chemotherapy, hormone therapy, and targeted immunotherapy.",
        "whenToSeeDoctor": "See a doctor promptly if you find any new lump, skin dimpling, nipple changes, or unexplained discharge.",
        "warningSigns": [
            "Hard, fixed, painless lump in breast or axilla",
            "Bloody or spontaneous single-duct nipple discharge",
            "Orange peel skin texture (peau d'orange) or redness",
        ],
        "guides": [
            {"title": "Breast Self-Examination Routine", "text": "Step-by-step guidance on monthly self-exams performed 3–5 days after your period ends."}
        ],
    },
    "thyroid": {
        "id": "thyroid",
        "name": "Thyroid Disorders in Women",
        "shortName": "Thyroid Health",
        "category": "hormonal",
        "tagText": "Hormonal Health",
        "description": "Thyroid imbalances affect metabolism, energy, and menstrual regularities.",
        "what": "The butterfly-shaped thyroid gland in the neck produces hormones (T3, T4) regulating metabolism, heart rate, and reproductive cycles. Women are 5 to 8 times more likely to develop thyroid disorders than men.",
        "symptoms": [
            "Hypothyroidism (underactive): Fatigue, weight gain, heavy periods, sensitivity to cold, constipation, dry skin, depression",
            "Hyperthyroidism (overactive): Rapid heartbeat, weight loss, light/infrequent periods, heat sensitivity, anxiety, tremors",
            "Goiter (enlarged gland in neck)",
        ],
        "riskFactors": [
            "Female sex",
            "Family history of thyroid or autoimmune diseases",
            "Postpartum period (postpartum thyroiditis)",
            "Type 1 diabetes or other autoimmune conditions",
        ],
        "prevention": "Adequate dietary iodine, stress management, and regular screening when family history or symptoms are present.",
        "screening": "Blood test measuring Thyroid Stimulating Hormone (TSH) and Free T4. TSH is the most sensitive first-line test.",
        "treatment": "Hypothyroidism is managed with daily levothyroxine. Hyperthyroidism is treated with anti-thyroid medications, radioactive iodine, or surgery.",
        "whenToSeeDoctor": "Consult a healthcare provider if you have unexplained fatigue, rapid weight shifts, or sudden menstrual cycle alterations.",
        "warningSigns": [
            "Rapid or irregular heartbeat at rest",
            "Extreme fatigue or difficulty breathing",
            "Sudden neck swelling with swallowing difficulty",
        ],
        "guides": [
            {"title": "Thyroid & Fertility Connection", "text": "How TSH levels influence ovulation, progesterone levels, and pregnancy viability."}
        ],
    },
    "anemia": {
        "id": "anemia",
        "name": "Iron Deficiency Anemia",
        "shortName": "Anemia",
        "category": "general",
        "tagText": "General Health",
        "description": "Low iron from heavy menstrual bleeding can cause chronic fatigue and weakness.",
        "what": "Anemia occurs when the blood lacks enough healthy red blood cells or hemoglobin. In women of reproductive age, heavy menstrual bleeding (menorrhagia) is the leading cause of iron-deficiency anemia.",
        "symptoms": [
            "Extreme fatigue and lack of energy",
            "Pale skin, inner eyelids, or nailbeds",
            "Shortness of breath with minimal exertion",
            "Dizziness, lightheadedness, or headaches",
            "Cold hands and feet",
            "Brittle nails or hair loss",
            "Restless legs syndrome",
        ],
        "riskFactors": [
            "Heavy menstrual periods (soaking pads hourly or bleeding >7 days)",
            "Diet low in iron (vegetarian/vegan without adequate supplementation)",
            "Frequent blood donation",
            "Gastrointestinal conditions affecting absorption (celiac, IBD)",
        ],
        "prevention": [
            "Consuming iron-rich foods (beans, lentils, spinach, fortified grains, lean meats)",
            "Pairing plant-based iron with Vitamin C (citrus, bell peppers) to boost absorption",
            "Avoiding tea or coffee with iron-rich meals (tannins inhibit absorption)",
            "Tracking menstrual flow to identify excessive blood loss early",
        ],
        "screening": "Complete Blood Count (CBC) and serum Ferritin level test (evaluates total iron stores).",
        "treatment": "Oral iron supplements prescribed by a doctor, dietary modification, and treating the underlying cause of heavy bleeding (e.g., tranexamic acid, hormonal regulation).",
        "whenToSeeDoctor": "See a doctor if you experience persistent fatigue, dizziness, breathlessness, or notice that your periods are heavy enough to disrupt daily life.",
        "warningSigns": [
            "Fainting or severe lightheadedness",
            "Chest pain or rapid heartbeat during rest",
            "Severe shortness of breath",
        ],
        "guides": [
            {"title": "Nutritional Iron Optimization", "text": "Evidence-based meal planning to restore ferritin stores without gastrointestinal distress."}
        ],
    },
    "pid": {
        "id": "pid",
        "name": "Pelvic Inflammatory Disease (PID)",
        "shortName": "PID",
        "category": "reproductive",
        "tagText": "Reproductive Health",
        "description": "An infection of female reproductive organs often caused by untreated STIs.",
        "what": "Pelvic Inflammatory Disease is an infection of the upper female genital tract (uterus, fallopian tubes, and ovaries). It often arises from sexually transmitted bacteria (most commonly Chlamydia or Gonorrhea) that ascend from the vagina.",
        "symptoms": [
            "Pain in the lower abdomen and pelvis",
            "Abnormal, foul-smelling vaginal discharge",
            "Bleeding between periods or after sex",
            "Pain or bleeding during intercourse",
            "Fever and chills",
            "Painful or difficult urination",
        ],
        "riskFactors": [
            "Untreated sexually transmitted infections (STIs)",
            "Multiple sexual partners or partner with multiple partners",
            "Sex without barrier contraception",
            "History of PID or STI",
            "Recent insertion of an intrauterine device (IUD) — slight risk during first 3 weeks",
        ],
        "prevention": [
            "Practicing safer sex with barrier methods (condoms)",
            "Regular STI screenings for sexually active individuals",
            "Prompt treatment of any vaginal or cervical infection",
            "Ensuring sexual partners are tested and treated simultaneously",
        ],
        "screening": "Diagnosis involves pelvic examination (cervical motion tenderness, uterine tenderness), vaginal/cervical swabs for STIs, and pelvic ultrasound to check for tubal swelling or abscesses.",
        "treatment": "Prompt broad-spectrum antibiotic therapy is critical. Delaying treatment increases the risk of chronic pelvic pain, ectopic pregnancy, and tubal factor infertility.",
        "whenToSeeDoctor": "Seek immediate medical care for sudden severe lower abdominal pain, unusual vaginal discharge with fever, or pain during intercourse.",
        "warningSigns": [
            "Severe, acute lower pelvic pain with high fever",
            "Nausea and vomiting alongside pelvic tenderness",
            "Fainting or signs of systemic infection (septic shock)",
        ],
        "guides": [
            {"title": "STI Prevention & Pelvic Safety", "text": "Understanding ascending infections and timely clinical intervention protocols."}
        ],
    },
    "fibroids": {
        "id": "fibroids",
        "name": "Uterine Fibroids",
        "shortName": "Fibroids",
        "category": "reproductive",
        "tagText": "Reproductive Health",
        "description": "Non-cancerous growths in the uterus that can cause heavy bleeding and pelvic pressure.",
        "what": "Uterine fibroids (leiomyomas) are non-cancerous muscular tumors that grow in or on the wall of the uterus. They vary from pea-sized to large masses that enlarge the uterus. They are very common, affecting up to 70–80% of women by age 50.",
        "symptoms": [
            "Heavy or prolonged menstrual bleeding",
            "Pelvic pressure, fullness, or pain",
            "Frequent urination or difficulty emptying the bladder",
            "Constipation or rectal pressure",
            "Backache or leg pains",
            "Pain during sexual intercourse",
        ],
        "riskFactors": [
            "Family history of fibroids",
            "Age (most common between ages 30 and 50)",
            "Early onset of menstruation",
            "High body mass index (BMI)",
            "Diet high in red meat and low in green vegetables",
        ],
        "prevention": "While not entirely preventable, maintaining a healthy weight and diet rich in fruits, vegetables, and vitamin D may reduce the risk of fibroid development.",
        "screening": "Pelvic examination and pelvic ultrasound (transvaginal and transabdominal) are the primary diagnostic tools. MRI provides detailed mapping prior to surgical procedures.",
        "treatment": "Treatment depends on symptoms, size, and pregnancy plans: watchful waiting for asymptomatic fibroids, medications (tranexamic acid, hormonal IUD, GnRH agonists/antagonists), uterine artery embolization (UAE), or surgery (myomectomy or hysterectomy).",
        "whenToSeeDoctor": "Consult a gynecologist if your periods are heavily draining your energy, if you have persistent pelvic pressure, or if you struggle with bladder frequency.",
        "warningSigns": [
            "Sudden severe sharp pelvic pain (potential fibroid degeneration or torsion)",
            "Acute heavy bleeding causing severe dizziness",
            "Inability to pass urine due to cervical fibroid obstruction",
        ],
        "guides": [
            {"title": "Managing Fibroid Symptoms", "text": "Medical and lifestyle strategies to mitigate heavy bleeding and pelvic discomfort."}
        ],
    },
}


def get_public_conditions():
    """Return all conditions with only public fields."""
    public_list = []
    for cid, cond in CONDITIONS.items():
        public_list.append({
            "id": cond["id"],
            "name": cond["name"],
            "shortName": cond["shortName"],
            "category": cond["category"],
            "tagText": cond["tagText"],
            "description": cond["description"],
            "is_premium_locked": True,
        })
    return public_list


def get_condition_details(condition_id: str):
    """Return the complete clinical details for a condition."""
    return CONDITIONS.get(condition_id)
