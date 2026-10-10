import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyConstraint() {
  console.log('Applying unique_period_id constraint to cycle_history table...\n');
  
  try {
    // Check if constraint already exists
    const { data: existing, error: checkError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'cycle_history' 
        AND constraint_name = 'unique_period_id';
      `
    });
    
    if (checkError) {
      console.log('Cannot check constraints via RPC. Will try direct ALTER TABLE...\n');
    } else if (existing && existing.length > 0) {
      console.log('✅ Constraint unique_period_id already exists!');
      return;
    }
    
    // Apply the constraint
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE cycle_history ADD CONSTRAINT unique_period_id UNIQUE (period_id);'
    });
    
    if (alterError) {
      if (alterError.message.includes('already exists')) {
        console.log('✅ Constraint unique_period_id already exists!');
      } else {
        throw alterError;
      }
    } else {
      console.log('✅ Constraint unique_period_id applied successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  You need to manually run this SQL in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/your-supabase-project-ref/sql/new\n');
    console.log('   ALTER TABLE cycle_history ADD CONSTRAINT unique_period_id UNIQUE (period_id);\n');
    process.exit(1);
  }
}

applyConstraint();
