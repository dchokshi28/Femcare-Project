import pathlib

files = [
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\Posts.jsx',
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\context\AuthContext.jsx',
    r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\Quiz.jsx',
]

for fpath in files:
    p = pathlib.Path(fpath)
    if not p.exists():
        print(f"SKIP: {fpath}")
        continue
    content = p.read_text(encoding='utf-8')
    if "from '../lib/api'" not in content and 'from "../lib/api"' not in content:
        # Insert after first import line
        lines = content.split('\n')
        insert_at = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_at = i + 1
        lines.insert(insert_at, "import { API_BASE } from '../lib/api';")
        p.write_text('\n'.join(lines), encoding='utf-8')
        print(f"Added import: {p.name}")
    else:
        print(f"Import already exists: {p.name}")

print("Done.")
