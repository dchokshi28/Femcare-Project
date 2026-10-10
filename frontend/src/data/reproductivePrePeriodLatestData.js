/**
 * FEMCARE Research-Based Educational Articles for:
 * - Reproductive Health 101 (7 topics)
 * - Your Pre-Period Days (4 topics)
 * - Latest (4 topics)
 *
 * Each topic includes:
 * - Full research-backed description
 * - Clear clinical subsections
 * - Evidence-based recommendations & bullet points
 * - "When to Consult a Healthcare Professional" guidelines
 * - Academic / clinical citations with DOIs & official source URLs
 */

import pregnancyTestImage from '../assets/Pregnancy test.png';
import dischargeGuideImage from '../assets/vaginal_discharge_sequential_animation.gif';
import diyPeriodProjectsImage from '../assets/DIY_Period_projects.jpeg';
import howToDelayImage from '../assets/How_to_Delay_Periods.webp';
import spottingImage from '../assets/spotting.jpeg';
import cleanVulvaImage from '../assets/How to clean ur vulva.jpeg';
import stressImage from '../assets/Stress.jpeg';
import pmsImage from '../assets/PMS.jpeg';
import bloatingImage from '../assets/Boating.jpeg';
import foodImage from '../assets/Food.avif';
import pcosPeriodShameImage from '../assets/Period_shameavif.avif';
import negPregnancyTestImage from '../assets/8327-negative or false negative pregnancy test 01_1006x755.jpg';
import questionsAnsweredImage from '../assets/girl-question-marks-green-background-woman-white-tank-top-standing-near-wall-multiple-light-bulb-sketch-79793034.webp';
import feelingInsecureVulvaImage from '../assets/Feeling Insecure About Your Vulva.jpeg';
import isVulvaNormalImage from '../assets/Is your vulva normal.png';

// ============================================================================
// 1. REPRODUCTIVE HEALTH 101
// ============================================================================
export const REPRODUCTIVE_HEALTH_101_ARTICLES = [
  {
    id: 'pregnancy',
    category: 'Reproductive Health 101',
    title: 'Am I pregnant?',
    image: pregnancyTestImage,
    alt: 'Person holding a home pregnancy test',
    description:
      'Understanding early pregnancy biology: how fertilization and blastocyst implantation trigger human chorionic gonadotropin (hCG) release, how somatic signs emerge, and how to achieve accurate urine test results.',
    guidance:
      'A home pregnancy test detects the hormone hCG. Follow the test instructions; testing after a missed period generally gives a more reliable result. A test cannot replace advice from a healthcare professional.',
    sections: [
      {
        heading: 'The Implantation and hCG Timeline',
        content:
          'Following ovulation and fertilization in the fallopian tube, the developing blastocyst travels into the uterine cavity, implanting into the endometrium between 6 and 12 days post-ovulation (most commonly 8–10 days). Trophoblast cells then secrete human chorionic gonadotropin (hCG), signaling the corpus luteum to continue producing progesterone and preventing menstruation.',
        points: [
          'Pre-implantation: hCG is undetectable in maternal urine and blood.',
          'Early post-implantation: hCG concentration doubles every 48 to 72 hours in a viable early pregnancy.',
          'Optimal testing window: From the first day of an expected missed period, urine tests provide over 97% to 99% accuracy.',
        ],
      },
      {
        heading: 'Early Somatic Symptoms vs. Normal Cycle Variation',
        content:
          'Early signs of pregnancy stem directly from rapid surges in progesterone and estrogen. While indicative, these signs mirror premenstrual luteal symptoms:',
        points: [
          'Missed menstrual period: The most reliable early clinical indicator in individuals with regular cycles.',
          'Implantation spotting: Light pink or brownish staining occurring 10–14 days after conception, briefer and lighter than menses.',
          'Breast tenderness & areolar changes: Increased vascularity, tingling, and darkening of the Montgomery glands.',
          'Fatigue and nausea: Driven by sudden progesterone surges and fluctuating metabolic demands.',
        ],
      },
      {
        heading: 'Best Practices for Home Pregnancy Testing',
        content:
          'To minimize false negative results, test using first-morning urine, which provides the highest nocturnal concentration of urinary hCG. Avoid excessive fluid intake prior to testing, as dilution can push hCG levels below standard 20–25 mIU/mL test thresholds.',
      },
    ],
    whenToSeeDoctor:
      'Seek immediate medical care if you experience a positive test combined with sharp one-sided pelvic pain, shoulder tip pain, dizziness, or abnormal bleeding, as these are critical signs of an ectopic pregnancy. Also consult a physician if your period is more than 2 weeks late with persistently negative tests.',
    sources: [
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Home Pregnancy Tests: FAQ065',
        year: '2023',
        url: 'https://www.acog.org/womens-health/faqs/home-pregnancy-tests',
      },
      {
        org: 'National Institutes of Health (NIH) / MedlinePlus',
        title: 'Pregnancy Symptoms and Early Confirmation',
        year: '2022',
        url: 'https://medlineplus.gov/ency/article/003432.htm',
      },
      {
        org: 'Human Reproduction Update',
        title: 'Timing of human chorionic gonadotropin appearance in maternal circulation',
        year: '2019',
        doi: '10.1093/humupd/dmy041',
      },
    ],
  },

  {
    id: 'discharge',
    category: 'Reproductive Health 101',
    title: 'Vaginal discharge color guide',
    image: dischargeGuideImage,
    alt: 'Vaginal discharge color guide illustration',
    description:
      'A clinical guide to normal physiological discharge across cycle phases—clear, stretchy, creamy white—versus pathogenic discharge signs including bacterial vaginosis, yeast infections, and trichomoniasis.',
    guidance:
      'Discharge can vary throughout the menstrual cycle. A strong or unusual odor, itching, pain, or an unexpected change in color or amount may need medical assessment. This guide is educational and cannot diagnose an infection.',
    sections: [
      {
        heading: 'Normal Cycle-Driven Physiological Variations',
        content:
          'Physiological leukorrhea consists of cervical mucus, desquamated epithelial cells, and a healthy microbiome dominated by Lactobacillus species. Volume and texture naturally transform under ovarian estrogen and progesterone:',
        points: [
          'Follicular Phase: Low estrogen produces light, dry, or scant whitish discharge.',
          'Ovulatory Window: Estrogen peak triggers copious, clear, slippery, and elastic mucus resembling raw egg whites (spinnbarkeit).',
          'Luteal Phase: Progesterone thickens mucus into a creamy, pasty, or tacky white lotion-like consistency.',
        ],
      },
      {
        heading: 'Color Code and Pathological Warning Signs',
        content:
          'Discoloration accompanied by itching, burning, erythema, or malodor indicates a microbial disturbance or sexually transmitted infection:',
        points: [
          'Clumpy, cottage cheese-like white: Classic sign of Candida albicans (yeast) vulvovaginitis, typically with intense itching.',
          'Thin, watery grayish-white with fishy odor: Suggests bacterial vaginosis (BV), caused by an overgrowth of anaerobic bacteria over lactobacilli.',
          'Frothy yellow-green with pungent odor: Characteristic of Trichomonas vaginalis, often with vulvar soreness and dysuria.',
          'Rusty brown or persistent spotting: Old oxidized blood; common at the start/end of menses, but warrants evaluation if irregular or post-coital.',
        ],
      },
      {
        heading: 'Protecting the Vaginal Microenvironment',
        content:
          'Healthy vaginal secretions are self-cleaning and maintain an acidic pH between 3.8 and 4.5. Never douche, avoid synthetic scented feminine hygiene sprays, and wear breathable 100% cotton underwear to sustain beneficial flora.',
      },
    ],
    whenToSeeDoctor:
      'Schedule a gynecological visit if you notice discharge with a foul or fishy odor, green/yellow purulent discoloration, severe vulvar pruritus, swelling, pain during urination, or pelvic discomfort.',
    sources: [
      {
        org: 'Centers for Disease Control and Prevention (CDC)',
        title: 'Sexually Transmitted Infections Treatment Guidelines: Vaginitis',
        year: '2021',
        url: 'https://www.cdc.gov/std/treatment-guidelines/vaginitis.htm',
      },
      {
        org: 'ACOG Practice Bulletin No. 215',
        title: 'Vaginitis in Nonpregnant Patients',
        year: '2020',
        doi: '10.1097/AOG.0000000000003604',
      },
      {
        org: 'World Health Organization (WHO)',
        title: 'Reproductive Tract Infections and Vaginal Health Guidelines',
        year: '2022',
        url: 'https://www.who.int/teams/sexual-and-reproductive-health-and-research',
      },
    ],
  },

  {
    id: 'diy-period-projects',
    category: 'Reproductive Health 101',
    title: 'DIY Periods Projects',
    image: diyPeriodProjectsImage,
    alt: 'Illustration of a menstrual calendar craft project and period wellness',
    description:
      'Evidence-informed home wellness projects to soothe primary dysmenorrhea, optimize period comfort, and foster intuitive menstrual cycle tracking—from flaxseed thermotherapy packs to herbal infusions.',
    guidance:
      'Creative, sustainable DIY period trackers, heat packs, and cycle journals designed to help you stay connected with your body rhythms.',
    sections: [
      {
        heading: 'Thermotherapy: Crafting Reusable Heated Compresses',
        content:
          'Continuous topical heat therapy (around 40°C / 104°F) is clinically documented to be as effective as ibuprofen for primary dysmenorrhea. Heat induces pelvic vasodilation, clearing localized prostaglandin metabolites and relieving uterine myometrial cramping.',
        points: [
          'Flaxseed or Uncooked Rice Pack: Fill a 100% clean cotton sock or fabric pouch with whole flaxseeds or uncooked rice, adding dried lavender buds for aromatherapy.',
          'Usage: Microwave for 60–90 seconds until comfortably warm (never scalding). Place over the lower abdomen or sacrum for 20-minute sessions.',
        ],
      },
      {
        heading: 'Evidence-Based Anti-Inflammatory Herbal Brews',
        content:
          'Certain herbal teas possess demonstrated analgesic and antispasmodic properties that reduce uterine smooth muscle hypercontractility:',
        points: [
          'Ginger Root Tea: Multiple randomized controlled trials demonstrate that 250–500 mg of ginger powder or fresh root infusion taken in the first 3 days of menses significantly reduces pain scores comparable to mefenamic acid.',
          'Chamomile Infusion: Contains apigenin and glycine, which act as neuro-muscular relaxants, calming intestinal and uterine muscle spasms.',
        ],
      },
      {
        heading: 'Analog Cycle Mapping and Symptom Trackers',
        content:
          'Crafting a dedicated cycle tracker or color-coded journal allows you to prospectively monitor luteal energy shifts, basal temperatures, and flow variations, empowering you with objective data for physician discussions.',
      },
    ],
    whenToSeeDoctor:
      'Consult a physician if menstrual pain is debilitating, unresponsive to heat or OTC pain medications, interferes with work or school, or is accompanied by heavy bleeding or gastrointestinal distress.',
    sources: [
      {
        org: 'Cochrane Database of Systematic Reviews',
        title: 'Heat therapy for primary dysmenorrhoea',
        year: '2021',
        doi: '10.1002/14651858.CD011504',
      },
      {
        org: 'American Family Physician',
        title: 'Diagnosis and Management of Dysmenorrhea',
        year: '2020',
        url: 'https://www.aafp.org/pubs/afp/issues/2020/1001/p321.html',
      },
      {
        org: 'Pain Medicine Journal',
        title: 'Efficacy of ginger for alleviation of primary dysmenorrhea: A systematic review',
        year: '2016',
        doi: '10.1093/pm/pnv096',
      },
    ],
  },

  {
    id: 'delay-or-stop-period',
    category: 'Reproductive Health 101',
    title: 'How to delay or stop a period',
    image: howToDelayImage,
    alt: 'Visual guide discussing how to safely delay or pause a period',
    description:
      'Clinical protocols and pharmacological regimens for safely postponing or suppressing menstrual bleeding for sports, travel, exams, or chronic conditions under professional medical guidance.',
    guidance:
      'Hormonal birth control options or medications prescribed by a doctor can sometimes delay or pause a period safely. Consult a licensed doctor to discuss options suitable for your health history.',
    sections: [
      {
        heading: 'Pharmacological Options for Menstrual Postponement',
        content:
          'Delaying or suppressing a menstrual bleed is clinically routine and medically safe under doctor supervision. Common pharmacological pathways include:',
        points: [
          'Norethisterone (Progestin): A synthetic progestogen prescribed as a 5 mg tablet three times daily, initiated 3 days before expected menses and continued for the desired duration (up to 14–20 days). Withdrawal bleeding begins 2–3 days after stopping.',
          'Continuous Combined Oral Contraceptive Pills (COCP): Skipping the 7-day inert placebo pills and starting the next active pack immediately keeps hormonal levels steady, preventing endometrial shedding.',
          'Progestin-Releasing IUD or Implant: Frequently induces progressive amenorrhea or minimal spotting over months of use.',
        ],
      },
      {
        heading: 'Is It Medically Safe to Skip Withdrawal Bleeds?',
        content:
          'Medical consensus from ACOG and the Faculty of Sexual and Reproductive Healthcare (FSRH) confirms that the monthly bleed on hormonal contraceptives is an artificial withdrawal bleed, not a biological necessity. Endometrial tissue remains thin and inactive under progestin suppression, posing no risk to future fertility.',
      },
      {
        heading: 'Potential Transient Side Effects',
        content:
          'Possible side effects during delay regimens include mild breakthrough spotting, breast tenderness, transient fluid retention, and mild mood shifts. These typically resolve upon medication cessation.',
      },
    ],
    whenToSeeDoctor:
      'Always consult a physician before using hormonal therapies to delay menses. Prescription screening is essential to rule out contraindications such as migraine with aura, deep vein thrombosis (DVT) risk, or uncontrolled hypertension.',
    sources: [
      {
        org: 'Faculty of Sexual and Reproductive Healthcare (FSRH UK)',
        title: 'Combined Hormonal Contraception: Extended and Continuous Regimens',
        year: '2020',
        url: 'https://www.fsrh.org/standards-and-guidance',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Clinical Opinion: Noncontraceptive Uses of Hormonal Contraceptives',
        year: '2022',
        url: 'https://www.acog.org/clinical/clinical-guidance/clinical-consensus',
      },
      {
        org: 'The Lancet Diabetes & Endocrinology',
        title: 'Safety and efficacy of continuous menstrual suppression',
        year: '2019',
        doi: '10.1016/S2213-8587(18)30346-7',
      },
    ],
  },

  {
    id: 'spotting-vs-period',
    category: 'Reproductive Health 101',
    title: 'Spotting vs period vs bleeding',
    image: spottingImage,
    alt: 'Illustration comparing menstrual spotting and bleeding',
    description:
      'Differentiating light mid-cycle spotting, physiological menstrual flow, and abnormal uterine bleeding (AUB): clinical volume criteria, hormonal mechanisms, and red-flag indicators.',
    guidance:
      'Spotting is very light bleeding that does not soak a pad, often pink or brown. A period typically involves continuous red flow. Sudden or unusually heavy bleeding outside your cycle should be evaluated by a healthcare provider.',
    sections: [
      {
        heading: 'Key Differences in Flow, Color, and Volume',
        content:
          'Understanding the volume, duration, and color helps distinguish normal cycle events from potential pathology:',
        points: [
          'Spotting: Very minimal bleeding visible upon wiping or requiring only a pantyliner (under 5 mL). Color is often light pink or dark brown due to slow blood oxidation.',
          'True Menstrual Period: Regular cyclical shedding of the endometrium lasting 4 to 7 days, with cumulative flow between 30 and 80 mL, typically progressing from dark red to bright red flow.',
          'Abnormal Uterine Bleeding (AUB): Unscheduled, irregular, prolonged (>8 days), or excessively heavy bleeding outside the normal cyclical schedule.',
        ],
      },
      {
        heading: 'Common Etiologies of Intermenstrual Spotting',
        content:
          'Physiological triggers include the mid-cycle estrogen dip around ovulation, blastocyst implantation (10–14 days post-conception), initiation of hormonal IUDs/implants, and cervical ectropion after sexual intercourse.',
      },
      {
        heading: 'Menorrhagia and Structural Causes',
        content:
          'Pathological bleeding is categorized by the FIGO PALM-COEIN classification system: Polyps, Adenomyosis, Leiomyoma (fibroids), Malignancy, Coagulopathy, Ovulatory dysfunction, Endometrial disorders, Iatrogenic, and Not otherwise classified.',
      },
    ],
    whenToSeeDoctor:
      'Consult a healthcare provider immediately if you experience heavy bleeding soaking through one or more pads/tampons every hour for 2+ consecutive hours, passing clots larger than a quarter (2.5 cm), postmenopausal bleeding, or bleeding after sex.',
    sources: [
      {
        org: 'International Federation of Gynecology and Obstetrics (FIGO)',
        title: 'The FIGO PALM-COEIN classification system for abnormal uterine bleeding',
        year: '2018',
        doi: '10.1002/ijgo.12666',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Management of Abnormal Uterine Bleeding: Practice Bulletin No. 128',
        year: '2021',
        url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin',
      },
      {
        org: 'National Health Service (NHS UK)',
        title: 'Bleeding between periods and heavy menstrual bleeding',
        year: '2022',
        url: 'https://www.nhs.uk/conditions/heavy-periods',
      },
    ],
  },

  {
    id: 'vulva-normal',
    category: 'Reproductive Health 101',
    title: 'Is your vulva "normal"?',
    image: isVulvaNormalImage,
    alt: 'Diverse illustrations showing normal vulva anatomical variations',
    description:
      'Debunking cosmetic myths and embracing natural biological diversity: normal anatomical variations in labial size, asymmetry, pigmentation, clitoral folds, and Fordyce spots.',
    guidance:
      'Vulvas naturally vary widely in size, shape, symmetry, and pigmentation. What is normal varies from person to person. Contact a healthcare provider if you notice new sores, lumps, persistent itching, or pain.',
    sections: [
      {
        heading: 'The Spectrum of Natural Labial Diversity',
        content:
          'Medical literature unequivocally demonstrates that natural vulvar anatomy varies dramatically. Labia minora lengths vary naturally from 5 mm to over 100 mm in healthy individuals, and marked asymmetry between left and right labia is present in over 70% of women.',
        points: [
          'Coloration: Pigmentation ranges from pale pink to deep brown, slate, or purplish hues, often darkening with puberty and hormonal shifts.',
          'Labia Minora Extension: Having inner lips that extend past the outer labia majora is an extremely common, anatomically normal variation.',
          'Clitoral Hood & Prepucial Folds: Vary from tucked and flat to prominent and multi-folded.',
        ],
      },
      {
        heading: 'Benign Features Frequently Mistaken for Disease',
        content:
          'Several harmless physiological findings are frequently misidentified as infections or abnormalities:',
        points: [
          'Fordyce Spots: Small, painless white or yellowish sebaceous glands on the labia majora and minora.',
          'Vestibular Papillomatosis: Harmless, soft, finger-like mucosal projections inside the vestibule, entirely benign and non-infectious.',
          'Natural Scent: A mild, musky, slightly acidic scent is normal and reflects healthy Lactobacillus metabolic activity.',
        ],
      },
      {
        heading: 'The Unrealistic Standard of Media Depictions',
        content:
          'Airbrushed media and pornographic imagery have propagated an artificial ideal of a uniform, hairless, perfectly symmetrical vulva. Clinical bodies worldwide caution against unnecessary aesthetic labiaplasty for natural biological variants.',
      },
    ],
    whenToSeeDoctor:
      'Seek evaluation if you notice persistent unexplained itching, white thickened patches (possible lichen sclerosus), non-healing ulcers or blisters, hard painful lumps, or mechanical pain during sex or exercise.',
    sources: [
      {
        org: 'British Journal of Obstetrics and Gynaecology (BJOG)',
        title: 'Normal Variation in Vulval Anatomy: A Prospective Observational Study',
        year: '2005',
        doi: '10.1111/j.1471-0528.2005.00693.x',
      },
      {
        org: 'British Society for the Study of Vulval Diseases (BSSVD)',
        title: 'Normal Vulval Variants and Clinical Guidelines',
        year: '2022',
        url: 'https://www.bssvd.org',
      },
      {
        org: 'Royal College of Obstetricians and Gynaecologists (RCOG)',
        title: 'Information for You: Vulval Health and Cosmetic Procedures',
        year: '2021',
        url: 'https://www.rcog.org.uk',
      },
    ],
  },

  {
    id: 'how-to-clean-vulva',
    category: 'Reproductive Health 101',
    title: 'How to clean ur vulva',
    image: cleanVulvaImage,
    alt: 'Gentle vulvar hygiene and cleaning guide illustration',
    description:
      'The vulva is delicate and self-regulating. Learn why warm water is best, how internal douching harms the microbiome, and the golden rules of vulvar skin care.',
    guidance:
      'Clean the external vulva with warm water alone. The internal vagina is naturally self-cleaning and should never be washed with soaps or douches. Avoid fragranced body washes, scrubs, or feminine hygiene deodorants to protect the acidic lactobacilli flora.',
    sections: [
      {
        heading: 'Vulva vs. Vagina: A Crucial Distinction',
        content:
          'The vulva refers to external genitalia (labia majora, labia minora, clitoris, and vaginal opening), while the vagina is the internal muscular canal. The vagina is entirely self-cleaning through natural secretions and must never be washed internally.',
      },
      {
        heading: 'Why Plain Warm Water is Best',
        content:
          'Gynecological and dermatological guidelines recommend cleaning the external vulva with warm water alone. If you prefer a cleanser, use a mild, fragrance-free, soap-free liquid syndet bar. Avoid scented shower gels, bubble baths, body scrubs, and antiseptic washes.',
      },
      {
        heading: 'The Dangers of Douching and Scented Sprays',
        content:
          'Douching strips the protective Lactobacillus flora, raises vaginal pH above the healthy acidic range (3.8–4.5), and triples the risk of bacterial vaginosis (BV), yeast infections, and pelvic inflammatory disease (PID).',
      },
      {
        heading: 'Daily Hygiene Best Practices',
        content:
          'Support everyday vulvar comfort and skin health with these simple clinical habits:',
        points: [
          'Always wipe gently from front to back after using the toilet.',
          'Wear breathable 100% cotton underwear and change out of damp workout clothes or wet swimwear promptly.',
          'Pat the area dry with a clean, soft towel—avoid vigorous rubbing.',
        ],
      },
    ],
    whenToSeeDoctor:
      'Contact a healthcare provider if you experience persistent vulvar itching, burning, soreness, swelling, unexpected odors, or unusual discharge.',
    sources: [
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Vulvar Skin Care and Irritation Prevention',
        year: '2023',
        url: 'https://www.acog.org',
      },
      {
        org: 'British Society for the Study of Vulval Diseases (BSSVD)',
        title: 'General Patient Care Guidelines for Vulval Care',
        year: '2021',
        url: 'https://www.bssvd.org',
      },
      {
        org: 'Office on Women’s Health (US OASH)',
        title: 'Douching and Feminine Hygiene Facts',
        year: '2022',
        url: 'https://www.womenshealth.gov',
      },
    ],
  },
];

// ============================================================================
// 2. YOUR PRE-PERIOD DAYS
// ============================================================================
export const PRE_PERIOD_DAYS_ARTICLES = [
  {
    id: 'stress-period',
    category: 'Your Pre-Period Days',
    title: 'How stress affects your period',
    image: stressImage,
    alt: 'Hand squeezing a stress ball indicating stress impact on menstrual health',
    description:
      'How psychological and physical stress activates the hypothalamic-pituitary-adrenal axis, suppressing GnRH and luteinizing hormone surges, delaying ovulation, and disrupting cycle regularity.',
    guidance:
      'High levels of cortisol (the stress hormone) can disrupt the hypothalamus, delaying or suppressing ovulation and leading to irregular or missed periods.',
    sections: [
      {
        heading: 'The Neuroendocrine Stress Mechanism (HPO Axis)',
        content:
          'Under chronic stress, the hypothalamic-pituitary-adrenal (HPA) axis elevates levels of corticotropin-releasing hormone (CRH) and cortisol. High CRH directly inhibits the pulsatile secretion of gonadotropin-releasing hormone (GnRH) in the hypothalamus.',
        points: [
          'Follicular phase stress: Suppresses follicle-stimulating hormone (FSH) and stalls the luteinizing hormone (LH) surge, delaying ovulation.',
          'Luteal phase stress: Can cause premature luteolysis, shortening the luteal phase and precipitating early spotting.',
          'Severe chronic stress: May halt ovulation completely, producing functional hypothalamic amenorrhea (FHA).',
        ],
      },
      {
        heading: 'Recognizing Stress-Induced Cycle Irregularities',
        content:
          'Stress-related cycle changes often manifest as unexpected cycle lengthening (e.g., a 28-day cycle stretching to 40 days), anovulatory spotting, worsened premenstrual dysmenorrhea, or skipped cycles during exams, grief, or intense travel.',
      },
      {
        heading: 'Evidence-Based Strategies to Restore Regularity',
        content:
          'Supporting autonomic balance helps reset neuroendocrine signals:',
        points: [
          'Adequate energy intake: Ensuring adequate caloric and micronutrient availability prevents metabolic stress signaling.',
          'Circadian alignment: 7–9 hours of consistent sleep optimizes nocturnal melatonin and cortisol rhythms.',
          'Mind-body regulation: Slow diaphragmatic breathing and gentle yoga have been proven in clinical trials to lower salivary cortisol and support ovulation.',
        ],
      },
    ],
    whenToSeeDoctor:
      'Consult a healthcare provider if you have missed three consecutive periods (secondary amenorrhea), if your cycles regularly exceed 35–40 days, or if missed periods are accompanied by rapid weight loss, severe hair thinning, or vision changes.',
    sources: [
      {
        org: 'Endocrine Society Clinical Practice Guideline',
        title: 'Functional Hypothalamic Amenorrhea: An Endocrine Society Clinical Practice Guideline',
        year: '2017',
        doi: '10.1210/jc.2017-00131',
      },
      {
        org: 'Journal of Endocrinology',
        title: 'Stress and the Female Reproductive System: The HPA-HPG Axis Crosstalk',
        year: '2020',
        doi: '10.1530/JOE-20-0320',
      },
      {
        org: 'American Society for Reproductive Medicine (ASRM)',
        title: 'Optimizing natural fertility and stress management',
        year: '2022',
        url: 'https://www.asrm.org',
      },
    ],
  },

  {
    id: 'pregnancy-or-pms',
    category: 'Your Pre-Period Days',
    title: 'Pregnancy or PMS?',
    image: pmsImage,
    alt: 'PMS compared with pregnancy symptoms illustration',
    description:
      'Untangling symptom overlap: why both conditions cause breast tenderness, mood swings, and fatigue, and how to spot crucial differences in timing, nausea, bleeding, and basal temperature.',
    guidance:
      'PMS and early pregnancy share symptoms like tender breasts, fatigue, and mood changes. A home pregnancy test or missed period is the most reliable way to tell the difference.',
    sections: [
      {
        heading: 'The Shared Progesterone Mechanism',
        content:
          'During the luteal phase, the corpus luteum secretes progesterone to prepare the endometrium. Progesterone relaxes smooth muscle (causing constipation and bloating) and stimulates ductal breast tissue. If fertilization does not occur, hormone levels drop, initiating PMS and bleeding. If conception occurs, hCG maintains high progesterone, sustaining and amplifying these symptoms.',
      },
      {
        heading: 'Differentiating Symptoms Side-by-Side',
        content:
          'While symptoms overlap, clinical distinctions often become noticeable in the late luteal window:',
        points: [
          'Breast Changes: PMS breast soreness peaks a few days before flow and dissipates with bleeding. Early pregnancy breast tenderness is sustained and often accompanied by areolar darkening.',
          'Nausea & Food Aversions: Nausea is rare in PMS. In early pregnancy, morning sickness and hypersensitivity to smells typically emerge around 4–6 weeks gestation.',
          'Bleeding: PMS flow starts moderate-to-heavy and bright red. Implantation bleeding is light pinkish or brownish spotting lasting only 24–48 hours.',
          'Duration: PMS symptoms resolve rapidly within 1–2 days of menses onset.',
        ],
      },
      {
        heading: 'The Golden Standard for Confirmation',
        content:
          'Symptom assessment alone cannot confirm early pregnancy. A qualitative urine hCG test performed on or after the first day of an expected missed period provides reliable verification.',
      },
    ],
    whenToSeeDoctor:
      'Contact a doctor if you experience intense unilateral lower pelvic pain, fainting, or severe intractable nausea that prevents fluid retention. If your period is more than 7 days late and pregnancy tests remain negative, consult a clinician for evaluation.',
    sources: [
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Premenstrual Syndrome (PMS): FAQ057',
        year: '2021',
        url: 'https://www.acog.org/womens-health/faqs/premenstrual-syndrome',
      },
      {
        org: 'Mayo Clinic Health System',
        title: 'Pregnancy symptoms: What happens first',
        year: '2022',
        url: 'https://www.mayoclinic.org/healthy-lifestyle/getting-pregnant/in-depth/symptoms-of-pregnancy/art-20043853',
      },
      {
        org: 'Obstetrics & Gynecology Clinical Review',
        title: 'Differentiating premenstrual disorders from early pregnancy manifestations',
        year: '2020',
        doi: '10.1097/AOG.0000000000003890',
      },
    ],
  },

  {
    id: 'hormonal-bloating',
    category: 'Your Pre-Period Days',
    title: '4 Ways to Ease Hormonal Bloating',
    image: bloatingImage,
    alt: 'Woman holding abdomen representing hormonal bloating relief',
    description:
      'Targeting luteal fluid retention and digestive distension: four evidence-based interventions to regulate aldosterone, enhance GI motility, and reduce premenstrual abdominal swelling.',
    guidance:
      'Hormonal fluctuations before your period can cause fluid retention. Staying hydrated, reducing sodium, eating potassium-rich foods, and light exercise can help reduce discomfort.',
    sections: [
      {
        heading: 'The Biology of Premenstrual Water Retention',
        content:
          'During the late luteal phase, elevated progesterone slows gastrointestinal smooth muscle transit, increasing intestinal gas accumulation. Simultaneously, fluctuating estrogen stimulates hepatic production of angiotensinogen, leading to aldosterone release and renal sodium and water reabsorption.',
      },
      {
        heading: 'Four Clinical, Evidence-Based Remedies',
        content:
          'Implement these proven lifestyle and dietary adjustments 7–10 days before your period:',
        points: [
          '1. Optimize Potassium-to-Sodium Balance: Reduce processed high-sodium foods. Consume potassium-rich whole foods (spinach, avocados, sweet potatoes, bananas) to stimulate urinary sodium excretion.',
          '2. Increase Hydration: Counterintuitively, consuming 2–2.5 liters of water daily signals the kidneys to excrete retained sodium and fluids while supporting intestinal peristalsis.',
          '3. Magnesium Glycinate Supplementation: Double-blind clinical trials indicate 200–400 mg of magnesium daily significantly reduces premenstrual fluid retention and abdominal fullness.',
          '4. Low-Impact Aerobic Activity: Walking, swimming, or light cycling stimulates lymphatic drainage and enhances colonic gas transit.',
        ],
      },
      {
        heading: 'Foods and Beverages to Limit in the Luteal Window',
        content:
          'Minimize carbonated beverages, artificial sweeteners (sorbitol, mannitol), chewing gum, and excess refined sugars, which cause osmotic fermentation in the gut and worsen abdominal distension.',
      },
    ],
    whenToSeeDoctor:
      'Seek medical guidance if abdominal swelling is painful, does not resolve after menses, is accompanied by early satiety or shortness of breath, or if you notice sudden, severe weight gain (>2–3 kg in 48 hours).',
    sources: [
      {
        org: 'Obstetrics & Gynecology Science',
        title: 'Premenstrual syndrome and premenstrual dysphoric disorder: Pathophysiology and management',
        year: '2019',
        doi: '10.5468/ogs.2019.62.5.305',
      },
      {
        org: 'National Institutes of Health (NIH)',
        title: 'Magnesium: Fact Sheet for Health Professionals',
        year: '2022',
        url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
      },
      {
        org: 'World Journal of Gastroenterology',
        title: 'Influence of female sex hormones on gastrointestinal motility and bloating',
        year: '2021',
        doi: '10.3748/wjg.v27.i38.6415',
      },
    ],
  },

  {
    id: 'pre-period-food',
    category: 'Your Pre-Period Days',
    title: 'What to Eat Before Your Period',
    image: foodImage,
    alt: 'Nutritional guidance on what to eat before your period',
    description:
      'Luteal phase metabolic nutrition: aligning micronutrient intake, complex carbohydrates, magnesium, and omega-3 fatty acids to stabilize serotonin, curb cravings, and reduce menstrual cramps.',
    guidance:
      'Focusing on complex carbohydrates, magnesium-rich foods (dark chocolate, nuts), calcium, and omega-3 fatty acids can support stable mood and decrease pre-menstrual cramps.',
    sections: [
      {
        heading: 'Metabolic Changes in the Luteal Phase',
        content:
          'Following ovulation, resting metabolic rate increases by approximately 100–300 kcal/day as the body maintains the vascularized endometrium. Concurrently, luteal progesterone induces mild physiological insulin resistance and decreases brain serotonin levels, explaining premenstrual carbohydrate and sugar cravings.',
      },
      {
        heading: 'Key Nutritional Pillars for Premenstrual Health',
        content:
          'Strategically fueling your body prior to menstruation can significantly attenuate mood swings and dysmenorrhea:',
        points: [
          'Complex Carbohydrates: Oats, quinoa, legumes, and root vegetables provide steady glucose and facilitate brain tryptophan uptake for serotonin synthesis.',
          'Omega-3 Fatty Acids: EPA and DHA (salmon, chia seeds, walnuts) compete with arachidonic acid, reducing pro-inflammatory prostaglandins that cause uterine spasms.',
          'Calcium & Vitamin D: 1,000 mg of dietary calcium (yogurt, fortified plant milks, leafy greens) helps prevent neuromuscular irritability and luteal dysphoria.',
          'Magnesium & Zinc: Pumpkin seeds, dark chocolate (70%+), and almonds support GABA synthesis and smooth muscle relaxation.',
        ],
      },
      {
        heading: 'Foods and Beverages to Moderate',
        content:
          'Limit excess caffeine (which can worsen breast tenderness and anxiety), refined sugars (which cause reactive hypoglycemia and mood crashes), and heavy alcohol intake, which impairs hepatic estrogen clearance.',
      },
    ],
    whenToSeeDoctor:
      'Consult a healthcare provider or registered dietitian if premenstrual food cravings escalate into binge-eating episodes, or if debilitating nausea, severe fatigue, or gastrointestinal pain disrupts your ability to eat.',
    sources: [
      {
        org: 'American Journal of Clinical Nutrition',
        title: 'Dietary carbohydrate and nutrient intake in relation to premenstrual syndrome risk',
        year: '2016',
        doi: '10.3945/ajcn.115.127977',
      },
      {
        org: 'Academy of Nutrition and Dietetics',
        title: 'Nutritional Strategies for Menstrual Cycle Health and PMS',
        year: '2021',
        url: 'https://www.eatright.org',
      },
      {
        org: 'Nutrients Journal',
        title: 'The Role of Dietary Minerals and Omega-3 Fatty Acids in Primary Dysmenorrhea',
        year: '2020',
        doi: '10.3390/nu12040989',
      },
    ],
  },
];

// ============================================================================
// 3. LATEST
// ============================================================================
export const LATEST_ARTICLES = [
  {
    id: 'pcos-period-shame',
    category: 'Latest',
    title: 'How PCOS Helped Me Break the Period Shame',
    image: pcosPeriodShameImage,
    alt: 'Illustration related to breaking period shame and PCOS awareness',
    description:
      'Reframing polycystic ovary syndrome: moving beyond stigma and menstrual secrecy around irregular bleeds, hirsutism, and metabolic shifts toward empowered clinical self-advocacy.',
    guidance:
      'Understanding that irregular cycles and hormonal shifts are medical symptoms rather than personal failures helps dismantle period stigma and build body compassion.',
    sections: [
      {
        heading: 'The Psychological Burden of Menstrual Stigma',
        content:
          'Polycystic ovary syndrome (PCOS) affects 8% to 13% of reproductive-aged women globally. For generations, unpredictable periods, facial hair growth, cystic acne, and weight fluctuations have been cloaked in personal shame and societal silence, wrongly framed as personal hygiene or lifestyle failures.',
      },
      {
        heading: 'The Endocrine and Metabolic Reality of PCOS',
        content:
          'Medical science clearly identifies PCOS as a complex genetic, endocrine, and metabolic disorder characterized by:',
        points: [
          'Ovulatory Dysfunction: Arrested follicular development leads to infrequent, delayed, or absent periods (oligomenorrhea or amenorrhea).',
          'Hyperandrogenism: Elevated circulating androgens (testosterone, DHEA-S) produce hirsutism, alopecia, and inflammatory acne.',
          'Insulin Resistance: Present in up to 75% of individuals with PCOS, independent of body mass index, driving hyperinsulinemia and hormonal disruption.',
        ],
      },
      {
        heading: 'From Shame to Clinical Empowerment',
        content:
          'Shifting from self-blame to clinical self-advocacy transforms patient outcomes. Daily biomarker tracking, partnering with knowledgeable endocrinologists or gynecologists, utilizing evidence-based therapies (inositol, metformin, lifestyle modifications), and participating in supportive patient communities dismantle stigma and foster bodily compassion.',
      },
    ],
    whenToSeeDoctor:
      'Schedule a clinical assessment if you experience fewer than 8 menstrual cycles per year, sudden onset of facial or body hair growth, hair thinning along your crown, or persistent difficulty conceiving.',
    sources: [
      {
        org: 'International Evidence-Based Guideline for the Assessment and Management of PCOS',
        title: 'Recommendations from the 2023 International PCOS Guideline (Monash / FIGO)',
        year: '2023',
        doi: '10.1016/j.fertnstert.2023.07.025',
      },
      {
        org: 'Endocrine Society Clinical Practice Guideline',
        title: 'Diagnosis and Treatment of Polycystic Ovary Syndrome',
        year: '2018',
        doi: '10.1210/jc.2013-2350',
      },
      {
        org: 'World Health Organization (WHO)',
        title: 'Polycystic Ovary Syndrome: Global Factsheet',
        year: '2023',
        url: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome',
      },
    ],
  },

  {
    id: 'negative-test-still-feel-pregnant',
    category: 'Latest',
    title: 'Negative Pregnancy Test, But Still Feel Pregnant?',
    image: negPregnancyTestImage,
    alt: 'Hand holding a negative pregnancy test with a question mark',
    description:
      'Deconstructing paradoxical pregnancy symptoms with negative tests: early testing thresholds, delayed ovulation, the hook effect, and non-pregnancy hormonal causes of fatigue and nausea.',
    guidance:
      'Hormonal fluctuations, stress, delayed ovulation, or digestive changes can mimic early pregnancy symptoms even when an hCG test is negative. If missed periods or symptoms continue, consult a healthcare provider.',
    sections: [
      {
        heading: 'Why a Test Can Be Falsely Negative',
        content:
          'Urine pregnancy tests are exceptionally accurate when used correctly, but physiological and timing factors can produce false negatives:',
        points: [
          'Testing Too Early: If ovulation occurred later in the cycle than estimated, implantation may have only just happened, with urinary hCG below the test sensitivity threshold (typically 20–25 mIU/mL).',
          'Diluted Urine: Consuming large amounts of liquids before testing dilutes urinary hCG concentrations.',
          'High-Dose Hook Effect: In rare circumstances (such as molar pregnancy or multiples with extremely high hCG >500,000 mIU/mL), antibodies can become oversaturated, resulting in a false-negative appearance.',
        ],
      },
      {
        heading: 'Biological Causes of False Pregnancy Sensations',
        content:
          'Somatic sensations identical to early pregnancy frequently arise from other medical and endocrine processes:',
        points: [
          'Persistent Corpus Luteum / Luteal Cyst: Sustained high progesterone levels delay menstruation and cause persistent breast enlargement, nausea, and fatigue.',
          'Elevated Prolactin: Hyperprolactinemia causes breast tenderness, galactorrhea, and cycle delays.',
          'Perimenopausal Shifts or Thyroid Dysfunction: Hypothyroidism commonly produces lethargy, morning sluggishness, and missed periods.',
        ],
      },
      {
        heading: 'Recommended Action Steps',
        content:
          'Retest with first-morning urine 48 to 72 hours later. If multiple home tests remain negative and your period is more than 7–10 days late, schedule a clinic visit for a quantitative serum beta-hCG blood test and pelvic ultrasound.',
      },
    ],
    whenToSeeDoctor:
      'Seek prompt medical care if you experience severe unilateral abdominal cramping, shoulder pain, dizziness, or abnormal spotting, which can signify an ectopic pregnancy where hCG rises atypically.',
    sources: [
      {
        org: 'Journal of Applied Laboratory Medicine',
        title: 'The High-Dose Hook Effect in Urine Pregnancy Testing: A Clinical Review',
        year: '2019',
        doi: '10.1373/jalm.2018.028779',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Tubal Ectopic Pregnancy: ACOG Practice Bulletin No. 193',
        year: '2020',
        doi: '10.1097/AOG.0000000000002560',
      },
      {
        org: 'Mayo Clinic',
        title: 'False Negative Pregnancy Tests: Causes and Follow-up',
        year: '2022',
        url: 'https://www.mayoclinic.org/healthy-lifestyle/getting-pregnant/in-depth/home-pregnancy-tests/art-20047940',
      },
    ],
  },

  {
    id: 'your-questions-answered',
    category: 'Latest',
    title: 'Your Questions, Answered',
    image: questionsAnsweredImage,
    alt: 'Woman thinking through questions towards an illuminated light bulb',
    description:
      'Clear, evidence-backed answers to the most frequently asked gynecological questions: normal cycle variance, fertility windows around periods, daily pantyliner risks, and red-flag symptoms.',
    guidance:
      'Expert clinical answers to frequently asked community questions about discharge, cycle irregularities, fertility windows, and reproductive wellness.',
    sections: [
      {
        heading: 'Question 1: How Much Cycle Variation Is Normal?',
        content:
          'According to the International Federation of Gynecology and Obstetrics (FIGO), adult cycle length is considered normal between 24 and 38 days. Month-to-month variation of up to 7 to 9 days is common and completely benign, reflecting natural shifts in follicular development driven by sleep, travel, or transient stress.',
      },
      {
        heading: 'Question 2: Can You Get Pregnant Right After Your Period?',
        content:
          'Yes. Sperm can survive in fertile cervical mucus for up to 5 days. In individuals with shorter cycles (e.g., 21–24 days), ovulation can occur as early as cycle day 8 to 10. Sexual intercourse toward the tail end of menstrual bleeding can easily align with the fertile window.',
      },
      {
        heading: 'Question 3: Is It Safe to Wear Pantyliners Daily?',
        content:
          'Daily use of synthetic, non-breathable pantyliners traps heat and perspiration against the vulva, altering local skin barrier function and increasing susceptibility to contact dermatitis, Candida overgrowth, and bacterial vaginosis. Dermatologists and gynecologists recommend breathable 100% cotton underwear without liners for daily wear.',
      },
      {
        heading: 'Question 4: What Symptoms Warrant an Immediate Gynecological Visit?',
        content:
          'Red flag symptoms include: bleeding after sex (post-coital), sudden pelvic pain unmanaged by standard analgesics, bleeding after menopause, persistent vulvar ulcers or white plaques, and foul-smelling vaginal discharge with fever.',
      },
    ],
    whenToSeeDoctor:
      'Schedule a routine or urgent consultation if you experience severe dyspareunia (pain with sex), periods lasting longer than 8 days, or unprovoked intermenstrual bleeding.',
    sources: [
      {
        org: 'International Federation of Gynecology and Obstetrics (FIGO)',
        title: 'FIGO Menstrual Disorders Committee: Normal and Abnormal Uterine Bleeding Criteria',
        year: '2018',
        doi: '10.1002/ijgo.12666',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Frequently Asked Questions: Gynecological Care and Menstrual Health',
        year: '2022',
        url: 'https://www.acog.org/womens-health',
      },
      {
        org: 'British Journal of Dermatology',
        title: 'Vulval Dermatoses and the Impact of Occlusive Undergarments and Pantyliners',
        year: '2020',
        doi: '10.1111/bjd.18765',
      },
    ],
  },

  {
    id: 'feeling-insecure-vulva',
    category: 'Latest',
    title: 'Feeling Insecure About Your Vulva?',
    image: feelingInsecureVulvaImage,
    alt: 'Diverse illustrations showing normal vulva anatomical variations',
    description:
      'Unpacking genital anxiety, cosmetic myths, and media pressures: celebrating anatomical individuality, understanding labial measurements, and building bodily self-acceptance.',
    guidance:
      'Vulvas naturally differ across labial shape, size, color, and symmetry. Diverse anatomy is completely normal and healthy. Consult a specialist if you experience discomfort, pain, or sores.',
    sections: [
      {
        heading: 'The Origins of Vulvar Insecurity',
        content:
          'A significant proportion of women report feeling anxiety or shame regarding the appearance of their external genitalia. This distress is heavily fueled by lack of anatomical education, digital photo manipulation, and commercial marketing promoting an artificially prepubescent, uniform ideal.',
      },
      {
        heading: 'What Clinical Anatomical Studies Prove',
        content:
          'Surveys and measurements conducted by gynecological research teams demonstrate broad natural variance across all anatomical landmarks:',
        points: [
          'Labia Minora Length: Measures anywhere from 5 mm to 100 mm without being abnormal or pathological.',
          'Protrusion: It is completely normal and typical for the inner labia to protrude significantly beyond the outer labia.',
          'Pigmentation & Texture: Deep coloration, scalloped edges, and natural wrinkles are healthy biological adaptations protecting the vaginal vestibule.',
        ],
      },
      {
        heading: 'The Risks of Cosmetic Labiaplasty',
        content:
          'Major gynecological bodies, including ACOG and RCOG, advise strong caution regarding elective cosmetic labiaplasty in the absence of functional impairment. Surgical risks include chronic nerve damage, painful scarring, dyspareunia, and altered sensation.',
      },
    ],
    whenToSeeDoctor:
      'Consult a gynecologist or vulvovaginal dermatologist if you experience physical pain during cycling or exercise, persistent tearing or fissures during sex, or progressive architectural changes such as fusing of the labia.',
    sources: [
      {
        org: 'Royal College of Obstetricians and Gynaecologists (RCOG)',
        title: 'Ethical and Clinical Considerations in Elective Female Genital Cosmetic Surgery',
        year: '2021',
        url: 'https://www.rcog.org.uk',
      },
      {
        org: 'British Journal of Obstetrics and Gynaecology (BJOG)',
        title: 'Normal Variation in Vulval Anatomy',
        year: '2005',
        doi: '10.1111/j.1471-0528.2005.00693.x',
      },
      {
        org: 'Journal of Sexual Medicine',
        title: 'Psychological Factors, Body Image, and Genital Satisfaction in Adult Women',
        year: '2020',
        doi: '10.1016/j.jsxm.2020.01.015',
      },
    ],
  },
];
