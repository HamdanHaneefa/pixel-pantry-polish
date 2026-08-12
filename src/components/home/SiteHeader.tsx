import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  Menu,
  ShoppingBag,
  User,
  X,
  Youtube,
} from "lucide-react";
import petpediaLogo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";

const NAV = ["Shop", "Dogs", "Cats", "Brands", "Offers", "Pet Care", "Accessories"];

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
    <img src={petpediaLogo} alt="Petpedia Logo" className={`h-6 md:h-7 w-auto object-contain ${className}`} />
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openCart } = useCart();

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
            {NAV.map((item) => (
              <Link
                key={item}
                to={item === "Shop" ? "/shop" : (item === "Offers" ? "/offers" : "#")}
                className="text-[15px] font-medium text-foreground/85 transition-colors hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <button aria-label="Account" className="text-foreground/80 hover:text-primary">
              <User className="h-[22px] w-[22px]" strokeWidth={1.6} />
            </button>
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
            {open ? <Menu className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            {NAV.map((item) => (
              <Link
                key={item}
                to={item === "Shop" ? "/shop" : (item === "Offers" ? "/offers" : "#")}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-secondary"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}