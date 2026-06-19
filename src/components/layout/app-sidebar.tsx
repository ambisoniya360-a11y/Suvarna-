import Link from "next/link"
import { LayoutDashboard, Users, Gem, HandCoins, ReceiptText, Settings, LogOut, Bell, BarChart3 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", url: "/dashboard/customers", icon: Users },
  { title: "Gold Items", url: "/dashboard/gold-items", icon: Gem },
  { title: "Loans", url: "/dashboard/loans", icon: HandCoins },
  { title: "Payments & Invoices", url: "/dashboard/payments", icon: ReceiptText },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b dark:border-zinc-800">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <Gem size={20} />
          </div>
          <span>SuvarnaLoan</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t dark:border-zinc-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-red-500 hover:text-red-600">
              <button>
                <LogOut />
                <span>Log out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
