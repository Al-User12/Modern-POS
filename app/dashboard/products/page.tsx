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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table"
import { ChevronDown, Download, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from "@/lib/products"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function ProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    sku: "",
    barcode: "",
    stockQuantity: "",
    minStockLevel: "",
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const productsData = await getProducts()
        const categoriesData = await getCategories()

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data produk",
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
      name: "",
      description: "",
      category: "",
      price: "",
      cost: "",
      sku: "",
      barcode: "",
      stockQuantity: "",
      minStockLevel: "",
    })
  }

  const handleAddProduct = async () => {
    try {
      // Convert string values to numbers where needed
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        cost: Number.parseFloat(formData.cost),
        stockQuantity: Number.parseInt(formData.stockQuantity),
        minStockLevel: Number.parseInt(formData.minStockLevel),
      }

      const newProduct = await addProduct(productData)
      setProducts([...products, newProduct])

      await logAction({
        action: "product_created",
        details: `Produk "${newProduct.name}" telah dibuat`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Produk Ditambahkan",
        description: "Produk telah berhasil ditambahkan",
      })

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan produk",
      })
    }
  }

  const handleEditProduct = async () => {
    try {
      // Convert string values to numbers where needed
      const productData = {
        ...formData,
        id: currentProduct.id,
        price: Number.parseFloat(formData.price),
        cost: Number.parseFloat(formData.cost),
        stockQuantity: Number.parseInt(formData.stockQuantity),
        minStockLevel: Number.parseInt(formData.minStockLevel),
      }

      const updatedProduct = await updateProduct(productData)

      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

      await logAction({
        action: "product_updated",
        details: `Produk "${updatedProduct.name}" telah diperbarui`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Produk Diperbarui",
        description: "Produk telah berhasil diperbarui",
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui produk",
      })
    }
  }

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(currentProduct.id)

      setProducts(products.filter((p) => p.id !== currentProduct.id))

      await logAction({
        action: "product_deleted",
        details: `Produk "${currentProduct.name}" telah dihapus`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Produk Dihapus",
        description: "Produk telah berhasil dihapus",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus produk",
      })
    }
  }

  const openEditDialog = (product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      sku: product.sku || "",
      barcode: product.barcode || "",
      stockQuantity: product.stockQuantity.toString(),
      minStockLevel: product.minStockLevel.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "category", header: "Kategori" },
    {
      accessorKey: "price",
      header: "Harga",
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    { accessorKey: "stockQuantity", header: "Stok" },
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
              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog(product)}>
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
        <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Ekspor
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Ekspor sebagai CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Ekspor sebagai Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Ekspor sebagai PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Katalog Produk</CardTitle>
          <CardDescription>Kelola inventaris produk, harga, dan tingkat stok Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Cari produk..." />
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
            <DialogDescription>
              Isi detail produk di bawah ini untuk menambahkan produk baru ke inventaris Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi produk"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Biaya</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Masukkan SKU"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Masukkan barcode"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stockQuantity">Jumlah Stok</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStockLevel">Level Stok Minimum</Label>
                <Input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddProduct}>Tambah Produk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>Perbarui detail produk di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Produk</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Harga</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cost">Biaya</Label>
                <Input
                  id="edit-cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input id="edit-sku" name="sku" value={formData.sku} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-barcode">Barcode</Label>
                <Input id="edit-barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stockQuantity">Jumlah Stok</Label>
                <Input
                  id="edit-stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minStockLevel">Level Stok Minimum</Label>
                <Input
                  id="edit-minStockLevel"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditProduct}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk "{currentProduct?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
