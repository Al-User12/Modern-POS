// Mock dashboard data service

export async function getSalesStats() {
  // In a real app, this would fetch from a database
  return {
    dailySales: 2458000,
    totalCustomers: 142,
    totalOrders: 38,
    salesData: [
      { date: "Sen", sales: 1234000 },
      { date: "Sel", sales: 2345000 },
      { date: "Rab", sales: 1876000 },
      { date: "Kam", sales: 2458000 },
      { date: "Jum", sales: 3012000 },
      { date: "Sab", sales: 3567000 },
      { date: "Min", sales: 2876000 },
    ],
  }
}

export async function getInventoryStats() {
  // In a real app, this would fetch from a database
  return {
    totalProducts: 156,
    lowStockCount: 12,
  }
}

export async function getRecentSales() {
  // In a real app, this would fetch from a database
  return [
    {
      id: "ORD-001",
      customer: "Budi Santoso",
      date: "2023-04-22T10:30:00",
      amount: 125000,
      status: "completed",
    },
    {
      id: "ORD-002",
      customer: "Siti Rahayu",
      date: "2023-04-22T11:45:00",
      amount: 89500,
      status: "completed",
    },
    {
      id: "ORD-003",
      customer: "Ahmad Hidayat",
      date: "2023-04-22T13:15:00",
      amount: 245750,
      status: "completed",
    },
    {
      id: "ORD-004",
      customer: "Dewi Lestari",
      date: "2023-04-22T14:30:00",
      amount: 67250,
      status: "pending",
    },
    {
      id: "ORD-005",
      customer: "Eko Prasetyo",
      date: "2023-04-22T15:45:00",
      amount: 189990,
      status: "completed",
    },
  ]
}

export async function getLowStockProducts() {
  // In a real app, this would fetch from a database
  return [
    {
      id: "P001",
      name: "Biji Kopi Organik",
      category: "Minuman",
      currentStock: 5,
      minStock: 10,
    },
    {
      id: "P002",
      name: "Earbuds Nirkabel",
      category: "Elektronik",
      currentStock: 2,
      minStock: 5,
    },
    {
      id: "P003",
      name: "Kaos Katun",
      category: "Pakaian",
      currentStock: 3,
      minStock: 8,
    },
    {
      id: "P004",
      name: "Botol Air Stainless Steel",
      category: "Aksesoris",
      currentStock: 4,
      minStock: 10,
    },
    {
      id: "P005",
      name: "Matras Yoga",
      category: "Fitness",
      currentStock: 1,
      minStock: 5,
    },
  ]
}
