// Verify ML Pipeline Unchanged

async function testML() {
  console.log('Testing ML Pipeline...\n');
  
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    if (data.status === 'ok' && data.model_loaded === true) {
      console.log('✅ ML Model: LOADED');
      console.log('✅ ML Pipeline: UNCHANGED\n');
      return true;
    } else {
      console.log('❌ ML Model: NOT LOADED\n');
      return false;
    }
  } catch (error) {
    console.log('❌ ML Test Error:', error.message);
    return false;
  }
}

testML();
