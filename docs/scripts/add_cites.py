import pathlib

p = pathlib.Path(r"C:\Users\Siddhi\Desktop\Fem\Femcare-Project\Report_extracted\chap-2-Lit.tex")
c = p.read_text(encoding="utf-8")

# 1. wang2024 alongside maity2025 in Paper 20 (LLM healthcare)
c = c.replace(
    r"delivering future AI-driven intelligent healthcare services. \cite{maity2025}",
    r"delivering future AI-driven intelligent healthcare services. \cite{maity2025,wang2024}"
)

# 2. goodale2019 alongside yu2022 in Paper 7 (physiological data / fertile window)
c = c.replace(
    r"However, the performance of the model is not good for individuals with irregular cycles. \cite{yu2022}",
    r"However, the performance of the model is not good for individuals with irregular cycles. \cite{yu2022,goodale2019}"
)

# 3. urteaga2017 + li2020 alongside li2021 in Paper 1 (personalized menstrual cycle prediction)
c = c.replace(
    r"predicting menstrual cycle lengths, but it is based on user information and may therefore be biased. \cite{li2021}",
    r"predicting menstrual cycle lengths, but it is based on user information and may therefore be biased. \cite{li2021,urteaga2017,li2020}"
)

# 4. liu2019 alongside epstein2017 in Paper 4 (menstrual tracking apps)
c = c.replace(
    r"This study does not provide any predictive model. \cite{epstein2017}",
    r"This study does not provide any predictive model. \cite{epstein2017,liu2019}"
)

# 5. rego2023 alongside khairunisa2025 in Paper 12 (menstrual cycle prediction/forecasting)
c = c.replace(
    r"However, the dataset used for the research is small. \cite{khairunisa2025}",
    r"However, the dataset used for the research is small. \cite{khairunisa2025,rego2023}"
)

# 6. dataset in Research Gap section (project uses a dataset for PCOS/menstrual prediction)
c = c.replace(
    r"The available research on women's healthcare is primarily focused on solving individual problems, such as predicting periods or detecting PCOS.",
    r"The available research on women's healthcare is primarily focused on solving individual problems, such as predicting periods or detecting PCOS. \cite{dataset}"
)

# 7. isayev2023 — postmenopausal women; check if it fits Ali 2023 (Paper 6 deals with menopausal women)
c = c.replace(
    r"This study deals with menopausal women only. \cite{ali2023}",
    r"This study deals with menopausal women only. \cite{ali2023,isayev2023}"
)

p.write_text(c, encoding="utf-8")

import re
all_cites = re.findall(r"\\cite\{([^}]+)\}", c)
keys = set()
for group in all_cites:
    for k in group.split(","):
        keys.add(k.strip())
print("All cited keys in Ch2:", sorted(keys))
print("Total distinct:", len(keys))

bib = pathlib.Path(r"C:\Users\Siddhi\Desktop\Fem\Femcare-Project\Report_extracted\Bibilio.tex").read_text(encoding="utf-8")
bib_keys = set(re.findall(r"\\bibitem\{([^}]+)\}", bib))
missing = keys - bib_keys
print("MISSING from bib:", missing or "NONE")
print("Done.")
