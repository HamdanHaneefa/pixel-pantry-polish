import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { formatPrice } from "@/data/home";
import { Trash2, Home, ChevronRight, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Petpedia" },
      { name: "description", content: "View and manage your saved pet supplies and favorites." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem, isLoading } = useCart();

  const handleAddToCart = async (item: any) => {
    try {
      const variantId = item.variantId || item.variants?.[0]?.id || item.id;
      await addItem({
        variantId,
        product: item,
      });
      toast.success(`Added "${item.title}" to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link
            to="/"
            className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Wishlist</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-[28px] font-bold text-foreground">
            My Wishlist {items.length > 0 && <span className="text-base text-muted-foreground font-normal">({items.length} items)</span>}
          </h1>
          {items.length > 0 && (
            <Link
              to="/shop"
              className="text-xs md:text-sm font-semibold text-[#FF5B00] hover:underline"
            >
              Continue Shopping →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 text-[15px] max-w-md">
              Explore our wide range of pet food, toys, and accessories and click the heart icon on any product to save it here.
            </p>
            <Link
              to="/shop"
              className="bg-[#FF5B00] text-white px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-[#E55200] transition-colors shadow-sm"
            >
              BROWSE PRODUCTS →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[1fr_150px_150px_200px_60px] gap-8 p-6 bg-muted/10 border-b border-border/40 text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
              <div>Product</div>
              <div>Price</div>
              <div>Stock Status</div>
              <div>Action</div>
              <div className="text-right">Remove</div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-border/40">
              {items.map((item) => {
                const isOutOfStock =
                  item.availableForSale === false ||
                  (typeof item.stockQuantity === "number" && item.stockQuantity <= 0);

                return (
                  <div key={item.id} className="p-4 md:p-6 hover:bg-muted/5 transition-colors">
                    {/* --- MOBILE LAYOUT --- */}
                    <div className="flex md:hidden gap-4 items-start w-full">
                      {/* Image & Remove Button */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            removeFromWishlist(item.id);
                            toast.info("Removed from wishlist");
                          }}
                          className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center bg-white border border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 rounded-full shadow-sm z-10 transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                        <div className="w-[90px] h-[90px] bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                            }}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col flex-1 pt-1 min-w-0">
                        <Link
                          to="/product"
                          search={{ handle: item.handle || item.id } as any}
                          className="font-medium text-[13.5px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2 pr-2"
                        >
                          {item.title}
                        </Link>

                        <div className="flex items-center gap-2 mt-1.5">
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-[12px] text-muted-foreground line-through">
                              {formatPrice(item.mrp)}
                            </span>
                          )}
                          <span className="font-bold text-[14px] text-foreground">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            disabled={isLoading || isOutOfStock}
                            onClick={() => handleAddToCart(item)}
                            className={`h-8 px-4 rounded-md border text-[11px] font-bold tracking-wide transition-colors uppercase cursor-pointer ${
                              isOutOfStock
                                ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                                : "border-[#FF5B00] text-[#FF5B00] hover:bg-[#FF5B00] hover:text-white"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
                          </button>
                          <div
                            className={`text-[11px] font-bold uppercase ${
                              isOutOfStock ? "text-red-500" : "text-[#00A651]"
                            }`}
                          >
                            {isOutOfStock ? "OUT OF STOCK" : "IN STOCK"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- DESKTOP LAYOUT --- */}
                    <div className="hidden md:grid grid-cols-[1fr_150px_150px_200px_60px] gap-8 items-center w-full">
                      {/* Product Info */}
                      <div className="flex items-center gap-5 w-full pr-10 min-w-0">
                        <div className="w-20 h-20 shrink-0 bg-white rounded-lg border border-border/60 p-2 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                            }}
                          />
                        </div>
                        <Link
                          to="/product"
                          search={{ handle: item.handle || item.id } as any}
                          className="font-semibold text-[15px] leading-snug text-foreground hover:text-[#FF5B00] transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      </div>

                      {/* Price */}
                      <div>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-[12px] text-muted-foreground line-through block">
                            {formatPrice(item.mrp)}
                          </span>
                        )}
                        <span className="font-bold text-[16px] text-foreground">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div
                        className={`text-[13px] font-bold uppercase ${
                          isOutOfStock ? "text-red-500" : "text-[#00A651]"
                        }`}
                      >
                        {isOutOfStock ? "OUT OF STOCK" : "IN STOCK"}
                      </div>

                      {/* Actions */}
                      <div>
                        <button
                          type="button"
                          disabled={isLoading || isOutOfStock}
                          onClick={() => handleAddToCart(item)}
                          className={`h-10 px-5 rounded-lg border-2 text-[12px] font-bold tracking-wide transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                            isOutOfStock
                              ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                              : "border-[#FF5B00] text-[#FF5B00] hover:bg-[#FF5B00] hover:text-white shadow-xs"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
                        </button>
                      </div>

                      {/* Remove Button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            removeFromWishlist(item.id);
                            toast.info("Removed from wishlist");
                          }}
                          className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
