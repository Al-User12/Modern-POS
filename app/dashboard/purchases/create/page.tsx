"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react"
import { getWholesalers } from "@/lib/wholesalers"
import { getProducts } from "@/lib/products"
import { createPurchase } from "@/lib/purchases"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function CreatePurchasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [wholesalers, setWholesalers] = useState([])
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [purchaseData, setPurchaseData] = useState({
    wholesalerId: "",
    items: [],
    paymentMethod: "cash",
    paymentStatus: "pending",
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
          router.push("/dashboard")
          return
        }

        const wholesalersData = await getWholesalers()
        const productsData = await getProducts()

        setWholesalers(wholesalersData)
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast, router])

  useEffect(() => {
    // Filter products based on search term
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPurchaseData({ ...purchaseData, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setPurchaseData({ ...purchaseData, [name]: value })
  }

  const addToCart = (product) => {
    const existingItemIndex = purchaseData.items.findIndex((item) => item.productId === product.id)

    if (existingItemIndex !== -1) {
      // Item already exists, update quantity
      const updatedItems = [...purchaseData.items]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitCost

      setPurchaseData({ ...purchaseData, items: updatedItems })
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitCost: product.cost,
        total: product.cost,
      }

      setPurchaseData({ ...purchaseData, items: [...purchaseData.items, newItem] })
    }
  }

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    const updatedItems = [...purchaseData.items]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].total = newQuantity * updatedItems[index].unitCost

    setPurchaseData({ ...purchaseData, items: updatedItems })
  }

  const updateItemUnitCost = (index, newUnitCost) => {
    const updatedItems = [...purchaseData.items]
    updatedItems[index].unitCost = newUnitCost
    updatedItems[index].total = updatedItems[index].quantity * newUnitCost

    setPurchaseData({ ...purchaseData, items: updatedItems })
  }

  const removeItem = (index) => {
    const updatedItems = [...purchaseData.items]
    updatedItems.splice(index, 1)

    setPurchaseData({ ...purchaseData, items: updatedItems })
  }

  const calculateSubtotal = () => {
    return purchaseData.items.reduce((total, item) => total + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.11 // 11% PPN
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async () => {
    try {
      if (!purchaseData.wholesalerId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Silakan pilih tengkulak",
        })
        return
      }

      if (purchaseData.items.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Silakan tambahkan minimal satu item",
        })
        return
      }

      const purchasePayload = {
        ...purchaseData,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        createdBy: user.id,
        createdByName: user.username,
      }

      const newPurchase = await createPurchase(purchasePayload)

      await logAction({
        action: "purchase_created",
        details: `Pembelian #${newPurchase.id} dibuat dengan total ${formatCurrency(newPurchase.total)}`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Pembelian Berhasil",
        description: "Transaksi pembelian telah berhasil dibuat",
      })

      router.push("/dashboard/purchases")
    } catch (error) {
      console.error("Error creating purchase:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal membuat transaksi pembelian",
      })
    }
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Buat Pembelian Baru</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/purchases")}>
          Kembali ke Daftar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Pembelian</CardTitle>
              <CardDescription>Masukkan informasi pembelian dari tengkulak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="wholesalerId">Pilih Tengkulak</Label>
                <Select
                  value={purchaseData.wholesalerId}
                  onValueChange={(value) => handleSelectChange("wholesalerId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tengkulak" />
                  </SelectTrigger>
                  <SelectContent>
                    {wholesalers.map((wholesaler) => (
                      <SelectItem key={wholesaler.id} value={wholesaler.id}>
                        {wholesaler.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={purchaseData.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="credit">Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Status Pembayaran</Label>
                <Select
                  value={purchaseData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Tertunda</SelectItem>
                    <SelectItem value="partial">Sebagian Dibayar</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={purchaseData.notes}
                  onChange={handleInputChange}
                  placeholder="Masukkan catatan tambahan (opsional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produk</CardTitle>
              <CardDescription>Pilih produk untuk dibeli</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari produk berdasarkan nama, SKU, atau barcode..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-1">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium line-clamp-2">{product.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold">{formatCurrency(product.cost)}</span>
                        <span className="text-xs">Stok: {product.stockQuantity}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
                    Tidak ada produk yang ditemukan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Keranjang Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchaseData.items.length > 0 ? (
                <div className="space-y-4">
                  {purchaseData.items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 border-b pb-3">
                      <div className="flex justify-between">
                        <div className="font-medium">{item.name}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`quantity-${index}`} className="text-xs">
                            Jumlah
                          </Label>
                          <div className="flex items-center border rounded-md mt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, Number.parseInt(e.target.value) || 0)}
                              className="h-8 w-12 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`cost-${index}`} className="text-xs">
                            Harga Satuan
                          </Label>
                          <Input
                            id={`cost-${index}`}
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => updateItemUnitCost(index, Number.parseFloat(e.target.value) || 0)}
                            className="h-8 mt-1"
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">Total: {formatCurrency(item.total)}</div>
                    </div>
                  ))}

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (11%)</span>
                      <span>{formatCurrency(calculateTax())}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleSubmit}>
                    Buat Pembelian
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Keranjang Anda kosong</p>
                  <p className="text-xs text-muted-foreground">Tambahkan produk dengan mengklik pada produk</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
