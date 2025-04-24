// Model data untuk Tengkulak (Wholesaler)

// Database mock untuk tengkulak
let wholesalers = [
  {
    id: "W001",
    name: "PT Sumber Hasil Tani",
    contactPerson: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@sumberhasiltani.com",
    address: "Jl. Pasar Induk No. 123, Bogor",
    notes: "Pemasok utama beras dan biji-bijian",
    isActive: true,
    createdAt: "2023-03-15T08:30:00Z",
    updatedAt: "2023-03-15T08:30:00Z",
  },
  {
    id: "W002",
    name: "CV Mitra Tani Sejahtera",
    contactPerson: "Siti Rahayu",
    phone: "0813-2345-6789",
    email: "siti@mitratani.co.id",
    address: "Jl. Raya Cibadak No. 45, Sukabumi",
    notes: "Pemasok sayuran organik",
    isActive: true,
    createdAt: "2023-03-20T10:15:00Z",
    updatedAt: "2023-03-20T10:15:00Z",
  },
  {
    id: "W003",
    name: "UD Hasil Bumi Nusantara",
    contactPerson: "Ahmad Hidayat",
    phone: "0857-1234-5678",
    email: "ahmad@hasilbumi.com",
    address: "Jl. Pasar Minggu No. 78, Jakarta Selatan",
    notes: "Pemasok buah-buahan lokal dan impor",
    isActive: true,
    createdAt: "2023-04-05T09:45:00Z",
    updatedAt: "2023-04-05T09:45:00Z",
  },
]

let nextWholesalerId = 4

export async function getWholesalers() {
  // Dalam aplikasi nyata, ini akan mengambil data dari database
  return [...wholesalers]
}

export async function getWholesalerById(id) {
  // Dalam aplikasi nyata, ini akan mengambil data dari database
  const wholesaler = wholesalers.find((w) => w.id === id)

  if (wholesaler) {
    return { ...wholesaler }
  }

  throw new Error("Tengkulak tidak ditemukan")
}

export async function addWholesaler(wholesalerData) {
  // Buat ID baru
  const newId = `W${String(nextWholesalerId++).padStart(3, "0")}`

  // Buat data tengkulak baru
  const timestamp = new Date().toISOString()
  const newWholesaler = {
    id: newId,
    ...wholesalerData,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  // Tambahkan ke database mock
  wholesalers.push(newWholesaler)

  return newWholesaler
}

export async function updateWholesaler(wholesalerData) {
  // Cari tengkulak yang akan diperbarui
  const index = wholesalers.findIndex((w) => w.id === wholesalerData.id)

  if (index !== -1) {
    // Perbarui tengkulak
    wholesalers[index] = {
      ...wholesalers[index],
      ...wholesalerData,
      updatedAt: new Date().toISOString(),
    }

    return wholesalers[index]
  }

  throw new Error("Tengkulak tidak ditemukan")
}

export async function deleteWholesaler(id) {
  // Cari tengkulak yang akan dihapus
  const index = wholesalers.findIndex((w) => w.id === id)

  if (index !== -1) {
    // Hapus tengkulak
    const deletedWholesaler = wholesalers[index]
    wholesalers = wholesalers.filter((w) => w.id !== id)

    return deletedWholesaler
  }

  throw new Error("Tengkulak tidak ditemukan")
}

// Alternatif: nonaktifkan tengkulak daripada menghapusnya
export async function toggleWholesalerStatus(id) {
  // Cari tengkulak
  const index = wholesalers.findIndex((w) => w.id === id)

  if (index !== -1) {
    // Toggle status aktif
    wholesalers[index].isActive = !wholesalers[index].isActive
    wholesalers[index].updatedAt = new Date().toISOString()

    return wholesalers[index]
  }

  throw new Error("Tengkulak tidak ditemukan")
}
