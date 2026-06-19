"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPayment(formData: FormData) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Not authenticated" }
  }

  const loanId = formData.get("loanId") as string
  const paymentType = formData.get("paymentType") as string
  const amount = parseFloat(formData.get("amount") as string)
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string

  if (!loanId || !paymentType || !amount || !paymentMethod) {
    return { error: "Missing required fields" }
  }

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        loan_id: loanId,
        payment_type: paymentType,
        amount: amount,
        payment_method: paymentMethod,
        notes: notes,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating payment:", error)
    return { error: error.message }
  }

  // If Full Settlement, we should probably update the loan status to 'Closed'
  if (paymentType === "Full Settlement") {
    await supabase.from("loans").update({ status: "Closed" }).eq("id", loanId)
  }

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard/loans")
  return { data }
}

export async function getPayments() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      loans ( 
        loan_number,
        customers ( 
          full_name, mobile_number, address,
          shops ( shop_name, owner_name, mobile )
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return data
}
