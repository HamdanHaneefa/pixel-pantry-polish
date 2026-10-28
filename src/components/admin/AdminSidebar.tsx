import { useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { logoutAdminFn } from "@/lib/admin/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Award,
  Smartphone,
  Truck,
} from "lucide-react";

export default function AdminSidebar() {
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdminFn();
    router.navigate({ to: "/admin/login" });
  };

  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: "/admin/products",
      label: "Products & Stock",
      icon: Package,
    },
    {
      to: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
    },
    {
      to: "/admin/settings",
      label: "Shipping & Settings",
      icon: Truck,
    },
    {
      to: "/admin/sponsors",
      label: "Sponsors & Brands",
      icon: Award,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full w-full min-h-full flex-1 flex-col justify-between p-4 bg-slate-900 text-slate-100 overflow-y-auto no-scrollbar">
      <div className="space-y-4">
        {/* Logo / Title */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-600 text-white font-bold text-xs tracking-tight">
              P
            </div>
            <div>
              <h1 className="text-xs font-semibold tracking-tight text-white leading-tight">
                Petpedia Admin
              </h1>
              <p className="text-[10px] text-slate-400">Merchant Portal</p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 px-2 py-1 text-[11px] font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Shopify Connected
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? currentPath === item.to : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white shadow-2xs font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-orange-400" : "text-slate-400"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="space-y-0.5 border-t border-slate-800/80 pt-2.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            View Storefront
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live</span>
        </a>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs">
            P
          </div>
          <span className="font-bold text-slate-900 text-sm">Petpedia Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-60 bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:flex-col h-screen h-[100dvh] w-56 shrink-0 border-r border-slate-800 bg-slate-900 sticky top-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
