import pathlib, re

files = [
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\FindCare.jsx',
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\context\AuthContext.jsx',
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\Posts.jsx',
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\Quiz.jsx',
]

for fpath in files:
    p = pathlib.Path(fpath)
    if not p.exists():
        print(f'SKIP (not found): {fpath}')
        continue
    content = p.read_text(encoding='utf-8')
    # Replace quoted localhost:5000 with template literal using API_BASE
    new_content = re.sub(r"['\"]http://localhost:5000", "`${API_BASE}", content)
    if content != new_content:
        p.write_text(new_content, encoding='utf-8')
        print(f'FIXED: {p.name}')
    else:
        print(f'NO CHANGE: {p.name}')

print("Done.")
