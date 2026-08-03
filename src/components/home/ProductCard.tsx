import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice, type Badge, type Product } from "@/data/home";

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
  return (
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
        <img
          src={product.image}
          alt={product.title}
          width={512}
          height={512}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 opacity-100 transition-all md:pointer-events-none md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100">
          <button
            aria-label="Add to wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md md:h-10 md:w-10"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-primary hover:text-primary-foreground md:h-10 md:w-10"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-primary hover:text-primary-foreground md:h-10 md:w-10"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-border/70 px-3.5 py-3.5">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground md:text-[15px]">
          {product.title}
        </h3>
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
  );
}