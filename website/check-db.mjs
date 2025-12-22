import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juyxfrvadwdrxidmeaup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eXhmcnZhZHdkcnhpZG1lYXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjkyMzEsImV4cCI6MjA4MTg0NTIzMX0.CCoynrlYikih_H_5ossP50CC-V4QiTzJ52o7eU0QARM';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Checking projects table...\n');

const { data, error } = await supabase
  .from('projects')
  .select('*')
  .limit(1);

if (error) {
  console.error('❌ Error: Table does not exist or cannot be accessed');
  console.error('Error details:', error.message);
  console.error('Error code:', error.code);
  console.log('\n📝 Please apply the migration manually:');
  console.log('1. Go to https://supabase.com/dashboard/project/juyxfrvadwdrxidmeaup');
  console.log('2. Go to SQL Editor');
  console.log('3. Paste contents of supabase/migrations/001_create_projects.sql');
  console.log('4. Run the query');
} else {
  console.log('✅ Projects table exists and is accessible');
  console.log('Found', data?.length || 0, 'test records');
}
