// Mock reports data service
import { getSales } from "./sales"
import { getProducts } from "./products"

export async function getSalesReportData(timeRange) {
  // In a real app, this would fetch from a database with proper date filtering
  const sales = await getSales()

  // For demo purposes, we'll just return all sales
  return sales.map((sale) => ({
    id: sale.id,
    date: sale.date,
    customer: sale.customerName,
    cashier: sale.cashierName,
    total: sale.total,
    profit: sale.total * 0.3, // Mock profit calculation
    paymentMethod: sale.paymentMethod,
  }))
}

export async function getProductSalesData(timeRange) {
  // In a real app, this would fetch from a database with proper aggregation
  const sales = await getSales()
  const products = await getProducts()

  // Create a map to track sales by product
  const productSalesMap = {}

  // Process all sales
  for (const sale of sales) {
    for (const item of sale.items) {
      if (!productSalesMap[item.productId]) {
        const product = products.find((p) => p.id === item.productId)
        productSalesMap[item.productId] = {
          id: item.productId,
          name: item.name,
          category: product ? product.category : "Unknown",
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        }
      }

      productSalesMap[item.productId].quantitySold += item.quantity
      productSalesMap[item.productId].revenue += item.price * item.quantity
      productSalesMap[item.productId].profit += item.price * item.quantity * 0.3 // Mock profit calculation
    }
  }

  // Convert map to array and sort by revenue
  return Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue)
}

export async function getCategorySalesData(timeRange) {
  // In a real app, this would fetch from a database with proper aggregation
  const productSales = await getProductSalesData(timeRange)

  // Create a map to track sales by category
  const categorySalesMap = {}

  // Process all product sales
  for (const product of productSales) {
    if (!categorySalesMap[product.category]) {
      categorySalesMap[product.category] = {
        name: product.category,
        revenue: 0,
        profit: 0,
        itemsSold: 0,
      }
    }

    categorySalesMap[product.category].revenue += product.revenue
    categorySalesMap[product.category].profit += product.profit
    categorySalesMap[product.category].itemsSold += product.quantitySold
  }

  // Convert map to array and sort by revenue
  return Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue)
}

export async function getDailySalesData(timeRange) {
  // In a real app, this would fetch from a database with proper date aggregation

  // Mock daily sales data
  return [
    { date: "Apr 16", sales: 1234.56 },
    { date: "Apr 17", sales: 2345.67 },
    { date: "Apr 18", sales: 1876.23 },
    { date: "Apr 19", sales: 2458.35 },
    { date: "Apr 20", sales: 3012.45 },
    { date: "Apr 21", sales: 3567.89 },
    { date: "Apr 22", sales: 2876.12 },
  ]
}
