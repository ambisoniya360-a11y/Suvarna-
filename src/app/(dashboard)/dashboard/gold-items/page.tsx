import { createClient } from "@/lib/supabase/server"
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

async function getGoldItems() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("gold_items")
    .select(`
      *,
      customers ( full_name )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching gold items:", error)
    return []
  }

  return data
}

export default async function GoldItemsPage() {
  const goldItems = await getGoldItems()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gold Items</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ornaments..."
            className="pl-8 bg-white/50 dark:bg-zinc-900/50"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Gross Wt</TableHead>
              <TableHead>Net Wt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goldItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No gold items found. Items are added when loans are created.
                </TableCell>
              </TableRow>
            ) : (
              goldItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.customers?.full_name}</TableCell>
                  <TableCell>{item.ornament_type}</TableCell>
                  <TableCell>{item.purity}</TableCell>
                  <TableCell>{item.gross_weight}g</TableCell>
                  <TableCell>{item.net_weight}g</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Details</Button>
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
