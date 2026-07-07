import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployeesClient from './EmployeesClient';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*, branches(name)')
    .eq('shop_id', profile.shop_id)
    .order('name', { ascending: true });

  // Fetch branches
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('shop_id', profile.shop_id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Fetch shop plan
  const { data: shop } = await supabase
    .from('shops')
    .select('plan')
    .eq('id', profile.shop_id)
    .single();

  return (
    <EmployeesClient
      initialEmployees={(employees as any) || []}
      branches={(branches as any) || []}
      shopPlan={shop?.plan || 'Professional'}
    />
  );
}
