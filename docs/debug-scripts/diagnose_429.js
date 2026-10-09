// Single controlled diagnostic request
async function diagnose() {
  console.log('=== DIAGNOSTIC: Single Chatbot Request ===\n');
  
  const payload = {
    message: "What is PMS?",
    context: {
      cycleLength: 28,
      cycleDay: 15,
      phase: "Ovulation",
      lastPeriod: "2025-01-01T00:00:00.000Z",
      symptoms: [],
      flow: "regular"
    }
  };
  
  console.log('Sending request to: http://localhost:5000/api/chat');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('\nWaiting for response...\n');
  
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const elapsed = Date.now() - startTime;
    
    console.log('✓ Response received in', elapsed, 'ms');
    console.log('HTTP Status:', response.status, response.statusText);
    console.log('\nResponse Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const data = await response.json();
    console.log('\nResponse Body:', JSON.stringify(data, null, 2));
    
    // Analyze the response
    console.log('\n=== ANALYSIS ===');
    
    if (response.status === 429) {
      console.log('❌ HTTP 429 DETECTED: Rate Limit Error');
      console.log('   Source: Backend returned 429 status');
    } else if (response.status === 200) {
      console.log('✓ HTTP 200: Success');
    } else {
      console.log('⚠️  Unexpected status:', response.status);
    }
    
    if (data.error) {
      console.log('❌ Error field present:', data.error);
      if (data.error.includes('Too many requests') || data.error.includes('rate limit')) {
        console.log('   → Rate limit error from API');
      }
    }
    
    if (data.reply) {
      console.log('✓ Reply received:', data.reply.substring(0, 100) + '...');
    }
    
    if (data.llm_used !== undefined) {
      console.log('✓ LLM Used:', data.llm_used);
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.error('   This indicates a network/connection error, not rate limiting');
  }
  
  console.log('\n=== END DIAGNOSTIC ===');
}

diagnose();
