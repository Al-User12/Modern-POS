"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table"
import { Edit, Key, MoreHorizontal, Trash2, User, UserPlus, Users } from "lucide-react"
import { getUsers, addUser, updateUser, deleteUser, resetUserPassword } from "@/lib/users"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    role: "cashier",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLoggedInUser = await getCurrentUser()
        setLoggedInUser(currentLoggedInUser)

        if (currentLoggedInUser?.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses halaman ini",
          })
          return
        }

        const usersData = await getUsers()
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data pengguna",
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

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      email: "",
      role: "cashier",
      password: "",
      confirmPassword: "",
    })
  }

  const validateForm = () => {
    if (!formData.username || !formData.name || !formData.email || !formData.role) {
      toast({
        variant: "destructive",
        title: "Error Validasi",
        description: "Silakan isi semua kolom yang diperlukan",
      })
      return false
    }

    if (isAddDialogOpen && (!formData.password || !formData.confirmPassword)) {
      toast({
        variant: "destructive",
        title: "Error Validasi",
        description: "Silakan berikan password",
      })
      return false
    }

    if (isAddDialogOpen && formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error Validasi",
        description: "Password tidak cocok",
      })
      return false
    }

    return true
  }

  const handleAddUser = async () => {
    try {
      if (!validateForm()) return

      const userData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      }

      const newUser = await addUser(userData)
      setUsers([...users, newUser])

      await logAction({
        action: "user_created",
        details: `Pengguna "${newUser.username}" dibuat dengan peran "${newUser.role === "admin" ? "Admin" : "Kasir"}"`,
        userId: loggedInUser?.id,
        username: loggedInUser?.username,
      })

      toast({
        title: "Pengguna Ditambahkan",
        description: "Pengguna telah berhasil ditambahkan",
      })

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan pengguna",
      })
    }
  }

  const handleEditUser = async () => {
    try {
      if (!validateForm()) return

      const userData = {
        id: currentUser.id,
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      const updatedUser = await updateUser(userData)

      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))

      await logAction({
        action: "user_updated",
        details: `Pengguna "${updatedUser.username}" diperbarui`,
        userId: loggedInUser?.id,
        username: loggedInUser?.username,
      })

      toast({
        title: "Pengguna Diperbarui",
        description: "Pengguna telah berhasil diperbarui",
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui pengguna",
      })
    }
  }

  const handleDeleteUser = async () => {
    try {
      await deleteUser(currentUser.id)

      setUsers(users.filter((u) => u.id !== currentUser.id))

      await logAction({
        action: "user_deleted",
        details: `Pengguna "${currentUser.username}" dihapus`,
        userId: loggedInUser?.id,
        username: loggedInUser?.username,
      })

      toast({
        title: "Pengguna Dihapus",
        description: "Pengguna telah berhasil dihapus",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus pengguna",
      })
    }
  }

  const handleResetPassword = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error Validasi",
          description: "Password tidak cocok",
        })
        return
      }

      await resetUserPassword(currentUser.id, formData.password)

      await logAction({
        action: "password_reset",
        details: `Password direset untuk pengguna "${currentUser.username}"`,
        userId: loggedInUser?.id,
        username: loggedInUser?.username,
      })

      toast({
        title: "Password Direset",
        description: "Password telah berhasil direset",
      })

      setIsResetPasswordDialogOpen(false)
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mereset password",
      })
    }
  }

  const openEditDialog = (user) => {
    setCurrentUser(user)
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  const openResetPasswordDialog = (user) => {
    setCurrentUser(user)
    setFormData({
      ...formData,
      password: "",
      confirmPassword: "",
    })
    setIsResetPasswordDialogOpen(true)
  }

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Peran",
      cell: ({ row }) => <div className="capitalize">{row.original.role === "admin" ? "Admin" : "Kasir"}</div>,
    },
    {
      accessorKey: "lastLogin",
      header: "Login Terakhir",
      cell: ({ row }) => (row.original.lastLogin ? formatDate(row.original.lastLogin, true) : "Belum Pernah"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

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
              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteDialog(user)}
                disabled={user.id === loggedInUser?.id}
                className={user.id === loggedInUser?.id ? "text-muted-foreground" : "text-destructive"}
              >
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
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Pengguna sistem aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</div>
            <p className="text-xs text-muted-foreground">Pengguna dengan hak admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kasir</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => user.role === "cashier").length}</div>
            <p className="text-xs text-muted-foreground">Pengguna dengan hak kasir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Login Terbaru</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter(
                  (user) => user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Pengguna login dalam 24 jam</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengguna Sistem</CardTitle>
          <CardDescription>Kelola akun pengguna dan izin akses</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} searchKey="username" searchPlaceholder="Cari pengguna..." />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>Buat akun pengguna baru dengan peran dan izin tertentu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Masukkan username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Peran</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Kasir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Konfirmasi password"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddUser}>Tambah Pengguna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Perbarui detail akun pengguna dan izin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Masukkan username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Peran</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  disabled={currentUser?.id === loggedInUser?.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Kasir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditUser}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna "{currentUser?.username}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Tetapkan password baru untuk pengguna "{currentUser?.username}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password baru"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-new-password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm-new-password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
