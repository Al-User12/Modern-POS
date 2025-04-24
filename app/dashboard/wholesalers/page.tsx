"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/data-table"
import { Download, Edit, MoreHorizontal, Plus, Store, Trash2, Users } from "lucide-react"
import { getWholesalers, addWholesaler, updateWholesaler, deleteWholesaler } from "@/lib/wholesalers"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function WholesalersPage() {
  const { toast } = useToast()
  const [wholesalers, setWholesalers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentWholesaler, setCurrentWholesaler] = useState(null)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

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

        const wholesalersData = await getWholesalers()
        setWholesalers(wholesalersData)
      } catch (error) {
        console.error("Error fetching wholesalers:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data tengkulak",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    })
  }

  const handleAddWholesaler = async () => {
    try {
      const newWholesaler = await addWholesaler(formData)
      setWholesalers([...wholesalers, newWholesaler])

      await logAction({
        action: "wholesaler_created",
        details: `Tengkulak "${newWholesaler.name}" telah ditambahkan`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Tengkulak Ditambahkan",
        description: "Tengkulak baru telah berhasil ditambahkan",
      })

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding wholesaler:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan tengkulak",
      })
    }
  }

  const handleEditWholesaler = async () => {
    try {
      const updatedWholesaler = await updateWholesaler({
        id: currentWholesaler.id,
        ...formData,
      })

      setWholesalers(wholesalers.map((w) => (w.id === updatedWholesaler.id ? updatedWholesaler : w)))

      await logAction({
        action: "wholesaler_updated",
        details: `Tengkulak "${updatedWholesaler.name}" telah diperbarui`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Tengkulak Diperbarui",
        description: "Data tengkulak telah berhasil diperbarui",
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating wholesaler:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui data tengkulak",
      })
    }
  }

  const handleDeleteWholesaler = async () => {
    try {
      await deleteWholesaler(currentWholesaler.id)

      setWholesalers(wholesalers.filter((w) => w.id !== currentWholesaler.id))

      await logAction({
        action: "wholesaler_deleted",
        details: `Tengkulak "${currentWholesaler.name}" telah dihapus`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Tengkulak Dihapus",
        description: "Tengkulak telah berhasil dihapus",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting wholesaler:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus tengkulak",
      })
    }
  }

  const openEditDialog = (wholesaler) => {
    setCurrentWholesaler(wholesaler)
    setFormData({
      name: wholesaler.name,
      contactPerson: wholesaler.contactPerson,
      phone: wholesaler.phone,
      email: wholesaler.email,
      address: wholesaler.address,
      notes: wholesaler.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (wholesaler) => {
    setCurrentWholesaler(wholesaler)
    setIsDeleteDialogOpen(true)
  }

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Nama Tengkulak" },
    { accessorKey: "contactPerson", header: "Kontak Person" },
    { accessorKey: "phone", header: "Telepon" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${row.original.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {row.original.isActive ? "Aktif" : "Tidak Aktif"}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Terakhir Diperbarui",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const wholesaler = row.original

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
              <DropdownMenuItem onClick={() => openEditDialog(wholesaler)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog(wholesaler)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
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
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Tengkulak</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tengkulak
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tengkulak</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wholesalers.length}</div>
            <p className="text-xs text-muted-foreground">Pemasok terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tengkulak Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wholesalers.filter((w) => w.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Pemasok aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tengkulak Baru</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                wholesalers.filter((w) => new Date(w.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Ditambahkan dalam 30 hari terakhir</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tengkulak</CardTitle>
          <CardDescription>Kelola daftar tengkulak dan pemasok Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={wholesalers} searchKey="name" searchPlaceholder="Cari tengkulak..." />
        </CardContent>
      </Card>

      {/* Add Wholesaler Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Tengkulak Baru</DialogTitle>
            <DialogDescription>Tambahkan tengkulak atau pemasok baru ke dalam sistem.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Tengkulak</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama tengkulak"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Nama Kontak</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Masukkan nama kontak"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Masukkan catatan tambahan (opsional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddWholesaler}>Tambah Tengkulak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Wholesaler Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tengkulak</DialogTitle>
            <DialogDescription>Perbarui informasi tengkulak.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama Tengkulak</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama tengkulak"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactPerson">Nama Kontak</Label>
              <Input
                id="edit-contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Masukkan nama kontak"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Alamat</Label>
              <Textarea
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Catatan</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Masukkan catatan tambahan (opsional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditWholesaler}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Wholesaler Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tengkulak "{currentWholesaler?.name}"? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteWholesaler}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
