const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDb() {
  const { data: shops } = await supabase.from('shops').select('*');
  console.log('SHOPS IN DATABASE:', shops);
  
  const { data: users } = await supabase.from('users').select('*, shops(shop_name)');
  console.log('USERS IN DATABASE:', users);
}

inspectDb();
