// Mock backup service

// Mock backup history
let backupHistory = [
  {
    id: "backup-001",
    timestamp: "2023-04-20T10:30:00Z",
    size: "1,2 MB",
    note: "Sebelum pembaruan katalog produk",
  },
  {
    id: "backup-002",
    timestamp: "2023-04-21T15:45:00Z",
    size: "1,3 MB",
    note: "Backup otomatis mingguan",
  },
  {
    id: "backup-003",
    timestamp: "2023-04-22T09:15:00Z",
    size: "1,3 MB",
    note: "",
  },
]

let nextBackupId = 4

export async function getBackupHistory() {
  // In a real app, this would fetch from a database or file system
  return [...backupHistory]
}

export async function backupData(note = "") {
  // In a real app, this would create a backup of all data
  // For this mock, we'll just add an entry to the backup history

  const newBackup = {
    id: `backup-${String(nextBackupId++).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    size: `${(1 + Math.random() * 0.5).toFixed(1).replace(".", ",")} MB`,
    note,
  }

  backupHistory.push(newBackup)

  return newBackup
}

export async function restoreData(backupId = null, file = null) {
  // In a real app, this would restore data from a backup
  // For this mock, we'll just simulate a successful restore

  if (backupId) {
    const backup = backupHistory.find((b) => b.id === backupId)
    if (!backup) {
      throw new Error("Backup tidak ditemukan")
    }

    // Simulate restore process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true, message: "Data berhasil dipulihkan" }
  }

  if (file) {
    // Simulate file upload restore process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return { success: true, message: "Data berhasil dipulihkan dari file yang diunggah" }
  }

  throw new Error("Tidak ada backup yang ditentukan")
}

export async function scheduleAutomaticBackup(frequency) {
  // In a real app, this would schedule automatic backups
  // For this mock, we'll just return success

  return { success: true, message: `Backup otomatis dijadwalkan ${frequency}` }
}

export async function deleteBackup(backupId) {
  // In a real app, this would delete a backup
  backupHistory = backupHistory.filter((b) => b.id !== backupId)

  return { success: true, message: "Backup berhasil dihapus" }
}
