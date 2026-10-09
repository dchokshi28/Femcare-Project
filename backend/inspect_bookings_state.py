from supabase import create_client
import os
from dotenv import load_dotenv
import json

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('=== STEP 1: INSPECT EXISTING BOOKINGS ===\n')

# Get all bookings
try:
    response = supabase.table('bookings').select('*').execute()
    bookings = response.data
    
    print(f'Total Bookings: {len(bookings)}\n')
    
    if bookings:
        print('Existing Bookings:')
        print('-' * 120)
        for b in bookings:
            print(f"ID: {b.get('id')}")
            print(f"  User ID: {b.get('user_id')}")
            print(f"  Provider ID: {b.get('provider_id', 'NOT SET')}")
            print(f"  Hospital Name: {b.get('hospital_name')}")
            print(f"  Date: {b.get('appointment_date')}")
            print(f"  Slot: {b.get('appointment_slot')}")
            print(f"  Status: {b.get('status')}")
            print()
    
    # Find problematic provider_ids
    print('\n=== PROBLEMATIC PROVIDER IDS ===\n')
    
    null_or_unknown = [b for b in bookings if not b.get('provider_id') or b.get('provider_id') in ['unknown', '']]
    print(f'Bookings with NULL/unknown/empty provider_id: {len(null_or_unknown)}')
    
    if null_or_unknown:
        print('\nDetails:')
        for b in null_or_unknown:
            print(f"  {b.get('id')}: {b.get('hospital_name')} | {b.get('appointment_date')} | {b.get('appointment_slot')}")
    
    # Find duplicates among confirmed bookings
    print('\n=== DUPLICATE ACTIVE SLOTS ===\n')
    
    confirmed = [b for b in bookings if b.get('status') == 'confirmed']
    slot_map = {}
    
    for b in confirmed:
        pid = b.get('provider_id', 'unknown')
        date = b.get('appointment_date')
        slot = b.get('appointment_slot')
        key = f"{pid}|{date}|{slot}"
        
        if key in slot_map:
            slot_map[key].append(b)
        else:
            slot_map[key] = [b]
    
    duplicates = {k: v for k, v in slot_map.items() if len(v) > 1}
    
    if duplicates:
        print(f'Found {len(duplicates)} duplicate slot combinations:')
        for key, bookings_list in duplicates.items():
            pid, date, slot = key.split('|')
            print(f'\n  Provider: {pid} | Date: {date} | Slot: {slot}')
            print(f'  {len(bookings_list)} bookings:')
            for b in bookings_list:
                print(f'    - ID: {b.get("id")} | Hospital: {b.get("hospital_name")} | User: {b.get("user_id")[:8]}...')
    else:
        print('No duplicate active slots found')
    
except Exception as e:
    print(f'Error fetching bookings: {e}')

print('\n=== STEP 2: CHECK WHAT EXISTS IN DATABASE ===\n')

# Check if provider_id column exists
try:
    # Try to select provider_id
    response = supabase.table('bookings').select('provider_id').limit(1).execute()
    print('✓ provider_id column EXISTS')
    has_provider_id = True
except Exception as e:
    if 'Could not find' in str(e) or 'column' in str(e).lower():
        print('✗ provider_id column DOES NOT EXIST')
        has_provider_id = False
    else:
        print(f'? Cannot determine if provider_id exists: {e}')
        has_provider_id = False

# Check if unique constraint exists
print('\nChecking unique constraint...')
print('(Cannot check via Python - must verify in Supabase dashboard)')

# Check if functions exist
print('\nChecking database functions...')
print('(Cannot check via Python - must verify in Supabase dashboard)')

print('\n=== STEP 3: INSPECT FIND CARE PROVIDERS ===\n')
print('Provider data from FindCare.jsx:')
print('(Checking frontend code...)')

# Read the FindCare component
try:
    with open('../frontend/src/pages/FindCare.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Look for provider definitions
    if 'vadodara-1' in content:
        print('✓ Found provider IDs: vadodara-1, vadodara-2, etc.')
        print('  These are stable IDs used in the frontend')
    
    # Extract provider names
    import re
    names = re.findall(r"name:\s*'([^']+)'", content)
    if names:
        print(f'\n  Providers found: {len(names)}')
        for i, name in enumerate(names[:5], 1):
            print(f'    {i}. {name}')
        if len(names) > 5:
            print(f'    ... and {len(names) - 5} more')
            
except Exception as e:
    print(f'Error reading FindCare.jsx: {e}')

print('\n=== SUMMARY ===\n')
print(f'Existing Bookings: {len(bookings) if bookings else 0}')
print(f'Bookings With NULL/Unknown Provider: {len(null_or_unknown) if null_or_unknown else 0}')
print(f'Duplicate Active Slots: {len(duplicates) if duplicates else 0}')
print(f'provider_id Column Exists: {"YES" if has_provider_id else "NO"}')
print('\nNext: Determine provider mapping strategy')
