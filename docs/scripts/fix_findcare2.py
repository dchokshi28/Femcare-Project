import pathlib, re

p = pathlib.Path(r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\FindCare.jsx')
content = p.read_text(encoding='utf-8')

# Fix: `${API_BASE}/anything' -> `${API_BASE}/anything`
fixed = re.sub(r'(`\$\{API_BASE\}[^`\'"\n]*?)\'', r'\1`', content)

p.write_text(fixed, encoding='utf-8')

# Verify
remaining = [l.strip() for l in fixed.splitlines() if '`${API_BASE}' in l and l.count('`') % 2 != 0]
if remaining:
    print("STILL BROKEN:")
    for l in remaining:
        print(" ", l)
else:
    print("FindCare.jsx: all template literals clean")
