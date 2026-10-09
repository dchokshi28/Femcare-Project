import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('Checking if bookings table exists...\n');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('bookings')
      .select('count')
      .limit(0);
    
    if (error && error.code === '42P01') {
      console.log('❌ Bookings table does not exist');
      console.log('\n⚠️  You need to manually run the migration in Supabase SQL Editor:');
      console.log('URL: https://supabase.com/dashboard/project/your-supabase-project-ref/sql/new\n');
      console.log('Copy and paste the contents of:');
      console.log('supabase/migrations/003_bookings_schema.sql\n');
    } else if (error) {
      console.log('❌ Error checking table:', error.message);
    } else {
      console.log('✅ Bookings table exists!');
      console.log('✅ Ready for booking operations\n');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigration();
