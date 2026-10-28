import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/formatPrice";

export default function AccountWishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem, isLoading } = useCart();

  const handleAddToCart = async (item: any) => {
    try {
      const variantId = item.variantId || item.variants?.[0]?.id || item.id;
      await addItem({ variantId, product: item });
      toast.success(`Added "${item.title}" to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Products you've saved for later</p>
        </div>
        {items.length > 0 && (
          <Link to="/shop" className="text-sm font-semibold text-[#FF5B00] hover:underline">
            Continue Shopping →
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Explore our wide range of pet food, toys, and accessories and click the heart icon on
              any product to save it here.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5B00] hover:bg-[#E05000] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70">
          {items.map((item) => {
            const isOutOfStock =
              item.availableForSale === false ||
              (typeof item.stockQuantity === "number" && item.stockQuantity <= 0);

            return (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-20 h-20 shrink-0 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    to="/product"
                    search={{ handle: item.handle || item.id } as any}
                    className="font-semibold text-sm leading-snug text-slate-800 hover:text-[#FF5B00] transition-colors line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(item.mrp)}
                      </span>
                    )}
                    <span className="font-bold text-sm text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase ${
                        isOutOfStock ? "text-red-500" : "text-[#00A651]"
                      }`}
                    >
                      {isOutOfStock ? "Out of stock" : "In stock"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading || isOutOfStock}
                    onClick={() => handleAddToCart(item)}
                    className={`mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      isOutOfStock
                        ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                        : "border-[#FF5B00] text-[#FF5B00] hover:bg-[#FF5B00] hover:text-white cursor-pointer"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeFromWishlist(item.id);
                    toast.info("Removed from wishlist");
                  }}
                  className="self-start p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
