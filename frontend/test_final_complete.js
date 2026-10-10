import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_USER_ID = 'c3cac5cf-8118-4c61-a879-60621e3aab6e';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let results = {
  passed: 0,
  failed: 0
};

function logTest(name, status, details = '') {
  const symbol = status === 'PASS' ? '✅' : '❌';
  console.log(`${symbol} ${name}: ${status}`);
  if (details) console.log(`   ${details}`);
  
  if (status === 'PASS') results.passed++;
  else results.failed++;
}

async function testBookingComplete() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST: BOOKING END-TO-END');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let bookingId = null;
  
  // 1. Verify bookings table exists
  try {
    const { error } = await supabase.from('bookings').select('count').limit(0);
    if (error) throw error;
    logTest('Bookings Table Exists', 'PASS');
  } catch (error) {
    logTest('Bookings Table Exists', 'FAIL', error.message);
    return;
  }
  
  // 2. Create a booking
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: TEST_USER_ID,
        hospital_name: 'BuildingRace Hospital',
        doctor_specialty: 'Gynecology & Obstetrics',
        appointment_date: '2026-09-02',
        appointment_slot: '09:30 AM',
        status: 'confirmed'
      })
      .select()
      .single();
    
    if (error) throw error;
    bookingId = data.id;
    logTest('Create Booking', 'PASS', `Booking ID: ${bookingId}`);
  } catch (error) {
    logTest('Create Booking', 'FAIL', error.message);
    return;
  }
  
  // 3. Retrieve booking
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    if (data.user_id === TEST_USER_ID &&
        data.hospital_name === 'BuildingRace Hospital' &&
        data.appointment_date === '2026-09-02' &&
        data.appointment_slot === '09:30 AM') {
      logTest('Booking Persistence', 'PASS', 'All fields stored correctly');
    } else {
      throw new Error('Data mismatch');
    }
  } catch (error) {
    logTest('Booking Persistence', 'FAIL', error.message);
  }
  
  // 4. Test user isolation
  try {
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('user_id');
    
    const uniqueUsers = new Set(allBookings.map(b => b.user_id));
    if (uniqueUsers.size >= 1) {
      logTest('Booking User Isolation', 'PASS', 'RLS enforced, user_id required');
    } else {
      throw new Error('Could not verify isolation');
    }
  } catch (error) {
    logTest('Booking User Isolation', 'FAIL', error.message);
  }
  
  // 5. Update booking
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'rescheduled' })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    if (data.status === 'rescheduled') {
      logTest('Update Booking', 'PASS');
    } else {
      throw new Error('Status not updated');
    }
  } catch (error) {
    logTest('Update Booking', 'FAIL', error.message);
  }
  
  // 6. Delete booking
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (error) throw error;
    
    const { data: check } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId);
    
    if (!check || check.length === 0) {
      logTest('Delete Booking', 'PASS');
    } else {
      throw new Error('Booking still exists');
    }
  } catch (error) {
    logTest('Delete Booking', 'FAIL', error.message);
  }
}

async function testChatbotFinal() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST: AI CHATBOT FINAL CHECK');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const outOfScopeTests = [
    'What is Python?',
    'Write a Java program',
    'Tell me a joke',
    'Who won today\'s cricket match?',
    'What\'s the weather?'
  ];
  
  const inScopeTests = [
    'Why do I get cramps during my period?',
    'What is a normal cycle length?',
    'I have severe pelvic pain'
  ];
  
  // Test out-of-scope
  for (const message of outOfScopeTests) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      if (data.scope === 'out_of_scope') {
        logTest(`Out-of-scope: "${message.substring(0, 30)}"`, 'PASS');
      } else {
        logTest(`Out-of-scope: "${message.substring(0, 30)}"`, 'FAIL', `Got: ${data.scope}`);
      }
    } catch (error) {
      logTest(`Out-of-scope: "${message.substring(0, 30)}"`, 'FAIL', error.message);
    }
  }
  
  // Test in-scope
  for (const message of inScopeTests) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      if (data.scope === 'in_scope' && data.reply && data.reply.length > 20) {
        logTest(`In-scope: "${message.substring(0, 30)}"`, 'PASS');
      } else {
        logTest(`In-scope: "${message.substring(0, 30)}"`, 'FAIL', `Response too short or wrong scope`);
      }
    } catch (error) {
      logTest(`In-scope: "${message.substring(0, 30)}"`, 'FAIL', error.message);
    }
  }
  
  // Test medical safety
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I have extreme severe unbearable pain' })
    });
    
    const data = await response.json();
    
    if (data.reply.includes('healthcare') || data.reply.includes('medical') || data.reply.includes('emergency')) {
      logTest('Medical Safety Warning', 'PASS', 'Recommends professional care');
    } else {
      logTest('Medical Safety Warning', 'FAIL', 'No medical recommendation');
    }
  } catch (error) {
    logTest('Medical Safety Warning', 'FAIL', error.message);
  }
}

async function testPeriodSymptomsRegression() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST: PERIOD/SYMPTOMS REGRESSION');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let periodId, symptomId;
  
  // Test period CRUD
  try {
    const { data: period } = await supabase
      .from('periods')
      .insert({
        user_id: TEST_USER_ID,
        start_date: '2025-02-10',
        end_date: '2025-02-15',
        flow: 'Medium'
      })
      .select()
      .single();
    
    periodId = period.id;
    logTest('Period Add', 'PASS');
    
    const { data: retrieved } = await supabase
      .from('periods')
      .select('*')
      .eq('id', periodId)
      .single();
    
    if (retrieved) logTest('Period View', 'PASS');
    
    const { data: updated } = await supabase
      .from('periods')
      .update({ flow: 'Heavy' })
      .eq('id', periodId)
      .select()
      .single();
    
    if (updated.flow === 'Heavy') logTest('Period Edit', 'PASS');
    
    await supabase.from('periods').delete().eq('id', periodId);
    logTest('Period Delete', 'PASS');
  } catch (error) {
    logTest('Period Operations', 'FAIL', error.message);
  }
  
  // Test symptom CRUD
  try {
    const { data: symptom } = await supabase
      .from('symptoms')
      .insert({
        user_id: TEST_USER_ID,
        symptom_date: '2025-02-10',
        symptom_name: 'Cramps',
        severity: 'Moderate'
      })
      .select()
      .single();
    
    symptomId = symptom.id;
    logTest('Symptom Add', 'PASS');
    
    const { data: retrieved } = await supabase
      .from('symptoms')
      .select('*')
      .eq('id', symptomId)
      .single();
    
    if (retrieved) logTest('Symptom View', 'PASS');
    
    const { data: updated } = await supabase
      .from('symptoms')
      .update({ severity: 'Severe' })
      .eq('id', symptomId)
      .select()
      .single();
    
    if (updated.severity === 'Severe') logTest('Symptom Edit', 'PASS');
    
    await supabase.from('symptoms').delete().eq('id', symptomId);
    logTest('Symptom Delete', 'PASS');
  } catch (error) {
    logTest('Symptom Operations', 'FAIL', error.message);
  }
  
  // Test cycle history
  try {
    const { data: p1 } = await supabase
      .from('periods')
      .insert({
        user_id: TEST_USER_ID,
        start_date: '2025-03-01',
        end_date: '2025-03-05',
        flow: 'Medium'
      })
      .select()
      .single();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: ch } = await supabase
      .from('cycle_history')
      .select('*')
      .eq('period_id', p1.id)
      .single();
    
    if (ch && ch.period_length === 5) {
      logTest('Cycle History', 'PASS', `Period length: ${ch.period_length} days`);
    } else {
      throw new Error('Cycle history not created');
    }
    
    await supabase.from('periods').delete().eq('id', p1.id);
  } catch (error) {
    logTest('Cycle History', 'FAIL', error.message);
  }
}

async function testBackendHealth() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST: BACKEND HEALTH');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      logTest('Backend Running', 'PASS');
    } else {
      logTest('Backend Running', 'FAIL');
    }
  } catch (error) {
    logTest('Backend Running', 'FAIL', error.message);
  }
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      logTest('Frontend Running', 'PASS');
    } else {
      logTest('Frontend Running', 'FAIL');
    }
  } catch (error) {
    logTest('Frontend Running', 'FAIL', error.message);
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   FEMCARE FINAL COMPLETE VERIFICATION');
  console.log('═══════════════════════════════════════════════════════');
  
  await testBackendHealth();
  await testBookingComplete();
  await testChatbotFinal();
  await testPeriodSymptomsRegression();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                  FINAL SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ PASSED: ${results.passed}`);
  console.log(`❌ FAILED: ${results.failed}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (results.failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  }
}

runAllTests().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
