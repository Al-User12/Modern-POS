// Mock customers data service

// Mock customer database
const customers = [
  {
    id: "C001",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "0812-3456-7890",
    address: "Jl. Merdeka No. 123, Jakarta",
  },
  {
    id: "C002",
    name: "Siti Rahayu",
    email: "siti.rahayu@example.com",
    phone: "0813-2345-6789",
    address: "Jl. Pahlawan No. 456, Bandung",
  },
  {
    id: "C003",
    name: "Agus Wijaya",
    email: "agus.wijaya@example.com",
    phone: "0857-1234-5678",
    address: "Jl. Diponegoro No. 789, Surabaya",
  },
  {
    id: "C004",
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    phone: "0878-9012-3456",
    address: "Jl. Sudirman No. 101, Semarang",
  },
  {
    id: "C005",
    name: "Eko Prasetyo",
    email: "eko.prasetyo@example.com",
    phone: "0856-7890-1234",
    address: "Jl. Gatot Subroto No. 202, Yogyakarta",
  },
]

export async function getCustomers() {
  // In a real app, this would fetch from a database
  return [...customers]
}

export async function getCustomerById(customerId) {
  // In a real app, this would fetch from a database
  const customer = customers.find((c) => c.id === customerId)

  if (customer) {
    return { ...customer }
  }

  return null
}
