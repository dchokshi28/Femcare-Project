import pathlib, re

src = pathlib.Path(r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src')

for f in src.rglob('*.jsx'):
    content = f.read_text(encoding='utf-8')
    lines = content.splitlines()
    for i, line in enumerate(lines, 1):
        # Look for template literal started with backtick but closed with single quote
        if '`${API_BASE}' in line and line.count('`') % 2 != 0:
            print(f"{f.name}:{i} => {line.strip()}")

print("Scan complete.")
