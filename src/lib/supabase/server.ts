import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

// Helper to create a mock database query builder
function createMockQueryBuilder(table: string, email: string | undefined, role: string | undefined) {
  const builder: any = {};
  
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
      plan: role === 'Super Admin' ? 'Enterprise' : 'Professional',
      created_at: new Date().toISOString()
    }
  };

  builder.select = () => builder;
  builder.eq = () => builder;
  builder.gte = () => builder;
  builder.order = () => builder;
  builder.limit = () => builder;
  builder.single = async () => {
    return { data: mockData[table] || null, error: null };
  };
  
  // For array yields
  builder.then = (onfulfilled: any) => {
    const listData = table === 'payments' ? [] : [];
    return Promise.resolve(onfulfilled({ data: listData, count: 0, error: null }));
  };

  return builder;
}

export async function createClient() {
  const cookieStore = await cookies();

  if (isPlaceholder) {
    // Return mock client
    const mockEmail = cookieStore.get('sb-mock-email')?.value;
    const mockRole = cookieStore.get('sb-mock-role')?.value;
    
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
          return {
            data: { user: { id: 'mock-user-id', email } },
            error: null
          };
        },
        signInWithOtp: async ({ email }: { email: string }) => {
          cookieStore.set('sb-mock-email', email, { path: '/' });
          cookieStore.set('sb-mock-role', 'Shop Owner', { path: '/' });
          return { data: {}, error: null };
        },
        signOut: async () => {
          cookieStore.delete('sb-mock-email');
          cookieStore.delete('sb-mock-role');
          return { error: null };
        }
      },
      from: (relation: string) => {
        return createMockQueryBuilder(relation, mockEmail, mockRole);
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
  if (isPlaceholder) {
    return {
      auth: {
        createUser: async () => ({ data: { user: { id: 'new-mock-id' } }, error: null })
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
