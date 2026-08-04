import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice, type Badge, type Product } from "@/data/home";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductOverview from "@/components/home/ProductOverview";

const toneClass: Record<Badge["tone"], string> = {
  deal: "bg-deal text-primary-foreground",
  hot: "bg-hot text-primary-foreground",
  sale: "bg-sale text-primary-foreground",
  off: "bg-off text-foreground",
};

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${n <= rating ? "fill-primary text-primary" : "text-primary/40"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({reviews})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-[0_18px_40px_-24px_oklch(0.3_0.05_60/0.55)]">
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
        {product.badges?.map((b) => (
          <span
            key={b.label}
            className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${toneClass[b.tone]}`}
          >
            {b.label}
          </span>
        ))}
      </div>

      <div className="relative aspect-square overflow-hidden bg-card p-4">
        <Link to="/product" className="block h-full w-full">
          <img
            src={product.image}
            alt={product.title}
            width={512}
            height={512}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-center gap-2 opacity-0 pointer-events-none transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            aria-label="Add to wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            aria-label="Quick view"
            onClick={() => setShowQuickView(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-primary hover:text-primary-foreground z-10 relative"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2 px-3 pt-1 pb-2 md:hidden">
        <button
          aria-label="Add to wishlist"
          className="flex h-9 flex-1 items-center justify-center rounded-md border border-border/80 bg-card text-foreground"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button
          aria-label="Add to cart"
          className="flex h-9 flex-1 items-center justify-center rounded-md border border-border/80 bg-card text-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
        <button
          aria-label="Quick view"
          onClick={() => setShowQuickView(true)}
          className="flex h-9 flex-1 items-center justify-center rounded-md border border-border/80 bg-card text-foreground relative z-10"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5 md:border-t md:border-border/70 md:pt-3.5">
        <Link to="/product" className="hover:underline">
          <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground md:text-[15px]">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          {product.mrp && (
            <span className="text-[13px] text-muted-foreground line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
          <span className="text-[15px] font-bold text-foreground">{formatPrice(product.price)}</span>
        </div>
        <Stars rating={product.rating} reviews={product.reviews} />
      </div>
    </article>

    <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <ProductOverview product={product} />
      </DialogContent>
    </Dialog>
    </>
  );
}