"use client"

import * as React from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { PaymentReceiptPDF } from "./payment-receipt"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DownloadReceiptButton({ payment, loan, customer, shop }: any) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Download className="mr-2 h-4 w-4" />
        Receipt
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <PaymentReceiptPDF
          payment={payment}
          loan={loan}
          customer={customer}
          shop={shop}
        />
      }
      fileName={`Receipt_${payment.id}.pdf`}
    >
      {({ loading }) => (
        <Button variant="ghost" size="sm" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Receipt"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
