from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

print('='*70)
print('TESTING DOUBLE-BOOKING PREVENTION')
print('='*70)

# Get existing user
existing_user = '34140a75-b002-47f1-a1cb-47284a76315d'

# Test 1: Try to create duplicate confirmed booking
print('\n1. TEST: Duplicate confirmed booking (should FAIL)')
print('-'*70)
print('Attempting to book:')
print('  Provider: vadodara-1')
print('  Date: 2026-09-02')
print('  Slot: 09:30 AM')
print('  Status: confirmed')
print('  (This slot already has 1 confirmed booking)')

try:
    result = supabase.table('bookings').insert({
        'user_id': existing_user,
        'provider_id': 'vadodara-1',
        'hospital_name': 'BuildingRace Hospital',
        'doctor_specialty': 'Gynecology',
        'appointment_date': '2026-09-02',
        'appointment_slot': '09:30 AM',
        'status': 'confirmed'
    }).execute()
    
    print('✗ FAIL: Duplicate booking was ALLOWED (index not working)')
    print(f'  Created booking: {result.data[0].get("id")}')
    
    # Clean up
    supabase.table('bookings').delete().eq('id', result.data[0].get('id')).execute()
    
except Exception as e:
    error_msg = str(e)
    if 'unique' in error_msg.lower() or 'duplicate' in error_msg.lower() or '23505' in error_msg:
        print('✓ PASS: Duplicate booking REJECTED by unique constraint')
        print(f'  Error: {error_msg[:100]}...')
    else:
        print(f'? Unexpected error: {error_msg}')

# Test 2: Book a different time slot (should SUCCEED)
print('\n\n2. TEST: Different time slot (should SUCCEED)')
print('-'*70)
print('Attempting to book:')
print('  Provider: vadodara-1')
print('  Date: 2026-09-02')
print('  Slot: 10:00 AM')
print('  Status: confirmed')

try:
    result = supabase.table('bookings').insert({
        'user_id': existing_user,
        'provider_id': 'vadodara-1',
        'hospital_name': 'BuildingRace Hospital',
        'doctor_specialty': 'Gynecology',
        'appointment_date': '2026-09-02',
        'appointment_slot': '10:00 AM',
        'status': 'confirmed'
    }).execute()
    
    print('✓ PASS: Booking ALLOWED (different slot)')
    booking_id = result.data[0].get('id')
    print(f'  Created booking: {booking_id[:8]}...')
    
    # Clean up
    print('  Cleaning up test booking...')
    supabase.table('bookings').delete().eq('id', booking_id).execute()
    
except Exception as e:
    print(f'✗ FAIL: Booking was REJECTED: {e}')

# Test 3: Book same time at different provider (should SUCCEED)
print('\n\n3. TEST: Same time, different provider (should SUCCEED)')
print('-'*70)
print('Attempting to book:')
print('  Provider: vadodara-3 (Sun-Pharma Hospital)')
print('  Date: 2026-09-02')
print('  Slot: 09:30 AM')
print('  Status: confirmed')

try:
    result = supabase.table('bookings').insert({
        'user_id': existing_user,
        'provider_id': 'vadodara-3',
        'hospital_name': 'Sun-Pharma Hospital',
        'doctor_specialty': 'Women Care',
        'appointment_date': '2026-09-02',
        'appointment_slot': '09:30 AM',
        'status': 'confirmed'
    }).execute()
    
    print('✓ PASS: Booking ALLOWED (different provider)')
    booking_id = result.data[0].get('id')
    print(f'  Created booking: {booking_id[:8]}...')
    
    # Clean up
    print('  Cleaning up test booking...')
    supabase.table('bookings').delete().eq('id', booking_id).execute()
    
except Exception as e:
    print(f'✗ FAIL: Booking was REJECTED: {e}')

# Test 4: Cancelled booking doesn't block slot
print('\n\n4. TEST: Cancelled booking allows new confirmed (should SUCCEED)')
print('-'*70)
print('Current state for vadodara-1, 2026-09-02, 09:30 AM:')
print('  - 1 cancelled booking')
print('  - 1 confirmed booking')
print('  Total: 2 bookings, but only 1 confirmed')
print('\nAttempt to create ANOTHER booking will fail (test 1 proved this)')
print('But if we cancel the confirmed one, the slot should become available')

# Get the confirmed booking
confirmed = supabase.table('bookings').select('id').eq('provider_id', 'vadodara-1').eq('appointment_date', '2026-09-02').eq('appointment_slot', '09:30 AM').eq('status', 'confirmed').execute()

if confirmed.data and len(confirmed.data) > 0:
    confirmed_id = confirmed.data[0].get('id')
    print(f'\nCancelling confirmed booking {confirmed_id[:8]}...')
    
    # Cancel it
    supabase.table('bookings').update({'status': 'cancelled'}).eq('id', confirmed_id).execute()
    print('✓ Booking cancelled')
    
    # Now try to create a new confirmed booking
    print('\nAttempting new booking for same slot...')
    try:
        result = supabase.table('bookings').insert({
            'user_id': existing_user,
            'provider_id': 'vadodara-1',
            'hospital_name': 'BuildingRace Hospital',
            'doctor_specialty': 'Gynecology',
            'appointment_date': '2026-09-02',
            'appointment_slot': '09:30 AM',
            'status': 'confirmed'
        }).execute()
        
        print('✓ PASS: New booking ALLOWED after cancellation')
        booking_id = result.data[0].get('id')
        print(f'  Created booking: {booking_id[:8]}...')
        
        # Restore original state
        print('\nRestoring original state...')
        supabase.table('bookings').delete().eq('id', booking_id).execute()
        supabase.table('bookings').update({'status': 'confirmed'}).eq('id', confirmed_id).execute()
        print('✓ State restored')
        
    except Exception as e:
        print(f'✗ FAIL: New booking was REJECTED: {e}')
        # Restore
        supabase.table('bookings').update({'status': 'confirmed'}).eq('id', confirmed_id).execute()
else:
    print('No confirmed booking found to test')

# Test 5: Check availability reflects correct state
print('\n\n5. TEST: Availability function accuracy')
print('-'*70)

try:
    result = supabase.rpc('get_available_slots', {
        'p_provider_id': 'vadodara-1',
        'p_date': '2026-09-02'
    }).execute()
    
    slot_0930 = next((s for s in result.data if s.get('slot_time') == '09:30 AM'), None)
    slot_1000 = next((s for s in result.data if s.get('slot_time') == '10:00 AM'), None)
    
    print('Availability check:')
    print(f'  09:30 AM: available={slot_0930.get("is_available")}, booked={slot_0930.get("booked_count")}')
    print(f'  10:00 AM: available={slot_1000.get("is_available")}, booked={slot_1000.get("booked_count")}')
    
    if not slot_0930.get('is_available') and slot_0930.get('booked_count') == 1:
        print('  ✓ PASS: 09:30 AM correctly marked as booked')
    else:
        print('  ✗ FAIL: 09:30 AM availability incorrect')
    
    if slot_1000.get('is_available') and slot_1000.get('booked_count') == 0:
        print('  ✓ PASS: 10:00 AM correctly marked as available')
    else:
        print('  ✗ FAIL: 10:00 AM availability incorrect')
        
except Exception as e:
    print(f'Error checking availability: {e}')

print('\n' + '='*70)
print('TEST SUMMARY')
print('='*70)
print('All tests completed. Check results above.')
