import { createBrowserClient } from '@supabase/ssr';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export function createClient() {
  if (isPlaceholder) {
    // Return mock client for client-side queries
    return {
      auth: {
        getUser: async () => {
          const matchEmail = document.cookie.match(/sb-mock-email=([^;]+)/);
          const email = matchEmail ? decodeURIComponent(matchEmail[1]) : null;
          if (!email) return { data: { user: null }, error: null };
          return { data: { user: { id: 'mock-user-id', email } }, error: null };
        },
        signInWithPassword: async ({ email }: { email: string }) => {
          if (email.startsWith('pending')) {
            return { data: null, error: { message: "Your shop registration request has not been approved by the Super Admin yet." } };
          }
          if (email.startsWith('suspended')) {
            return { data: null, error: { message: "Your shop account is currently suspended by the system operator." } };
          }
          const role = email.includes('admin') ? 'Super Admin' : 'Shop Owner';
          document.cookie = `sb-mock-email=${encodeURIComponent(email)}; path=/`;
          document.cookie = `sb-mock-role=${encodeURIComponent(role)}; path=/`;
          return { data: { user: { id: 'mock-user-id', email } }, error: null };
        },
        signInWithOtp: async ({ email }: { email: string }) => {
          document.cookie = `sb-mock-email=${encodeURIComponent(email)}; path=/`;
          document.cookie = `sb-mock-role=Shop Owner; path=/`;
          return { data: {}, error: null };
        },
        signOut: async () => {
          document.cookie = 'sb-mock-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'sb-mock-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          return { error: null };
        }
      },
      from: (table: string) => {
        return {
          select: () => {
            return {
              eq: () => ({
                single: async () => ({ data: null, error: null })
              }),
              single: async () => ({ data: null, error: null })
            };
          }
        };
      }
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
