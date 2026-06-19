import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateLoanDialog } from "@/components/loans/create-loan-dialog"
import { DownloadLoanButton } from "@/components/pdf/download-loan-button"
import { getLoans } from "@/actions/loan-actions"
import { getCustomers } from "@/actions/customer-actions"

export default async function LoansPage() {
  const loans = await getLoans()
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Loans</h2>
        <CreateLoanDialog customers={customers || []} />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search loans..."
            className="pl-8 bg-white/50 dark:bg-zinc-900/50"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Interest Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No active loans. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.loan_number}</TableCell>
                  <TableCell>{loan.customers?.full_name}</TableCell>
                  <TableCell>₹{loan.loan_amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {loan.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <DownloadLoanButton 
                      loan={loan} 
                      customer={loan.customers} 
                      shop={loan.customers?.shops} 
                      goldItem={loan.gold_items} 
                    />
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
