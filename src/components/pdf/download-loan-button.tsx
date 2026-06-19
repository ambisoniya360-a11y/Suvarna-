"use client"

import * as React from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { LoanAgreementPDF } from "./loan-agreement"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export function DownloadLoanButton({ loan, customer, shop, goldItem }: any) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button variant="outline" size="sm" disabled>
        <FileText className="mr-2 h-4 w-4" />
        Preparing PDF...
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <LoanAgreementPDF
          loan={loan}
          customer={customer}
          shop={shop}
          goldItem={goldItem}
        />
      }
      fileName={`Loan_Agreement_${loan.loan_number}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <FileText className="mr-2 h-4 w-4" />
          {loading ? "Generating PDF..." : "Download Agreement"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
