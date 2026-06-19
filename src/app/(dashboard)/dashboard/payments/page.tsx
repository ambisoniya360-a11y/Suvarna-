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
import { ReceivePaymentDialog } from "@/components/payments/receive-payment-dialog"
import { DownloadReceiptButton } from "@/components/pdf/download-receipt-button"
import { getPayments } from "@/actions/payment-actions"
import { getLoans } from "@/actions/loan-actions"

export default async function PaymentsPage() {
  const payments = await getPayments()
  const loans = await getLoans()
  
  // Filter active loans for the payment dialog
  const activeLoans = loans.filter((loan: any) => loan.status === "Active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Payments & Invoices</h2>
        <ReceivePaymentDialog activeLoans={activeLoans || []} />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="pl-8 bg-white/50 dark:bg-zinc-900/50"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Loan</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No payments recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.loans?.loan_number}</TableCell>
                  <TableCell>{payment.loans?.customers?.full_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {payment.payment_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell className="text-right">
                    <DownloadReceiptButton 
                      payment={payment}
                      loan={payment.loans}
                      customer={payment.loans?.customers}
                      shop={payment.loans?.customers?.shops}
                    />
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
