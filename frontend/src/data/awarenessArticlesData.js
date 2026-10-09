/**
 * FEMCARE Research-Based Educational Articles
 * 18 Topics across 4 sections:
 * - User's Favorites (1-4)
 * - The Lowdown on Late Periods (5-7)
 * - Live in Sync With Your Cycle (8-12)
 * - FemCare's Recommendations (13-18)
 *
 * Sources include: ACOG, NIH, WHO, CDC, Endocrine Society, FIGO,
 * British Society for the Study of Vulval Diseases (BSSVD), and peer-reviewed journals.
 */

import pregnancyTimingImage from '../assets/Pregnancy Tests Timing Matters.png';
import alwaysTiredImage from '../assets/Why Am I Always Tired.png';
import periodsLateImage from '../assets/Beyond Pregnancy Why Periods Run Late.png';
import dischargeDecodedImage from '../assets/Your Discharge, Decoded.png';
import bringOnPeriodImage from '../assets/Can You Really Bring on a Late Period.png';
import periodNotShowingImage from "../assets/When Your Period Doesn't Show Up.png";
import howLateImage from '../assets/How Late Is Too Late.png';
import moveWithCycleImage from '../assets/Move with your cycle.png';
import alcoholCycleImage from '../assets/Alcohol & Your Cycle.png';
import sleepBodyNeedsImage from '../assets/The Sleep Your Body Needs.png';
import eatWellImage from '../assets/Eat Well, Feel Well.png';
import whySleepChangesImage from '../assets/Why Sleep Changes With Your Cycle.jpeg';
import cycleOffTrackImage from '../assets/What Causes Irregular Cycles.png';
import dischargeTellingYouImage from '../assets/Discharge changes through the cycle.png';
import bladderLeaksImage from '../assets/Pee Leaks Ruining Your Day.png';
import goodSideDischargeImage from '../assets/Reasons to Love Your Discharge.png';
import vulvaYourChoiceImage from "../assets/Why I'll Never Shave Again.png";
import pmsMoreThanMoodImage from '../assets/The Secret Power of PMS.png';

export const USERS_FAVORITES_ARTICLES = [
  {
    id: 'fav-pregnancy-timing',
    category: "User's Favorites",
    title: 'Pregnancy Tests: Timing Matters',
    image: pregnancyTimingImage,
    alt: 'Home pregnancy test beside calendar and clock indicating timing',
    description:
      'Home pregnancy tests rely on detecting hCG in urine. Learn how the biology of implantation dictates when a test can turn positive, why testing too early causes false negatives, and what to do if results are unclear.',
    sections: [
      {
        heading: 'How Home Pregnancy Tests Work',
        content:
          'Home pregnancy tests detect human chorionic gonadotropin (hCG), a hormone produced by the trophoblastic tissue following blastocyst implantation. Implantation typically occurs 6 to 12 days after ovulation (most commonly 8–10 days). Before implantation, hCG is not present in maternal blood or urine, meaning a test taken too soon cannot detect pregnancy regardless of its brand sensitivity.',
      },
      {
        heading: 'Why Testing Too Early Leads to False Negatives',
        content:
          'Following implantation, urinary hCG concentrations double approximately every 48 to 72 hours in healthy early intrauterine pregnancies. Most home tests have a detection threshold between 20 and 25 mIU/mL. Testing several days before your expected period often yields a false negative because hCG has not accumulated to detectable levels.',
        points: [
          'First day of missed period: Clinical accuracy is approximately 90%.',
          'One week after missed period: Sensitivity reaches 97% to 99%.',
          'First-morning urine: Offers the highest concentration of hCG after overnight bladder retention.',
        ],
      },
      {
        heading: 'What to Do After a Negative Result',
        content:
          'If your test is negative but your period still has not started, wait 3 to 5 days and re-test with first-morning urine. For irregular menstrual cycles, medical guidelines advise testing at least 21 days after unprotected sexual intercourse. If multiple tests remain negative and your period is more than a week late, consult a healthcare professional for a serum quantitative hCG test.',
      },
    ],
    whenToSeeDoctor:
      'Seek prompt medical care if you experience a positive test accompanied by sharp one-sided pelvic pain, shoulder pain, dizziness, or abnormal spotting, which are potential warning signs of an ectopic pregnancy.',
    sources: [
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Home Pregnancy Tests: FAQ065',
        year: '2023',
        url: 'https://www.acog.org/womens-health/faqs/home-pregnancy-tests',
      },
      {
        org: 'New England Journal of Medicine (NEJM)',
        title: 'Time of Implantation of the Conceptus and Loss of Pregnancy',
        year: '1999',
        doi: '10.1056/NEJM199906103402304',
      },
      {
        org: 'National Health Service (NHS UK)',
        title: 'Doing a pregnancy test: Clinical Guidance',
        year: '2024',
        url: 'https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/',
      },
    ],
  },
  {
    id: 'fav-always-tired',
    category: "User's Favorites",
    title: 'Why Am I Always Tired?',
    image: alwaysTiredImage,
    alt: 'Fatigued young woman in bed with low battery symbol',
    description:
      'Persistent exhaustion in women frequently stems from biochemical and hormonal imbalances rather than simple lack of rest. Understand the roles of hidden iron depletion, thyroid axis disruption, and cycle-related neurosteroids.',
    sections: [
      {
        heading: 'Latent Iron Deficiency Without Anemia',
        content:
          'Standard Complete Blood Counts (CBC) measure circulating hemoglobin, but women can experience profound exhaustion when serum ferritin—the protein that stores iron—drops below 30–50 ng/mL, even while hemoglobin remains normal. Iron is essential for mitochondrial ATP energy synthesis and neurotransmitter regulation. Women with heavy menstrual bleeding are particularly vulnerable to chronic ferritin depletion.',
      },
      {
        heading: 'Thyroid Hypofunction (Hypothyroidism)',
        content:
          'Women are five to eight times more likely to experience thyroid disorders than men. The thyroid gland requires iron-dependent thyroid peroxidase (TPO) to synthesize thyroxine (T4) and triiodothyronine (T3). Sluggish thyroid activity reduces basal metabolic rate, causing persistent brain fog, lethargy, cold sensitivity, and muscle weakness.',
      },
      {
        heading: 'Luteal Phase Hormonal Shifts & Sleep Disruption',
        content:
          'During the second half of the menstrual cycle, rising progesterone is metabolized into allopregnanolone, which interacts with central GABA-A receptors to induce daytime drowsiness. Simultaneously, progesterone elevates basal core temperature by ~0.5°C, impairing nighttime deep and REM sleep efficiency.',
      },
      {
        heading: 'Comprehensive Blood Panel to Request',
        content:
          'If fatigue persists beyond several weeks, ask your doctor for targeted laboratory testing rather than assuming it is purely lifestyle-related.',
        points: [
          'Serum Ferritin, Iron, and Total Iron-Binding Capacity (TIBC)',
          'Complete Thyroid Panel (TSH, Free T4, Free T3, and TPO antibodies)',
          'Vitamin D (25-hydroxyvitamin D) and Vitamin B12',
          'Comprehensive Metabolic Panel (fasting glucose, electrolytes, liver enzymes)',
        ],
      },
    ],
    whenToSeeDoctor:
      'Contact a healthcare provider if fatigue is accompanied by unexplained weight changes, shortness of breath upon exertion, heart palpitations, swollen lymph nodes, or heavy menstrual cycles soaking through pads every hour.',
    sources: [
      {
        org: 'Office on Women’s Health (US OASH)',
        title: 'Iron-Deficiency Anemia and Fatigue in Women',
        year: '2022',
        url: 'https://www.womenshealth.gov',
      },
      {
        org: 'Clinical Case Reports',
        title: 'Iron Deficiency Without Anemia — A Clinical Challenge',
        year: '2018',
        doi: '10.1002/ccr3.1529',
      },
      {
        org: 'American Thyroid Association (ATA)',
        title: 'Hypothyroidism in Women: Clinical Guidelines and Management',
        year: '2023',
        url: 'https://www.thyroid.org',
      },
    ],
  },
  {
    id: 'fav-why-periods-late',
    category: "User's Favorites",
    title: 'Beyond Pregnancy: Why Periods Run Late',
    image: periodsLateImage,
    alt: 'Woman thinking about reasons for late periods including stress and workouts',
    description:
      'When pregnancy is ruled out, a delayed period is almost always caused by delayed or suppressed ovulation. Learn how acute stress, energy deficits, travel, and endocrine shifts pause the reproductive axis.',
    sections: [
      {
        heading: 'The Follicular Variable: Why Cycles Shift',
        content:
          'In human reproductive biology, the luteal phase (the interval from ovulation to menstruation) is relatively stable at 12 to 14 days. In contrast, the follicular phase (the days preceding ovulation) is sensitive to environmental and physiological stressors. If follicle maturation is delayed, ovulation happens later than expected, pushing back your entire period.',
      },
      {
        heading: 'The Stress Hormone Pathway (CRH and Cortisol)',
        content:
          'Under acute psychological or physical stress, the brain secretes corticotropin-releasing hormone (CRH) and cortisol. High cortisol suppresses the pulsatile release of gonadotropin-releasing hormone (GnRH) from the hypothalamus. Without coordinated GnRH pulses, the pituitary fails to release the LH surge required for follicle rupture.',
      },
      {
        heading: 'Relative Energy Deficiency & Exercise (RED-S)',
        content:
          'When energy expenditure exceeds nutritional intake—whether from intensive training, rapid weight loss, or restrictive dieting—the body enters metabolic preservation mode. Non-essential physiological functions, such as ovulation, are temporarily down-regulated to conserve glucose and energy for vital organs.',
      },
      {
        heading: 'Endocrine and Medical Factors',
        content:
          'Conditions such as Polycystic Ovary Syndrome (PCOS), subclinical thyroid disease (hypo- or hyperthyroidism), elevated prolactin levels, and recent cessation of oral contraceptive pills can lead to delayed or sporadic ovulatory cycles.',
      },
    ],
    whenToSeeDoctor:
      'Consult a gynecologist or healthcare professional if your cycle is more than 90 days late, if you miss three consecutive periods, or if amenorrhea is accompanied by unusual headaches, milk production from the breasts, or noticeable facial hair growth.',
    sources: [
      {
        org: 'The Endocrine Society',
        title: 'Functional Hypothalamic Amenorrhea: Clinical Practice Guideline',
        year: '2017',
        doi: '10.1210/jc.2017-00131',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Committee Opinion No. 749: Amenorrhea Clinical Evaluation',
        year: '2018',
        url: 'https://www.acog.org',
      },
      {
        org: 'British Journal of Sports Medicine (BJSM)',
        title: 'The IOC Consensus Statement on Relative Energy Deficiency in Sport (RED-S)',
        year: '2014',
        doi: '10.1136/bjsports-2014-093502',
      },
    ],
  },
  {
    id: 'fav-discharge-decoded',
    category: "User's Favorites",
    title: 'Your Discharge, Decoded',
    image: dischargeDecodedImage,
    alt: 'Guide illustrating various normal cervical fluid textures and colors',
    description:
      'Healthy vaginal secretions and cervical mucus adapt continually throughout the month in response to estrogen and progesterone. Learn to read your cycle-related fluid patterns with confidence.',
    sections: [
      {
        heading: 'What Is Vaginal Discharge Composed Of?',
        content:
          'Normal vaginal discharge is a physiological blend of cervical mucus, transudate from vaginal capillary beds, desquamated epithelial cells, and beneficial bacteria (primarily Lactobacillus). It protects reproductive tissues by maintaining an acidic pH (3.8–4.5) that deters pathogens and creates an optimal transport medium for sperm during the fertile window.',
      },
      {
        heading: 'Cycle-by-Cycle Texture Changes',
        content:
          'As hormones fluctuate throughout your cycle, the appearance and texture of healthy discharge follow a recognizable sequence:',
        points: [
          'Post-Period (Days 4–7): Scant, dry, or tacky discharge due to low circulating estrogen.',
          'Mid-Follicular (Days 8–11): Increasing estrogen produces creamy, lotion-like, cloudy white secretions.',
          'Ovulation Window (Days 12–16): Peak estradiol triggers high-volume, transparent, slippery, and stretchy mucus resembling raw egg whites (spinnbarkeit).',
          'Luteal Phase (Days 17–28): Rising progesterone thickens cervical fluid into a dense, sticky, or pasty barrier.',
        ],
      },
      {
        heading: 'What Is Normal vs. Concerning?',
        content:
          'Normal discharge is odorless or has a mild, clean, slightly acidic scent. It may dry pale yellow on underwear due to contact with air. Concerning signs include a fishy odor, frothy green or gray fluid, thick cottage cheese-like clumps, or discharge paired with vulvar itching, burning, or redness.',
      },
    ],
    whenToSeeDoctor:
      'Schedule an examination if you experience sudden changes in discharge color or smell, persistent vulvar itching or swelling, pelvic discomfort, or burning sensations during urination or intimacy.',
    sources: [
      {
        org: 'Human Reproduction Update',
        title: 'Endocrine and Cervical Mucus Changes During the Menstrual Cycle',
        year: '2017',
        doi: '10.1093/humupd/dmx008',
      },
      {
        org: 'Cleveland Clinic',
        title: 'Vaginal Discharge: Causes, Colors, What Is Normal & When to Worry',
        year: '2024',
        url: 'https://my.clevelandclinic.org',
      },
      {
        org: 'CDC (Centers for Disease Control and Prevention)',
        title: 'Vaginitis and Vaginal Discharge Clinical Guidelines',
        year: '2021',
        url: 'https://www.cdc.gov/std/treatment-guidelines/vaginitis.htm',
      },
    ],
  },
];

export const LATE_PERIODS_ARTICLES = [
  {
    id: 'late-bring-on-period',
    category: 'The Lowdown on Late Periods',
    title: 'Can You Really Bring on a Late Period?',
    image: bringOnPeriodImage,
    alt: 'Woman resting with heating pad and herbal tea focusing on cycle health',
    description:
      'From mega-dose vitamin C to parsley tea, social media is full of period-inducing recipes. Examine what gynecological science reveals about emmenagogues, potential safety hazards, and what genuinely regulates bleeding.',
    sections: [
      {
        heading: 'The Biology of Menstrual Onset',
        content:
          'Menstruation is triggered by the withdrawal of progesterone when an egg is not fertilized and the corpus luteum naturally breaks down. If ovulation has not yet taken place, progesterone has not been produced; if pregnancy has occurred, hCG sustains progesterone production. There is no biological mechanism by which consuming specific foods or herbs can abruptly drop progesterone levels on demand.',
      },
      {
        heading: 'The Truth About Purported Emmenagogues',
        content:
          'Remedies marketed as "period starters" (such as high-dose ascorbic acid/vitamin C, parsley, cinnamon, dong quai, or black cohosh) lack clinical trials proving efficacy. Furthermore, high doses of vitamin C can cause acute nausea, severe diarrhea, and kidney stones, while certain concentrated herbal extracts carry risks of liver toxicity and dangerous uterine contractions.',
      },
      {
        heading: 'The Role of Warmth and Stress Reduction',
        content:
          'While a warm bath or heating pad cannot biochemically force the endometrium to shed, physical relaxation reduces sympathetic nervous system tone. Lowering adrenaline and cortisol can help relieve pelvic muscle tension and support your neuroendocrine system in returning to its natural rhythm.',
      },
      {
        heading: 'Evidence-Based Approaches to Delayed Cycles',
        content:
          'Instead of risky DIY interventions, take a home pregnancy test if pregnancy is possible. For chronic cycle irregularity, clinical evaluation of ovulatory function, thyroid health, and metabolic factors is the only evidence-based path forward.',
      },
    ],
    whenToSeeDoctor:
      'Avoid consuming high doses of unverified supplements or herbal concoctions. If your period is more than 14 days overdue or your cycles are consistently irregular, consult a gynecologist for a safe, targeted evaluation.',
    sources: [
      {
        org: 'National Center for Complementary and Integrative Health (NIH)',
        title: 'Herbs at a Glance: Evidence and Safety Profiles',
        year: '2023',
        url: 'https://www.nccih.nih.gov',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Abnormal Uterine Bleeding and Irregular Menstrual Cycles: Patient FAQ',
        year: '2022',
        url: 'https://www.acog.org',
      },
      {
        org: 'American Society for Reproductive Medicine (ASRM)',
        title: 'Optimizing Natural Fertility: A Committee Opinion',
        year: '2022',
        doi: '10.1016/j.fertnstert.2021.10.007',
      },
    ],
  },
  {
    id: 'late-doesnt-show-up',
    category: 'The Lowdown on Late Periods',
    title: "When Your Period Doesn't Show Up",
    image: periodNotShowingImage,
    alt: "Young woman contemplating missing period with menstrual calendar dial",
    description:
      'When your period fails to arrive month after month, doctors diagnose it as secondary amenorrhea. Explore the clinical causes, diagnostic steps, and long-term implications for bone and cardiovascular health.',
    sections: [
      {
        heading: 'Clinical Definition of Secondary Amenorrhea',
        content:
          'Secondary amenorrhea is clinically defined by ACOG as the cessation of regular menses for 3 consecutive months, or for 6 months in women with a history of irregular cycles. While skipping a single period is relatively common, prolonged absence indicates an interruption along the hypothalamic-pituitary-ovarian (HPO) axis.',
      },
      {
        heading: 'Key Medical Causes to Investigate',
        content:
          'Once pregnancy is excluded, clinicians evaluate several primary possibilities:',
        points: [
          'Polycystic Ovary Syndrome (PCOS): The most frequent cause of chronic anovulation, driven by androgen excess and insulin resistance.',
          'Functional Hypothalamic Amenorrhea (FHA): Triggered by energy deficits, eating disorders, excessive exercise, or severe emotional distress.',
          'Hyperprolactinemia: Excess prolactin secretion from pituitary microadenomas, medications, or hypothyroidism inhibiting GnRH pulsatility.',
          'Primary Ovarian Insufficiency (POI): Loss of normal ovarian function before the age of 40.',
          'Thyroid Dysfunction: Both hypothyroidism and hyperthyroidism can interrupt normal cyclical ovulation.',
        ],
      },
      {
        heading: 'Long-Term Health Consequences',
        content:
          'Prolonged absence of ovulation can lead to prolonged hypoestrogenism, which accelerates bone mineral density loss and increases long-term cardiovascular risks. Conversely, in conditions like PCOS with chronic anovulation, unopposed estrogen without progesterone increases the risk of endometrial hyperplasia.',
      },
    ],
    whenToSeeDoctor:
      'Schedule a clinical evaluation if you have missed your period for three consecutive months, or earlier if amenorrhea is accompanied by persistent headaches, vision changes, galactorrhea (breast discharge), or noticeable hot flashes.',
    sources: [
      {
        org: 'ACOG Practice Bulletin No. 206',
        title: 'Amenorrhea: Clinical Management Guidelines for Obstetrician-Gynecologists',
        year: '2019',
        doi: '10.1097/AOG.0000000000003117',
      },
      {
        org: 'Journal of Clinical Endocrinology & Metabolism',
        title: 'Functional Hypothalamic Amenorrhea: An Endocrine Society Guideline',
        year: '2017',
        doi: '10.1210/jc.2017-00131',
      },
      {
        org: 'Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD)',
        title: 'What causes amenorrhea?',
        year: '2022',
        url: 'https://www.nichd.nih.gov',
      },
    ],
  },
  {
    id: 'late-how-late-too-late',
    category: 'The Lowdown on Late Periods',
    title: 'How Late Is Too Late?',
    image: howLateImage,
    alt: 'Desk calendar with shifting period date circles and clock',
    description:
      'Cycles naturally shift by a few days from month to month. Understand international medical thresholds for normal variation, when a delay is considered oligomenorrhea, and when to seek medical evaluation.',
    sections: [
      {
        heading: 'Normal Cycle Variability: The FIGO Standard',
        content:
          'According to the International Federation of Gynecology and Obstetrics (FIGO), an adult menstrual cycle is considered normal if it falls between 24 and 38 days in length. Cycle length is measured from Day 1 of full flow to Day 1 of the following period. Natural variations of up to 7 to 9 days from one cycle to the next are common and medically normal.',
      },
      {
        heading: 'When Is a Period Officially "Late"?',
        content:
          'A period is generally considered late once it has not arrived 5 to 7 days past the latest expected date based on your personal cycle history. If your cycle extends past 38 days, it falls under the clinical category of oligomenorrhea (infrequent menstrual bleeding).',
      },
      {
        heading: 'Day-to-Day Factors That Cause Temporary Delays',
        content:
          'Transient follicular delays of 3 to 7 days are routinely caused by mild viral illnesses, international travel across time zones (circadian misalignment), sudden changes in work shifts, intense short-term stress, or starting new medications.',
      },
      {
        heading: 'Action Plan by Timeframe',
        content:
          'Follow these evidence-based steps when your cycle is running behind schedule:',
        points: [
          'Days 1–5 Late: Take a home pregnancy test if applicable; ensure adequate hydration and consistent sleep.',
          'Days 6–10 Late: If initial test was negative, re-test with first-morning urine; avoid taking unverified supplements.',
          'Cycle > 38 Days or 3 Cycles Missed: Book an evaluation with a healthcare provider for basic pelvic ultrasound and hormonal evaluation.',
        ],
      },
    ],
    whenToSeeDoctor:
      'Consult a doctor immediately if late bleeding is accompanied by severe abdominal cramping, heavy unusual bleeding, fever, dizziness, or if you consistently go longer than 38 days between menstrual cycles.',
    sources: [
      {
        org: 'International Journal of Gynecology & Obstetrics (FIGO)',
        title: 'The Two FIGO Systems for Normal and Abnormal Uterine Bleeding Symptoms',
        year: '2018',
        doi: '10.1002/ijgo.12666',
      },
      {
        org: 'ACOG Committee Opinion No. 651',
        title: 'Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign',
        year: '2015',
        doi: '10.1097/AOG.0000000000001215',
      },
      {
        org: 'Mayo Clinic',
        title: 'Menstrual Cycle: What’s Normal, What’s Not',
        year: '2023',
        url: 'https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047186',
      },
    ],
  },
];

export const SYNC_CYCLE_ARTICLES = [
  {
    id: 'sync-move-with-cycle',
    category: 'Live in Sync With Your Cycle',
    title: 'Move With Your Cycle',
    image: moveWithCycleImage,
    alt: 'Woman practicing yoga surrounded by workout cycle phases illustration',
    description:
      'Separate sports science evidence from wellness hype. Learn how estrogen and progesterone influence fuel utilization, joint laxity, and core temperature across workout phases.',
    sections: [
      {
        heading: 'What Sports Medicine Evidence Shows',
        content:
          'Systematic reviews in sports medicine show that while fluctuations in estrogen and progesterone alter muscle glycogen storage, ligament laxity, and core body temperature, there is no one-size-fits-all workout regimen for all women. Individual symptom variation is substantially greater than the minor physiological differences between cycle phases.',
      },
      {
        heading: 'The Follicular Phase: Strength, Power, and Glycolysis',
        content:
          'From menstruation through ovulation, estrogen rises while progesterone remains low. Research indicates enhanced insulin sensitivity and higher carbohydrate utilization efficiency during this window. Many women report higher neuromuscular power, faster recovery, and greater readiness for strength training or high-intensity interval training (HIIT).',
      },
      {
        heading: 'The Luteal Phase: Endurance, Heat, and Recovery',
        content:
          'In the two weeks after ovulation, progesterone elevates basal body temperature by ~0.5°C and increases protein catabolism and sodium-water retention. Workouts in hot or humid environments may feel significantly more demanding. Moderate steady-state cardio, strength maintenance, and mobility routines are often better tolerated.',
      },
      {
        heading: 'The Evidence-Based Approach: Autoregulation',
        content:
          'Rather than rigidly changing workout types purely based on calendar dates, modern sports scientists recommend autoregulated training: adjust training volume and intensity based on daily readiness, sleep quality, and physical comfort.',
      },
    ],
    whenToSeeDoctor:
      'If intense exercise is accompanied by the loss of your menstrual period (amenorrhea) or recurrent stress fractures, seek evaluation for Relative Energy Deficiency in Sport (RED-S).',
    sources: [
      {
        org: 'Sports Medicine',
        title: 'The Effects of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women: A Systematic Review and Meta-Analysis',
        year: '2020',
        doi: '10.1007/s40279-020-01319-3',
      },
      {
        org: 'Frontiers in Physiology',
        title: 'The Effects of Menstrual Cycle Phase on Elite Athlete Performance: A Critical and Systematic Review',
        year: '2021',
        doi: '10.3389/fphys.2021.654585',
      },
      {
        org: 'British Journal of Sports Medicine (BJSM)',
        title: 'Menstrual Cycle and Performance in Female Athletes',
        year: '2021',
        doi: '10.1136/bjsports-2020-103759',
      },
    ],
  },
  {
    id: 'sync-alcohol-and-cycle',
    category: 'Live in Sync With Your Cycle',
    title: 'Alcohol & Your Cycle: What to Know',
    image: alcoholCycleImage,
    alt: 'Glass of wine, water glass, citrus slices and cycle wheel diagram',
    description:
      'Alcohol interacts with liver estrogen metabolism, intensifies premenstrual water retention, alters sleep stages, and can exacerbate dysmenorrhea. Discover the clinical facts.',
    sections: [
      {
        heading: 'Hepatic Estrogen Metabolism',
        content:
          'The liver is responsible for metabolizing both alcohol (ethanol) and circulating steroid hormones. When alcohol is consumed, liver cytochrome P450 enzymes prioritize ethanol oxidation, temporarily slowing the breakdown of circulating estradiol. This can result in short-term spikes in serum estrogen levels.',
      },
      {
        heading: 'Impact on Ovulation and Fertility',
        content:
          'Prospective epidemiological studies demonstrate that heavy alcohol consumption—particularly during the ovulatory and luteal windows—is associated with reduced fecundability and higher rates of sporadic anovulation. Moderate or occasional intake shows less pronounced effects, but individual sensitivity varies widely.',
      },
      {
        heading: 'Exacerbation of Premenstrual Mood & Sleep',
        content:
          'Alcohol is a central nervous system depressant and neurotoxin that severely impairs sleep architecture. Consuming alcohol during the premenstrual phase suppresses restorative REM and slow-wave sleep, worsens dehydration, and can trigger next-day rebound anxiety ("hangxiety") due to luteal GABA-A receptor sensitivity.',
      },
      {
        heading: 'Prostaglandins & Menstrual Cramps',
        content:
          'Systemic dehydration from alcohol coupled with localized inflammatory signaling can intensify the production of uterine prostaglandins (PGF2-alpha), increasing the severity of painful uterine cramping during the first 48 hours of your period.',
      },
    ],
    whenToSeeDoctor:
      'If you notice significant menstrual irregularity, severe premenstrual mood drops, or difficulty moderating alcohol consumption around your cycle, speak with a healthcare provider or mental health specialist.',
    sources: [
      {
        org: 'Reproductive Health',
        title: 'The Association Between Alcohol Consumption and Menstrual Cycle Characteristics: A Systematic Review',
        year: '2021',
        doi: '10.1186/s12978-021-01201-9',
      },
      {
        org: 'Alcohol and Alcoholism',
        title: 'Acute Effect of Alcohol on Androgens and Estrogens in Pre-Menopausal Women',
        year: '2000',
        doi: '10.1093/alcalc/35.1.84',
      },
      {
        org: 'National Institute on Alcohol Abuse and Alcoholism (NIAAA / NIH)',
        title: 'Women and Alcohol: Hormonal and Reproductive Interactions',
        year: '2023',
        url: 'https://www.niaaa.nih.gov',
      },
    ],
  },
  {
    id: 'sync-sleep-body-needs',
    category: 'Live in Sync With Your Cycle',
    title: 'The Sleep Your Body Needs',
    image: sleepBodyNeedsImage,
    alt: 'Young woman resting deeply in bed with glowing biological rhythm elements',
    description:
      'Deep, consistent sleep is foundational to healthy reproductive endocrine signaling. Understand how sleep debt elevates cortisol, suppresses LH surges, and impairs glucose regulation.',
    sections: [
      {
        heading: 'Sleep as an Endocrine Regulator',
        content:
          'Sleep is an active metabolic and neuroendocrine process. The central circadian pacemaker (the suprachiasmatic nucleus) coordinates the pulsatile release of essential hormones, including growth hormone, thyroid-stimulating hormone (TSH), prolactin, leptin, ghrelin, and gonadotropins (LH and FSH). Chronic sleep deprivation disrupts these delicate biorhythms.',
      },
      {
        heading: 'Cortisol Elevation and Ovulatory Disruption',
        content:
          'Sleeping fewer than 7 hours per night or having fragmented sleep activates the hypothalamic-pituitary-adrenal (HPA) axis, elevating nighttime cortisol. Sustained cortisol inhibits hypothalamic GnRH secretion, which can delay or blunt the mid-cycle LH surge needed for mature follicle release.',
      },
      {
        heading: 'Metabolic Vulnerability and Insulin Resistance',
        content:
          'Clinical trials show that just a few nights of partial sleep restriction can reduce peripheral insulin sensitivity by up to 30%. In individuals with PCOS or metabolic vulnerabilities, this exacerbates glycemic instability, fueling sugar cravings and daytime fatigue.',
      },
      {
        heading: 'Evidence-Based Sleep Hygiene Rules',
        content:
          'Optimize your hormonal recovery with simple, validated sleep habits:',
        points: [
          'Maintain consistent bed and wake times within 30 minutes every day.',
          'Keep your bedroom dark, quiet, and cool (65°F to 68°F / 18°C to 20°C).',
          'Get 15–30 minutes of natural outdoor morning light to anchor circadian melatonin production.',
          'Avoid heavy meals, alcohol, and caffeine within 4 to 6 hours of bedtime.',
        ],
      },
    ],
    whenToSeeDoctor:
      'If you suffer from chronic insomnia, loud snoring with daytime fatigue, or unrefreshing sleep despite 8 hours in bed, consult a physician to be screened for sleep apnea or restless legs syndrome.',
    sources: [
      {
        org: 'Journal of Circadian Rhythms',
        title: 'Sleep and Reproductive Health: Endocrine and Circadian Links',
        year: '2020',
        doi: '10.5334/jcr.193',
      },
      {
        org: 'Journal of Applied Physiology',
        title: 'Sleep Loss: A Novel Risk Factor for Insulin Resistance and Metabolic Dysfunction',
        year: '2005',
        doi: '10.1152/japplphysiol.00660.2005',
      },
      {
        org: 'National Sleep Foundation',
        title: 'Sleep Health Recommendations and Guidelines for Women',
        year: '2023',
        url: 'https://www.sleepfoundation.org',
      },
    ],
  },
  {
    id: 'sync-eat-well-feel-well',
    category: 'Live in Sync With Your Cycle',
    title: 'Eat Well, Feel Well',
    image: eatWellImage,
    alt: 'Colorful balanced nutrition bowl with grains, greens, seeds, nuts, and avocado',
    description:
      'Evidence-based nutrition supports metabolic shifts across the menstrual cycle. Learn how to stabilize blood glucose, ease inflammatory cramping with omega-3s, and replenish iron stores.',
    sections: [
      {
        heading: 'Metabolic Changes Across Cycle Phases',
        content:
          'During the luteal phase, baseline metabolic rate increases by approximately 100 to 300 kcal/day due to progesterone’s thermogenic effect. Concurrently, progesterone mildly reduces peripheral insulin sensitivity. Prioritizing steady blood sugar through fiber, complex carbohydrates, and lean proteins helps prevent sharp glucose drops that trigger intense cravings and irritability.',
      },
      {
        heading: 'Magnesium and Vitamin B6 for Symptom Relief',
        content:
          'Magnesium acts as an essential cofactor in neuromuscular relaxation and dopamine synthesis. Clinical trials indicate that supplementing 200–400 mg of magnesium (especially combined with vitamin B6) significantly reduces premenstrual fluid retention, breast tenderness, and mood symptoms. Rich dietary sources include pumpkin seeds, almonds, dark leafy greens, and dark chocolate.',
      },
      {
        heading: 'Anti-Inflammatory Omega-3s for Menstrual Pain',
        content:
          'Primary dysmenorrhea (period cramping) is driven by endometrial prostaglandins (PGF2-alpha). Anti-inflammatory omega-3 fatty acids (EPA and DHA found in salmon, sardines, flaxseeds, and chia seeds) competitively displace arachidonic acid, significantly reducing inflammatory prostaglandin production and cramp severity.',
      },
      {
        heading: 'Iron Replenishment Strategies',
        content:
          'Menstrual bleeding is the primary cause of iron depletion in premenopausal women. Pairing non-heme iron sources (beans, lentils, spinach) with vitamin C (bell peppers, citrus fruits, broccoli) boosts iron absorption up to three-fold. Avoid drinking coffee or black tea with iron-rich meals, as tannins inhibit iron uptake.',
      },
    ],
    whenToSeeDoctor:
      'If you have debilitating menstrual cramps unmanageable with diet and over-the-counter NSAIDs, or if heavy bleeding causes chronic exhaustion, see a gynecologist to evaluate for endometriosis, adenomyosis, or fibroids.',
    sources: [
      {
        org: 'European Journal of Obstetrics & Gynecology and Reproductive Biology',
        title: 'Effect of Omega-3 Fatty Acids on Primary Dysmenorrhea: A Systematic Review and Meta-Analysis',
        year: '2022',
        doi: '10.1016/j.ejogrb.2022.02.012',
      },
      {
        org: 'Journal of Women’s Health & Gender-Based Medicine',
        title: 'A Synergistic Effect of Magnesium Plus Vitamin B6 for the Relief of Premenstrual Symptoms',
        year: '2000',
        doi: '10.1089/152460900318623',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Nutrition and Wellness Guidelines for Women',
        year: '2022',
        url: 'https://www.acog.org',
      },
    ],
  },
  {
    id: 'sync-why-sleep-changes',
    category: 'Live in Sync With Your Cycle',
    title: 'Why Sleep Changes With Your Cycle',
    image: whySleepChangesImage,
    alt: 'Window overlooking daytime and nocturnal sky representing circadian sleep changes',
    description:
      'Waking up sweaty, restless, or having vivid dreams before your period is driven by progesterone’s thermogenic influence and shifts in REM sleep architecture.',
    sections: [
      {
        heading: 'Progesterone and Core Body Temperature',
        content:
          'Following ovulation, the corpus luteum produces progesterone, which acts on the thermoregulatory center in the hypothalamus to elevate core body temperature by 0.3°C to 0.7°C (0.5°F to 1.0°F). Because physiological sleep onset and maintenance depend on a rapid nocturnal drop in core temperature, this elevated baseline makes falling and staying asleep noticeably harder during the luteal phase.',
      },
      {
        heading: 'Shifts in Sleep Stages (REM vs. Sleep Spindles)',
        content:
          'Polysomnography studies show a distinct reduction in Rapid Eye Movement (REM) sleep during the luteal phase compared to the follicular phase. Concurrently, progesterone’s neuroactive metabolite, allopregnanolone, interacts with GABA-A receptors, increasing sleep spindle frequency (12–15 Hz) during non-REM sleep—a protective biological mechanism to preserve sleep continuity.',
      },
      {
        heading: 'Premenstrual Insomnia and PMDD Vulnerability',
        content:
          'In individuals with PMS or Premenstrual Dysphoric Disorder (PMDD), rapid withdrawal of estrogen and progesterone in the late luteal phase destabilizes both allopregnanolone and brain serotonin pathways. This often leads to fragmented sleep, frequent nocturnal awakenings, night sweats, and vivid dreams in the 3 to 7 days before bleeding.',
      },
      {
        heading: 'Targeted Luteal Phase Sleep Interventions',
        content:
          'Counteract cycle-related sleep disturbances with these evidence-based adjustments:',
        points: [
          'Set your bedroom thermostat 1°C to 2°C cooler during the premenstrual week.',
          'Use natural, breathable bedding (cotton, linen, or bamboo) to dissipate nocturnal heat.',
          'Take a warm shower 90 minutes before bed; as your body cools afterward, it triggers natural sleepiness.',
          'Curtail evening alcohol and caffeine, both of which severely worsen luteal night sweats.',
        ],
      },
    ],
    whenToSeeDoctor:
      'If premenstrual insomnia severely impairs your ability to function at work or school, or is accompanied by intense feelings of hopelessness or rage, discuss PMDD screening with your healthcare provider.',
    sources: [
      {
        org: 'Sleep Medicine',
        title: 'Circadian Rhythms, Sleep, and the Menstrual Cycle',
        year: '2007',
        doi: '10.1016/j.sleep.2006.09.011',
      },
      {
        org: 'International Journal of Endocrinology',
        title: 'Sleep, Hormones, and Circadian Rhythms Throughout the Menstrual Cycle in Healthy Women and PMDD',
        year: '2010',
        doi: '10.1155/2010/259345',
      },
      {
        org: 'Cleveland Clinic Health Essentials',
        title: 'How Your Menstrual Cycle Affects Your Sleep and Night Sweats',
        year: '2023',
        url: 'https://health.clevelandclinic.org',
      },
    ],
  },
];

export const FEMCARE_RECOMMENDATIONS_ARTICLES = [
  {
    id: 'rec-cycle-off-track',
    category: "FemCare's Recommendations",
    title: 'When Your Cycle Goes Off Track',
    image: cycleOffTrackImage,
    alt: 'Smartwatch showing menstrual cycle tracking dial with reproductive organs and hormonal nodes',
    description:
      'From irregular intervals to unexpected spotting, understand how gynecologists use the international FIGO PALM-COEIN classification to diagnose and treat cycle disruptions.',
    sections: [
      {
        heading: 'Defining Cycle Irregularity',
        content:
          'A menstrual cycle is classified as irregular if its length consistently falls outside the 24 to 38-day range, if cycle lengths vary by more than 7 to 9 days from month to month, or if unpredictable intermenstrual bleeding occurs between expected periods.',
      },
      {
        heading: 'The FIGO PALM-COEIN Classification Framework',
        content:
          'Gynecologists categorize abnormal bleeding and irregular cycles into structural and non-structural causes using the standardized PALM-COEIN system:',
        points: [
          'P - Polyps: Endometrial or cervical growths that can cause irregular bleeding or spotting.',
          'A - Adenomyosis: Endometrial tissue growing into the uterine muscular wall.',
          'L - Leiomyomas: Uterine fibroids causing prolonged, heavy, or unpredictable bleeding.',
          'M - Malignancy & Hyperplasia: Atypical cellular changes of the endometrium.',
          'C - Coagulopathy: Underlying blood clotting disorders such as von Willebrand disease.',
          'O - Ovulatory Dysfunction: Anovulation or irregular ovulation (most commonly PCOS, thyroid disease, or hypothalamic stress).',
          'E - Endometrial: Primary disorders of local endometrial hemostasis.',
          'I - Iatrogenic: Bleeding caused by IUDs, contraceptive implants, or medications.',
          'N - Not otherwise classified: Rare anatomical or functional vascular anomalies.',
        ],
      },
      {
        heading: 'The Clinical Significance of Anovulatory Bleeding (AUB-O)',
        content:
          'In reproductive-aged women, ovulatory dysfunction is the most common functional cause. Without ovulation, the ovary produces continuous estrogen without the stabilizing effect of progesterone. The uterine lining proliferates unchecked until it breaks down unpredictably, causing prolonged spotting or sudden heavy bleeding.',
      },
    ],
    whenToSeeDoctor:
      'Consult a healthcare provider if you soak through one or more sanitary pads/tampons per hour for two or more consecutive hours, bleed longer than 8 days, bleed after intercourse, or miss your period for more than 90 days.',
    sources: [
      {
        org: 'International Federation of Gynecology and Obstetrics (FIGO)',
        title: 'FIGO Classification System (PALM-COEIN) for Causes of Abnormal Uterine Bleeding',
        year: '2018',
        doi: '10.1002/ijgo.12666',
      },
      {
        org: 'ACOG Practice Bulletin No. 128',
        title: 'Diagnosis of Abnormal Uterine Bleeding in Reproductive-Aged Women',
        year: '2012',
        doi: '10.1097/AOG.0b013e318262e320',
      },
      {
        org: 'American Family Physician (AAFP)',
        title: 'Abnormal Uterine Bleeding: Evaluation and Management',
        year: '2019',
        url: 'https://www.aafp.org/pubs/afp/issues/2019/0401/p430.html',
      },
    ],
  },
  {
    id: 'rec-discharge-telling-you',
    category: "FemCare's Recommendations",
    title: 'What Your Discharge Is Telling You',
    image: dischargeTellingYouImage,
    alt: 'Scientific glassware illustrating microscopic cervical fluid changes throughout the cycle',
    description:
      'Learn the clinical characteristics that differentiate physiological vaginal secretions from bacterial vaginosis, candidiasis, and trichomoniasis.',
    sections: [
      {
        heading: 'The Vaginal Ecosystem & Acidic Mantle',
        content:
          'A healthy vaginal environment is predominantly colonized by Lactobacillus species, which convert glycogen from epithelial cells into lactic acid and hydrogen peroxide. This maintains a protective acidic pH between 3.8 and 4.5, creating a natural defense against opportunistic pathogenic bacteria and yeasts.',
      },
      {
        heading: 'Comparing Common Vaginal Infections',
        content:
          'According to CDC and ACOG clinical guidelines, the three most common causes of abnormal vaginal discharge exhibit distinct features:',
        points: [
          'Bacterial Vaginosis (BV): Thin, homogenous, off-white or gray discharge with an alkaline pH (>4.5) and a characteristic "fishy" amine odor, often more noticeable after intercourse.',
          'Vulvovaginal Candidiasis (Yeast): Thick, white, curdy discharge (like cottage cheese), normal acidic pH (≤4.5), intense vulvar pruritus (itching), burning, and redness.',
          'Trichomoniasis: Sexually transmitted infection caused by a protozoan; presents with copious, frothy, yellow-green discharge, strong odor, dysuria, and cervical petechiae.',
        ],
      },
      {
        heading: 'Why You Should Avoid Self-Treating',
        content:
          'Studies demonstrate that up to two-thirds of women who self-treat with over-the-counter anti-yeast treatments do not actually have a yeast infection. Misusing antifungals can irritate sensitive vulvar tissues, worsen contact dermatitis, and delay the correct diagnosis and treatment of bacterial vaginosis or STIs.',
      },
    ],
    whenToSeeDoctor:
      'See a healthcare professional if you notice an offensive odor, clumpy white or yellow-green discharge, burning during urination, pelvic pain, or persistent itching. Accurate diagnosis requires clinical testing (swab, pH, or NAAT).',
    sources: [
      {
        org: 'ACOG Practice Bulletin No. 215',
        title: 'Vaginitis in Nonpregnant Patients: Clinical Management',
        year: '2020',
        doi: '10.1097/AOG.0000000000003604',
      },
      {
        org: 'CDC MMWR Recommendations and Reports',
        title: 'Sexually Transmitted Infections Treatment Guidelines: Vaginitis',
        year: '2021',
        url: 'https://www.cdc.gov/std/treatment-guidelines/vaginitis.htm',
      },
      {
        org: 'The Lancet',
        title: 'Vulvovaginal Candidosis: Pathogenesis and Clinical Management',
        year: '2007',
        doi: '10.1016/S0140-6736(07)60917-9',
      },
    ],
  },
  {
    id: 'rec-bladder-leaks',
    category: "FemCare's Recommendations",
    title: 'Taking Control of Bladder Leaks',
    image: bladderLeaksImage,
    alt: 'Light blue underwear with panty liner representing pelvic floor bladder leak management',
    description:
      'Urinary leakage when coughing, laughing, or exercising is common, but it is never something you simply have to accept. Explore the proven power of pelvic floor muscle training and bladder retraining.',
    sections: [
      {
        heading: 'Types of Urinary Incontinence in Women',
        content:
          'Urinary incontinence affects approximately 1 in 3 women. Identifying your specific type is essential for effective treatment:',
        points: [
          'Stress Urinary Incontinence (SUI): Involuntary leakage occurring when physical exertion increases intra-abdominal pressure (e.g., coughing, sneezing, laughing, jumping, or heavy lifting). It is caused by pelvic floor weakness or urethral hypermobility.',
          'Urge Urinary Incontinence (UUI / Overactive Bladder): A sudden, intense, uncontrollable urge to void followed immediately by involuntary leakage, caused by uninhibited detrusor muscle contractions.',
          'Mixed Incontinence: A combination of both stress and urge symptoms.',
        ],
      },
      {
        heading: 'First-Line Therapy: Pelvic Floor Muscle Training (PFMT)',
        content:
          'ACOG Practice Bulletin No. 155 recommends Pelvic Floor Muscle Training (Kegel exercises) as the proven, non-invasive first-line therapy. Correctly contracting and relaxing the pubococcygeus and levator ani muscles strengthens the muscular hammock supporting the bladder neck and urethra, with cure or marked improvement rates reaching up to 70–80%.',
      },
      {
        heading: 'Behavioral & Lifestyle Interventions',
        content:
          'Simple daily modifications significantly reduce leak episodes:',
        points: [
          'Bladder Training: Scheduled voiding at set intervals (gradually increasing from every 2 hours to every 3–4 hours) to recondition the detrusor muscle.',
          'Fluid & Dietary Management: Reducing intake of bladder irritants such as excess caffeine, artificial sweeteners, carbonated drinks, and alcohol.',
          'Moderate Weight Management: Reducing abdominal adiposity decreases resting mechanical pressure on the pelvic floor.',
        ],
      },
    ],
    whenToSeeDoctor:
      'If home pelvic floor exercises do not improve your symptoms after 6 to 8 weeks, consult a urogynecologist or specialized pelvic floor physical therapist. They can evaluate muscle recruitment with biofeedback, discuss supportive pessaries, or recommend medical options.',
    sources: [
      {
        org: 'ACOG Practice Bulletin No. 155',
        title: 'Urinary Incontinence in Women: Clinical Management Guidelines',
        year: '2015',
        doi: '10.1097/AOG.0000000000001148',
      },
      {
        org: 'Cochrane Database of Systematic Reviews',
        title: 'Pelvic Floor Muscle Training Versus No Treatment for Urinary Incontinence in Women',
        year: '2018',
        doi: '10.1002/14651858.CD005654.pub4',
      },
      {
        org: 'American Urogynecologic Society (AUGS)',
        title: 'Clinical Consensus Statement: Conservative Management of Stress Urinary Incontinence',
        year: '2020',
        doi: '10.1097/SPV.0000000000000854',
      },
    ],
  },
  {
    id: 'rec-good-side-discharge',
    category: "FemCare's Recommendations",
    title: 'The Good Side of Vaginal Discharge',
    image: goodSideDischargeImage,
    alt: 'Panty liner with natural healthy fluid drops and botanical reproductive wellness elements',
    description:
      'Vaginal discharge is not an embarrassing flaw; it is an intelligent biological defense system. Understand the vital self-cleaning, antimicrobial, and fertility-facilitating roles of natural vaginal fluids.',
    sections: [
      {
        heading: 'The Intelligent Self-Cleaning System',
        content:
          'The vagina is a dynamic, self-cleansing organ. Vaginal discharge continuously carries old epithelial cells, debris, and potential environmental pathogens outward away from internal reproductive structures. This continuous outward flow prevents ascending infections from reaching the cervix, uterus, and fallopian tubes.',
      },
      {
        heading: 'Immunological & Antimicrobial Barrier',
        content:
          'Healthy vaginal secretions are rich in glycogen, which nourishes protective Lactobacillus bacteria. These bacteria produce lactic acid, maintaining an acidic pH (3.8–4.5) that prevents colonization by anaerobic pathogens and Candida. Additionally, vaginal fluid contains natural antimicrobial peptides, lysozymes, and secretory immunoglobulin A (sIgA) antibodies.',
      },
      {
        heading: 'Fertility Facilitation: The Cervical Highway',
        content:
          'During the fertile pre-ovulatory window, estrogen triggers the production of specialized type-E cervical mucus. Under microscopic analysis, this mucus aligns in parallel micro-filaments, creating low-resistance swimming channels that filter out abnormal sperm and nourish viable sperm on their journey to the egg.',
      },
      {
        heading: 'Why Cleansing and Douching Are Harmful',
        content:
          'Douching, scented wipes, and vaginal "cleansers" wash away beneficial lactobacilli, strip natural antimicrobial peptides, and elevate vaginal pH. Research confirms that douching increases the risk of bacterial vaginosis by up to 300% and significantly raises the risk of pelvic inflammatory disease (PID).',
      },
    ],
    whenToSeeDoctor:
      'Embrace your body’s natural protective fluid. If your discharge suddenly turns yellow-green, thick and clumpy, develops a sharp odor, or is accompanied by burning or itching, consult a healthcare provider for an evaluation.',
    sources: [
      {
        org: 'ACOG Committee Opinion No. 734',
        title: 'The Vaginal Microbiome and Women’s Health',
        year: '2018',
        doi: '10.1097/AOG.0000000000002573',
      },
      {
        org: 'Annual Review of Genomics and Human Genetics',
        title: 'Microbiome of the Lower Genital Tract of Women of Reproductive Age',
        year: '2011',
        doi: '10.1146/annurev-genom-090810-183138',
      },
      {
        org: 'Office on Women’s Health (US OASH)',
        title: 'Douching: Health Risks and Medical Recommendations',
        year: '2022',
        url: 'https://www.womenshealth.gov',
      },
    ],
  },
  {
    id: 'rec-vulva-your-choice',
    category: "FemCare's Recommendations",
    title: 'Your Vulva, Your Choice',
    image: vulvaYourChoiceImage,
    alt: 'Grooming razor and pubic hair skincare kit with microscopic folliculitis diagrams',
    description:
      'Whether you choose to shave, trim, wax, or keep your pubic hair natural is entirely personal. Learn the biological benefits of pubic hair, common skin complications like folliculitis, and medical guidelines for safe care.',
    sections: [
      {
        heading: 'The Evolutionary & Biological Functions of Pubic Hair',
        content:
          'Pubic hair is not unhygienic. From an evolutionary perspective, it acts as a physical friction barrier that cushions delicate skin during movement and sexual activity. It also helps divert sweat and external debris away from the sensitive vaginal introitus and urethral opening.',
      },
      {
        heading: 'Common Dermatological Complications of Hair Removal',
        content:
          'Surveys indicate that up to 80% of individuals who remove pubic hair experience some form of adverse skin reaction:',
        points: [
          'Folliculitis: Bacterial infection or inflammation of the hair follicle (most commonly Staphylococcus aureus), presenting as tender red bumps or whiteheads.',
          'Pseudofolliculitis (Ingrown Hairs): Occurs when curly pubic hair is cut short and curls back into the epidermal layer, triggering a foreign-body inflammatory reaction.',
          'Micro-Abrasions: Shaving creates microscopic epidermal tears in the stratum corneum, increasing susceptibility to contact dermatitis and skin-to-skin viral transmission (such as Molluscum contagiosum or HPV).',
        ],
      },
      {
        heading: 'Clinical Guidelines for Safe Grooming',
        content:
          'If you choose to groom, dermatologists and gynecologists recommend these protective practices:',
        points: [
          'Always use a clean, sharp razor; replace blades frequently and never share razors.',
          'Shave in the direction of hair growth, never against the grain.',
          'Hydrate skin with warm water and use an unscented, non-comedogenic shaving cream or gel.',
          'Trimming with sanitized scissors or an electric trimmer with a guard carries the lowest risk of cuts and ingrown hairs.',
        ],
      },
      {
        heading: 'Vulvar Hygiene Essentials',
        content:
          'The external vulva (labia majora, labia minora, and clitoris) only requires washing with warm water or a gentle, fragrance-free, soap-free cleanser. Avoid internal douching, antibacterial soaps, bubble baths, and scented feminine products, which frequently cause irritant contact dermatitis.',
      },
    ],
    whenToSeeDoctor:
      'Consult a gynecologist or dermatologist if you develop persistent painful bumps, expanding redness with heat, open sores or ulcers, or severe itching that does not resolve within a few days of grooming.',
    sources: [
      {
        org: 'British Society for the Study of Vulval Diseases (BSSVD)',
        title: 'Vulval Care Guidelines: General Patient Care Guidelines',
        year: '2021',
        url: 'https://www.bssvd.org',
      },
      {
        org: 'Sexually Transmitted Infections (BMJ Journal)',
        title: 'Correlation Between Pubic Hair Grooming and Sexually Transmitted Infections: National Survey Findings',
        year: '2017',
        doi: '10.1136/sextrans-2016-052687',
      },
      {
        org: 'American College of Obstetricians and Gynecologists (ACOG)',
        title: 'Vulvar Skin Care and Irritation Prevention: Patient Guide',
        year: '2023',
        url: 'https://www.acog.org',
      },
    ],
  },
  {
    id: 'rec-pms-more-than-mood-swings',
    category: "FemCare's Recommendations",
    title: 'PMS: More Than Just Mood Swings',
    image: pmsMoreThanMoodImage,
    alt: 'Care drawer with heating pad, sleep mask, tea, healthy snacks and symptom icons',
    description:
      'Premenstrual syndrome is far broader than emotional volatility. Discover the wide spectrum of physical, cognitive, and somatic symptoms, the biology of neurosteroids, and how to track your cycle effectively.',
    sections: [
      {
        heading: 'The Full Clinical Spectrum of PMS',
        content:
          'Premenstrual Syndrome (PMS) is a multifaceted neuroendocrine condition. While emotional symptoms such as irritability, anxiety, and low mood are well-recognized, clinical literature documents over 150 potential physical and somatic symptoms recurring during the luteal phase:',
        points: [
          'Physical Symptoms: Abdominal bloating, fluid retention, breast tenderness (mastalgia), muscle and joint aches, tension headaches, and gastrointestinal alterations (constipation or diarrhea).',
          'Cognitive & Energy Symptoms: Lethargy, daytime fatigue, difficulty concentrating, brain fog, and sleep disruption.',
          'Affective Symptoms: Emotional lability, tearfulness, anger, food cravings, and heightened sensitivity to stress.',
        ],
      },
      {
        heading: 'The Underlying Neuroendocrine Mechanism',
        content:
          'Research indicates that PMS is not caused by abnormal circulating levels of estrogen or progesterone. Rather, it is driven by abnormal central nervous system sensitivity to normal physiological hormonal fluctuations. When progesterone declines in the late luteal phase, levels of its neuroactive metabolite allopregnanolone fall rapidly, destabilizing GABA-A receptors and impairing central serotonin transmission.',
      },
      {
        heading: 'Differentiating PMS from PMDD',
        content:
          'Premenstrual Dysphoric Disorder (PMDD) is a severe, distinct clinical diagnosis affecting 3% to 8% of women. PMDD requires at least five symptoms with prominent, disabling psychiatric manifestations (severe depression, hopelessness, panic, or intense anger) that substantially impair interpersonal relationships, work, or school functioning.',
      },
      {
        heading: 'The Power of Prospective Symptom Tracking',
        content:
          'ACOG guidelines state that prospective daily symptom tracking across at least two consecutive menstrual cycles—using validated tools like the Daily Record of Severity of Problems (DRSP)—is the clinical gold standard. Tracking verifies that symptoms disappear within a few days of menstrual bleeding, distinguishing PMS from generalized anxiety, depression, or thyroid disorders.',
      },
    ],
    whenToSeeDoctor:
      'If your premenstrual symptoms feel overwhelming, strain your relationships, or cause feelings of despair or self-harm, seek support from a healthcare professional immediately. Effective evidence-based treatments—ranging from cognitive behavioral therapy to SSRIs and hormonal cycle regulation—are available.',
    sources: [
      {
        org: 'ACOG Practice Bulletin No. 209',
        title: 'Premenstrual Dysphoric Disorder and Premenstrual Syndrome',
        year: '2019',
        doi: '10.1097/AOG.0000000000003248',
      },
      {
        org: 'Expert Review of Pharmacoeconomics & Outcomes Research',
        title: 'Premenstrual Syndrome and Premenstrual Dysphoric Disorder: Quality of Life and Burden of Illness',
        year: '2009',
        doi: '10.1586/erp.09.14',
      },
      {
        org: 'American Psychiatric Association (APA)',
        title: 'Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR): PMDD Diagnostic Criteria',
        year: '2022',
        url: 'https://www.psychiatry.org',
      },
    ],
  },
];
