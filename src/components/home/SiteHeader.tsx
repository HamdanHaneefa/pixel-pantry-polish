import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Package,
  ShoppingBag,
  User,
  X,
  Youtube,
  LogOut,
} from "lucide-react";
import petpediaLogo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";

const NAV_ITEMS = [
  { label: "Shop", path: "/shop" },
  { label: "Dogs", path: "/shop?pet=dogs" },
  { label: "Cats", path: "/shop?pet=cats" },
  { label: "Brands", path: "/shop" },
  { label: "Offers", path: "/offers" },
  { label: "Pet Care", path: "/shop?category=pet-care" },
  { label: "Accessories", path: "/shop?category=accessories" },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
    </svg>
  );
}

function CartBadge() {
  const { itemCount } = useCart();
  if (itemCount <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF5B00] px-1 text-[10px] font-bold text-white shadow-sm">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={petpediaLogo}
      alt="Petpedia Logo"
      width={140}
      height={28}
      fetchPriority="high"
      loading="eager"
      decoding="sync"
      className={`h-6 md:h-7 w-auto object-contain ${className}`}
    />
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openCart } = useCart();
  const { customer, isAuthenticated, logout } = useCustomer();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div
        className="flex h-11 items-center justify-between px-4 text-xs font-medium text-primary-foreground md:px-8"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.638 0.221 36.5) 0%, oklch(0.6 0.2 25) 45%, oklch(0.42 0.16 300) 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 opacity-95 hover:opacity-100">
            English <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1 opacity-95 hover:opacity-100">
            India <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="hidden text-center text-[11px] font-semibold tracking-wide uppercase md:block">
          New customers save 10% with the code GET10
        </p>
        <div className="flex items-center gap-4">
          <Facebook className="h-4 w-4" />
          <XIcon className="h-3.5 w-3.5" />
          <Instagram className="h-4 w-4" />
          <Youtube className="h-4 w-4" />
        </div>
      </div>

      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:h-[72px] md:px-8">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-[15px] font-medium text-foreground/85 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {/* Account Icon / Dropdown Menu (Zigly Style) */}
            {isAuthenticated && customer ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors cursor-pointer py-1"
                  aria-label="User Account"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center text-xs font-bold text-[#1E3A8A]">
                    {(customer.firstName?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-slate-100 pb-3 mb-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        Hello! {customer.firstName || "Pet Parent"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {customer.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/account"
                        hash="profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-500" /> My Account
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      <Link
                        to="/account"
                        hash="order"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-500" /> My Orders
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-slate-500" /> My Wishlist
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152B6B] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/account/login"
                search={{ redirect: "/account#order" }}
                aria-label="Account Login"
                className="text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </Link>
            )}

            <Link to="/wishlist" aria-label="Wishlist" className="text-foreground/80 hover:text-primary">
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.6} />
            </Link>
            <button
              onClick={openCart}
              aria-label="Cart"
              className="text-foreground/80 hover:text-primary cursor-pointer relative"
            >
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.6} />
              <CartBadge />
            </button>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="text-foreground lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-border bg-background px-4 pb-4 lg:hidden">
          <div className="mb-3 flex justify-end">
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <nav className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  hash="profile"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary flex items-center justify-between"
                >
                  <span>My Account</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/account"
                  hash="order"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary flex items-center justify-between"
                >
                  <span>My Orders</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-[15px] font-medium text-rose-600 hover:bg-rose-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/account/login"
                search={{ redirect: "/account#order" }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary"
              >
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}