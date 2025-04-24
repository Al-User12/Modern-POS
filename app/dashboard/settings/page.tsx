"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Download, Info, Save, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { getStoreSettings, updateStoreSettings } from "@/lib/settings"
import { backupData, restoreData, getBackupHistory } from "@/lib/backup"
import { logAction } from "@/lib/audit"
import { formatDate } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("store")
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [backupHistory, setBackupHistory] = useState([])
  const [selectedBackup, setSelectedBackup] = useState("")
  const [backupNote, setBackupNote] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeAddress: "",
    storeCity: "",
    storeState: "",
    storeZip: "",
    storePhone: "",
    storeEmail: "",
    storeTaxRate: "11",
    storeCurrency: "IDR",
    storeLogoUrl: "",
    receiptFooter: "Terima kasih atas kunjungan Anda!",
    enableAutomaticBackup: false,
    backupFrequency: "daily",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser?.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses halaman ini",
          })
          router.push("/dashboard")
          return
        }

        const settings = await getStoreSettings()
        setStoreSettings(settings)

        const history = await getBackupHistory()
        setBackupHistory(history)
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat pengaturan",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setStoreSettings({ ...storeSettings, [name]: value })
  }

  const handleSwitchChange = (name, checked) => {
    setStoreSettings({ ...storeSettings, [name]: checked })
  }

  const handleSelectChange = (name, value) => {
    setStoreSettings({ ...storeSettings, [name]: value })
  }

  const handleSaveSettings = async () => {
    try {
      await updateStoreSettings(storeSettings)

      await logAction({
        action: "settings_updated",
        details: "Pengaturan toko diperbarui",
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Pengaturan Disimpan",
        description: "Pengaturan Anda telah berhasil disimpan",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan pengaturan",
      })
    }
  }

  const handleCreateBackup = async () => {
    try {
      await backupData(backupNote)

      await logAction({
        action: "backup_created",
        details: `Backup manual dibuat${backupNote ? `: ${backupNote}` : ""}`,
        userId: user?.id,
        username: user?.username,
      })

      // Refresh backup history
      const history = await getBackupHistory()
      setBackupHistory(history)

      toast({
        title: "Backup Dibuat",
        description: "Data Anda telah berhasil dicadangkan",
      })

      setIsBackupDialogOpen(false)
      setBackupNote("")
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal membuat backup",
      })
    }
  }

  const handleRestoreBackup = async () => {
    try {
      if (!selectedBackup && !uploadedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Silakan pilih backup untuk dipulihkan atau unggah file backup",
        })
        return
      }

      if (selectedBackup) {
        await restoreData(selectedBackup)
      } else if (uploadedFile) {
        // Handle file upload restore
        await restoreData(null, uploadedFile)
      }

      await logAction({
        action: "backup_restored",
        details: selectedBackup
          ? `Dipulihkan dari backup ID: ${selectedBackup}`
          : `Dipulihkan dari file yang diunggah: ${uploadedFile?.name}`,
        userId: user?.id,
        username: user?.username,
      })

      toast({
        title: "Pemulihan Selesai",
        description: "Data Anda telah berhasil dipulihkan. Sistem akan dimuat ulang.",
      })

      setIsRestoreDialogOpen(false)
      setSelectedBackup("")
      setUploadedFile(null)

      // Reload the application after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memulihkan backup",
      })
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setSelectedBackup("") // Clear selected backup when file is uploaded
    }
  }

  const downloadBackup = async (backupId) => {
    try {
      // In a real app, this would trigger a download of the backup file
      toast({
        title: "Unduhan Dimulai",
        description: "File backup Anda sedang diunduh",
      })

      await logAction({
        action: "backup_downloaded",
        details: `Mengunduh backup ID: ${backupId}`,
        userId: user?.id,
        username: user?.username,
      })
    } catch (error) {
      console.error("Error downloading backup:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengunduh backup",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="store">Informasi Toko</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Toko</CardTitle>
              <CardDescription>Kelola detail dan informasi kontak toko Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nama Toko</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={storeSettings.storeName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama toko"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Nomor Telepon</Label>
                  <Input
                    id="storePhone"
                    name="storePhone"
                    value={storeSettings.storePhone}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeEmail">Alamat Email</Label>
                <Input
                  id="storeEmail"
                  name="storeEmail"
                  type="email"
                  value={storeSettings.storeEmail}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Alamat Jalan</Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat jalan"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="storeCity">Kota</Label>
                  <Input
                    id="storeCity"
                    name="storeCity"
                    value={storeSettings.storeCity}
                    onChange={handleInputChange}
                    placeholder="Masukkan kota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeState">Provinsi</Label>
                  <Input
                    id="storeState"
                    name="storeState"
                    value={storeSettings.storeState}
                    onChange={handleInputChange}
                    placeholder="Masukkan provinsi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeZip">Kode Pos</Label>
                  <Input
                    id="storeZip"
                    name="storeZip"
                    value={storeSettings.storeZip}
                    onChange={handleInputChange}
                    placeholder="Masukkan kode pos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeTaxRate">Tarif Pajak Default (%)</Label>
                  <Input
                    id="storeTaxRate"
                    name="storeTaxRate"
                    type="number"
                    value={storeSettings.storeTaxRate}
                    onChange={handleInputChange}
                    placeholder="Masukkan tarif pajak"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeCurrency">Mata Uang</Label>
                  <Select
                    value={storeSettings.storeCurrency}
                    onValueChange={(value) => handleSelectChange("storeCurrency", value)}
                  >
                    <SelectTrigger id="storeCurrency">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Rupiah Indonesia (IDR)</SelectItem>
                      <SelectItem value="USD">Dolar AS (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="SGD">Dolar Singapura (SGD)</SelectItem>
                      <SelectItem value="MYR">Ringgit Malaysia (MYR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Struk</CardTitle>
              <CardDescription>Sesuaikan informasi struk Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Pesan Footer Struk</Label>
                <Textarea
                  id="receiptFooter"
                  name="receiptFooter"
                  value={storeSettings.receiptFooter}
                  onChange={handleInputChange}
                  placeholder="Masukkan pesan yang akan ditampilkan di bagian bawah struk"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Sesuaikan identitas visual toko Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeLogoUrl">URL Logo</Label>
                <Input
                  id="storeLogoUrl"
                  name="storeLogoUrl"
                  value={storeSettings.storeLogoUrl}
                  onChange={handleInputChange}
                  placeholder="Masukkan URL ke logo toko Anda"
                />
                <p className="text-sm text-muted-foreground">
                  Untuk hasil terbaik, gunakan gambar persegi minimal 200x200 piksel
                </p>
              </div>

              <div className="mt-4">
                <Label>Pratinjau Logo</Label>
                <div className="mt-2 flex h-32 w-32 items-center justify-center rounded-md border bg-muted">
                  {storeSettings.storeLogoUrl ? (
                    <img
                      src={storeSettings.storeLogoUrl || "/placeholder.svg"}
                      alt="Logo toko"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Info className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Backup</CardTitle>
              <CardDescription>Konfigurasi pengaturan backup otomatis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAutomaticBackup"
                  checked={storeSettings.enableAutomaticBackup}
                  onCheckedChange={(checked) => handleSwitchChange("enableAutomaticBackup", checked)}
                />
                <Label htmlFor="enableAutomaticBackup">Aktifkan Backup Otomatis</Label>
              </div>

              {storeSettings.enableAutomaticBackup && (
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                  <Select
                    value={storeSettings.backupFrequency}
                    onValueChange={(value) => handleSelectChange("backupFrequency", value)}
                  >
                    <SelectTrigger id="backupFrequency">
                      <SelectValue placeholder="Pilih frekuensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button onClick={() => setIsBackupDialogOpen(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Buat Backup Sekarang
                </Button>
                <Button variant="outline" onClick={() => setIsRestoreDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Pulihkan dari Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Backup</CardTitle>
              <CardDescription>Lihat dan kelola riwayat backup Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length > 0 ? (
                <div className="space-y-4">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <h4 className="font-medium">{formatDate(backup.timestamp, true)}</h4>
                        <p className="text-sm text-muted-foreground">{backup.note || "Tidak ada deskripsi"}</p>
                        <p className="text-xs text-muted-foreground">Ukuran: {backup.size}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => downloadBackup(backup.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Unduh
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-md border">
                  <p className="text-muted-foreground">Tidak ada riwayat backup tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Backup</DialogTitle>
            <DialogDescription>
              Buat cadangan semua data sistem Anda. Ini termasuk produk, inventaris, penjualan, dan pengaturan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backupNote">Deskripsi Backup (Opsional)</Label>
              <Textarea
                id="backupNote"
                value={backupNote}
                onChange={(e) => setBackupNote(e.target.value)}
                placeholder="Masukkan deskripsi untuk backup ini"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateBackup}>Buat Backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pulihkan dari Backup</DialogTitle>
            <DialogDescription>
              Pulihkan data sistem Anda dari backup sebelumnya atau file backup yang diunggah.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Peringatan</AlertTitle>
              <AlertDescription>
                Memulihkan dari backup akan menggantikan semua data saat ini. Tindakan ini tidak dapat dibatalkan.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="selectBackup">Pilih dari Riwayat Backup</Label>
              <Select value={selectedBackup} onValueChange={setSelectedBackup} disabled={!!uploadedFile}>
                <SelectTrigger id="selectBackup">
                  <SelectValue placeholder="Pilih backup" />
                </SelectTrigger>
                <SelectContent>
                  {backupHistory.map((backup) => (
                    <SelectItem key={backup.id} value={backup.id}>
                      {formatDate(backup.timestamp)} {backup.note ? `- ${backup.note}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploadBackup">Atau Unggah File Backup</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="uploadBackup"
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  disabled={!!selectedBackup}
                />
                {uploadedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="h-8 px-2 text-destructive"
                  >
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Format yang diterima: .json, .zip</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleRestoreBackup}>
              Pulihkan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
