import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReportsClient from './reports-client';
import { getReportData } from '@/actions/report-actions';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user.id).single();
  if (!profile?.shop_id) redirect('/dashboard');

  // Default: current month
  const now = new Date();
  const dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const dateTo = now.toISOString().split('T')[0];

  const { data: reportData } = await getReportData(dateFrom, dateTo);

  return <ReportsClient initialData={reportData ?? null} defaultFrom={dateFrom} defaultTo={dateTo} />;
}
