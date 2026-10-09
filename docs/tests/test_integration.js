/**
 * Integration Test Script
 * Tests period and symptom operations via Supabase API
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  // Test 1: Check periods table
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/periods?select=*&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ periods table accessible');
    } else {
      console.log(`❌ periods table error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ periods table error: ${error.message}`);
  }
  
  // Test 2: Check symptoms table  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/symptoms?select=*&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ symptoms table accessible');
    } else {
      console.log(`❌ symptoms table error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ symptoms table error: ${error.message}`);
  }
  
  // Test 3: Check cycle_history table
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cycle_history?select=*&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ cycle_history table accessible');
    } else {
      console.log(`❌ cycle_history table error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ cycle_history table error: ${error.message}`);
  }
  
  // Test 4: Check frontend availability
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Frontend accessible at http://localhost:3000');
    } else {
      console.log(`❌ Frontend error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend not accessible: ${error.message}`);
  }
  
  // Test 5: Check backend availability
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    if (data.status === 'ok') {
      console.log('✅ Backend accessible at http://localhost:5000');
      console.log(`   ML Model loaded: ${data.model_loaded}`);
    } else {
      console.log('❌ Backend unhealthy');
    }
  } catch (error) {
    console.log(`❌ Backend not accessible: ${error.message}`);
  }
  
  console.log('\n=== Test Complete ===');
}

testConnection();
