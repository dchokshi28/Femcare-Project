from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

USER_ID = '34140a75-b002-47f1-a1cb-47284a76315d'

print('=== CHECKING USER PROFILE ===\n')

# Check auth.users
print('1. AUTH.USERS:')
try:
    auth_response = supabase.auth.admin.list_users()
    total_users = len(auth_response)
    print(f'   Total auth users: {total_users}')
    
    user = next((u for u in auth_response if str(u.id) == USER_ID), None)
    
    if user:
        print(f'   ✓ User found in auth.users')
        print(f'   Email: {user.email}')
        print(f'   Created: {user.created_at}')
        print(f'   Email confirmed: {user.email_confirmed_at}')
        print(f'   Metadata: {user.user_metadata}')
    else:
        print(f'   ✗ User NOT found in auth.users')
except Exception as e:
    print(f'   Error: {e}')

print('\n2. PUBLIC.USERS:')
try:
    profile_response = supabase.table('users').select('*').eq('id', USER_ID).execute()
    
    if len(profile_response.data) > 0:
        print(f'   ✓ Profile exists in public.users')
        print(f'   Profile data: {profile_response.data[0]}')
    else:
        print(f'   ✗ Profile NOT found in public.users')
        print(f'   This is the problem!')
except Exception as e:
    print(f'   Error: {e}')

print('\n3. ALL AUTH USERS vs PUBLIC.USERS:')
try:
    auth_response = supabase.auth.admin.list_users()
    auth_ids = set(str(u.id) for u in auth_response)
    
    profile_response = supabase.table('users').select('id').execute()
    profile_ids = set(p['id'] for p in profile_response.data)
    
    missing = auth_ids - profile_ids
    
    print(f'   Auth users: {len(auth_ids)}')
    print(f'   Profile records: {len(profile_ids)}')
    print(f'   Missing profiles: {len(missing)}')
    
    if missing:
        print(f'\n   Users missing profiles:')
        for missing_id in missing:
            user = next((u for u in auth_response if str(u.id) == missing_id), None)
            if user:
                print(f'   - {user.email} ({missing_id})')
except Exception as e:
    print(f'   Error: {e}')

print('\n4. CHECK TRIGGER:')
try:
    trigger_response = supabase.rpc('exec_sql', {
        'sql': "SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created'"
    }).execute()
    print(f'   Query result: {trigger_response}')
except Exception as e:
    # RPC might not exist, check differently
    print(f'   Cannot check trigger via RPC (this is OK)')

print('\n=== DIAGNOSIS ===')
print('If user exists in auth.users but NOT in public.users:')
print('→ Trigger did not fire OR failed')
print('→ User was created before trigger was added')
print('→ Need to backfill missing profiles')
