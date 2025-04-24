"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle } from "lucide-react"
import { getSalesStats, getInventoryStats, getRecentSales, getLowStockProducts } from "@/lib/dashboard"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SalesChart } from "@/components/sales-chart"
import { DataTable } from "@/components/data-table"
import { getCurrentUser } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    dailySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
  })
  const [recentSales, setRecentSales] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [salesData, setSalesData] = useState([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const salesStats = await getSalesStats()
        const inventoryStats = await getInventoryStats()
        const recentSalesData = await getRecentSales()
        const lowStockData = await getLowStockProducts()

        setStats({
          dailySales: salesStats.dailySales,
          totalProducts: inventoryStats.totalProducts,
          totalCustomers: salesStats.totalCustomers,
          totalOrders: salesStats.totalOrders,
          lowStockCount: lowStockData.length,
        })

        setRecentSales(recentSalesData)
        setLowStockProducts(lowStockData)
        setSalesData(salesStats.salesData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const recentSalesColumns = [
    { accessorKey: "id", header: "ID Pesanan" },
    { accessorKey: "customer", header: "Pelanggan" },
    { accessorKey: "date", header: "Tanggal" },
    {
      accessorKey: "amount",
      header: "Jumlah",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusText = row.original.status === "completed" ? "Selesai" : "Tertunda"
        return (
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {statusText}
          </div>
        )
      },
    },
  ]

  const lowStockColumns = [
    { accessorKey: "id", header: "ID Produk" },
    { accessorKey: "name", header: "Nama Produk" },
    { accessorKey: "category", header: "Kategori" },
    { accessorKey: "currentStock", header: "Stok Saat Ini" },
    { accessorKey: "minStock", header: "Stok Minimum" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => router.push("/dashboard/pos")}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Penjualan Baru
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Harian</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.dailySales)}</div>
            <p className="text-xs text-muted-foreground">+12% dari kemarin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockCount} item stok rendah</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+5 baru hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+18 hari ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ikhtisar Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={salesData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Peringatan Stok Rendah</CardTitle>
            <CardDescription>Produk yang perlu segera diisi ulang</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stok saat ini:{" "}
                        <span className="font-medium text-red-600 dark:text-red-400">{product.currentStock}</span> (Min:{" "}
                        {product.minStock})
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/inventory")}>
                    Lihat semua {lowStockProducts.length} item stok rendah
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex h-[140px] items-center justify-center">
                <p className="text-sm text-muted-foreground">Tidak ada item stok rendah</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent-sales" className="w-full">
        <TabsList>
          <TabsTrigger value="recent-sales">Penjualan Terbaru</TabsTrigger>
          <TabsTrigger value="low-stock">Produk Stok Rendah</TabsTrigger>
        </TabsList>
        <TabsContent value="recent-sales">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan Terbaru</CardTitle>
              <CardDescription>Ikhtisar transaksi penjualan terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={recentSalesColumns}
                data={recentSales}
                searchKey="customer"
                searchPlaceholder="Cari pelanggan..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Produk Stok Rendah</CardTitle>
              <CardDescription>Produk yang perlu segera diisi ulang</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={lowStockColumns}
                data={lowStockProducts}
                searchKey="name"
                searchPlaceholder="Cari produk..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
