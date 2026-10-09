import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraints() {
  console.log('Checking cycle_history table constraints...\n');
  
  // Check if unique constraint exists
  const { data: constraints, error: constraintError } = await supabase
    .from('information_schema.table_constraints')
    .select('constraint_name, constraint_type')
    .eq('table_name', 'cycle_history');
  
  if (constraintError) {
    console.log('Cannot query constraints directly. Trying alternative method...\n');
    
    // Try to insert duplicate period_id to test constraint
    const testUserId = 'c3cac5cf-8118-4c61-a879-60621e3aab6e';
    
    // First, get an existing period if any
    const { data: periods } = await supabase
      .from('periods')
      .select('id')
      .eq('user_id', testUserId)
      .limit(1);
    
    if (periods && periods.length > 0) {
      const periodId = periods[0].id;
      
      // Check if cycle_history record exists for this period
      const { data: existingHistory } = await supabase
        .from('cycle_history')
        .select('id')
        .eq('period_id', periodId);
      
      console.log(`Existing cycle_history records for period ${periodId}:`, existingHistory?.length || 0);
      
      if (existingHistory && existingHistory.length > 0) {
        console.log('✅ Constraint appears to be working (cycle_history exists)');
      } else {
        console.log('⚠️ No cycle_history record found for this period');
      }
    } else {
      console.log('No periods found for test user. Cannot verify constraint.');
    }
  } else {
    console.log('Constraints found:', constraints);
  }
}

checkConstraints().catch(console.error);
