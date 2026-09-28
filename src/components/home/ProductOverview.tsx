import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Heart, HelpCircle, Copy, Facebook, Instagram, Star, Minus, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, type Product } from "@/data/home";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";
import { trackViewItem } from "@/lib/analytics";

function cleanVariantTitle(title?: string, productTitle?: string): string {
  if (!title || title.trim() === "" || title.toLowerCase() === "default title") {
    return "Default";
  }

  let text = title.trim();

  if (productTitle) {
    const cleanProd = productTitle.trim().toLowerCase();
    if (text.toLowerCase().startsWith(cleanProd)) {
      text = text.slice(cleanProd.length).replace(/^[\s/\\-]+/, "").trim();
    }
  }

  const segments = text.split(/\s*[\/|\\]\s*/).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return text || "Default";

  const uniqueSegments: string[] = [];
  for (const seg of segments) {
    const isDuplicate = uniqueSegments.some((u) => u.toLowerCase() === seg.toLowerCase());
    if (!isDuplicate) {
      if (
        segments.length > 1 &&
        productTitle &&
        seg.toLowerCase().length > 15 &&
        productTitle.toLowerCase().includes(seg.toLowerCase().slice(0, 15))
      ) {
        continue;
      }
      uniqueSegments.push(seg);
    }
  }

  const result = (uniqueSegments.length > 0 ? uniqueSegments : segments).join(" / ");
  return result || text;
}

export default function ProductOverview({ product }: { product?: Product | undefined }) {
  const { addItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants?.[0]?.id || ""
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(null);
    setSelectedVariantId(product?.variants?.[0]?.id || "");
    setActiveThumb(0);
  }, [product?.id]);

  const thumbnails = useMemo(() => {
    const list: string[] = [];
    if (product?.images && product.images.length > 0) {
      list.push(...product.images);
    } else if (product?.image) {
      list.push(product.image);
    }
    if (product?.variants) {
      for (const v of product.variants) {
        if (v.image && !list.includes(v.image)) {
          list.push(v.image);
        }
      }
    }
    return list.length > 0 ? list : ["/placeholder-product.png"];
  }, [product]);

  const currentVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) ||
    product?.variants?.[0];

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const targetVar = product?.variants?.find((v) => v.id === variantId);
    if (targetVar?.image) {
      setSelectedImage(targetVar.image);
      const targetClean = targetVar.image.split("?")[0];
      const idx = thumbnails.findIndex(
        (t) => t === targetVar.image || t.split("?")[0] === targetClean
      );
      if (idx !== -1) {
        setActiveThumb(idx);
      }
    } else {
      setSelectedImage(thumbnails[0] || null);
      setActiveThumb(0);
    }
  };

  const handleThumbClick = (idx: number) => {
    setActiveThumb(idx);
    const clickedUrl = thumbnails[idx];
    if (clickedUrl) {
      setSelectedImage(clickedUrl);
      const clickedClean = clickedUrl.split("?")[0];
      const matchingVar = product?.variants?.find(
        (v) => v.image === clickedUrl || (v.image && v.image.split("?")[0] === clickedClean)
      );
      if (matchingVar) {
        setSelectedVariantId(matchingVar.id);
      }
    }
  };

  const displayPrice = currentVariant ? currentVariant.price : product?.price || 800;
  const displayMrp = currentVariant?.compareAtPrice || product?.mrp;
  const discountPct =
    displayMrp && displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : null;

  useEffect(() => {
    if (product) {
      trackViewItem({
        id: product.id,
        name: product.title,
        price: displayPrice,
        category: product.productType || undefined,
        brand: product.vendor || "Petpedia",
        variant: currentVariant?.title || undefined,
      });
    }
  }, [product?.id, currentVariant?.id, displayPrice]);

  const isOutOfStock =
    !product?.availableForSale ||
    (typeof (product as any)?.stockQuantity === "number" && (product as any)?.stockQuantity <= 0) ||
    (currentVariant ? currentVariant.availableForSale === false : false);

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    const variantIdToUse = currentVariant?.id || `var_${product.id}`;
    const variantLabel =
      currentVariant?.title && currentVariant.title !== "Default Title"
        ? ` (${currentVariant.title})`
        : "";
    await addItem({
      variantId: variantIdToUse,
      quantity,
      product: {
        id: product.id,
        title: `${product.title}${variantLabel}`,
        handle: product.handle || "product",
        price: displayPrice,
        mrp: displayMrp || displayPrice,
        image: currentVariant?.image || thumbnails[activeThumb] || product.image,
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

  const activeImage =
    selectedImage ||
    thumbnails[activeThumb] ||
    (currentVariant?.image && currentVariant.image.trim()) ||
    thumbnails[0] ||
    "/placeholder-product.png";

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
                onClick={() => handleThumbClick(idx)}
                className={`w-[80px] h-[80px] md:w-full md:h-[100px] shrink-0 rounded-lg overflow-hidden border-2 ${
                  (activeImage === thumb || activeThumb === idx)
                    ? "border-[#FF5B00]"
                    : "border-border/50 hover:border-border"
                } bg-white p-2 transition-colors cursor-pointer`}
              >
                <img
                  src={thumb}
                  alt={`Thumbnail ${idx}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 bg-white rounded-xl border border-border/60 p-6 flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
          <img
            src={activeImage}
            alt={currentVariant?.title ? `${product?.title} - ${currentVariant.title}` : (product?.title || "Product")}
            className="w-full h-full max-h-[400px] object-contain transition-all duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
            }}
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

        {/* Variants Selection */}
        {product?.variants && product.variants.length > 1 && (
          <div className="space-y-3 pt-2 max-w-[480px]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">
                Options / Size:{" "}
                <span className="text-[#FF5B00] font-semibold">
                  {cleanVariantTitle(currentVariant?.title, product.title)}
                </span>
              </p>
              {(currentVariant as any)?.sku && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  SKU: {(currentVariant as any).sku}
                </span>
              )}
            </div>

            {/* Visual Modern Variant Selector Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const formattedTitle = cleanVariantTitle(v.title, product.title);
                const isOutOfStock =
                  v.availableForSale === false || (v.quantity !== undefined && v.quantity <= 0);

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariant(v.id)}
                    className={`group relative flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#FF5B00] bg-[#FFF5EE] ring-2 ring-[#FF5B00]/25 shadow-xs"
                        : "border-border/80 bg-white hover:border-[#FF5B00]/40 hover:bg-slate-50/70"
                    } ${isOutOfStock ? "opacity-60 grayscale-[30%]" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={v.title}
                          className="h-10 w-10 rounded-lg object-cover border border-border/50 shrink-0"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs font-semibold leading-snug line-clamp-2 ${
                            isSelected ? "text-[#FF5B00]" : "text-foreground"
                          }`}
                        >
                          {formattedTitle}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs ${
                              isSelected
                                ? "text-[#FF5B00] font-bold"
                                : "text-muted-foreground font-medium"
                            }`}
                          >
                            {formatPrice(v.price)}
                          </span>
                          {isOutOfStock && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5B00] text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add to Cart & Fastrr 1-Click Buy */}
        <div className="space-y-3 pt-4 max-w-[420px]">
          <div className="flex gap-3">
            <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] h-12 w-[110px] shrink-0 text-foreground">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex-1 flex justify-center items-center h-full hover:bg-black/5 text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-[15px] w-8 text-center text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity(quantity + 1)}
                className="flex-1 flex justify-center items-center h-full hover:bg-black/5 text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={`flex-1 rounded-lg font-bold text-[14px] tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#FFF2F2] hover:bg-[#FFE6E6] active:bg-[#FEDDDD] border border-[#E51E2B] text-[#E51E2B] cursor-pointer disabled:opacity-75"
              }`}
            >
              {isOutOfStock ? (
                "OUT OF STOCK"
              ) : addedAnimation ? (
                <>
                  <Check className="w-5 h-5" /> ADDED TO BAG!
                </>
              ) : (
                "ADD TO BAG"
              )}
            </button>
          </div>

          {/* Fastrr 1-Click Instant Buy Button */}
          {!isOutOfStock ? (
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
          ) : (
            <div className="w-full py-2.5 px-4 text-center rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              Currently Unavailable — This item is out of stock.
            </div>
          )}
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
