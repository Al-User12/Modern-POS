// Mock products data service

// Mock product database
let products = [
  {
    id: "P001",
    name: "Kopi Organik",
    description: "Biji kopi organik premium dari Ethiopia",
    category: "Minuman",
    price: 120000,
    cost: 65000,
    sku: "MIN-KOPI-001",
    barcode: "123456789012",
    stockQuantity: 5,
    minStockLevel: 10,
  },
  {
    id: "P002",
    name: "Earbuds Nirkabel",
    description: "Earbuds nirkabel Bluetooth 5.0 dengan peredam bising",
    category: "Elektronik",
    price: 899000,
    cost: 450000,
    sku: "ELEK-AUDIO-002",
    barcode: "223456789012",
    stockQuantity: 2,
    minStockLevel: 5,
  },
  {
    id: "P003",
    name: "Kaos Katun",
    description: "Kaos katun organik 100%",
    category: "Pakaian",
    price: 199000,
    cost: 80000,
    sku: "PAK-KAOS-003",
    barcode: "323456789012",
    stockQuantity: 3,
    minStockLevel: 8,
  },
  {
    id: "P004",
    name: "Botol Air Stainless",
    description: "Botol air stainless steel berinsulasi, 600ml",
    category: "Aksesoris",
    price: 249000,
    cost: 100000,
    sku: "AKS-BOTOL-004",
    barcode: "423456789012",
    stockQuantity: 4,
    minStockLevel: 10,
  },
  {
    id: "P005",
    name: "Matras Yoga",
    description: "Matras yoga anti-slip, ketebalan 5mm",
    category: "Kebugaran",
    price: 299000,
    cost: 125000,
    sku: "KEB-YOGA-005",
    barcode: "523456789012",
    stockQuantity: 1,
    minStockLevel: 5,
  },
  {
    id: "P006",
    name: "Casing Smartphone",
    description: "Casing pelindung untuk iPhone 13",
    category: "Aksesoris",
    price: 149000,
    cost: 50000,
    sku: "AKS-CASE-006",
    barcode: "623456789012",
    stockQuantity: 15,
    minStockLevel: 10,
  },
  {
    id: "P007",
    name: "Speaker Bluetooth",
    description: "Speaker bluetooth portabel dengan baterai tahan 10 jam",
    category: "Elektronik",
    price: 499000,
    cost: 225000,
    sku: "ELEK-SPEAK-007",
    barcode: "723456789012",
    stockQuantity: 8,
    minStockLevel: 5,
  },
]

// Mock categories
const categories = [
  { id: "1", name: "Minuman" },
  { id: "2", name: "Elektronik" },
  { id: "3", name: "Pakaian" },
  { id: "4", name: "Aksesoris" },
  { id: "5", name: "Kebugaran" },
  { id: "6", name: "Makanan" },
  { id: "7", name: "Rumah Tangga" },
]

export async function getProducts() {
  // In a real app, this would fetch from a database
  return [...products]
}

export async function getCategories() {
  // In a real app, this would fetch from a database
  return [...categories]
}

export async function addProduct(productData) {
  // Generate a new ID
  const newId = `P${String(products.length + 1).padStart(3, "0")}`

  // Create the new product
  const newProduct = {
    id: newId,
    ...productData,
  }

  // Add to the mock database
  products.push(newProduct)

  return newProduct
}

export async function updateProduct(productData) {
  // Find the product to update
  const index = products.findIndex((p) => p.id === productData.id)

  if (index !== -1) {
    // Update the product
    products[index] = {
      ...products[index],
      ...productData,
    }

    return products[index]
  }

  throw new Error("Produk tidak ditemukan")
}

export async function deleteProduct(productId) {
  // Find the product to delete
  const index = products.findIndex((p) => p.id === productId)

  if (index !== -1) {
    // Remove the product
    const deletedProduct = products[index]
    products = products.filter((p) => p.id !== productId)

    return deletedProduct
  }

  throw new Error("Produk tidak ditemukan")
}

export async function getProductById(productId) {
  // Find the product
  const product = products.find((p) => p.id === productId)

  if (product) {
    return { ...product }
  }

  throw new Error("Produk tidak ditemukan")
}
