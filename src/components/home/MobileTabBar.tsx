import { ChevronUp, Heart, Home, LayoutList, ShoppingBag, User } from "lucide-react";

const TABS = [
  { label: "Home", icon: Home, active: true },
  { label: "Category", icon: LayoutList },
  { label: "Wishlist", icon: Heart },
  { label: "Cart", icon: ShoppingBag },
  { label: "Account", icon: User },
];

export default function MobileTabBar() {
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
        {TABS.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              active ? "text-primary" : "text-foreground/70"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "fill-primary/15" : ""}`} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}