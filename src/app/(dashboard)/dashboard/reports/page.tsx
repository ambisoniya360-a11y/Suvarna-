import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadButton } from "@/components/reports/download-reports-button"

async function getReportData() {
  const supabase = await createClient()

  // Get start of today and start of month
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // 1. Daily Report Data (Created today)
  const { data: dailyLoans } = await supabase
    .from("loans")
    .select("*, customers(full_name)")
    .gte("created_at", today.toISOString())
  
  const { data: dailyPayments } = await supabase
    .from("payments")
    .select("*, loans(loan_number, customers(full_name))")
    .gte("created_at", today.toISOString())

  // 2. Monthly Report Data (Created this month)
  const { data: monthlyInterest } = await supabase
    .from("payments")
    .select("amount")
    .eq("payment_type", "Interest Payment")
    .gte("created_at", startOfMonth.toISOString())
  
  const { count: monthlyNewCustomers } = await supabase
    .from("customers")
    .select("*", { count: 'exact', head: true })
    .gte("created_at", startOfMonth.toISOString())
  
  const { count: monthlyClosedLoans } = await supabase
    .from("loans")
    .select("*", { count: 'exact', head: true })
    .eq("status", "Closed")
    .gte("created_at", startOfMonth.toISOString())

  const totalMonthlyInterest = monthlyInterest?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  return {
    daily: {
      loansCreated: dailyLoans?.length || 0,
      paymentsReceived: dailyPayments?.length || 0,
      loansData: dailyLoans || [],
      paymentsData: dailyPayments || []
    },
    monthly: {
      interestCollection: totalMonthlyInterest,
      newCustomers: monthlyNewCustomers || 0,
      closedLoans: monthlyClosedLoans || 0
    }
  }
}

export default async function ReportsPage() {
  const reportData = await getReportData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <DownloadButton reportData={reportData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Daily Report (Today)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">New Loans Created</span>
              <span className="font-bold text-lg">{reportData.daily.loansCreated}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Payments Received</span>
              <span className="font-bold text-lg">{reportData.daily.paymentsReceived}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Monthly Report (This Month)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Interest Collected</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                ₹{reportData.monthly.interestCollection.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">New Customers</span>
              <span className="font-bold text-lg">{reportData.monthly.newCustomers}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Loans Closed</span>
              <span className="font-bold text-lg">{reportData.monthly.closedLoans}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can download the full detailed daily and monthly transactions in Excel (CSV) or PDF format using the export button in the top right corner.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
