import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Auto-provision shop and user if they don't exist (for testing)
  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .single()

  if (!userProfile) {
    // Create a default shop
    const { data: newShop } = await supabase
      .from("shops")
      .insert([{ shop_name: "Demo Jewellery Shop", owner_name: session.user.email, mobile: "9999999999" }])
      .select()
      .single()

    if (newShop) {
      // Create user record
      await supabase.from("users").insert([
        { id: session.user.id, shop_id: newShop.id, name: session.user.email, role: "Shop Owner" }
      ])
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden relative flex flex-col">
        <header className="sticky top-0 z-10 w-full flex items-center justify-between px-4 h-14 border-b bg-background/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg ml-2">SuvarnaLoan Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
