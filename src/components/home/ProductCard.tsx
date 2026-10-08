import { Eye, Heart, ShoppingBag, Star, Check } from "lucide-react";
import { formatPrice, type Product } from "@/data/home";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductOverview from "@/components/home/ProductOverview";
import { useCart } from "@/context/CartContext";
import { optimizeShopifyImage } from "@/lib/utils";

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  if (!reviews || reviews === 0) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className="h-3.5 w-3.5 text-muted-foreground/30 stroke-current" />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground/70">(0)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${
              n <= Math.round(rating)
                ? "fill-primary text-primary"
                : "text-primary/40"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({reviews})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem, isLoading } = useCart();

  const isOutOfStock =
    product.availableForSale === false ||
    (typeof (product as any).stockQuantity === "number" && (product as any).stockQuantity <= 0) ||
    (product.variants && product.variants.length > 0 && product.variants.every((v) => !v.availableForSale));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const variantId = product.variants?.[0]?.id || `var_${product.id}`;
    await addItem({
      variantId,
      quantity: 1,
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
      },
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const productLinkParams = {
    handle: product.handle || product.id,
  };

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#FCECE0] bg-white shadow-[0_2px_12px_#FCECE0] transition-all duration-300 hover:shadow-[0_8px_24px_#FCECE0] hover:-translate-y-0.5">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
          {isOutOfStock ? (
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide bg-rose-100 text-rose-700 border border-rose-200">
              OUT OF STOCK
            </span>
          ) : null}
        </div>

        <div className="relative aspect-square overflow-hidden bg-white p-4">
          <Link
            to="/product"
            search={{ handle: product.handle || product.id }}
            className="block h-full w-full"
          >
            <img
              src={optimizeShopifyImage(product.image, 400)}
              alt={product.title}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
              }}
            />
          </Link>
          <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-center gap-2 opacity-0 pointer-events-none transition-all group-hover:pointer-events-auto group-hover:opacity-100">
            <Link
              to="/wishlist"
              aria-label="Add to wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <button
              aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
              title={isOutOfStock ? "Out of stock" : "Add to cart"}
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:scale-105 ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : justAdded
                  ? "bg-green-600 text-white cursor-pointer"
                  : "bg-white text-foreground hover:bg-primary hover:text-primary-foreground border border-[#FCECE0] cursor-pointer"
              }`}
            >
              {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </button>
            <button
              aria-label="Quick view"
              onClick={() => setShowQuickView(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-md hover:bg-primary hover:text-primary-foreground border border-[#FCECE0] z-10 relative cursor-pointer transition-transform hover:scale-105"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 px-3 pt-1 pb-2 md:hidden">
          <Link
            to="/wishlist"
            aria-label="Add to wishlist"
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-[#FCECE0] bg-white text-foreground"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <button
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
            title={isOutOfStock ? "Out of stock" : "Add to cart"}
            onClick={handleAddToCart}
            disabled={isLoading || isOutOfStock}
            className={`flex h-9 flex-1 items-center justify-center rounded-md border border-[#FCECE0] text-foreground ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : justAdded
                ? "bg-green-600 text-white cursor-pointer"
                : "bg-white cursor-pointer"
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
          <button
            aria-label="Quick view"
            onClick={() => setShowQuickView(true)}
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-[#FCECE0] bg-white text-foreground relative z-10 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5 md:border-t md:border-[#FCECE0] md:pt-3.5">
          <Link
            to="/product"
            search={{ handle: product.handle || product.id }}
            className="hover:underline"
          >
            <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground md:text-[15px]">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            {product.mrp && product.mrp > product.price && (
              <span className="text-[13px] text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
            <span className="text-[15px] font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
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