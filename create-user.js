const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'password123';

  console.log('Creating user in auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  const isAlreadyRegistered = authError && (authError.code === 'email_exists' || authError.message.includes('already'));
  if (authError && !isAlreadyRegistered) {
    console.error('Error creating auth user:', authError);
    return;
  }

  let userId;
  if (isAlreadyRegistered) {
     console.log('User already exists, fetching...');
     const { data: listData } = await supabase.auth.admin.listUsers();
     const user = listData.users.find(u => u.email === email);
     if (user) userId = user.id;
  } else {
     userId = authData.user.id;
  }

  if (!userId) {
     console.error('Could not determine user ID');
     return;
  }
  
  // Create shop if not exists
  console.log('Checking for shop...');
  let { data: shopData } = await supabase.from('shops').select('id').eq('shop_name', 'Test Shop').single();
  let shopId;
  
  if (!shopData) {
     console.log('Creating shop...');
     const { data: newShop, error: shopError } = await supabase.from('shops').insert({
       shop_name: 'Test Shop',
       owner_name: 'Test Owner',
       mobile: '1234567890'
     }).select('id').single();
     
     if (shopError) {
        console.error('Error creating shop:', shopError);
        return;
     }
     shopId = newShop.id;
  } else {
     shopId = shopData.id;
  }

  // Create user record in 'users' table
  console.log('Checking user profile...');
  let { data: profileData } = await supabase.from('users').select('id').eq('id', userId).single();
  if (!profileData) {
      console.log('Creating user profile...');
      const { error: profileError } = await supabase.from('users').insert({
          id: userId,
          shop_id: shopId,
          name: 'Test User',
          role: 'Shop Owner'
      });
      if (profileError) {
          console.error('Error creating user profile:', profileError);
          return;
      }
  }

  console.log('--- SUCCESS ---');
  console.log('Email:', email);
  console.log('Password:', password);
}

createTestUser();
