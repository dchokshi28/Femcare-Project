// Test: Controlled chatbot flow simulation
// This sends 3 messages with proper spacing

async function testChatbotFlow() {
  console.log('=== CHATBOT FLOW TEST ===\n');
  
  const tests = [
    { message: "What is PMS?", expected: "in_scope, LLM response" },
    { message: "Write Python code", expected: "out_of_scope rejection" },
    { message: "I have severe bleeding", expected: "safety/urgent response" }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\nTest ${i + 1}/${tests.length}: "${test.message}"`);
    console.log(`Expected: ${test.expected}`);
    console.log('---');
    
    try {
      const payload = {
        message: test.message,
        context: {
          cycleLength: 28,
          cycleDay: 14,
          phase: "Ovulation",
          lastPeriod: "2025-01-15T00:00:00.000Z",
          symptoms: [],
          flow: "regular"
        }
      };
      
      const startTime = Date.now();
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const elapsed = Date.now() - startTime;
      
      const data = await response.json();
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Time: ${elapsed}ms`);
      console.log(`Scope: ${data.scope || 'N/A'}`);
      console.log(`LLM Used: ${data.llm_used}`);
      console.log(`Reply: ${data.reply.substring(0, 100)}...`);
      
      if (response.status === 429) {
        console.log('\n❌ RATE LIMIT ERROR DETECTED');
        console.log('Stopping tests');
        break;
      }
      
      if (data.error && data.error.includes('rate limit')) {
        console.log('\n❌ GROQ RATE LIMIT ERROR');
        console.log('Error:', data.error);
        break;
      }
      
      console.log('✓ Request successful');
      
      // Wait 2 seconds between requests
      if (i < tests.length - 1) {
        console.log('Waiting 2 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
      break;
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('Check backend logs for request count');
  console.log('Expected: 3 successful requests (or fewer if rate limited)');
}

testChatbotFlow();
