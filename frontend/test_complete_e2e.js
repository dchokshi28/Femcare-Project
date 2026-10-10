import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_USER_ID = 'c3cac5cf-8118-4c61-a879-60621e3aab6e';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const results = {
  passed: [],
  failed: [],
  skipped: []
};

function logTest(name, status, details = '') {
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${symbol} ${name}: ${status}`);
  if (details) console.log(`   ${details}`);
  
  if (status === 'PASS') results.passed.push(name);
  else if (status === 'FAIL') results.failed.push(name);
  else results.skipped.push(name);
}

async function testDatabaseConnection() {
  console.log('\n🔍 STEP 1: DATABASE CONNECTION\n');
  
  try {
    const { data, error } = await supabase.from('periods').select('count');
    if (error) throw error;
    logTest('Supabase Connection', 'PASS');
    return true;
  } catch (error) {
    logTest('Supabase Connection', 'FAIL', error.message);
    return false;
  }
}

async function testTablesExist() {
  console.log('\n🔍 STEP 2: VERIFY TABLES EXIST\n');
  
  const tables = ['periods', 'symptoms', 'cycle_history', 'users'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(0);
      if (error) throw error;
      logTest(`Table: ${table}`, 'PASS');
    } catch (error) {
      logTest(`Table: ${table}`, 'FAIL', error.message);
    }
  }
}

async function testUserExists() {
  console.log('\n🔍 STEP 3: VERIFY TEST USER\n');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', TEST_USER_ID)
      .single();
    
    if (error) throw error;
    
    if (data) {
      logTest('Test User Exists', 'PASS', `Email: ${data.email}`);
      return true;
    } else {
      logTest('Test User Exists', 'FAIL', 'User not found');
      return false;
    }
  } catch (error) {
    logTest('Test User Exists', 'FAIL', error.message);
    return false;
  }
}

async function testPeriodCRUD() {
  console.log('\n🔍 STEP 4: TEST PERIOD CRUD OPERATIONS\n');
  
  let testPeriodId = null;
  
  // CREATE
  try {
    const { data, error } = await supabase
      .from('periods')
      .insert({
        user_id: TEST_USER_ID,
        start_date: '2025-02-01',
        end_date: '2025-02-05',
        flow: 'Medium',
        notes: 'E2E Test Period'
      })
      .select()
      .single();
    
    if (error) throw error;
    testPeriodId = data.id;
    logTest('Create Period', 'PASS', `ID: ${testPeriodId}`);
  } catch (error) {
    logTest('Create Period', 'FAIL', error.message);
  }
  
  // READ
  if (testPeriodId) {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('id', testPeriodId)
        .single();
      
      if (error) throw error;
      logTest('Read Period', 'PASS', `Flow: ${data.flow}`);
    } catch (error) {
      logTest('Read Period', 'FAIL', error.message);
    }
    
    // UPDATE
    try {
      const { data, error } = await supabase
        .from('periods')
        .update({ flow: 'Heavy', notes: 'Updated via E2E test' })
        .eq('id', testPeriodId)
        .select()
        .single();
      
      if (error) throw error;
      logTest('Update Period', 'PASS', `New flow: ${data.flow}`);
    } catch (error) {
      logTest('Update Period', 'FAIL', error.message);
    }
    
    // DELETE
    try {
      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('id', testPeriodId);
      
      if (error) throw error;
      logTest('Delete Period', 'PASS');
    } catch (error) {
      logTest('Delete Period', 'FAIL', error.message);
    }
  } else {
    logTest('Read Period', 'SKIP', 'No period to read');
    logTest('Update Period', 'SKIP', 'No period to update');
    logTest('Delete Period', 'SKIP', 'No period to delete');
  }
}

async function testSymptomCRUD() {
  console.log('\n🔍 STEP 5: TEST SYMPTOM CRUD OPERATIONS\n');
  
  let testSymptomId = null;
  
  // CREATE
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .insert({
        user_id: TEST_USER_ID,
        symptom_date: '2025-02-01',
        symptom_name: 'Cramps',
        severity: 'Moderate',
        notes: 'E2E Test Symptom'
      })
      .select()
      .single();
    
    if (error) throw error;
    testSymptomId = data.id;
    logTest('Create Symptom', 'PASS', `ID: ${testSymptomId}`);
  } catch (error) {
    logTest('Create Symptom', 'FAIL', error.message);
  }
  
  // READ
  if (testSymptomId) {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('id', testSymptomId)
        .single();
      
      if (error) throw error;
      logTest('Read Symptom', 'PASS', `Name: ${data.symptom_name}`);
    } catch (error) {
      logTest('Read Symptom', 'FAIL', error.message);
    }
    
    // UPDATE
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .update({ severity: 'Severe', notes: 'Updated via E2E test' })
        .eq('id', testSymptomId)
        .select()
        .single();
      
      if (error) throw error;
      logTest('Update Symptom', 'PASS', `New severity: ${data.severity}`);
    } catch (error) {
      logTest('Update Symptom', 'FAIL', error.message);
    }
    
    // DELETE
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', testSymptomId);
      
      if (error) throw error;
      logTest('Delete Symptom', 'PASS');
    } catch (error) {
      logTest('Delete Symptom', 'FAIL', error.message);
    }
  } else {
    logTest('Read Symptom', 'SKIP', 'No symptom to read');
    logTest('Update Symptom', 'SKIP', 'No symptom to update');
    logTest('Delete Symptom', 'SKIP', 'No symptom to delete');
  }
}

async function testCycleHistoryCalculation() {
  console.log('\n🔍 STEP 6: TEST CYCLE HISTORY CALCULATION\n');
  
  let period1Id, period2Id;
  
  try {
    // Create first period
    const { data: p1, error: e1 } = await supabase
      .from('periods')
      .insert({
        user_id: TEST_USER_ID,
        start_date: '2025-01-01',
        end_date: '2025-01-05',
        flow: 'Medium'
      })
      .select()
      .single();
    
    if (e1) throw e1;
    period1Id = p1.id;
    logTest('Create Period 1', 'PASS');
    
    // Wait a moment for trigger
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if cycle_history was created
    const { data: ch1 } = await supabase
      .from('cycle_history')
      .select('*')
      .eq('period_id', period1Id);
    
    if (ch1 && ch1.length > 0) {
      logTest('Cycle History Auto-Created', 'PASS', `Period length: ${ch1[0].period_length} days`);
    } else {
      logTest('Cycle History Auto-Created', 'FAIL', 'No cycle history record');
    }
    
    // Create second period
    const { data: p2, error: e2 } = await supabase
      .from('periods')
      .insert({
        user_id: TEST_USER_ID,
        start_date: '2025-01-29',
        end_date: '2025-02-03',
        flow: 'Medium'
      })
      .select()
      .single();
    
    if (e2) throw e2;
    period2Id = p2.id;
    logTest('Create Period 2', 'PASS');
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check cycle length calculation
    const { data: ch2 } = await supabase
      .from('cycle_history')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('cycle_start_date', '2025-01-01');
    
    if (ch2 && ch2.length > 0 && ch2[0].cycle_length) {
      logTest('Cycle Length Calculation', 'PASS', `Cycle length: ${ch2[0].cycle_length} days`);
    } else {
      logTest('Cycle Length Calculation', 'FAIL', 'Cycle length not calculated');
    }
    
    // Cleanup
    await supabase.from('periods').delete().eq('id', period1Id);
    await supabase.from('periods').delete().eq('id', period2Id);
    
  } catch (error) {
    logTest('Cycle History Test', 'FAIL', error.message);
  }
}

async function testRLS() {
  console.log('\n🔍 STEP 7: TEST ROW LEVEL SECURITY\n');
  
  try {
    // Create anon client (no service role)
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to access periods without auth (should fail or return empty)
    const { data, error } = await anonClient
      .from('periods')
      .select('*')
      .limit(10);
    
    // RLS should block or return no data
    if ((!data || data.length === 0) || error) {
      logTest('RLS Protection', 'PASS', 'Unauthenticated access blocked/empty');
    } else {
      logTest('RLS Protection', 'FAIL', `Returned ${data.length} rows without auth`);
    }
  } catch (error) {
    logTest('RLS Protection', 'PASS', 'Access denied as expected');
  }
}

async function testBackendHealth() {
  console.log('\n🔍 STEP 8: TEST BACKEND HEALTH\n');
  
  try {
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      const data = await response.json();
      logTest('Backend Health Check', 'PASS', `Model loaded: ${data.model_loaded}`);
    } else {
      logTest('Backend Health Check', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Backend Health Check', 'FAIL', error.message);
  }
}

async function testFrontendAvailable() {
  console.log('\n🔍 STEP 9: TEST FRONTEND AVAILABILITY\n');
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      logTest('Frontend Available', 'PASS');
    } else {
      logTest('Frontend Available', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Frontend Available', 'FAIL', error.message);
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('        FEMCARE END-TO-END INTEGRATION TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  await testDatabaseConnection();
  await testTablesExist();
  await testUserExists();
  await testPeriodCRUD();
  await testSymptomCRUD();
  await testCycleHistoryCalculation();
  await testRLS();
  await testBackendHealth();
  await testFrontendAvailable();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ PASSED: ${results.passed.length}`);
  console.log(`❌ FAILED: ${results.failed.length}`);
  console.log(`⏭️  SKIPPED: ${results.skipped.length}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (results.failed.length > 0) {
    console.log('FAILED TESTS:');
    results.failed.forEach(test => console.log(`  ❌ ${test}`));
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
