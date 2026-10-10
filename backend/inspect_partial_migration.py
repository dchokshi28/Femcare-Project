from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('=== INSPECTING PARTIAL MIGRATION STATE ===\n')

# Check 1: Does provider_id column exist?
print('1. Checking provider_id column...')
try:
    result = supabase.table('bookings').select('provider_id').limit(1).execute()
    print('   ✓ provider_id column EXISTS')
    provider_id_exists = True
    
    # Check current values
    all_bookings = supabase.table('bookings').select('id, provider_id, hospital_name, appointment_date, appointment_slot, status').execute()
    print(f'\n   Current bookings ({len(all_bookings.data)}):')
    for b in all_bookings.data:
        pid = b.get('provider_id') or 'NULL'
        print(f'     - {b.get("id")[:8]}... | provider_id: {pid} | hospital: {b.get("hospital_name")} | status: {b.get("status")}')
    
    # Count problematic provider_ids
    null_count = len([b for b in all_bookings.data if not b.get('provider_id')])
    unknown_count = len([b for b in all_bookings.data if b.get('provider_id') == 'unknown'])
    empty_count = len([b for b in all_bookings.data if b.get('provider_id') == ''])
    
    print(f'\n   NULL provider_id: {null_count}')
    print(f'   "unknown" provider_id: {unknown_count}')
    print(f'   Empty provider_id: {empty_count}')
    
except Exception as e:
    if 'does not exist' in str(e).lower() or '42703' in str(e):
        print('   ✗ provider_id column DOES NOT EXIST')
        provider_id_exists = False
    else:
        print(f'   ? Cannot determine: {e}')
        provider_id_exists = False

# Check 2: Does unique_active_booking_slot index exist?
print('\n2. Checking unique_active_booking_slot index...')
# Cannot check indexes via Supabase API directly, but we can try to create duplicates
try:
    # Try to query - if unique constraint exists, we can't test via API
    print('   (Cannot check index existence via Supabase API)')
    print('   Must verify manually or attempt to create duplicate')
    unique_index_exists = 'UNKNOWN'
except Exception as e:
    print(f'   Error: {e}')
    unique_index_exists = 'UNKNOWN'

# Check 3: Do availability functions exist?
print('\n3. Checking get_available_slots function...')
try:
    result = supabase.rpc('get_available_slots', {
        'p_provider_id': 'vadodara-1',
        'p_date': '2026-09-02'
    }).execute()
    print('   ✓ get_available_slots function EXISTS')
    availability_function_exists = True
except Exception as e:
    if 'function' in str(e).lower() or '42883' in str(e):
        print('   ✗ get_available_slots function DOES NOT EXIST')
        availability_function_exists = False
    else:
        print(f'   ? Cannot determine: {e}')
        availability_function_exists = False

print('\n4. Checking get_booking_stats function...')
try:
    result = supabase.rpc('get_booking_stats', {
        'p_provider_id': 'vadodara-1',
        'p_date': '2026-09-02'
    }).execute()
    print('   ✓ get_booking_stats function EXISTS')
    stats_function_exists = True
except Exception as e:
    if 'function' in str(e).lower() or '42883' in str(e):
        print('   ✗ get_booking_stats function DOES NOT EXIST')
        stats_function_exists = False
    else:
        print(f'   ? Cannot determine: {e}')
        stats_function_exists = False

# Check 4: Find duplicate active bookings
print('\n5. Checking for duplicate active bookings...')
if provider_id_exists:
    try:
        all_confirmed = supabase.table('bookings').select('*').eq('status', 'confirmed').execute()
        
        # Group by provider_id + date + slot
        slot_map = {}
        for b in all_confirmed.data:
            pid = b.get('provider_id') or 'NULL'
            date = b.get('appointment_date')
            slot = b.get('appointment_slot')
            key = f"{pid}|{date}|{slot}"
            
            if key in slot_map:
                slot_map[key].append(b)
            else:
                slot_map[key] = [b]
        
        duplicates = {k: v for k, v in slot_map.items() if len(v) > 1}
        
        if duplicates:
            print(f'   ⚠ Found {len(duplicates)} duplicate slot combinations:')
            for key, bookings_list in duplicates.items():
                pid, date, slot = key.split('|')
                print(f'     - provider:{pid} | {date} | {slot} → {len(bookings_list)} bookings')
                for b in bookings_list:
                    print(f'       · {b.get("id")[:8]}... | user:{b.get("user_id")[:8]}... | created:{b.get("created_at")}')
        else:
            print('   ✓ No duplicate active bookings found')
            
    except Exception as e:
        print(f'   Error checking duplicates: {e}')
else:
    print('   (Skipped - provider_id column does not exist)')

print('\n' + '='*60)
print('SUMMARY')
print('='*60)
print(f'provider_id column: {"EXISTS" if provider_id_exists else "MISSING"}')
print(f'unique_active_booking_slot index: {unique_index_exists}')
print(f'get_available_slots function: {"EXISTS" if availability_function_exists else "MISSING"}')
print(f'get_booking_stats function: {"EXISTS" if stats_function_exists else "MISSING"}')

if provider_id_exists:
    print(f'\nProblematic Records:')
    print(f'  NULL provider_id: {null_count}')
    print(f'  "unknown" provider_id: {unknown_count}')
    print(f'  Empty provider_id: {empty_count}')
    
    if duplicates:
        print(f'  Duplicate active slots: {len(duplicates)}')
    else:
        print(f'  Duplicate active slots: 0')
