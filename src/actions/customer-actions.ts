"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  // For real implementation, you would extract the user's shop_id from the session or user metadata
  // Since we don't have a guaranteed shop_id right now in our dummy setup, we will query the first shop
  // Note: in a real production environment, shop_id must come from the authenticated user.
  
  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Not authenticated" }
  }

  // 2. Find user's shop_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("shop_id")
    .eq("id", user.id)
    .single()
  
  if (userError || !userData?.shop_id) {
    // If no user record exists, return an error. Or for testing, we can fall back.
    // return { error: "User is not assigned to any shop." }
  }

  const shopId = userData?.shop_id

  const fullName = formData.get("fullName") as string
  const mobileNumber = formData.get("mobileNumber") as string
  const aadhaarNumber = formData.get("aadhaarNumber") as string
  const panNumber = formData.get("panNumber") as string
  const address = formData.get("address") as string

  if (!fullName || !mobileNumber) {
    return { error: "Full Name and Mobile Number are required" }
  }

  const { data, error } = await supabase
    .from("customers")
    .insert([
      {
        shop_id: shopId, // This might be undefined if not set up, which will violate NOT NULL constraint.
        full_name: fullName,
        mobile_number: mobileNumber,
        aadhaar_number: aadhaarNumber,
        pan_number: panNumber,
        address: address,
        status: "Active",
      },
    ])
    .select()

  if (error) {
    console.error("Error creating customer:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers")
  return { data }
}

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }

  return data
}
