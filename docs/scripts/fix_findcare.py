import pathlib, re

p = pathlib.Path(r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\FindCare.jsx')
content = p.read_text(encoding='utf-8')

# Fix any mangled replacements from PowerShell
content = content.replace("'${API_BASE}`", "`${API_BASE}`")  # fix broken single-quote prefix
content = content.replace('"${API_BASE}`', '`${API_BASE}`')  # fix broken double-quote prefix

# Also fix anything still with literal localhost
import re as _re
content = _re.sub(r"['\"]http://localhost:5000", "`${API_BASE}", content)

# Add import if not present
if 'from ../lib/api' not in content and "from '../lib/api'" not in content:
    content = "import { API_BASE } from '../lib/api';\n" + content

p.write_text(content, encoding='utf-8')
print("FindCare.jsx fixed")

# Verify no localhost left
remaining = [l for l in content.splitlines() if 'localhost:5000' in l]
if remaining:
    print("REMAINING localhost:5000:")
    for l in remaining:
        print(" ", l.strip())
else:
    print("No localhost:5000 remaining - CLEAN")
