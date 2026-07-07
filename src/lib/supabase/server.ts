import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

// Helper to create a mock database query builder with Proxy support for chainable methods
function createMockQueryBuilder(
  table: string, 
  email: string | undefined, 
  role: string | undefined,
  plan: string | undefined,
  cookieStore?: any
) {
  const mockPlan = plan || (role === 'Super Admin' ? 'Enterprise' : 'Professional');

  const mockData: Record<string, any> = {
    users: {
      id: 'mock-user-id',
      name: role === 'Super Admin' ? 'System Administrator' : 'Rajesh Jewellers Owner',
      role: role || 'Shop Owner',
      shop_id: 'shop-123',
      shops: { shop_name: role === 'Super Admin' ? 'SuvarnaLoan System' : 'Rajesh Jewellers' }
    },
    shops: {
      id: 'shop-123',
      shop_name: role === 'Super Admin' ? 'SuvarnaLoan System' : 'Rajesh Jewellers',
      owner_name: 'Rajesh Kalyan',
      mobile: '9876543210',
      email: email || 'owner@rajeshjewellers.com',
      plan: mockPlan,
      subscription_start: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      subscription_end: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
      status: 'Active',
      created_at: new Date().toISOString()
    }
  };

  let isUpdatingShops = false;
  let updateData: any = null;

  const builder: any = {
    update: (data: any) => {
      if (table === 'shops') {
        isUpdatingShops = true;
        updateData = data;
        if (data.plan && cookieStore) {
          cookieStore.set('sb-mock-plan', data.plan, { path: '/' });
        }
      }
      return proxy;
    },
    insert: (data: any) => {
      return proxy;
    },
    delete: () => {
      return proxy;
    },
    eq: () => {
      return proxy;
    },
    single: async () => {
      if (isUpdatingShops && updateData) {
        return {
          data: {
            ...mockData.shops,
            ...updateData
          },
          error: null
        };
      }
      return { data: mockData[table] || null, error: null };
    },
    then: (onfulfilled: any) => {
      let listData: any[] = [];
      
      if (table === 'subscription_payments') {
        listData = [
          {
            id: 'sub_pay_mock_1',
            razorpay_order_id: 'order_renew_mock_123',
            razorpay_payment_id: 'pay_renew_mock_123',
            plan: mockPlan,
            amount: mockPlan === 'Enterprise' ? 24999 : 999,
            created_at: new Date().toISOString(),
            status: 'Success'
          }
        ];
      } else if (table === 'branches' && mockPlan === 'Enterprise') {
        listData = [
          {
            id: 'branch-1',
            shop_id: 'shop-123',
            name: 'Sangli Main Branch',
            address: '123 Main Road, Sangli',
            phone: '9876543201',
            is_active: true,
            created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 'branch-2',
            shop_id: 'shop-123',
            name: 'Miraj City Center',
            address: '456 Plaza Mall, Miraj',
            phone: '9876543202',
            is_active: true,
            created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
          }
        ];
      } else if (table === 'employees' && mockPlan === 'Enterprise') {
        listData = [
          {
            id: 'emp-1',
            shop_id: 'shop-123',
            branch_id: 'branch-1',
            name: 'Amit Patil',
            role: 'Branch Admin',
            phone: '9876543211',
            email: 'amit@rajeshjewellers.com',
            salary: 25000,
            joined_at: '2026-01-10',
            is_active: true,
            created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            branches: { name: 'Sangli Main Branch' }
          },
          {
            id: 'emp-2',
            shop_id: 'shop-123',
            branch_id: 'branch-2',
            name: 'Pooja Joshi',
            role: 'Staff',
            phone: '9876543212',
            email: 'pooja@rajeshjewellers.com',
            salary: 18000,
            joined_at: '2026-02-15',
            is_active: true,
            created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
            branches: { name: 'Miraj City Center' }
          }
        ];
      } else if (table === 'customers') {
        listData = [
          {
            id: 'cust-1',
            shop_id: 'shop-123',
            name: 'Ketan Shah',
            phone: '9823456789',
            email: 'ketan@gmail.com',
            address: 'Shivaji Nagar, Sangli',
            created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 'cust-2',
            shop_id: 'shop-123',
            name: 'Meena Kulkarni',
            phone: '9890123456',
            email: 'meena@gmail.com',
            address: 'Vishrambag, Sangli',
            created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
          }
        ];
      } else if (table === 'loans') {
        listData = [
          {
            id: 'loan-1',
            shop_id: 'shop-123',
            customer_id: 'cust-1',
            loan_no: 'L-2026-001',
            principal_amount: 50000,
            interest_rate: 2.5,
            tenure_months: 12,
            status: 'Active',
            created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
            customers: { name: 'Ketan Shah', phone: '9823456789' }
          }
        ];
      } else if (table === 'gold_items') {
        listData = [
          {
            id: 'gold-1',
            loan_id: 'loan-1',
            description: 'Gold Chain 22K',
            gross_weight: 15.5,
            net_weight: 15.0,
            purity: 22,
            created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()
          }
        ];
      }

      return Promise.resolve(onfulfilled({ data: listData, count: listData.length, error: null }));
    }
  };

  const handler = {
    get(target: any, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      return () => proxy;
    }
  };

  const proxy = new Proxy(builder, handler);
  return proxy;
}

export async function createClient() {
  const cookieStore = await cookies();

  if (isPlaceholder) {
    // Return mock client
    const mockEmail = cookieStore.get('sb-mock-email')?.value;
    const mockRole = cookieStore.get('sb-mock-role')?.value;
    const mockPlan = cookieStore.get('sb-mock-plan')?.value || (mockRole === 'Super Admin' ? 'Enterprise' : 'Professional');
    
    const mockClient: any = {
      auth: {
        getUser: async () => {
          if (!mockEmail) return { data: { user: null }, error: null };
          return {
            data: {
              user: {
                id: 'mock-user-id',
                email: mockEmail,
                role: 'authenticated'
              }
            },
            error: null
          };
        },
        signInWithPassword: async ({ email }: { email: string }) => {
          if (email.startsWith('pending')) {
            return { data: null, error: { message: "Your shop registration request has not been approved by the Super Admin yet." } };
          }
          if (email.startsWith('suspended')) {
            return { data: null, error: { message: "Your shop account is currently suspended by the system operator." } };
          }
          const role = email.includes('admin') ? 'Super Admin' : 'Shop Owner';
          cookieStore.set('sb-mock-email', email, { path: '/' });
          cookieStore.set('sb-mock-role', role, { path: '/' });
          cookieStore.set('sb-mock-plan', role === 'Super Admin' ? 'Enterprise' : 'Professional', { path: '/' });
          return {
            data: { user: { id: 'mock-user-id', email } },
            error: null
          };
        },
        signInWithOtp: async ({ email }: { email: string }) => {
          cookieStore.set('sb-mock-email', email, { path: '/' });
          cookieStore.set('sb-mock-role', 'Shop Owner', { path: '/' });
          cookieStore.set('sb-mock-plan', 'Professional', { path: '/' });
          return { data: {}, error: null };
        },
        signOut: async () => {
          cookieStore.delete('sb-mock-email');
          cookieStore.delete('sb-mock-role');
          cookieStore.delete('sb-mock-plan');
          return { error: null };
        }
      },
      from: (relation: string) => {
        return createMockQueryBuilder(relation, mockEmail, mockRole, mockPlan, cookieStore);
      }
    };
    return mockClient;
  }

  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  );

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  const originalFrom = anonClient.from.bind(anonClient);
  anonClient.from = (relation: string) => {
    if (relation === 'users') {
      return adminClient.from(relation);
    }
    return originalFrom(relation);
  };

  return anonClient;
}

export async function createAdminClient() {
  const cookieStore = await cookies();
  
  if (isPlaceholder) {
    const mockEmail = cookieStore.get('sb-mock-email')?.value;
    const mockRole = cookieStore.get('sb-mock-role')?.value;
    const mockPlan = cookieStore.get('sb-mock-plan')?.value || (mockRole === 'Super Admin' ? 'Enterprise' : 'Professional');

    return {
      auth: {
        createUser: async () => ({ data: { user: { id: 'new-mock-id' } }, error: null }),
        deleteUser: async () => ({ error: null })
      },
      from: (relation: string) => {
        return createMockQueryBuilder(relation, mockEmail, mockRole, mockPlan, cookieStore);
      }
    } as any;
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
