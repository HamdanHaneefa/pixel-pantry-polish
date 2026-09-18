import { ChevronUp, Heart, Home, LayoutList, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { getShopifyAccountUrl } from "@/lib/shopify/client";

const TABS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Shop", icon: LayoutList, path: "/shop" },
  { label: "Wishlist", icon: Heart, path: "/wishlist" },
  { label: "Cart", icon: ShoppingBag, path: "/cart" },
  { label: "Account", icon: User, path: "/account" },
];

export default function MobileTabBar() {
  const location = useLocation();
  const { openCart, itemCount } = useCart();
  
  return (
    <>
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 transition-all md:hidden cursor-pointer"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200/80 bg-white/95 backdrop-blur-md pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {TABS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path === "/" && location.pathname === "");
          
          if (path === "/cart") {
            return (
              <button
                key={label}
                onClick={openCart}
                className={`relative flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                  active ? "text-[#FF5B00]" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? "fill-[#FF5B00]/15" : ""}`} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#FF5B00] px-1 text-[9px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                {label}
              </button>
            );
          }

          if (path === "/account") {
            return (
              <a
                key={label}
                href={getShopifyAccountUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#FF5B00]"
              >
                <Icon className="h-5 w-5" />
                {label}
              </a>
            );
          }

          return (
            <Link
              key={label}
              to={path as any}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
                active ? "text-[#FF5B00]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-[#FF5B00]/15" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}