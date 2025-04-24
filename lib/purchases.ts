// Model data untuk transaksi pembelian dari tengkulak
import { getWholesalerById } from "./wholesalers"
import { getProductById, updateProduct } from "./products"
import { updateInventory } from "./inventory"

// Database mock untuk transaksi pembelian
const purchases = [
  {
    id: "P001",
    wholesalerId: "W001",
    wholesalerName: "PT Sumber Hasil Tani",
    items: [
      {
        productId: "P001",
        name: "Kopi Organik",
        quantity: 10,
        unitCost: 55000,
        total: 550000,
      },
      {
        productId: "P003",
        name: "Kaos Katun",
        quantity: 20,
        unitCost: 70000,
        total: 1400000,
      },
    ],
    subtotal: 1950000,
    tax: 195000,
    total: 2145000,
    paymentMethod: "transfer",
    paymentStatus: "paid",
    notes: "Pengiriman reguler",
    purchaseDate: "2023-04-10T09:30:00Z",
    receivedDate: "2023-04-12T14:00:00Z",
    createdBy: "1",
    createdByName: "Admin Sistem",
  },
  {
    id: "P002",
    wholesalerId: "W002",
    wholesalerName: "CV Mitra Tani Sejahtera",
    items: [
      {
        productId: "P004",
        name: "Botol Air Stainless",
        quantity: 15,
        unitCost: 90000,
        total: 1350000,
      },
    ],
    subtotal: 1350000,
    tax: 135000,
    total: 1485000,
    paymentMethod: "cash",
    paymentStatus: "paid",
    notes: "Pengiriman express",
    purchaseDate: "2023-04-15T10:45:00Z",
    receivedDate: "2023-04-16T11:30:00Z",
    createdBy: "1",
    createdByName: "Admin Sistem",
  },
]

let nextPurchaseId = 3

export async function getPurchases() {
  // Dalam aplikasi nyata, ini akan mengambil data dari database
  return [...purchases]
}

export async function getPurchaseById(id) {
  // Dalam aplikasi nyata, ini akan mengambil data dari database
  const purchase = purchases.find((p) => p.id === id)

  if (purchase) {
    return { ...purchase }
  }

  throw new Error("Transaksi pembelian tidak ditemukan")
}

export async function createPurchase(purchaseData) {
  try {
    // Buat ID baru
    const newId = `P${String(nextPurchaseId++).padStart(3, "0")}`

    // Dapatkan informasi tengkulak
    const wholesaler = await getWholesalerById(purchaseData.wholesalerId)

    // Buat data transaksi pembelian baru
    const newPurchase = {
      id: newId,
      wholesalerId: purchaseData.wholesalerId,
      wholesalerName: wholesaler.name,
      items: purchaseData.items,
      subtotal: purchaseData.subtotal,
      tax: purchaseData.tax,
      total: purchaseData.total,
      paymentMethod: purchaseData.paymentMethod,
      paymentStatus: purchaseData.paymentStatus,
      notes: purchaseData.notes || "",
      purchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
      receivedDate: purchaseData.receivedDate || null,
      createdBy: purchaseData.createdBy,
      createdByName: purchaseData.createdByName,
    }

    // Tambahkan ke database mock
    purchases.push(newPurchase)

    // Perbarui inventaris untuk setiap item
    for (const item of purchaseData.items) {
      // Perbarui stok produk
      await updateInventory({
        productId: item.productId,
        quantity: item.quantity, // Positif karena menambah stok
        reason: `Pembelian #${newId} dari ${wholesaler.name}`,
        userId: purchaseData.createdBy,
        username: purchaseData.createdByName,
      })

      // Opsional: Perbarui harga biaya produk jika berubah
      const product = await getProductById(item.productId)
      if (product.cost !== item.unitCost) {
        await updateProduct({
          id: item.productId,
          cost: item.unitCost,
        })
      }
    }

    return newPurchase
  } catch (error) {
    console.error("Error creating purchase:", error)
    throw error
  }
}

export async function updatePurchaseStatus(id, status, receivedDate = null) {
  // Cari transaksi pembelian yang akan diperbarui
  const index = purchases.findIndex((p) => p.id === id)

  if (index !== -1) {
    // Perbarui status
    purchases[index].paymentStatus = status

    // Jika ada tanggal penerimaan, perbarui juga
    if (receivedDate) {
      purchases[index].receivedDate = receivedDate
    }

    return purchases[index]
  }

  throw new Error("Transaksi pembelian tidak ditemukan")
}

export async function getPurchasesByWholesaler(wholesalerId) {
  // Filter transaksi pembelian berdasarkan ID tengkulak
  return purchases.filter((p) => p.wholesalerId === wholesalerId)
}

export async function getPurchasesByDateRange(startDate, endDate) {
  // Filter transaksi pembelian berdasarkan rentang tanggal
  return purchases.filter((p) => {
    const purchaseDate = new Date(p.purchaseDate)
    return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate)
  })
}

export async function getPurchaseStats() {
  // Hitung statistik pembelian
  const totalPurchases = purchases.length
  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0)
  const pendingPayments = purchases.filter((p) => p.paymentStatus === "pending").length

  return {
    totalPurchases,
    totalSpent,
    pendingPayments,
  }
}
