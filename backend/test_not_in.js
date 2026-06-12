const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const dummyIds = ['e2d39501-5950-4938-9144-317c63882579']; // Let's try to exclude a valid ID
  
  let query = supabase
    .from('jobs')
    .select('id, title, skills')
    .not('id', 'in', `(${dummyIds.join(',')})`)
    
  // Chain textSearch
  query = query.textSearch('fts', 'react | node');
    
  const { data, error } = await query.limit(10);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! records:', data.length);
    console.log('Includes e2d39501?', data.some(d => d.id === 'e2d39501-5950-4938-9144-317c63882579'));
  }
}

test();
