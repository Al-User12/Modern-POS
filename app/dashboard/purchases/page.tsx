"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table"
import { ArrowDown, ArrowUp, Calendar, Download, Eye, MoreHorizontal, Plus, ShoppingBag } from "lucide-react"
import { getPurchases, getPurchaseStats, updatePurchaseStatus } from "@/lib/purchases"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function PurchasesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [user, setUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser?.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses halaman ini",
          })
          return
        }

        const purchasesData = await getPurchases()
        const statsData = await getPurchaseStats()

        setPurchases(purchasesData)
        setStats(statsData)
      } catch (error) {
        console.error("Error fetching purchases:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data pembelian",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleUpdateStatus = async () => {
    try {
      const updatedPurchase = await updatePurchaseStatus(
        currentPurchase.id,
        selectedStatus,
        selectedStatus === "received" ? new Date().toISOString() : null,
      )

      setPurchases(purchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p)))

      await logAction({
        action: "purchase_status_updated",
        details: `Status pembelian #${updatedPurchase.id} diubah menjadi "${selectedStatus}"`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Status Diperbarui",
        description: "Status pembelian telah berhasil diperbarui",
      })

      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error("Error updating purchase status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui status pembelian",
      })
    }
  }

  const openViewDialog = (purchase) => {
    setCurrentPurchase(purchase)
    setIsViewDialogOpen(true)
  }

  const openStatusDialog = (purchase) => {
    setCurrentPurchase(purchase)
    setSelectedStatus(purchase.paymentStatus)
    setIsStatusDialogOpen(true)
  }

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "wholesalerName", header: "Tengkulak" },
    {
      accessorKey: "purchaseDate",
      header: "Tanggal Pembelian",
      cell: ({ row }) => formatDate(row.original.purchaseDate),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "paymentStatus",
      header: "Status Pembayaran",
      cell: ({ row }) => {
        const status = row.original.paymentStatus
        let statusClass = ""
        let statusText = ""

        switch (status) {
          case "paid":
            statusClass = "bg-green-100 text-green-800"
            statusText = "Lunas"
            break
          case "pending":
            statusClass = "bg-yellow-100 text-yellow-800"
            statusText = "Tertunda"
            break
          case "partial":
            statusClass = "bg-blue-100 text-blue-800"
            statusText = "Sebagian"
            break
          default:
            statusClass = "bg-gray-100 text-gray-800"
            statusText = status
        }

        return <div className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>{statusText}</div>
      },
    },
    {
      accessorKey: "receivedDate",
      header: "Tanggal Diterima",
      cell: ({ row }) => (row.original.receivedDate ? formatDate(row.original.receivedDate) : "Belum diterima"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const purchase = row.original

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
              <DropdownMenuItem onClick={() => openViewDialog(purchase)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openStatusDialog(purchase)}>
                <Calendar className="mr-2 h-4 w-4" />
                Perbarui Status
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
        <h1 className="text-2xl font-bold tracking-tight">Pembelian dari Tengkulak</h1>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih rentang waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Waktu</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
          <Button onClick={() => router.push("/dashboard/purchases/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Pembelian
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Transaksi pembelian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Nilai pembelian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Tertunda</CardTitle>
            <ArrowDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Transaksi belum lunas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembelian</CardTitle>
          <CardDescription>Daftar transaksi pembelian dari tengkulak</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={purchases}
            searchKey="wholesalerName"
            searchPlaceholder="Cari berdasarkan tengkulak..."
          />
        </CardContent>
      </Card>

      {/* View Purchase Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Pembelian #{currentPurchase?.id}</DialogTitle>
            <DialogDescription>Informasi lengkap transaksi pembelian</DialogDescription>
          </DialogHeader>
          {currentPurchase && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Tengkulak</h3>
                  <p>{currentPurchase.wholesalerName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Tanggal Pembelian</h3>
                  <p>{formatDate(currentPurchase.purchaseDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Status Pembayaran</h3>
                  <div
                    className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      currentPurchase.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : currentPurchase.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {currentPurchase.paymentStatus === "paid"
                      ? "Lunas"
                      : currentPurchase.paymentStatus === "pending"
                        ? "Tertunda"
                        : "Sebagian"}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Metode Pembayaran</h3>
                  <p className="capitalize">
                    {currentPurchase.paymentMethod === "cash"
                      ? "Tunai"
                      : currentPurchase.paymentMethod === "transfer"
                        ? "Transfer Bank"
                        : currentPurchase.paymentMethod}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Item yang Dibeli</h3>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-sm font-medium">Produk</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Jumlah</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Harga Satuan</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentPurchase.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.unitCost)}</td>
                          <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(currentPurchase.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>{formatCurrency(currentPurchase.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(currentPurchase.total)}</span>
                </div>
              </div>

              {currentPurchase.notes && (
                <div>
                  <h3 className="font-medium">Catatan</h3>
                  <p className="text-sm text-muted-foreground">{currentPurchase.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perbarui Status Pembelian</DialogTitle>
            <DialogDescription>Perbarui status pembayaran untuk pembelian #{currentPurchase?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status Pembayaran</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Tertunda</SelectItem>
                  <SelectItem value="partial">Sebagian Dibayar</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="received">Diterima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateStatus}>Perbarui Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
