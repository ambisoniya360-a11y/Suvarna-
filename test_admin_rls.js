const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRls() {
  console.log("Logging in as Super Admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'wasimhavaldar70@gmail.com',
    password: 'Admin@12345'
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }

  console.log("Login successful! User ID:", authData.user.id);

  console.log("\nAttempting to query public.users (like fetchActiveShops)...");
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, name, role, shop_id, created_at, shops(*)');
  
  if (usersErr) {
    console.error("Query users failed:", usersErr);
  } else {
    console.log(`Query users successful. Got ${users.length} rows.`);
    console.log(JSON.stringify(users, null, 2));
  }

  console.log("\nAttempting to query registration_requests (like fetchPendingRequests)...");
  const { data: reqs, error: reqsErr } = await supabase
    .from('registration_requests')
    .select('*');

  if (reqsErr) {
    console.error("Query registration_requests failed:", reqsErr);
  } else {
    console.log(`Query registration_requests successful. Got ${reqs.length} rows.`);
    console.log(JSON.stringify(reqs, null, 2));
  }
}

testRls();
