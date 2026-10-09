from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('=== RUNNING BOOKING ENHANCEMENT MIGRATION ===\n')

# Read the SQL file
with open('../enhance_bookings_schema.sql', 'r') as f:
    sql = f.read()

# Split into individual statements
statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--') and 'SELECT' not in s.upper()[:20]]

success_count = 0
error_count = 0

for i, statement in enumerate(statements, 1):
    if not statement:
        continue
        
    try:
        # Execute using the REST API directly
        print(f'Executing statement {i}...')
        # Most statements need to be executed via SQL
        # Skipping complex ones that need direct SQL access
        print(f'  → Statement {i} prepared (requires Supabase SQL Editor)')
    except Exception as e:
        print(f'  ✗ Error: {e}')
        error_count += 1

print('\n' + '='*50)
print('IMPORTANT: This migration must be run in Supabase SQL Editor')
print('The SQL file is: enhance_bookings_schema.sql')
print('='*50)
print('\nInstructions:')
print('1. Go to Supabase Dashboard → SQL Editor')
print('2. Open enhance_bookings_schema.sql')
print('3. Copy and paste the entire file')
print('4. Click "Run"')
print('5. Verify no errors')
print('\nThis will:')
print('- Add provider_id column')
print('- Create unique constraint for double-booking prevention')
print('- Create availability query functions')
