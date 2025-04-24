"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, CreditCard, DollarSign, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus } from "lucide-react"
import { getProducts, getCategories } from "@/lib/products"
import { getCustomers } from "@/lib/customers"
import { createSale } from "@/lib/sales"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { logAction } from "@/lib/audit"

export default function POSPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [amountTendered, setAmountTendered] = useState("")
  const [receiptData, setReceiptData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // State untuk form pelanggan baru
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const productsData = await getProducts()
        const categoriesData = await getCategories()
        const customersData = await getCustomers()

        setProducts(productsData)
        setFilteredProducts(productsData)
        setCategories(categoriesData)
        setCustomers(customersData)
      } catch (error) {
        console.error("Error fetching POS data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data POS",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer("")
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const calculateChange = () => {
    const tendered = Number.parseFloat(amountTendered) || 0
    return Math.max(0, tendered - calculateTotal())
  }

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        toast({
          variant: "destructive",
          title: "Keranjang Kosong",
          description: "Silakan tambahkan item ke keranjang sebelum checkout",
        })
        return
      }

      const saleData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        customerId: selectedCustomer || null,
        paymentMethod,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        amountTendered: Number.parseFloat(amountTendered) || calculateTotal(),
        change: calculateChange(),
        cashierId: user?.id,
        cashierName: user?.username,
      }

      const sale = await createSale(saleData)

      await logAction({
        action: "sale_completed",
        details: `Penjualan #${sale.id} selesai dengan total ${formatCurrency(sale.total)}`,
        userId: user?.id,
        username: user?.username,
      })

      setReceiptData(sale)
      setIsCheckoutDialogOpen(false)
      setIsReceiptDialogOpen(true)

      // Reset for next sale
      setCart([])
      setSelectedCustomer("")
      setPaymentMethod("cash")
      setAmountTendered("")

      toast({
        title: "Penjualan Selesai",
        description: `Penjualan #${sale.id} telah berhasil diselesaikan`,
      })
    } catch (error) {
      console.error("Error processing sale:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memproses penjualan",
      })
    }
  }

  const printReceipt = () => {
    window.print()
  }

  // Fungsi untuk menangani penambahan pelanggan baru
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateNewCustomer = async () => {
    try {
      // Validasi data pelanggan
      if (!newCustomer.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Nama pelanggan wajib diisi",
        })
        return
      }

      // Simulasi penambahan pelanggan baru
      // Dalam aplikasi nyata, ini akan memanggil API untuk menyimpan pelanggan baru
      const newCustomerId = `C${String(customers.length + 1).padStart(3, "0")}`
      const createdCustomer = {
        id: newCustomerId,
        ...newCustomer,
      }

      // Tambahkan pelanggan baru ke daftar pelanggan
      setCustomers([...customers, createdCustomer])

      // Pilih pelanggan baru sebagai pelanggan saat ini
      setSelectedCustomer(newCustomerId)

      // Reset form dan tutup dialog
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
      })
      setIsNewCustomerDialogOpen(false)

      toast({
        title: "Pelanggan Baru",
        description: `Pelanggan ${newCustomer.name} berhasil ditambahkan`,
      })

      await logAction({
        action: "customer_created",
        details: `Pelanggan baru ${newCustomer.name} ditambahkan`,
        userId: user?.id,
        username: user?.username,
      })
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan pelanggan baru",
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
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Kasir</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearCart}>
            Kosongkan Keranjang
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 h-full">
        {/* Product Selection */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari produk..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optimized grid layout for iPad devices */}
          <div className="grid product-grid gap-3 overflow-y-auto flex-1 pb-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    product.stockQuantity <= 0 ? "opacity-50" : ""
                  }`}
                  onClick={() => product.stockQuantity > 0 && addToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                    {/* Repositioned price and stock information */}
                    <div className="flex flex-col mt-1 space-y-1">
                      <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                      <span className="text-xs text-muted-foreground">Stok: {product.stockQuantity}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40">
                <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Penjualan Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-3">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="customer" className="text-sm">
                    Pelanggan (Opsional)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs flex items-center gap-1"
                    onClick={() => setIsNewCustomerDialogOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Baru</span>
                  </Button>
                </div>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Pelanggan Langsung</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">Keranjang Anda kosong</p>
                  <p className="text-xs text-muted-foreground">Tambahkan produk dengan mengklik pada produk</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col border-t pt-3 px-3 pb-3">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%)</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              <Button
                className="w-full mt-3"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutDialogOpen(true)}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog Pelanggan Baru */}
      <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
            <DialogDescription>Masukkan informasi pelanggan baru. Kolom bertanda * wajib diisi.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">
                Nama Pelanggan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={newCustomer.name}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleNewCustomerChange}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleNewCustomerChange}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                name="address"
                value={newCustomer.address}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan alamat pelanggan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateNewCustomer}>Simpan Pelanggan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Selesaikan Penjualan</DialogTitle>
            <DialogDescription>Pilih metode pembayaran dan selesaikan transaksi.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Metode Pembayaran</Label>
              <Tabs defaultValue="cash" value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="cash">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Tunai
                  </TabsTrigger>
                  <TabsTrigger value="card">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Kartu
                  </TabsTrigger>
                  <TabsTrigger value="other">Lainnya</TabsTrigger>
                </TabsList>
                <TabsContent value="cash" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount-tendered">Jumlah Diterima</Label>
                    <Input
                      id="amount-tendered"
                      type="number"
                      step="0.01"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      placeholder={calculateTotal().toFixed(2)}
                    />
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Kembalian</span>
                    <span>{formatCurrency(calculateChange())}</span>
                  </div>
                </TabsContent>
                <TabsContent value="card" className="mt-4">
                  <div className="text-center text-muted-foreground">Proses pembayaran kartu di terminal</div>
                </TabsContent>
                <TabsContent value="other" className="mt-4">
                  <div className="text-center text-muted-foreground">Metode pembayaran lainnya</div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%)</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCheckout}>Selesaikan Penjualan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Struk</DialogTitle>
            <DialogDescription>Penjualan berhasil diselesaikan</DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="py-4 space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg">Sistem POS Modern</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <span>Created with</span>
                  <span className="text-red-500">❤️</span>
                  <span>by</span>
                  <a 
                    href="https://github.com/Al-User12" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline font-medium"
                  >
                    Al Fikri KM
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">Struk #{receiptData.id}</p>
                <p className="text-sm text-muted-foreground">{receiptData.date}</p>
              </div>

              <div className="border-t border-b py-2">
                <div className="flex justify-between text-sm">
                  <span>Kasir:</span>
                  <span>{receiptData.cashierName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pelanggan:</span>
                  <span>{receiptData.customerName || "Pelanggan Langsung"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Metode Pembayaran:</span>
                  <span className="capitalize">
                    {receiptData.paymentMethod === "cash"
                      ? "Tunai"
                      : receiptData.paymentMethod === "card"
                        ? "Kartu"
                        : "Lainnya"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Item</h4>
                {receiptData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(receiptData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak</span>
                  <span>{formatCurrency(receiptData.tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(receiptData.total)}</span>
                </div>
                {receiptData.paymentMethod === "cash" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Jumlah Diterima</span>
                      <span>{formatCurrency(receiptData.amountTendered)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kembalian</span>
                      <span>{formatCurrency(receiptData.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2">
                <p>Terima kasih atas pembelian Anda!</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={printReceipt}>Cetak Struk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
