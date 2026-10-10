// Monitor backend for duplicate requests during a single user interaction
// This simulates exactly ONE user message being sent from the frontend

console.log('=== MONITORING FOR DUPLICATE REQUESTS ===\n');
console.log('Instructions:');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Login');
console.log('3. Go to Dashboard');
console.log('4. Open browser DevTools (F12) → Network tab');
console.log('5. Filter by "chat"');
console.log('6. Type ONE message in chatbot: "What is PMS?"');
console.log('7. Click send ONCE');
console.log('8. Count how many POST requests to /api/chat appear in Network tab\n');
console.log('Expected: EXACTLY 1 request');
console.log('If you see 2+ requests, there is a duplicate request bug\n');
console.log('Also check backend terminal for request logs');
console.log('\n=== BACKEND REQUEST LOG ===');
console.log('Watch the backend terminal (term_1788229852667_ybwxp0uqtc)');
console.log('Each line like:');
console.log('  INFO:     127.0.0.1:XXXXX - "POST /api/chat HTTP/1.1" 200 OK');
console.log('represents ONE chatbot request');
console.log('\nIf ONE user message produces MULTIPLE log lines → DUPLICATE REQUEST BUG');
console.log('\n=== POSSIBLE CAUSES ===');
console.log('1. Duplicate useEffect in Dashboard.jsx');
console.log('2. React StrictMode calling effects twice in dev');
console.log('3. Event handler attached multiple times');
console.log('4. sendChat called from multiple places');
console.log('5. Automatic retry logic');
console.log('6. Test scripts running in background');
console.log('\n=== NEXT STEPS ===');
console.log('After testing in browser, report findings:');
console.log('- How many Network tab requests appear?');
console.log('- How many backend log lines appear?');
console.log('- Did the chatbot show an error or rate limit?');
console.log('- Is the actual Groq API being rate limited, or something else?');
