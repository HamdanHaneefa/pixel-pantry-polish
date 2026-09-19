import { useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { logoutAdminFn } from "@/lib/admin/auth";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Award,
  Download,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSidebar() {
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isInstallable, isStandalone, isIOS, promptInstall } = usePwaInstall();

  const handleLogout = async () => {
    await logoutAdminFn();
    router.navigate({ to: "/admin/login" });
  };

  const handleInstallClick = async () => {
    if (isStandalone) {
      toast.info("Petpedia Admin is already installed!");
      return;
    }

    if (isIOS) {
      toast("To install on iOS:", {
        description: "Tap Safari Share button at bottom -> select 'Add to Home Screen'.",
      });
      return;
    }

    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("Petpedia Admin installed successfully!");
    } else if (outcome === "unavailable") {
      toast("Install via browser menu", {
        description: "Tap browser menu (⋮ or ⋯) and select 'Install app' or 'Add to Home screen'.",
      });
    }
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
      to: "/admin/sponsors",
      label: "Sponsors & Brands",
      icon: Award,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full w-full min-h-full flex-1 flex-col justify-between p-4 bg-slate-900 text-slate-100 overflow-y-auto no-scrollbar">
      <div className="space-y-5">
        {/* Logo / Title */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm shadow-md shadow-orange-500/20">
              P
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">Petpedia Admin</h1>
              <p className="text-[10px] font-medium text-slate-400">Merchant Portal</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Shopify Connected
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? currentPath === item.to
              : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="space-y-1 border-t border-slate-800 pt-3">
        {/* Install Admin App Button */}
        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-amber-400" />
              Install Admin App
            </span>
            <span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] font-bold text-amber-300">
              PWA
            </span>
          </button>
        )}

        {isStandalone && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Admin App Installed
          </div>
        )}

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            View Storefront
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live</span>
        </a>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
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
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-500/20 transition-all cursor-pointer"
            >
              <Download className="h-3 w-3" />
              Install App
            </button>
          )}

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
