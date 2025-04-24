// Mock sales data service
import { getCustomerById } from "./customers"
import { updateInventory } from "./inventory"

// Mock sales database
const sales = []
let nextSaleId = 1

export async function createSale(saleData) {
  // Generate a new sale ID
  const saleId = `S${String(nextSaleId++).padStart(3, "0")}`

  // Get customer name if a customer ID was provided
  let customerName = "Pelanggan Umum"
  if (saleData.customerId) {
    const customer = await getCustomerById(saleData.customerId)
    if (customer) {
      customerName = customer.name
    }
  }

  // Create the new sale
  const newSale = {
    id: saleId,
    items: saleData.items,
    customerId: saleData.customerId,
    customerName,
    paymentMethod: saleData.paymentMethod,
    subtotal: saleData.subtotal,
    tax: saleData.tax,
    total: saleData.total,
    amountTendered: saleData.amountTendered,
    change: saleData.change,
    cashierId: saleData.cashierId,
    cashierName: saleData.cashierName,
    date: new Date().toISOString(),
    status: "completed",
  }

  // Add to the mock database
  sales.push(newSale)

  // Update inventory for each item
  for (const item of saleData.items) {
    await updateInventory({
      productId: item.productId,
      quantity: -item.quantity, // Negative because we're reducing stock
      reason: `Penjualan #${saleId}`,
      userId: saleData.cashierId,
      username: saleData.cashierName,
    })
  }

  return newSale
}

// Renamed getAllSales to getSales to match imports in other files
export async function getSales() {
  // In a real app, this would fetch from a database
  return [...sales]
}

export async function getSaleById(saleId) {
  // In a real app, this would fetch from a database
  const sale = sales.find((s) => s.id === saleId)

  if (sale) {
    return { ...sale }
  }

  throw new Error("Penjualan tidak ditemukan")
}

// Function to generate sales reports (Placeholder)
export async function generateSalesReport() {
  // Implement report generation logic here
  return "Laporan penjualan berhasil dibuat."
}
