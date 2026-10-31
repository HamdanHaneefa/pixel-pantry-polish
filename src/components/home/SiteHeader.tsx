import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Facebook,
  Heart,
  Menu,
  Package,
  ShoppingBag,
  User,
  X,
  Youtube,
  LogOut,
  Percent,
  Gift,
  Copy,
  Check,
} from "lucide-react";
import petpediaLogo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useWishlist } from "@/context/WishlistContext";

const NAV_ITEMS = [
  { label: "Shop", path: "/shop" },
  { label: "Dogs", path: "/shop?pet=dogs" },
  { label: "Cats", path: "/shop?pet=cats" },
  { label: "Brands", path: "/shop" },
  { label: "Offers", path: "/offers" },
  { label: "Pet Care", path: "/shop?category=pet-care" },
  { label: "Accessories", path: "/shop?category=accessories" },
];

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.41 9.42-9.41a9.36 9.36 0 0 1 6.66 2.76 9.35 9.35 0 0 1 2.75 6.66c0 5.19-4.23 9.41-9.42 9.41Zm8.02-17.43A11.27 11.27 0 0 0 12.05.75C5.8.75.71 5.84.7 12.09c0 2 .52 3.95 1.52 5.67L.6 23.25l5.63-1.48a11.3 11.3 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.35-11.34 0-3.03-1.18-5.88-3.32-8.02Z" />
    </svg>
  );
}

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1EvKK756Do/",
  youtube: "https://youtube.com/@petbeyvlogs?si=llFgUxCGr7rdRsg_",
  whatsapp: "https://whatsapp.com/channel/0029Vb8UPCj9cDDSzA94bo1u",
};

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
  const { itemCount: wishlistCount } = useWishlist();

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

  const ANNOUNCEMENTS = [
    {
      icon: Percent,
      headline: "SAVE 10% ON EVERY PURCHASE!",
      lead: "Use code",
      code: "GET10",
      tail: "at checkout",
    },
    {
      icon: Gift,
      headline: "YOUR FIRST ORDER, 30% OFF!",
      lead: "Apply code",
      code: "FIRST30",
      tail: "",
    },
  ];
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementPaused, setAnnouncementPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (announcementPaused) return;
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [ANNOUNCEMENTS.length, announcementPaused]);

  const copyCouponCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1800);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the code is still visible to copy manually.
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <div
        className="flex h-11 items-center justify-between px-3 text-xs font-medium text-primary-foreground sm:px-4 md:px-8 overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.638 0.221 36.5) 0%, oklch(0.6 0.2 25) 45%, oklch(0.42 0.16 300) 100%)",
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button className="flex items-center gap-1 opacity-95 hover:opacity-100">
            English <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1 opacity-95 hover:opacity-100">
            India <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Auto-rotating Announcement Banner */}
        <div
          className="relative flex-1 mx-2 sm:mx-4 h-8 overflow-hidden"
          onMouseEnter={() => setAnnouncementPaused(true)}
          onMouseLeave={() => setAnnouncementPaused(false)}
        >
          {ANNOUNCEMENTS.map((item, idx) => {
            const isCurrent = idx === announcementIndex;
            const Icon = item.icon;
            const copied = copiedCode === item.code;
            return (
              <div
                key={item.code}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-500 ease-out ${
                  isCurrent
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
              >
                <span className="hidden sm:flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-3 w-3" />
                </span>
                <span className="truncate text-[10.5px] sm:text-[12px] font-extrabold tracking-wide uppercase">
                  {item.headline}
                </span>
                <span className="hidden md:inline h-3.5 w-px shrink-0 bg-white/40" />
                <span className="hidden md:inline shrink-0 text-[11.5px] font-medium text-white/90">
                  {item.lead}
                </span>
                <button
                  type="button"
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={() => copyCouponCode(item.code)}
                  title="Click to copy code"
                  className="group flex shrink-0 items-center gap-1 rounded-md border border-dashed border-white/70 bg-white/15 px-2 py-0.5 text-[10.5px] sm:text-[11.5px] font-extrabold tracking-[0.12em] transition-colors hover:bg-white hover:text-[#E8431F] cursor-pointer"
                >
                  {copied ? "COPIED!" : item.code}
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-80 group-hover:opacity-100" />
                  )}
                </button>
                {item.tail && (
                  <span className="hidden md:inline shrink-0 text-[11.5px] font-medium text-white/90">
                    {item.tail}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:opacity-80"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:opacity-80"
          >
            <Youtube className="h-4 w-4" />
          </a>
          <a
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Channel"
            className="hover:opacity-80"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
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
                className="text-[15px] font-medium text-foreground/85 transition-all hover:text-primary active:scale-95"
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
                  <div className="w-8 h-8 rounded-full bg-[#FF5B00]/10 border border-[#FF5B00]/25 flex items-center justify-center text-xs font-bold text-[#FF5B00]">
                    {(customer.firstName?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-slate-100 pb-3 mb-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        Hello{customer.firstName ? `, ${customer.firstName}` : ""}!
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {customer.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/account"
                        hash="profile"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        }}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50/60 hover:text-[#FF5B00] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-500" /> My Account
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      <Link
                        to="/account"
                        hash="order"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        }}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50/60 hover:text-[#FF5B00] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-500" /> My Orders
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50/60 hover:text-[#FF5B00] transition-colors"
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
                        className="w-full py-2.5 rounded-xl bg-[#FF5B00] hover:bg-[#E05000] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
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
                search={{ redirect: "/account#order" } as any}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
                aria-label="Account Login"
                className="text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </Link>
            )}

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="text-foreground/80 hover:text-primary relative transition-colors"
            >
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.6} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
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
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary active:scale-[0.98] transition-all"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  hash="profile"
                  onClick={() => {
                    setOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  }}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary flex items-center justify-between"
                >
                  <span>My Account</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/account"
                  hash="order"
                  onClick={() => {
                    setOpen(false);
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  }}
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
                search={{ redirect: "/account#order" } as any}
                onClick={() => {
                  setOpen(false);
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
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
