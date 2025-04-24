"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Download, LineChart, PieChart, TrendingUp } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { SalesChart } from "@/components/sales-chart"
import { ProductSalesChart } from "@/components/product-sales-chart"
import { CategorySalesChart } from "@/components/category-sales-chart"
import { getSalesReportData, getProductSalesData, getCategorySalesData, getDailySalesData } from "@/lib/reports"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

export default function ReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("sales")
  const [timeRange, setTimeRange] = useState("7days")
  const [salesData, setSalesData] = useState([])
  const [productSalesData, setProductSalesData] = useState([])
  const [categorySalesData, setCategorySalesData] = useState([])
  const [dailySalesData, setDailySalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const salesReportData = await getSalesReportData(timeRange)
        const productData = await getProductSalesData(timeRange)
        const categoryData = await getCategorySalesData(timeRange)
        const dailyData = await getDailySalesData(timeRange)

        setSalesData(salesReportData)
        setProductSalesData(productData)
        setCategorySalesData(categoryData)
        setDailySalesData(dailyData)
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data laporan",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, toast])

  const handleExport = () => {
    toast({
      title: "Ekspor Dimulai",
      description: "Laporan Anda sedang diekspor",
    })
  }

  const salesColumns = [
    { accessorKey: "id", header: "ID Penjualan" },
    { accessorKey: "date", header: "Tanggal", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "customer", header: "Pelanggan" },
    { accessorKey: "cashier", header: "Kasir" },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "profit",
      header: "Keuntungan",
      cell: ({ row }) => formatCurrency(row.original.profit),
    },
    {
      accessorKey: "paymentMethod",
      header: "Metode Pembayaran",
      cell: ({ row }) => {
        const method = row.original.paymentMethod
        return (
          <span className="capitalize">{method === "cash" ? "Tunai" : method === "card" ? "Kartu" : "Lainnya"}</span>
        )
      },
    },
  ]

  const productSalesColumns = [
    { accessorKey: "id", header: "ID Produk" },
    { accessorKey: "name", header: "Nama Produk" },
    { accessorKey: "category", header: "Kategori" },
    { accessorKey: "quantitySold", header: "Jumlah Terjual" },
    {
      accessorKey: "revenue",
      header: "Pendapatan",
      cell: ({ row }) => formatCurrency(row.original.revenue),
    },
    {
      accessorKey: "profit",
      header: "Keuntungan",
      cell: ({ row }) => formatCurrency(row.original.profit),
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
        <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik</h1>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih rentang waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesData.reduce((total, sale) => total + sale.total, 0))}
            </div>
            <p className="text-xs text-muted-foreground">{salesData.length} transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Keuntungan</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesData.reduce((total, sale) => total + sale.profit, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (salesData.reduce((total, sale) => total + sale.profit, 0) /
                  salesData.reduce((total, sale) => total + sale.total, 0)) *
                100
              ).toFixed(1)}
              % margin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai Penjualan</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                salesData.length > 0 ? salesData.reduce((total, sale) => total + sale.total, 0) / salesData.length : 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Item Terjual</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productSalesData.reduce((total, product) => total + product.quantitySold, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Dari {productSalesData.length} produk</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Ikhtisar Penjualan</TabsTrigger>
          <TabsTrigger value="products">Performa Produk</TabsTrigger>
          <TabsTrigger value="categories">Analisis Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tren Penjualan</CardTitle>
              <CardDescription>Performa penjualan harian dari waktu ke waktu</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <SalesChart data={dailySalesData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Penjualan</CardTitle>
              <CardDescription>Daftar rinci semua transaksi penjualan</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={salesColumns}
                data={salesData}
                searchKey="customer"
                searchPlaceholder="Cari pelanggan..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
              <CardDescription>Produk dengan volume penjualan tertinggi</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ProductSalesChart data={productSalesData.slice(0, 10)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Penjualan Produk</CardTitle>
              <CardDescription>Rincian performa produk</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productSalesColumns}
                data={productSalesData}
                searchKey="name"
                searchPlaceholder="Cari produk..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan berdasarkan Kategori</CardTitle>
              <CardDescription>Distribusi pendapatan di seluruh kategori produk</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <CategorySalesChart data={categorySalesData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performa Kategori</CardTitle>
              <CardDescription>Rincian performa kategori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySalesData.map((category) => (
                  <div key={category.name} className="flex items-center">
                    <div className="w-1/4 font-medium">{category.name}</div>
                    <div className="w-3/4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${(category.revenue / categorySalesData[0].revenue) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right">{formatCurrency(category.revenue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
