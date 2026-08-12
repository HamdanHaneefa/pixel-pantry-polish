import { ChevronUp, Heart, Home, LayoutList, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";

const TABS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Category", icon: LayoutList, path: "/category" },
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
        className="fixed right-4 bottom-20 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-ink-foreground shadow-lg md:hidden"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-card py-2 md:hidden">
        {TABS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path === "/" && location.pathname === "");
          
          if (path === "/cart") {
            return (
              <button
                key={label}
                onClick={openCart}
                className={`relative flex flex-col items-center gap-1 text-[11px] font-medium cursor-pointer ${
                  active ? "text-primary" : "text-foreground/70"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? "fill-primary/15" : ""}`} />
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

          return (
            <Link
              key={label}
              to={path === "/" ? "/" : (path === "/wishlist" ? "/wishlist" : "#")}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
                active ? "text-primary" : "text-foreground/70"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-primary/15" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}