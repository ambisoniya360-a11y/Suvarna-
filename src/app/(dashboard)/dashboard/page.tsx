import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, HandCoins, Activity, IndianRupee } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch total customers
  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("*", { count: 'exact', head: true })

  // Fetch active loans
  const { count: activeLoans } = await supabase
    .from("loans")
    .select("*", { count: 'exact', head: true })
    .eq("status", "Active")

  // Fetch total outstanding amount
  const { data: outstandingLoans } = await supabase
    .from("loans")
    .select("loan_amount")
    .eq("status", "Active")
  
  const totalOutstanding = outstandingLoans?.reduce((acc, curr) => acc + Number(curr.loan_amount), 0) || 0

  // Fetch interest collected (total)
  const { data: interestPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("payment_type", "Interest Payment")
  
  const totalInterestCollected = interestPayments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Collected</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInterestCollected.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg mx-4">
              Chart Placeholder (Recharts)
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm">Welcome to SuvarnaLoan ERP</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  This dashboard provides a high-level overview of your gold loan business. You can navigate through the sidebar to manage your customers, issue new loans against gold items, and collect interest payments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
