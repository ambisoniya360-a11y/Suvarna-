const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('Starting Database Seed...');

  const ownerEmail = 'owner@kalyan.com';
  const ownerPassword = 'password123';

  // 1. Create Shop Owner in Auth
  console.log('1. Checking Auth User for Shop Owner...');
  let { data: listUsers } = await supabase.auth.admin.listUsers();
  let ownerUser = listUsers.users.find(u => u.email === ownerEmail);
  let ownerId;

  if (!ownerUser) {
    console.log('Creating auth account for owner@kalyan.com...');
    const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true
    });
    if (authErr) {
      console.error('Error creating auth user:', authErr);
      return;
    }
    ownerId = newUser.user.id;
  } else {
    ownerId = ownerUser.id;
  }
  console.log(`Shop Owner ID: ${ownerId}`);

  // 2. Create Shop
  console.log('2. Creating Shop...');
  // Delete existing test shop if exists
  await supabase.from('shops').delete().eq('shop_name', 'Kalyan Gold Syndicate');

  const { data: shop, error: shopErr } = await supabase.from('shops').insert({
    shop_name: 'Kalyan Gold Syndicate',
    owner_name: 'Rajesh Kalyan',
    mobile: '9876543210',
    email: ownerEmail,
    plan: 'Enterprise', // Enterprise supports multiple branches and staff
    subscription_start: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    subscription_end: new Date(Date.now() + 335 * 24 * 3600 * 1000).toISOString(),
    status: 'Active',
    temp_password: ownerPassword
  }).select('id').single();

  if (shopErr) {
    console.error('Error creating shop:', shopErr);
    return;
  }
  const shopId = shop.id;
  console.log(`Shop Created with ID: ${shopId}`);

  // 3. Create User Profile
  console.log('3. Linking Profile...');
  await supabase.from('users').delete().eq('id', ownerId);
  const { error: profileErr } = await supabase.from('users').insert({
    id: ownerId,
    shop_id: shopId,
    name: 'Rajesh Kalyan',
    role: 'Shop Owner'
  });
  if (profileErr) {
    console.error('Error creating profile:', profileErr);
    return;
  }

  // 4. Create Branches
  console.log('4. Seeding Branches...');
  const { data: branches, error: branchErr } = await supabase.from('branches').insert([
    {
      shop_id: shopId,
      name: 'Kalyan Gold - Mumbai H.O.',
      address: 'Gold Plaza, Fort, Mumbai',
      phone: '022-22445566',
      is_active: true
    },
    {
      shop_id: shopId,
      name: 'Kalyan Gold - Thane Branch',
      address: 'Ram Maruti Road, Thane',
      phone: '022-25889900',
      is_active: true
    }
  ]).select('*');

  if (branchErr) {
    console.error('Error seeding branches:', branchErr);
    return;
  }
  const branchMumbai = branches[0].id;
  const branchThane = branches[1].id;

  // 5. Create Employees
  console.log('5. Seeding Employees...');
  const { error: empErr } = await supabase.from('employees').insert([
    {
      shop_id: shopId,
      branch_id: branchMumbai,
      name: 'Amit Sharma',
      role: 'Branch Admin',
      phone: '9812345678',
      email: 'amit@kalyangold.com',
      salary: 35000,
      joined_at: '2025-01-15',
      is_active: true
    },
    {
      shop_id: shopId,
      branch_id: branchMumbai,
      name: 'Rajesh Patel',
      role: 'Staff',
      phone: '9823456789',
      email: 'rajesh@kalyangold.com',
      salary: 22000,
      joined_at: '2025-03-01',
      is_active: true
    },
    {
      shop_id: shopId,
      branch_id: branchThane,
      name: 'Pooja Rao',
      role: 'Staff',
      phone: '9834567890',
      email: 'pooja@kalyangold.com',
      salary: 24000,
      joined_at: '2025-02-10',
      is_active: true
    }
  ]);
  if (empErr) {
    console.error('Error seeding employees:', empErr);
    return;
  }

  // 6. Create Customers
  console.log('6. Seeding Customers...');
  const { data: customers, error: custErr } = await supabase.from('customers').insert([
    {
      shop_id: shopId,
      full_name: 'Ramesh Patil',
      mobile_number: '9845678901',
      aadhaar_number: '1234-5678-9012',
      pan_number: 'ABCDE1234F',
      address: 'Dadar West, Mumbai',
      status: 'Active'
    },
    {
      shop_id: shopId,
      full_name: 'Suresh Naik',
      mobile_number: '9856789012',
      aadhaar_number: '2345-6789-0123',
      pan_number: 'BCDEF2345G',
      address: 'Thane West, Thane',
      status: 'Active'
    },
    {
      shop_id: shopId,
      full_name: 'Meena Kulkarni',
      mobile_number: '9867890123',
      aadhaar_number: '3456-7890-1234',
      pan_number: 'CDEFG3456H',
      address: 'Vile Parle, Mumbai',
      status: 'Active'
    },
    {
      shop_id: shopId,
      full_name: 'Ketan Shah',
      mobile_number: '9878901234',
      aadhaar_number: '4567-8901-2345',
      pan_number: 'DEFGH4567I',
      address: 'Ghatkopar East, Mumbai',
      status: 'Blacklisted'
    }
  ]).select('*');

  if (custErr) {
    console.error('Error seeding customers:', custErr);
    return;
  }
  const custRamesh = customers[0].id;
  const custSuresh = customers[1].id;
  const custMeena = customers[2].id;

  // 7. Create Gold Items
  console.log('7. Seeding Gold Items...');
  const { data: goldItems, error: goldErr } = await supabase.from('gold_items').insert([
    {
      customer_id: custRamesh,
      ornament_type: 'Necklace',
      gross_weight: 25.500,
      net_weight: 24.200,
      purity: '22 Karat',
      hallmark_number: 'HM123456'
    },
    {
      customer_id: custSuresh,
      ornament_type: 'Bangles',
      gross_weight: 42.100,
      net_weight: 40.500,
      purity: '22 Karat',
      hallmark_number: 'HM654321'
    },
    {
      customer_id: custMeena,
      ornament_type: 'Ring',
      gross_weight: 8.500,
      net_weight: 8.000,
      purity: '18 Karat',
      hallmark_number: 'HM987654'
    }
  ]).select('*');

  if (goldErr) {
    console.error('Error seeding gold items:', goldErr);
    return;
  }
  const itemNecklace = goldItems[0].id;
  const itemBangles = goldItems[1].id;
  const itemRing = goldItems[2].id;

  // 8. Seeding Loans
  console.log('8. Seeding Loans...');
  const { data: loans, error: loanErr } = await supabase.from('loans').insert([
    {
      customer_id: custRamesh,
      gold_item_id: itemNecklace,
      loan_number: 'LN-2026-0001',
      loan_amount: 75000.00,
      interest_rate: 2.50,
      loan_date: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Active'
    },
    {
      customer_id: custSuresh,
      gold_item_id: itemBangles,
      loan_number: 'LN-2026-0002',
      loan_amount: 120000.00,
      interest_rate: 2.00,
      loan_date: new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Overdue'
    },
    {
      customer_id: custMeena,
      gold_item_id: itemRing,
      loan_number: 'LN-2026-0003',
      loan_amount: 35000.00,
      interest_rate: 3.00,
      loan_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Closed'
    }
  ]).select('*');

  if (loanErr) {
    console.error('Error seeding loans:', loanErr);
    return;
  }
  const loan1 = loans[0].id;
  const loan2 = loans[1].id;
  const loan3 = loans[2].id;

  // 9. Seeding Payments
  console.log('9. Seeding Payments...');
  const { error: payErr } = await supabase.from('payments').insert([
    {
      loan_id: loan1,
      payment_type: 'Interest Payment',
      amount: 1875.00,
      payment_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      payment_method: 'UPI',
      notes: 'Paid via GPay'
    },
    {
      loan_id: loan2,
      payment_type: 'Partial Payment',
      amount: 20000.00,
      payment_date: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString().split('T')[0],
      payment_method: 'Cash',
      notes: 'Handover at store'
    },
    {
      loan_id: loan3,
      payment_type: 'Full Settlement',
      amount: 36050.00,
      payment_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      payment_method: 'Net Banking',
      notes: 'IMPS transaction'
    }
  ]);

  if (payErr) {
    console.error('Error seeding payments:', payErr);
    return;
  }

  console.log('\n--- SEED COMPLETION SUCCESS ---');
  console.log(`Registered Shop: Kalyan Gold Syndicate`);
  console.log(`Login Email: ${ownerEmail}`);
  console.log(`Password: ${ownerPassword}`);
}

seedData();
