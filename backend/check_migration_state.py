from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('=== CHECKING MIGRATION STATE ===\n')

# The migration failed at the unique index creation
# But some earlier parts may have been applied

# Check 1: Does provider_id column exist?
print('1. provider_id column:')
try:
    result = supabase.table('bookings').select('provider_id').limit(1).execute()
    print('   ✓ EXISTS')
    
    # Check if it has data
    all_bookings = supabase.table('bookings').select('provider_id').execute()
    provider_ids = [b.get('provider_id') for b in all_bookings.data]
    unique_ids = set(provider_ids)
    print(f'   Values: {unique_ids}')
except Exception as e:
    if 'Could not find' in str(e):
        print('   ✗ DOES NOT EXIST')
    else:
        print(f'   ? Error: {e}')

# Check 2: Does appointment_time column exist?
print('\n2. appointment_time column:')
try:
    result = supabase.table('bookings').select('appointment_time').limit(1).execute()
    print('   ✓ EXISTS')
except Exception as e:
    if 'Could not find' in str(e):
        print('   ✗ DOES NOT EXIST')
    else:
        print(f'   ? Error: {e}')

# Check 3: List all columns that exist
print('\n3. All columns in bookings table:')
try:
    result = supabase.table('bookings').select('*').limit(1).execute()
    if result.data and len(result.data) > 0:
        columns = list(result.data[0].keys())
        print(f'   Columns: {", ".join(columns)}')
    else:
        print('   (Table empty, checking schema...)')
        # Try to get schema info
        result = supabase.table('bookings').select('*').limit(0).execute()
        print('   Cannot determine columns from empty table')
except Exception as e:
    print(f'   Error: {e}')

print('\n=== CONCLUSION ===')
print('The migration script started to run but failed when creating the unique index.')
print('Reason: Existing bookings have no provider_id set (NULL)')
print('When the script tried to backfill with DEFAULT "unknown", both existing')
print('bookings got provider_id = "unknown", creating a duplicate.')
print('\nThe unique constraint tried to enforce:')
print('  (provider_id, appointment_date, appointment_slot) must be unique')
print('  WHERE status = \'confirmed\'')
print('\nBut we have:')
print('  Booking 1: (unknown, 2026-09-02, 09:30 AM)')
print('  Booking 2: (unknown, 2026-09-02, 09:30 AM)')
print('  → DUPLICATE!')
print('\nSolution:')
print('1. Map existing bookings to REAL provider IDs based on hospital_name')
print('2. BuildingRace Hospital → vadodara-1')
print('3. Then the unique constraint will work because they share the SAME')
print('   real provider, and genuinely ARE duplicates (same user, same slot)')
