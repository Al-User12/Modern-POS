// Mock inventory data service
import { getProducts } from "./products"

export async function getInventory() {
  // In a real app, this would fetch from a database
  // For this mock, we'll just use the products data
  const products = await getProducts()
  return products
}

export async function getLowStockProducts() {
  // In a real app, this would fetch from a database
  const products = await getProducts()
  return products.filter((product) => product.stockQuantity <= product.minStockLevel)
}

export async function updateInventory({ productId, quantity, reason, userId, username }) {
  // In a real app, this would update a database
  const products = await getProducts()
  const productIndex = products.findIndex((p) => p.id === productId)

  if (productIndex === -1) {
    throw new Error("Produk tidak ditemukan")
  }

  // Update the stock quantity
  const updatedProduct = {
    ...products[productIndex],
    stockQuantity: Math.max(0, products[productIndex].stockQuantity + quantity),
  }

  // In a real app, we would also log this adjustment in an inventory_transactions table

  // Update our mock products array
  products[productIndex] = updatedProduct

  return updatedProduct
}
