"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table"
import { AlertTriangle, ArrowUpDown, Download, Edit, MoreHorizontal, Package, Plus } from "lucide-react"
import { getInventory, updateInventory, getLowStockProducts } from "@/lib/inventory"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function InventoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [inventory, setInventory] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const inventoryData = await getInventory()
        const lowStockData = await getLowStockProducts()

        setInventory(inventoryData)
        setLowStockProducts(lowStockData)
      } catch (error) {
        console.error("Error fetching inventory:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data inventaris",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAdjustInventory = async () => {
    try {
      const quantity = Number.parseInt(adjustmentQuantity)

      if (isNaN(quantity)) {
        toast({
          variant: "destructive",
          title: "Jumlah Tidak Valid",
          description: "Silakan masukkan angka yang valid",
        })
        return
      }

      const newQuantity = currentProduct.stockQuantity + quantity

      if (newQuantity < 0) {
        toast({
          variant: "destructive",
          title: "Penyesuaian Tidak Valid",
          description: "Penyesuaian akan menghasilkan stok negatif",
        })
        return
      }

      const updatedProduct = await updateInventory({
        productId: currentProduct.id,
        quantity,
        reason: adjustmentReason,
        userId: user?.id,
        username: user?.username,
      })

      setInventory(inventory.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))

      await logAction({
        action: "inventory_adjusted",
        details: `Menyesuaikan inventaris untuk "${currentProduct.name}" sebanyak ${quantity} unit. Alasan: ${adjustmentReason}`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Inventaris Diperbarui",
        description: "Inventaris telah berhasil disesuaikan",
      })

      setIsAdjustDialogOpen(false)
      setAdjustmentQuantity("")
      setAdjustmentReason("")
    } catch (error) {
      console.error("Error adjusting inventory:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyesuaikan inventaris",
      })
    }
  }

  const openAdjustDialog = (product) => {
    setCurrentProduct(product)
    setAdjustmentQuantity("")
    setAdjustmentReason("")
    setIsAdjustDialogOpen(true)
  }

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Nama Produk" },
    { accessorKey: "category", header: "Kategori" },
    { accessorKey: "sku", header: "SKU" },
    {
      accessorKey: "stockQuantity",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Stok
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const stockQuantity = row.original.stockQuantity
        const minStockLevel = row.original.minStockLevel
        const isLowStock = stockQuantity <= minStockLevel

        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? "text-red-500 font-medium" : ""}>{stockQuantity}</span>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        )
      },
    },
    { accessorKey: "minStockLevel", header: "Stok Minimum" },
    {
      accessorKey: "value",
      header: "Nilai Inventaris",
      cell: ({ row }) => {
        const value = row.original.stockQuantity * row.original.cost
        return formatCurrency(value)
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openAdjustDialog(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Sesuaikan Stok
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/dashboard/products?edit=${product.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Produk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Inventaris</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
          <Button onClick={() => router.push("/dashboard/products")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {inventory.reduce((total, item) => total + item.stockQuantity, 0)} unit dalam stok
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Item Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Item di bawah level stok minimum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(inventory.reduce((total, item) => total + item.cost * item.stockQuantity, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total nilai inventaris pada biaya</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nilai Eceran</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(inventory.reduce((total, item) => total + item.price * item.stockQuantity, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total nilai inventaris pada harga eceran</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventaris</CardTitle>
          <CardDescription>Kelola inventaris produk dan level stok Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={inventory} searchKey="name" searchPlaceholder="Cari produk..." />
        </CardContent>
      </Card>

      {/* Adjust Inventory Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sesuaikan Inventaris</DialogTitle>
            <DialogDescription>Perbarui jumlah stok untuk {currentProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-stock">Stok Saat Ini</Label>
              <Input id="current-stock" value={currentProduct?.stockQuantity || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment">Penyesuaian (positif untuk menambah, negatif untuk mengurangi)</Label>
              <Input
                id="adjustment"
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Masukkan jumlah untuk disesuaikan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Alasan Penyesuaian</Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Masukkan alasan penyesuaian"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-stock">Level Stok Baru</Label>
              <Input
                id="new-stock"
                value={
                  currentProduct && adjustmentQuantity
                    ? Math.max(0, currentProduct.stockQuantity + Number.parseInt(adjustmentQuantity || "0"))
                    : currentProduct?.stockQuantity || ""
                }
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAdjustInventory}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
