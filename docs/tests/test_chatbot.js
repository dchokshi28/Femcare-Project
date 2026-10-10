// Test AI Chatbot Endpoints

async function testChatbot() {
  console.log('='.repeat(60));
  console.log('TESTING AI CHATBOT');
  console.log('='.repeat(60));
  
  const tests = [
    { message: "What is Python?", expected: "out_of_scope" },
    { message: "Write a Java program", expected: "out_of_scope" },
    { message: "Tell me a joke", expected: "out_of_scope" },
    { message: "Why do I get cramps during my period?", expected: "in_scope" },
    { message: "What is a normal cycle length?", expected: "in_scope" },
    { message: "I have severe pelvic pain", expected: "in_scope" },
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n📝 Question: "${test.message}"`);
      
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: test.message })
      });
      
      if (!response.ok) {
        console.log(`❌ FAIL: HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`💬 Response: ${data.reply.substring(0, 100)}...`);
      console.log(`🔍 Scope: ${data.scope}`);
      
      if (test.expected && data.scope === test.expected) {
        console.log(`✅ PASS: Correctly identified as ${test.expected}`);
      } else if (test.expected && data.scope !== test.expected) {
        console.log(`❌ FAIL: Expected ${test.expected}, got ${data.scope}`);
      } else {
        console.log(`✅ Response received`);
      }
      
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

testChatbot().catch(console.error);
