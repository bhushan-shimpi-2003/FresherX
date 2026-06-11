const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('jobs').select('id').limit(1);
  if (error) {
    console.error('Error fetching job:', error);
    return;
  }
  if (!data.length) {
    console.log('No jobs found');
    return;
  }
  const jobId = data[0].id;
  const { error: updateError } = await supabase.from('jobs').update({ status: 'published', rejection_reason: 'test' }).eq('id', jobId);
  console.log('Update result:', updateError || 'Success');
}
test();
