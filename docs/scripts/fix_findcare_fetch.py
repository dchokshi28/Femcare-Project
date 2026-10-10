import pathlib, re

p = pathlib.Path(r'c:\Users\Siddhi\Desktop\Fem\Femcare-Project\ai-women-reproductive-health-main\frontend\src\pages\FindCare.jsx')
content = p.read_text(encoding='utf-8')

# Find all raw fetch calls and replace with apiFetch pattern
# Pattern: const response = await fetch(`${API_BASE}/api/...`, { method, headers, body })
# Replace: const { data: respData, error: respError } = await apiFetch(...)

# Count raw fetch calls still present
raw_fetches = re.findall(r'await fetch\(`\$\{API_BASE\}', content)
print(f"Raw fetch calls found: {len(raw_fetches)}")

# Replace each fetch call with apiFetch (remove headers since apiFetch adds them)
# Pattern 1: booking endpoints with auth header
content = re.sub(
    r"const response = await fetch\(`\$\{API_BASE\}(/api/[^`]+)`\s*,\s*\{[^}]*'Content-Type':\s*'application/json'[^}]*\}\s*\)\s*;\s*\n\s*(?:const data = await response\.json\(\);|if \(response\.ok\))",
    lambda m: m.group(0),  # keep as-is for now, we'll handle individually
    content
)

# More targeted: fix the response.json() calls that can crash
# Replace: const data = await response.json()  ->  safe version
content = content.replace(
    "const data = await response.json();\n        const slotsArr = data.slots",
    "if (!response.ok) { setAvailability(new Set()); setStats({ total_slots: 16, booked_slots: 0, available_slots: 16 }); return; }\n        const data = await response.json();\n        const slotsArr = (data && data.slots)"
)

# Fix book-appointment response parsing
old_book = '''      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Booking failed');
      }

      const data = await response.json();'''

new_book = '''      if (!response.ok) {
        let errMsg = 'Booking failed';
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const errBody = await response.json();
            errMsg = errBody.detail || errBody.error || errMsg;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Server returned an unexpected response. Please try again.');
      }
      const data = await response.json();'''

content = content.replace(old_book, new_book)

# Fix cancel response parsing
old_cancel = '''      if (response.ok) {
        const data = await response.json();'''
new_cancel = '''      if (response.ok) {
        let data = {};
        try { const ct2 = response.headers.get('content-type')||''; if(ct2.includes('application/json')) data = await response.json(); } catch {}'''
content = content.replace(old_cancel, new_cancel)

p.write_text(content, encoding='utf-8')
print("FindCare.jsx patched for safe JSON parsing")
