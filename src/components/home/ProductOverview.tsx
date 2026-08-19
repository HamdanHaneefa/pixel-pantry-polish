import { useState } from "react";
import { ChevronDown, Heart, HelpCircle, Copy, Facebook, Instagram, Star, Minus, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, type Product } from "@/data/home";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";

export default function ProductOverview({ product }: { product?: Product | undefined }) {
  const { addItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants?.[0]?.id || ""
  );
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);

  const thumbnails =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image || "/placeholder-product.png"];

  const currentVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) ||
    product?.variants?.[0];

  const displayPrice = currentVariant ? currentVariant.price : product?.price || 800;
  const displayMrp = currentVariant?.compareAtPrice || product?.mrp;
  const discountPct =
    displayMrp && displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : null;

  const handleAddToCart = async () => {
    if (!product) return;
    const variantIdToUse = currentVariant?.id || `var_${product.id}`;
    await addItem({
      variantId: variantIdToUse,
      quantity,
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle || "product",
        price: displayPrice,
        mrp: displayMrp || displayPrice,
        image: thumbnails[activeThumb] || product.image,
      },
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleCheckDelivery = () => {
    if (pincodeInput.trim().length >= 6) {
      setPincodeChecked(`Estimated Delivery in 2-3 Business Days for ${pincodeInput}`);
    } else {
      setPincodeChecked("Please enter a valid 6-digit PIN code");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Left: Gallery */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 flex-1 min-w-0">
        {/* Thumbnails Wrapper */}
        <div className="relative md:w-[100px] shrink-0">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar w-full pb-2 md:pb-0">
            {thumbnails.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setActiveThumb(idx)}
                className={`w-[80px] h-[80px] md:w-full md:h-[100px] shrink-0 rounded-lg overflow-hidden border-2 ${
                  activeThumb === idx
                    ? "border-[#FF5B00]"
                    : "border-border/50 hover:border-border"
                } bg-white p-2 transition-colors cursor-pointer`}
              >
                <img
                  src={thumb}
                  alt={`Thumbnail ${idx}`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 bg-white rounded-xl border border-border/60 p-6 flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
          <img
            src={thumbnails[activeThumb] || thumbnails[0]}
            alt={product?.title || "Product"}
            className="w-full h-full max-h-[400px] object-contain mix-blend-multiply"
          />
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col gap-6 flex-1 min-w-0 text-left">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-[#FF5B00]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.round(product?.rating || 4.7)
                      ? "fill-current"
                      : "text-[#FF5B00]/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">
              {product?.rating || 4.7} Star Rating
            </span>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              ({product?.reviews || 740} User feedback)
            </span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-foreground leading-tight mb-4">
            {product?.title || "Royal Canin Veterinary Diet Dry Food"}
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            {product?.description ||
              "Nutritionally complete formula loaded with premium protein, essential vitamins, Omega fatty acids and active prebiotics for optimal health and vitality."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {displayMrp && displayMrp > displayPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(displayMrp)}
            </span>
          )}
          <span className="text-[28px] font-bold text-[#FF5B00]">
            {formatPrice(displayPrice)}
          </span>
          {discountPct && (
            <span className="bg-[#FFE246] text-[#695A00] text-xs font-bold px-2.5 py-1 rounded-sm ml-2">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* Delivery Check */}
        <div className="pt-2">
          <p className="text-sm font-medium text-foreground mb-2">Check delivery date</p>
          <div className="flex gap-3 max-w-[400px]">
            <Input
              placeholder="Enter PIN code"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
              className="flex-1 bg-white border-border/60 h-11 focus-visible:ring-[#FF5B00]"
            />
            <button
              onClick={handleCheckDelivery}
              className="h-11 px-6 rounded-md border border-[#FF5B00] text-[#FF5B00] font-medium hover:bg-[#FF5B00]/5 transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>
          {pincodeChecked && (
            <p className="text-xs text-[#FF5B00] mt-1.5 font-medium">{pincodeChecked}</p>
          )}
        </div>

        {/* Variants */}
        {product?.variants && product.variants.length > 1 && (
          <div className="flex gap-4 max-w-[400px] pt-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">Options / Size</p>
              <div className="relative">
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-border/60 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#FF5B00] text-[15px] cursor-pointer"
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} - {formatPrice(v.price)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Add to Cart & Fastrr 1-Click Buy */}
        <div className="space-y-3 pt-4 max-w-[420px]">
          <div className="flex gap-3">
            <div className="flex items-center border border-border/60 rounded-md bg-white h-12 w-[110px] shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex-1 flex justify-center items-center h-full hover:bg-muted/50 text-muted-foreground transition-colors cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-[15px] w-8 text-center">
                {quantity.toString().padStart(2, "0")}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex-1 flex justify-center items-center h-full hover:bg-muted/50 text-muted-foreground transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="flex-1 bg-white border-2 border-[#FF5B00] text-[#FF5B00] hover:bg-[#FF5B00] hover:text-white rounded-md font-bold text-[14px] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5" /> ADDED!
                </>
              ) : (
                "ADD TO CART"
              )}
            </button>
          </div>

          {/* Fastrr 1-Click Instant Buy Button */}
          <FastrrButton
            onClick={() => setIsFastrrOpen(true)}
            label="BUY NOW"
            className="w-full"
            items={
              product
                ? [
                    {
                      variantId: currentVariant?.id || `var_${product.id}`,
                      quantity,
                    },
                  ]
                : []
            }
          />
        </div>

        {/* Fastrr 1-Click Checkout Modal */}
        {isFastrrOpen && product && (
          <FastrrCheckoutModal
            isOpen={isFastrrOpen}
            onClose={() => setIsFastrrOpen(false)}
            items={[
              {
                id: currentVariant?.id || `var_${product.id}`,
                variantId: currentVariant?.id || `var_${product.id}`,
                title: product.title,
                productTitle: product.title,
                price: displayPrice,
                quantity,
                image: thumbnails[activeThumb] || product.image,
                handle: product.handle || "product",
                mrp: displayMrp || displayPrice,
              },
            ]}
            subtotal={displayPrice * quantity}
            shippingFee={displayPrice * quantity > 500 ? 0 : 50}
          />
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 mt-2 border-t border-border/60">
          <div className="flex items-center gap-6">
            <Link
              to="/wishlist"
              className="flex items-center gap-2 text-[13px] md:text-[14px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart className="h-4 w-4" /> Add to Wishlist
            </Link>
            <button className="flex items-center gap-2 text-[13px] md:text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <HelpCircle className="h-4 w-4" /> Ask a question
            </button>
          </div>
          <div className="flex items-center gap-3 text-[13px] md:text-[14px] text-muted-foreground">
            <span className="hidden sm:inline">Share product:</span>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="hover:text-foreground transition-colors cursor-pointer"
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button className="hover:text-foreground transition-colors cursor-pointer">
              <Facebook className="h-4 w-4" />
            </button>
            <button className="hover:text-foreground transition-colors cursor-pointer">
              <Instagram className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
