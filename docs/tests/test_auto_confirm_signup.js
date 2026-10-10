// Test auto-confirm signup flow
async function testSignup() {
  console.log('=== TEST AUTO-CONFIRM SIGNUP ===\n');
  
  const testEmail = `test${Date.now()}@femcare.local`;
  const testPassword = 'TestPassword123';
  
  console.log('Test Account:');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);
  
  // Step 1: Call confirm-email endpoint directly to test it
  console.log('Step 1: Testing confirm-email endpoint...');
  try {
    const response = await fetch('http://localhost:5000/api/confirm-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com' })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.status === 404) {
      console.log('✓ Endpoint working (correctly returns 404 for non-existent user)\n');
    } else {
      console.log('⚠ Unexpected response\n');
    }
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
    console.log('Make sure backend is running on port 5000\n');
    return;
  }
  
  console.log('=== INSTRUCTIONS ===');
  console.log('Now test the full signup flow in the browser:');
  console.log('1. Open http://localhost:3000/signup');
  console.log('2. Fill in:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log('   Name: Auto Test User');
  console.log('   Age: 28');
  console.log('   Cycle Length: 28');
  console.log('3. Click Sign Up');
  console.log('4. Expected: Immediately redirected to Dashboard (no email confirmation message)');
  console.log('5. Verify you are logged in');
  console.log('\n=== EXPECTED FLOW ===');
  console.log('Frontend: supabase.auth.signUp()');
  console.log('  ↓');
  console.log('Supabase: Creates auth.users (email_confirmed_at = null)');
  console.log('  ↓');
  console.log('Trigger: Creates public.users profile');
  console.log('  ↓');
  console.log('Frontend: Detects no session');
  console.log('  ↓');
  console.log('Frontend: Calls /api/confirm-email');
  console.log('  ↓');
  console.log('Backend: Auto-confirms email via service_role key');
  console.log('  ↓');
  console.log('Frontend: Calls login()');
  console.log('  ↓');
  console.log('Supabase: Returns session');
  console.log('  ↓');
  console.log('Frontend: Redirects to Dashboard');
  console.log('\n=== CHECK BROWSER CONSOLE ===');
  console.log('Look for these messages:');
  console.log('- "Auto-confirming email for local development..."');
  console.log('- "Email auto-confirmed, logging in..."');
}

testSignup();
