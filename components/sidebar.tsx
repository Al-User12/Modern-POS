"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Truck,
  ShoppingBag,
  FileText,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

// Perbarui komponen DashboardSidebar untuk meningkatkan responsivitas
export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dasbor",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      variant: "default",
    },
    {
      title: "Kasir",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/dashboard/pos",
      variant: "default",
    },
    {
      title: "Produk",
      icon: <Package className="h-5 w-5" />,
      href: "/dashboard/products",
      variant: "default",
    },
    {
      title: "Inventaris",
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/dashboard/inventory",
      variant: "default",
    },
    {
      title: "Tengkulak",
      icon: <Truck className="h-5 w-5" />,
      href: "/dashboard/wholesalers",
      variant: "default",
    },
    {
      title: "Pembelian",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/dashboard/purchases",
      variant: "default",
    },
    {
      title: "Laporan",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/reports",
      variant: "default",
    },
    {
      title: "Log Audit",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/audit-logs",
      variant: "default",
    },
    {
      title: "Pengguna",
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/users",
      variant: "default",
    },
    {
      title: "Pengaturan",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
      variant: "default",
    },
  ]

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Alihkan menu navigasi</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px] max-w-[80vw]">
          <nav className="grid gap-1 p-2">
            <div className="flex h-14 items-center border-b px-2 mb-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="h-5 w-5" />
                <span>POS Modern</span>
              </div>
            </div>
            {routes.map((route, i) => (
              <Link
                key={i}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/50 focus:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50",
                  pathname === route.href
                    ? "bg-secondary/50 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                {route.icon}
                <span>{route.title}</span>
              </Link>
            ))}
            <div className="my-2 border-t" />
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/50 focus:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50 text-zinc-500 dark:text-zinc-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <SidebarProvider>
        <Sidebar className={cn("hidden md:flex", className)}>
          <SidebarHeader className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 px-2">
              <CircleDollarSign className="h-6 w-6" />
              <span className="text-lg font-bold">Sistem POS</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                    <Link href={route.href}>
                      {route.icon}
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex w-full items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSelector />
              </div>
              <Button variant="outline" size="icon" asChild>
                <Link href="/login">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Keluar</span>
                </Link>
              </Button>
            </div>
          </SidebarFooter>
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>
    </>
  )
}
