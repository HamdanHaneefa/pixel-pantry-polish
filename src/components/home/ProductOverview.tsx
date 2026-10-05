import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Heart, HelpCircle, Copy, Facebook, Instagram, Star, Minus, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, type Product } from "@/data/home";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import FastrrCheckoutModal from "@/components/shiprocket/FastrrCheckoutModal";
import FastrrButton from "@/components/shiprocket/FastrrButton";
import { trackViewItem } from "@/lib/analytics";
import { optimizeShopifyImage } from "@/lib/utils";

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
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isFastrrOpen, setIsFastrrOpen] = useState(false);

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
    product?.variants?.find((v) => v.id === selectedVariantId) ||
    product?.variants?.[0];

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
    if (Object.keys(map).length === 0 && currentVariant.title && currentVariant.title.includes(" / ")) {
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
      const targetClean = targetVar.image.split("?")[0].toLowerCase();
      const idx = thumbnails.findIndex(
        (t) => t.toLowerCase() === targetVar.image.toLowerCase() || t.split("?")[0].toLowerCase() === targetClean
      );
      if (idx !== -1) {
        setActiveThumb(idx);
        setSelectedImage(thumbnails[idx]);
      } else {
        setSelectedImage(targetVar.image);
      }
      setImageLoadError(false);
      try {
        const img = new Image();
        img.src = optimizeShopifyImage(targetVar.image, 700);
        if (!img.complete) {
          setIsImageLoading(true);
        } else {
          setIsImageLoading(false);
        }
      } catch {
        // no-op
      }
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
            (so) => so.name.toLowerCase() === name.toLowerCase() && so.value.toLowerCase() === val.toLowerCase()
          )
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
            (so) => so.name.toLowerCase() === optionName.toLowerCase() && so.value.toLowerCase() === optionValue.toLowerCase()
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

    try {
      const img = new Image();
      img.src = optimizeShopifyImage(clickedUrl, 700);
      if (!img.complete) {
        setIsImageLoading(true);
      } else {
        setIsImageLoading(false);
      }
    } catch {
      setIsImageLoading(true);
    }

    const clickedClean = clickedUrl.split("?")[0].toLowerCase();
    const matchingVar = product?.variants?.find(
      (v) => v.image && (v.image.toLowerCase() === clickedUrl.toLowerCase() || v.image.split("?")[0].toLowerCase() === clickedClean)
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
          {/* Subtle loading spinner overlay if fetching over network */}
          {isImageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full border-2 border-[#FF5B00]/20 border-t-[#FF5B00] animate-spin" />
            </div>
          )}

          {/* Instant low-res / cached thumbnail fallback so user NEVER sees blank or stale image */}
          {activeImage && activeImage !== "/placeholder-product.png" && (
            <img
              src={optimizeShopifyImage(activeImage, 140)}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-contain p-4 md:p-6 filter blur-xs transition-opacity duration-300 pointer-events-none ${
                isImageLoading ? "opacity-60" : "opacity-0"
              }`}
            />
          )}

          {/* Main High-Res Image */}
          <img
            key={activeImage}
            src={imageLoadError ? activeImage : optimizeShopifyImage(activeImage, 700)}
            alt={currentVariant?.title ? `${product?.title} - ${currentVariant.title}` : (product?.title || "Product")}
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
            className={`w-full h-full object-contain transition-opacity duration-200 relative z-5 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
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
                                    so.value.toLowerCase() === value.toLowerCase()
                                )
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
                                    so.value.toLowerCase() === val.toLowerCase()
                                )
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
                              {isValOutOfStock && (
                                <span className="sr-only"> (Sold Out)</span>
                              )}
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
