const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log("Fetching users from auth...");
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing auth users:", error);
    return;
  }

  console.log("Auth users list:");
  data.users.forEach(u => {
    console.log(`- Email: ${u.email}, ID: ${u.id}, Confirmed: ${u.email_confirmed_at}`);
  });

  console.log("\nFetching all profiles from public.users...");
  const { data: profiles, error: profileErr } = await supabase
    .from('users')
    .select('*');
  
  if (profileErr) {
    console.error("Error fetching profiles:", profileErr);
    return;
  }

  console.log("Profiles in public.users:");
  profiles.forEach(p => {
    const authUser = data.users.find(u => u.id === p.id);
    console.log(`- ID: ${p.id}, Name: ${p.name}, Role: ${p.role}, ShopID: ${p.shop_id}, Email: ${authUser ? authUser.email : 'NOT FOUND IN AUTH'}`);
  });
}

checkUsers();
