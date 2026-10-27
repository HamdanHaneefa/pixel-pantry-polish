import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Heart,
  HelpCircle,
  Copy,
  Facebook,
  Instagram,
  Star,
  Minus,
  Plus,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, type Product } from "@/data/home";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";
import { trackViewItem } from "@/lib/analytics";
import { optimizeShopifyImage } from "@/lib/utils";
import {
  getShippingSettingsFn,
  calculateShippingFee,
  ShippingSettings,
} from "@/lib/admin/shipping";
import {
  resolveEffectiveTrustBadges,
  type TrustBadgeConfig,
  DEFAULT_TRUST_BADGE_SETTINGS,
} from "@/lib/admin/trust-badges";
import qualityAssuredIcon from "@/assets/badges/quality-assured.png";
import expressDeliveryIcon from "@/assets/badges/express-delivery.png";
import noReturnIcon from "@/assets/badges/no-return.png";
import easyExchangeIcon from "@/assets/badges/easy-exchange.png";
import { toast } from "sonner";
import AskQuestionModal from "@/components/home/AskQuestionModal";

function cleanVariantTitle(title?: string, productTitle?: string): string {
  if (!title || title.trim() === "" || title.toLowerCase() === "default title") {
    return "Default";
  }

  let text = title.trim();

  if (productTitle) {
    const cleanProd = productTitle.trim().toLowerCase();
    if (text.toLowerCase().startsWith(cleanProd)) {
      text = text
        .slice(cleanProd.length)
        .replace(/^[\s/\\-]+/, "")
        .trim();
    }
  }

  const segments = text
    .split(/\s*[\/|\\]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
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

export default function ProductOverview({
  product,
  onOpenReviewModal,
  trustBadgeSettings,
}: {
  product?: Product | undefined;
  onOpenReviewModal?: (() => void) | undefined;
  trustBadgeSettings?: TrustBadgeConfig | undefined;
}) {
  const { addItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants?.[0]?.id || "",
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const inWishlist = Boolean(
    product?.id && (isInWishlist(product.id) || (product.handle ? isInWishlist(product.handle) : false)),
  );

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
      if (product.handle) removeFromWishlist(product.handle);
      toast.info("Removed from wishlist");
      // Do NOT redirect when unclicking
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist!");
      // Redirect to wishlist page when adding
      navigate({ to: "/wishlist" });
    }
  };

  const effectiveTrustBadges = useMemo(() => {
    return resolveEffectiveTrustBadges(
      trustBadgeSettings || DEFAULT_TRUST_BADGE_SETTINGS,
      product?.trustBadges,
      product?.tags,
    );
  }, [trustBadgeSettings, product?.trustBadges, product?.tags]);

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Product link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500",
    );
  };

  const handleShareWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(
      `Check out ${product?.title || "this product"} on Petpedia: ${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareInstagramOrNative = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || "Petpedia Product",
          text: `Check out ${product?.title} on Petpedia!`,
          url,
        });
        return;
      } catch {
        // User cancelled native share sheet
      }
    }
    await handleCopyLink();
    toast.info("Link copied! Paste it in Instagram to share.");
  };

  useEffect(() => {
    getShippingSettingsFn()
      .then(setShippingSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedImage(null);
    setSelectedVariantId(product?.variants?.[0]?.id || "");
    setActiveThumb(0);
    setIsImageLoading(false);
    setImageLoadError(false);
  }, [product?.id]);

  const thumbnails = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addImg = (url?: string | null) => {
      if (!url || typeof url !== "string" || !url.trim()) return;
      const clean = url.split("?")[0].toLowerCase().trim();
      if (seen.has(clean)) return;
      seen.add(clean);
      list.push(url.trim());
    };

    if (product?.images && product.images.length > 0) {
      product.images.forEach(addImg);
    } else if (product?.image) {
      addImg(product.image);
    }
    if (product?.variants) {
      for (const v of product.variants) {
        addImg(v.image);
      }
    }
    return list.length > 0 ? list : ["/placeholder-product.png"];
  }, [product]);

  // Preload all gallery images in high resolution (700px) so switching is instant
  useEffect(() => {
    if (!thumbnails || thumbnails.length === 0) return;
    thumbnails.forEach((thumbUrl) => {
      if (thumbUrl && thumbUrl !== "/placeholder-product.png") {
        const img = new Image();
        img.src = optimizeShopifyImage(thumbUrl, 700);
      }
    });
  }, [thumbnails]);

  const currentVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) || product?.variants?.[0];

  // Extract customizable option definitions from product or variants
  const productOptions = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const optionsMap = new Map<string, string[]>();

    for (const v of product.variants) {
      if (v.selectedOptions && v.selectedOptions.length > 0) {
        for (const so of v.selectedOptions) {
          if (!so.name || so.name === "Title" || so.name === "Default Title") continue;
          if (!optionsMap.has(so.name)) {
            optionsMap.set(so.name, []);
          }
          const list = optionsMap.get(so.name)!;
          if (!list.includes(so.value)) {
            list.push(so.value);
          }
        }
      } else if (v.title && v.title.includes(" / ")) {
        const parts = v.title.split(" / ");
        const opt1 = "Option 1";
        const opt2 = "Option 2";
        if (!optionsMap.has(opt1)) optionsMap.set(opt1, []);
        if (!optionsMap.has(opt2)) optionsMap.set(opt2, []);
        if (parts[0] && !optionsMap.get(opt1)!.includes(parts[0].trim())) {
          optionsMap.get(opt1)!.push(parts[0].trim());
        }
        if (parts[1] && !optionsMap.get(opt2)!.includes(parts[1].trim())) {
          optionsMap.get(opt2)!.push(parts[1].trim());
        }
      }
    }

    return Array.from(optionsMap.entries()).map(([name, values]) => ({
      name,
      values,
    }));
  }, [product]);

  // Current selected option values map e.g. { Color: "Pink", Size: "Small" }
  const currentOptionValues = useMemo<Record<string, string>>(() => {
    if (!currentVariant) return {};
    const map: Record<string, string> = {};
    if (currentVariant.selectedOptions && currentVariant.selectedOptions.length > 0) {
      for (const so of currentVariant.selectedOptions) {
        if (so.name && so.name !== "Title" && so.name !== "Default Title") {
          map[so.name] = so.value;
        }
      }
    }
    if (
      Object.keys(map).length === 0 &&
      currentVariant.title &&
      currentVariant.title.includes(" / ")
    ) {
      const parts = currentVariant.title.split(" / ");
      if (productOptions[0] && parts[0]) map[productOptions[0].name] = parts[0].trim();
      if (productOptions[1] && parts[1]) map[productOptions[1].name] = parts[1].trim();
      if (productOptions[2] && parts[2]) map[productOptions[2].name] = parts[2].trim();
    }
    return map;
  }, [currentVariant, productOptions]);

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const targetVar = product?.variants?.find((v) => v.id === variantId);
    if (targetVar?.image) {
      const targetImage = targetVar.image;
      const targetClean = targetImage.split("?")[0].toLowerCase();
      const idx = thumbnails.findIndex(
        (t) =>
          t.toLowerCase() === targetImage.toLowerCase() ||
          t.split("?")[0].toLowerCase() === targetClean,
      );
      if (idx !== -1) {
        setActiveThumb(idx);
        setSelectedImage(thumbnails[idx]);
      } else {
        setSelectedImage(targetImage);
      }
      setImageLoadError(false);
      setIsImageLoading(false);
    } else {
      setSelectedImage(thumbnails[0] || null);
      setActiveThumb(0);
      setImageLoadError(false);
      setIsImageLoading(false);
    }
  };

  const handleOptionSelect = (optionName: string, optionValue: string) => {
    if (!product?.variants || product.variants.length === 0) return;
    const targetValues = { ...currentOptionValues, [optionName]: optionValue };

    // 1. Try to find variant matching all target options
    let matched = product.variants.find((v) => {
      if (v.selectedOptions && v.selectedOptions.length > 0) {
        return Object.entries(targetValues).every(([name, val]) =>
          v.selectedOptions?.some(
            (so) =>
              so.name.toLowerCase() === name.toLowerCase() &&
              so.value.toLowerCase() === val.toLowerCase(),
          ),
        );
      }
      if (v.title && v.title.includes(" / ")) {
        const parts = v.title.split(" / ").map((p) => p.trim().toLowerCase());
        const desired = Object.values(targetValues).map((v) => v.trim().toLowerCase());
        return desired.every((d) => parts.includes(d));
      }
      return false;
    });

    // 2. Fallback: match by this option value directly
    if (!matched) {
      matched = product.variants.find((v) => {
        if (v.selectedOptions && v.selectedOptions.length > 0) {
          return v.selectedOptions.some(
            (so) =>
              so.name.toLowerCase() === optionName.toLowerCase() &&
              so.value.toLowerCase() === optionValue.toLowerCase(),
          );
        }
        return v.title.toLowerCase().includes(optionValue.toLowerCase());
      });
    }

    if (matched) {
      handleSelectVariant(matched.id);
    }
  };

  const handleThumbClick = (idx: number) => {
    const clickedUrl = thumbnails[idx];
    if (!clickedUrl) return;

    setActiveThumb(idx);
    setSelectedImage(clickedUrl);
    setImageLoadError(false);
    setIsImageLoading(false);

    const clickedClean = clickedUrl.split("?")[0].toLowerCase();
    const matchingVar = product?.variants?.find(
      (v) =>
        v.image &&
        (v.image.toLowerCase() === clickedUrl.toLowerCase() ||
          v.image.split("?")[0].toLowerCase() === clickedClean),
    );
    if (matchingVar) {
      setSelectedVariantId(matchingVar.id);
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
    thumbnails[activeThumb] ||
    selectedImage ||
    (currentVariant?.image && currentVariant.image.trim()) ||
    thumbnails[0] ||
    "/placeholder-product.png";

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
      {/* Left: Gallery */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 flex-1 min-w-0 items-start w-full">
        {/* Thumbnails Wrapper */}
        <div className="relative md:w-[84px] lg:w-[92px] shrink-0 w-full">
          <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar w-full max-h-[460px] lg:max-h-[520px] pb-2 md:pb-0 pr-1">
            {thumbnails.map((thumb, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`View product image ${idx + 1}`}
                onClick={() => handleThumbClick(idx)}
                className={`w-[72px] h-[72px] md:w-full md:h-[84px] lg:h-[92px] shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-1.5 ${
                  activeThumb === idx || activeImage === thumb
                    ? "border-[#FF5B00] shadow-xs ring-1 ring-[#FF5B00]/30"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <img
                  src={optimizeShopifyImage(thumb, 140)}
                  alt={`Thumbnail ${idx + 1}`}
                  width={92}
                  height={92}
                  loading="lazy"
                  decoding="async"
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
        <div className="flex-1 bg-white rounded-2xl border border-border/60 p-4 md:p-6 flex items-center justify-center relative aspect-square max-w-[540px] max-h-[520px] w-full self-start lg:sticky lg:top-24 shadow-2xs overflow-hidden">
          {/* Main High-Res Image */}
          <img
            key={activeImage}
            src={imageLoadError ? activeImage : optimizeShopifyImage(activeImage, 700)}
            alt={
              currentVariant?.title
                ? `${product?.title} - ${currentVariant.title}`
                : product?.title || "Product"
            }
            width={540}
            height={520}
            fetchPriority="high"
            decoding="async"
            onLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              if (!imageLoadError && activeImage && !activeImage.includes("placeholder-product")) {
                setImageLoadError(true);
              } else {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                setIsImageLoading(false);
              }
            }}
            className="w-full h-full object-contain transition-opacity duration-200 relative z-5 opacity-100"
          />
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col gap-6 flex-1 min-w-0 text-left">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {product?.reviews && product.reviews > 0 ? (
              <>
                <div className="flex text-[#FF5B00]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(product.rating) ? "fill-current" : "text-[#FF5B00]/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {product.rating} Star Rating
                </span>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  ({product.reviews} {product.reviews === 1 ? "Review" : "Reviews"})
                </span>
              </>
            ) : (
              <>
                <div className="flex text-muted-foreground/30">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 stroke-current fill-transparent" />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">No reviews yet</span>
                {onOpenReviewModal && (
                  <button
                    type="button"
                    onClick={onOpenReviewModal}
                    className="text-xs font-semibold text-[#FF5B00] hover:underline cursor-pointer"
                  >
                    Write the first review
                  </button>
                )}
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-foreground leading-tight mb-4">
            {product?.title || "Royal Canin Veterinary Diet Dry Food"}
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed whitespace-pre-line">
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
          <span className="text-[28px] font-bold text-[#FF5B00]">{formatPrice(displayPrice)}</span>
        </div>

        {/* Delivery Check */}
        <div className="pt-2 max-w-[420px]">
          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium mb-2">
            <Truck className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Enter pincode to see delivery date</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Pincode"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
              className="flex-1 bg-white border-slate-300 h-11 rounded-lg text-sm text-slate-900 focus-visible:ring-slate-900"
            />
            <button
              onClick={handleCheckDelivery}
              className="h-11 px-7 rounded-lg bg-[#1E3A5F] hover:bg-[#162D4A] active:bg-[#0F2035] text-white font-semibold text-sm transition-colors cursor-pointer shrink-0"
            >
              Check
            </button>
          </div>
          {pincodeChecked && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-2.5 py-1.5 mt-2 font-medium flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{pincodeChecked}</span>
            </p>
          )}
        </div>

        {/* Variants Selection */}
        {product?.variants && product.variants.length > 1 && (
          <div className="space-y-4 pt-2 max-w-[480px]">
            {productOptions.length > 1 ? (
              /* Multi-Option View: e.g. Color & Size */
              <div className="space-y-3.5">
                {productOptions.map((opt) => {
                  const isColor =
                    opt.name.toLowerCase().includes("color") ||
                    opt.name.toLowerCase().includes("colour");
                  const selectedVal = currentOptionValues[opt.name] || opt.values[0] || "";

                  return (
                    <div key={opt.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {opt.name}:{" "}
                          <span className="text-[#FF5B00] font-semibold normal-case text-sm ml-1">
                            {selectedVal}
                          </span>
                        </label>
                        {(currentVariant as any)?.sku && opt === productOptions[0] && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            SKU: {(currentVariant as any).sku}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                          const isSelected = selectedVal.toLowerCase() === val.toLowerCase();

                          // Check if this combination is in stock
                          const testValues = { ...currentOptionValues, [opt.name]: val };
                          const matchingVar = product.variants?.find((v) => {
                            if (v.selectedOptions && v.selectedOptions.length > 0) {
                              return Object.entries(testValues).every(([n, value]) =>
                                v.selectedOptions?.some(
                                  (so) =>
                                    so.name.toLowerCase() === n.toLowerCase() &&
                                    so.value.toLowerCase() === value.toLowerCase(),
                                ),
                              );
                            }
                            return false;
                          });

                          const isValOutOfStock = matchingVar
                            ? matchingVar.availableForSale === false ||
                              (matchingVar.stockQuantity !== undefined &&
                                matchingVar.stockQuantity <= 0)
                            : false;

                          // For color option, find variant with this color to show thumbnail
                          const colorVariant = isColor
                            ? product.variants?.find((v) =>
                                v.selectedOptions?.some(
                                  (so) =>
                                    so.name.toLowerCase() === opt.name.toLowerCase() &&
                                    so.value.toLowerCase() === val.toLowerCase(),
                                ),
                              )
                            : null;

                          if (isColor && colorVariant?.image) {
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleOptionSelect(opt.name, val)}
                                className={`group relative flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[#FF5B00] bg-[#FFF5EE] ring-2 ring-[#FF5B00]/30 shadow-xs"
                                    : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                                } ${isValOutOfStock ? "opacity-60" : ""}`}
                              >
                                <img
                                  src={colorVariant.image}
                                  alt={val}
                                  className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <span
                                  className={`text-xs font-semibold ${
                                    isSelected ? "text-[#FF5B00]" : "text-slate-800"
                                  }`}
                                >
                                  {val}
                                </span>
                                {isSelected && (
                                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF5B00] text-white shrink-0 ml-0.5">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </span>
                                )}
                              </button>
                            );
                          }

                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleOptionSelect(opt.name, val)}
                              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                isSelected
                                  ? "border-[#FF5B00] bg-[#FFF5EE] text-[#FF5B00] ring-2 ring-[#FF5B00]/30 shadow-xs"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                              } ${isValOutOfStock ? "line-through opacity-50 text-slate-400" : ""}`}
                            >
                              {val}
                              {isValOutOfStock && <span className="sr-only"> (Sold Out)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single Option View: Modern Variant Selector Cards */
              <div>
                <div className="flex items-center justify-between mb-2">
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

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    const formattedTitle = cleanVariantTitle(v.title, product.title);
                    const isOutOfStock =
                      v.availableForSale === false ||
                      (v.stockQuantity !== undefined && v.stockQuantity <= 0);

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
          </div>
        )}

        {/* Add to Cart & Fastrr 1-Click Buy */}
        <div className="space-y-3 pt-4 max-w-[420px]">
          <div className="flex gap-3">
            <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-white h-12 w-[110px] shrink-0 text-foreground">
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
              className={`flex-1 rounded-[10px] font-bold text-[14px] tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 h-12 ${
                isOutOfStock
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#FFF5F5] hover:bg-[#FFEBEB] active:bg-[#FFDEDE] border border-[#ff4d4d] text-[#ff3333] cursor-pointer disabled:opacity-75"
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
              options={
                product?.isCodAvailable === false
                  ? {
                      cartAttributes: {
                        no_cod: "true",
                        disable_cod: "true",
                        payment_type: "prepaid_only",
                      },
                    }
                  : undefined
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
                isCodAvailable: product.isCodAvailable !== false,
              },
            ]}
            subtotal={displayPrice * quantity}
            shippingFee={
              calculateShippingFee(displayPrice * quantity, shippingSettings).shippingFee
            }
            shippingTitle={
              calculateShippingFee(displayPrice * quantity, shippingSettings).shippingTitle
            }
          />
        )}

        {/* Dynamic Trust Assurance Badges (Zigly Structure) */}
        {(effectiveTrustBadges.showQualityAssured ||
          effectiveTrustBadges.showExpressDelivery ||
          effectiveTrustBadges.showReturnPolicy) && (
          <div className="grid grid-cols-3 items-start justify-items-center gap-2 sm:gap-6 mt-5 py-3">
            {effectiveTrustBadges.showQualityAssured && (
              <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center text-center sm:text-left gap-1.5 sm:gap-2.5 w-full">
                <img
                  src={qualityAssuredIcon}
                  alt="Quality Assured"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                />
                <span className="text-[11px] sm:text-[13px] font-medium text-[#1E293B] leading-tight max-w-[95px] sm:max-w-none">
                  Quality Assured
                </span>
              </div>
            )}

            {effectiveTrustBadges.showExpressDelivery && (
              <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center text-center sm:text-left gap-1.5 sm:gap-2.5 w-full">
                <img
                  src={expressDeliveryIcon}
                  alt="Express Delivery"
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                />
                <span className="text-[11px] sm:text-[13px] font-medium text-[#1E293B] leading-tight max-w-[95px] sm:max-w-none">
                  Express Delivery
                </span>
              </div>
            )}

            {effectiveTrustBadges.showReturnPolicy && (
              <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-center text-center sm:text-left gap-1.5 sm:gap-2.5 w-full">
                {effectiveTrustBadges.returnPolicyType === "no_return" ? (
                  <>
                    <img
                      src={noReturnIcon}
                      alt="No Return & Exchange"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                    />
                    <span className="text-[11px] sm:text-[13px] font-medium text-[#1E293B] leading-tight max-w-[95px] sm:max-w-none">
                      {effectiveTrustBadges.returnPolicyLabel || "No Return & Exchange"}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={easyExchangeIcon}
                      alt="Easy Exchange"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                    />
                    <span className="text-[11px] sm:text-[13px] font-medium text-[#1E293B] leading-tight max-w-[95px] sm:max-w-none">
                      {effectiveTrustBadges.returnPolicyLabel || "Easy Return & Exchange"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 mt-2 border-t border-border/60">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex items-center gap-2 text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer ${
                inWishlist
                  ? "text-rose-600 hover:text-rose-700"
                  : "text-muted-foreground hover:text-[#FF5B00]"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  inWishlist ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {inWishlist ? "In Wishlist (Click to remove)" : "Add to Wishlist"}
            </button>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="flex items-center gap-2 text-[13px] md:text-[14px] text-muted-foreground hover:text-[#FF5B00] transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" /> Ask a question
            </button>
          </div>
          <div className="flex items-center gap-3 text-[13px] md:text-[14px] text-muted-foreground">
            <span className="hidden sm:inline">Share product:</span>
            <button
              onClick={handleCopyLink}
              className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
              title="Copy link"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="hover:text-[#25D366] transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
            <button
              onClick={handleShareFacebook}
              className="hover:text-[#1877F2] transition-colors cursor-pointer"
              title="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </button>
            <button
              onClick={handleShareInstagramOrNative}
              className="hover:text-[#E4405F] transition-colors cursor-pointer"
              title="Share on Instagram / Devices"
            >
              <Instagram className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ask Question Modal */}
        <AskQuestionModal
          isOpen={isAskModalOpen}
          onClose={() => setIsAskModalOpen(false)}
          product={product}
        />
      </div>
    </div>

    {/* Mobile Sticky Bottom Action Bar (Quantity + Add to Bag + Buy Now) */}
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Stepper */}
        <div className="flex items-center border border-slate-300 rounded-lg bg-white h-11 w-[96px] shrink-0 text-foreground">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex-1 flex justify-center items-center h-full hover:bg-black/5 text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-bold text-sm w-7 text-center text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => setQuantity(quantity + 1)}
            className="flex-1 flex justify-center items-center h-full hover:bg-black/5 text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Add to Bag */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className={`flex-1 h-11 rounded-[10px] font-bold text-xs uppercase tracking-wide transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
            isOutOfStock
              ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#FFF5F5] hover:bg-[#FFEBEB] active:bg-[#FFDEDE] border border-[#ff4d4d] text-[#ff3333] cursor-pointer"
          }`}
        >
          {isOutOfStock ? (
            "OUT OF STOCK"
          ) : addedAnimation ? (
            <>
              <Check className="w-4 h-4" /> ADDED!
            </>
          ) : (
            "ADD TO BAG"
          )}
        </button>

        {/* Buy Now */}
        {!isOutOfStock ? (
          <button
            type="button"
            onClick={() => setIsFastrrOpen(true)}
            className="flex-1 h-11 rounded-[10px] font-bold text-xs uppercase tracking-wide transition-all shadow-2xs flex items-center justify-center gap-1.5 bg-[#E51E2B] hover:bg-[#D01521] active:bg-[#B8101B] text-white cursor-pointer"
          >
            BUY NOW
          </button>
        ) : null}
      </div>
    </div>
  </>
  );
}
