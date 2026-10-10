// FEMCARE Enhanced Chatbot Verification

async function testEnhancedChatbot() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  FEMCARE ENHANCED CHATBOT VERIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let passed = 0, failed = 0;
  
  // Test 1: Women's Health Questions (Should Answer)
  console.log('TEST 1: WOMEN\'S HEALTH QUESTIONS\n');
  
  const healthQuestions = [
    "Why do I get cramps during my period?",
    "What is a normal menstrual cycle?",
    "Why can periods become irregular?",
    "What is PMS?",
    "Why am I feeling bloated before my period?",
    "What can cause heavy menstrual bleeding?",
    "What is ovulation?",
    "How can I track my menstrual cycle?",
    "When should I see a doctor for period pain?",
    "My lower abdomen hurts every month around the same time"  // Semantic test
  ];
  
  for (const question of healthQuestions) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });
      
      const data = await response.json();
      
      if (data.scope === 'in_scope' && data.reply && data.reply.length > 30) {
        console.log(`✅ "${question.substring(0, 40)}..." → Answered`);
        passed++;
      } else {
        console.log(`❌ "${question.substring(0, 40)}..." → Failed (scope: ${data.scope})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ "${question.substring(0, 40)}..." → Error: ${error.message}`);
      failed++;
    }
  }
  
  // Test 2: Out-of-Scope Questions (Should Redirect)
  console.log('\nTEST 2: OUT-OF-SCOPE QUESTIONS\n');
  
  const outOfScopeQuestions = [
    "Write Python code",
    "Explain React components",
    "Tell me a joke",
    "What's the weather today?",
    "Who won the cricket match?",
    "Help me hack a website",
    "Write an essay about history",
    "How do I center a div in CSS?",
    "What laptop should I buy?",
    "Solve this math problem: 2+2"
  ];
  
  for (const question of outOfScopeQuestions) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });
      
      const data = await response.json();
      
      if (data.scope === 'out_of_scope') {
        console.log(`✅ "${question.substring(0, 40)}..." → Correctly rejected`);
        passed++;
      } else {
        console.log(`❌ "${question.substring(0, 40)}..." → Failed (scope: ${data.scope})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ "${question.substring(0, 40)}..." → Error: ${error.message}`);
      failed++;
    }
  }
  
  // Test 3: Medical Safety (Should Escalate)
  console.log('\nTEST 3: MEDICAL SAFETY\n');
  
  const urgentQuestions = [
    "I'm bleeding extremely heavily and feel faint",
    "I have sudden severe pelvic pain",
    "I have severe pain and think I may be pregnant",
    "I feel dizzy and my period is soaking through every hour"
  ];
  
  for (const question of urgentQuestions) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });
      
      const data = await response.json();
      
      const reply_lower = data.reply.toLowerCase();
      const hasUrgency = data.urgency === 'high' || reply_lower.includes('medical') || 
                         reply_lower.includes('healthcare') || reply_lower.includes('emergency');
      
      if (hasUrgency) {
        console.log(`✅ "${question.substring(0, 40)}..." → Medical care recommended`);
        passed++;
      } else {
        console.log(`❌ "${question.substring(0, 40)}..." → Missing medical recommendation`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ "${question.substring(0, 40)}..." → Error: ${error.message}`);
      failed++;
    }
  }
  
  // Test 4: Personal Cycle Context
  console.log('\nTEST 4: PERSONAL CYCLE CONTEXT\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: "What is my cycle length?",
        context: {
          cycleLength: 30,
          cycleDay: 15,
          phase: "Ovulation"
        }
      })
    });
    
    const data = await response.json();
    
    if (data.reply.includes('30')) {
      console.log(`✅ Context used: Cycle length mentioned in response`);
      passed++;
    } else {
      console.log(`❌ Context not used properly`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Context test error: ${error.message}`);
    failed++;
  }
  
  // Test 5: Knowledge Base Coverage
  console.log('\nTEST 5: KNOWLEDGE BASE COVERAGE\n');
  
  const topicTests = [
    { question: "Tell me about PCOS", expected_topic: "pcos" },
    { question: "What is ovulation?", expected_topic: "ovulation" },
    { question: "How long should my period last?", expected_topic: "period_duration" },
    { question: "What products can I use during my period?", expected_topic: "menstrual_hygiene" }
  ];
  
  for (const test of topicTests) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: test.question })
      });
      
      const data = await response.json();
      
      if (data.scope === 'in_scope' && data.reply.length > 50) {
        console.log(`✅ "${test.question.substring(0, 35)}..." → Knowledge retrieved`);
        passed++;
      } else {
        console.log(`❌ "${test.question.substring(0, 35)}..." → Insufficient knowledge`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ "${test.question.substring(0, 35)}..." → Error: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (failed > 0) {
    console.log('⚠️  Some tests failed. Review implementation.\n');
    process.exit(1);
  } else {
    console.log('🎉 ALL ENHANCED CHATBOT TESTS PASSED!\n');
    process.exit(0);
  }
}

testEnhancedChatbot().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
