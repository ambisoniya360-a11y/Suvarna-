"use client"

import * as React from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { DailyReportPDF } from "../pdf/daily-report-pdf"
import { Button } from "@/components/ui/button"
import { FileDown, FileText, FileSpreadsheet } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DownloadButton({ reportData }: { reportData: any }) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const downloadCSV = () => {
    const rows = [
      ["Type", "Loan Number", "Customer", "Amount", "Interest/Method", "Date"],
    ]

    reportData.daily.loansData.forEach((loan: any) => {
      rows.push([
        "Loan Created",
        loan.loan_number,
        loan.customers?.full_name || "",
        loan.loan_amount.toString(),
        `${loan.interest_rate}%`,
        new Date(loan.created_at).toLocaleDateString()
      ])
    })

    reportData.daily.paymentsData.forEach((payment: any) => {
      rows.push([
        "Payment Received",
        payment.loans?.loan_number || "",
        payment.loans?.customers?.full_name || "",
        payment.amount.toString(),
        payment.payment_method,
        new Date(payment.created_at).toLocaleDateString()
      ])
    })

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Daily_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isClient) {
    return (
      <Button variant="outline" disabled>
        <FileDown className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel (CSV)
        </DropdownMenuItem>
        
        <PDFDownloadLink
          document={<DailyReportPDF reportData={reportData} />}
          fileName={`Daily_Report_${new Date().toISOString().split('T')[0]}.pdf`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {({ loading }) => (
            <DropdownMenuItem disabled={loading}>
              <FileText className="mr-2 h-4 w-4" />
              {loading ? "Generating PDF..." : "Export as PDF"}
            </DropdownMenuItem>
          )}
        </PDFDownloadLink>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
