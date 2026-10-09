from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('=== BACKFILL MISSING PROFILES ===\n')

# Get all auth users
print('Step 1: Getting all auth users...')
auth_response = supabase.auth.admin.list_users()
print(f'Found {len(auth_response)} auth users\n')

# Get all existing profiles
print('Step 2: Getting existing profiles...')
profile_response = supabase.table('users').select('id').execute()
existing_profile_ids = set(p['id'] for p in profile_response.data)
print(f'Found {len(existing_profile_ids)} existing profiles\n')

# Find missing profiles
print('Step 3: Identifying missing profiles...')
missing_count = 0
backfilled = 0
errors = 0

for user in auth_response:
    user_id = str(user.id)
    
    if user_id not in existing_profile_ids:
        missing_count += 1
        print(f'\n→ Missing profile for: {user.email}')
        print(f'   UUID: {user_id}')
        print(f'   Metadata: {user.user_metadata}')
        
        # Extract data from metadata with fallbacks
        metadata = user.user_metadata or {}
        name = metadata.get('full_name') or metadata.get('name') or user.email.split('@')[0].title()
        age = metadata.get('age', 25)
        cycle_length = metadata.get('cycle_length', 28)
        last_period_date = metadata.get('last_period_date')
        
        # Try to convert age and cycle_length to integers
        try:
            age = int(age)
        except:
            age = 25
        
        try:
            cycle_length = int(cycle_length)
        except:
            cycle_length = 28
        
        print(f'   Creating profile with:')
        print(f'   - Name: {name}')
        print(f'   - Age: {age}')
        print(f'   - Cycle Length: {cycle_length}')
        
        # Insert profile
        try:
            insert_response = supabase.table('users').insert({
                'id': user_id,
                'email': user.email,
                'name': name,
                'age': age,
                'cycle_length': cycle_length,
                'last_period_date': last_period_date
            }).execute()
            
            if insert_response.data:
                print(f'   ✓ Profile created successfully')
                backfilled += 1
            else:
                print(f'   ✗ Failed to create profile')
                errors += 1
        except Exception as e:
            print(f'   ✗ Error creating profile: {e}')
            errors += 1

print(f'\n=== BACKFILL SUMMARY ===')
print(f'Total auth users: {len(auth_response)}')
print(f'Existing profiles (before): {len(existing_profile_ids)}')
print(f'Missing profiles found: {missing_count}')
print(f'Profiles backfilled: {backfilled}')
print(f'Errors: {errors}')

if backfilled > 0:
    print(f'\n✓ Backfill complete! {backfilled} profile(s) created.')
elif missing_count == 0:
    print(f'\n✓ No missing profiles. All auth users have profiles.')
else:
    print(f'\n⚠ Some profiles could not be created. Check errors above.')
