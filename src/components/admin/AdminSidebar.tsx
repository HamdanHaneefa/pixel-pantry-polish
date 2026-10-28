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
  Store,
  LayoutTemplate,
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

  const navSections = [
    {
      title: "Overview",
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          hint: "Sales & store summary",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: "Store",
      items: [
        {
          to: "/admin/products",
          label: "Products & Stock",
          hint: "Inventory, prices & visibility",
          icon: Package,
        },
        {
          to: "/admin/homepage",
          label: "Storefront Design",
          hint: "Banners, brands & testimonials",
          icon: LayoutTemplate,
        },
      ],
    },
    {
      title: "Sales",
      items: [
        {
          to: "/admin/orders",
          label: "Orders",
          hint: "Track & fulfil orders",
          icon: ShoppingCart,
        },
        {
          to: "/admin/settings",
          label: "Shipping & Settings",
          hint: "Delivery fees & product badges",
          icon: Truck,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full w-full min-h-full flex-1 flex-col bg-slate-900 text-slate-100 overflow-y-auto no-scrollbar">
      {/* Logo / Title */}
      <div className="border-b border-slate-800/80 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-base shadow-lg shadow-orange-900/40">
            P
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">
              Petpedia Admin
            </h1>
            <p className="text-xs text-slate-400">Merchant Portal</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Shopify Connected
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 px-3 py-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  "exact" in item ? currentPath === item.to : currentPath.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-500" />
                    )}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400"
                          : "bg-slate-800/70 text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}
                      >
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Utilities */}
      <div className="space-y-2 border-t border-slate-800/80 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-3 transition-colors hover:border-orange-500/40 hover:bg-slate-800"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/60 text-slate-300 group-hover:text-orange-400">
            <Store className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-200">View Storefront</span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
        </a>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
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
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:flex-col h-screen h-[100dvh] w-64 shrink-0 border-r border-slate-800 bg-slate-900 sticky top-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
