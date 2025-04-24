"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Truck,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser, logout } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Berhasil keluar",
      description: "Anda telah keluar dari sistem",
    })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Produk", href: "/dashboard/products", icon: Package },
    { name: "Inventaris", href: "/dashboard/inventory", icon: ClipboardList },
    { name: "Kasir", href: "/dashboard/pos", icon: ShoppingCart },
    { name: "Tengkulak", href: "/dashboard/wholesalers", icon: Truck },
    { name: "Pembelian", href: "/dashboard/purchases", icon: ShoppingBag },
    { name: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Log Audit", href: "/dashboard/audit-logs", icon: FileText },
  ]

  // Admin-only navigation items
  const adminNavigation = [
    { name: "Manajemen Pengguna", href: "/dashboard/users", icon: Users },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ]

  // Combine navigation based on user role
  const fullNavigation = user?.role === "admin" ? [...navigation, ...adminNavigation] : navigation

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka menu navigasi</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <div className="flex h-16 items-center border-b px-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ShoppingCart className="h-6 w-6" />
                  <span>POS Modern</span>
                </div>
              </div>
              {fullNavigation.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold md:text-xl">
          <ShoppingCart className="h-6 w-6" />
          <span className="hidden md:inline-block">Sistem POS Modern</span>
          <p className="text-xs text-muted-foreground">
            <span>Created with</span>
            <span className="text-red-500">❤️</span>
            <span>by</span>
            <span>
            <a href="https://github.com/Al-User12" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Al Fikri KM
            </a>
            </span>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium">{user?.name || user?.username}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {user?.role === "admin" ? "Admin" : "Kasir"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Keluar</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {fullNavigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
