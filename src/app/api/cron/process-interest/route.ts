import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// We use the Service Role Key here because cron jobs run outside user sessions
let supabaseInstance: any = null;
function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
    );
  }
  return supabaseInstance;
}

export async function GET(request: Request) {
  const supabase = getSupabase()
  // Simple authentication for cron (e.g., passing a secret token)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Note: In local development, you might want to bypass this or set CRON_SECRET in .env.local
    console.log("Unauthorized cron execution attempt.")
    // return new NextResponse('Unauthorized', { status: 401 })
  }

  console.log("Starting monthly interest calculation...")

  try {
    // 1. Fetch all active loans
    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .select(`
        id, loan_amount, interest_rate, loan_number,
        customers ( id, full_name, mobile_number )
      `)
      .eq("status", "Active")

    if (loansError) throw loansError

    let invoicesCreated = 0

    // 2. Process each loan
    for (const loan of loans || []) {
      const monthlyInterest = (loan.loan_amount * loan.interest_rate) / 100
      const invoiceNumber = `INV-${loan.loan_number}-${Date.now().toString().slice(-4)}`
      
      // Calculate due date (e.g., 5 days from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 5)

      // Create an Invoice record
      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          loan_id: loan.id,
          invoice_number: invoiceNumber,
          amount: monthlyInterest,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'Unpaid'
        }])

      if (!invoiceError) {
        invoicesCreated++
        
        // MOCK WHATSAPP REMINDER
        const customer = Array.isArray(loan.customers) ? loan.customers[0] : loan.customers
        const customerPhone = (customer as any)?.mobile_number
        const customerName = (customer as any)?.full_name
        
        console.log(`[MOCK WHATSAPP API] Message sent to ${customerPhone}`)
        console.log(`[MOCK WHATSAPP API] "Dear ${customerName}, your monthly interest payment of Rs.${monthlyInterest} for Loan ${loan.loan_number} is due on ${dueDate.toLocaleDateString()}. Please visit our shop."`)
        
        // Save to reminders table
        await supabase.from("reminders").insert([{
          customer_id: (customer as any)?.id,
          reminder_type: "WhatsApp",
          status: "Sent",
          sent_at: new Date().toISOString()
        }])
      } else {
        console.error(`Failed to create invoice for loan ${loan.id}:`, invoiceError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed interest for ${invoicesCreated} active loans.`,
      invoicesCreated
    })

  } catch (error: any) {
    console.error("Cron Job Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
