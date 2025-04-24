"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { Download } from "lucide-react"
import { getAuditLogs } from "@/lib/audit"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

export default function AuditLogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState([])
  const [timeRange, setTimeRange] = useState("7days")
  const [actionType, setActionType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const logsData = await getAuditLogs(timeRange, actionType)
        setLogs(logsData)
      } catch (error) {
        console.error("Error fetching audit logs:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat log audit",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, actionType, toast])

  const handleExport = () => {
    toast({
      title: "Ekspor Dimulai",
      description: "Log audit Anda sedang diekspor",
    })
  }

  const columns = [
    { accessorKey: "id", header: "ID Log" },
    {
      accessorKey: "timestamp",
      header: "Waktu",
      cell: ({ row }) => formatDate(row.original.timestamp, true),
    },
    { accessorKey: "username", header: "Pengguna" },
    {
      accessorKey: "action",
      header: "Tindakan",
      cell: ({ row }) => {
        const action = row.original.action
        const actionMap = {
          login: "Masuk",
          logout: "Keluar",
          product_created: "Produk Dibuat",
          product_updated: "Produk Diperbarui",
          product_deleted: "Produk Dihapus",
          inventory_adjusted: "Inventaris Disesuaikan",
          sale_completed: "Penjualan Selesai",
          user_created: "Pengguna Dibuat",
          user_updated: "Pengguna Diperbarui",
          user_deleted: "Pengguna Dihapus",
          password_reset: "Reset Password",
          settings_updated: "Pengaturan Diperbarui",
          backup_created: "Backup Dibuat",
          backup_restored: "Backup Dipulihkan",
          backup_downloaded: "Backup Diunduh",
        }
        return actionMap[action] || action
      },
    },
    { accessorKey: "details", header: "Detail" },
    { accessorKey: "ipAddress", header: "Alamat IP" },
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
        <h1 className="text-2xl font-bold tracking-tight">Log Audit</h1>
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
            </SelectContent>
          </Select>
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih jenis tindakan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tindakan</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="product">Perubahan Produk</SelectItem>
              <SelectItem value="inventory">Perubahan Inventaris</SelectItem>
              <SelectItem value="sale">Penjualan</SelectItem>
              <SelectItem value="user">Manajemen Pengguna</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Sistem</CardTitle>
          <CardDescription>Log komprehensif dari semua aktivitas dan perubahan sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={logs} searchKey="details" searchPlaceholder="Cari log..." />
        </CardContent>
      </Card>
    </div>
  )
}
