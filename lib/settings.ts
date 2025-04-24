// Mock settings service

// Default store settings
let storeSettings = {
  storeName: "Sistem POS Modern",
  storeAddress: "Jl. Utama No. 123",
  storeCity: "Jakarta",
  storeState: "DKI Jakarta",
  storeZip: "12345",
  storePhone: "(021) 123-4567",
  storeEmail: "info@modernpos.example",
  storeTaxRate: "11",
  storeCurrency: "IDR",
  storeLogoUrl: "",
  receiptFooter: "Terima kasih atas kunjungan Anda!",
  enableAutomaticBackup: false,
  backupFrequency: "daily",
  language: "id", // Added language setting
}

export async function getStoreSettings() {
  // In a real app, this would fetch from a database
  return { ...storeSettings }
}

export async function updateStoreSettings(settings) {
  // In a real app, this would update a database
  storeSettings = {
    ...storeSettings,
    ...settings,
  }

  return { ...storeSettings }
}

export async function getStoreCurrency() {
  // Helper function to get the current currency
  return storeSettings.storeCurrency
}

export async function getStoreTaxRate() {
  // Helper function to get the current tax rate
  return Number.parseFloat(storeSettings.storeTaxRate) / 100
}

export async function getStoreLanguage() {
  return storeSettings.language
}
