"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createLoan(formData: FormData) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Not authenticated" }
  }

  // 2. Fetch customer details
  const customerId = formData.get("customerId") as string
  const loanAmount = parseFloat(formData.get("loanAmount") as string)
  const interestRate = parseFloat(formData.get("interestRate") as string)
  const ornamentType = formData.get("ornamentType") as string
  const grossWeight = parseFloat(formData.get("grossWeight") as string)
  const netWeight = parseFloat(formData.get("netWeight") as string)
  const purity = formData.get("purity") as string

  if (!customerId || !loanAmount || !interestRate || !ornamentType) {
    return { error: "Missing required fields" }
  }

  // Generate unique loan number
  const loanNumber = `LN-${Date.now().toString().slice(-6)}`

  // 3. Start a transaction (or sequential inserts if Supabase RPC isn't available)
  // Insert Gold Item
  const { data: goldItemData, error: goldError } = await supabase
    .from("gold_items")
    .insert([
      {
        customer_id: customerId,
        ornament_type: ornamentType,
        gross_weight: grossWeight,
        net_weight: netWeight,
        purity: purity,
      },
    ])
    .select()
    .single()

  if (goldError || !goldItemData) {
    return { error: "Failed to save gold item details: " + goldError?.message }
  }

  // Insert Loan
  const { data: loanData, error: loanError } = await supabase
    .from("loans")
    .insert([
      {
        customer_id: customerId,
        gold_item_id: goldItemData.id,
        loan_number: loanNumber,
        loan_amount: loanAmount,
        interest_rate: interestRate,
        loan_date: new Date().toISOString().split('T')[0],
        status: "Active",
      },
    ])
    .select()

  if (loanError) {
    return { error: "Failed to create loan: " + loanError.message }
  }

  revalidatePath("/dashboard/loans")
  return { data: loanData }
}

export async function getLoans() {
  const supabase = await createClient()
  
  // Fetch loans with customer details
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      customers ( 
        full_name, mobile_number, address, aadhaar_number,
        shops ( shop_name, owner_name, mobile )
      ),
      gold_items (
        ornament_type, purity, gross_weight, net_weight
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching loans:", error)
    return []
  }

  return data
}
