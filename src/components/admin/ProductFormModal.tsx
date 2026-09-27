import { useState, useRef, useEffect } from "react";
import {
  AdminProduct,
  saveProductFn,
  uploadProductImageFn,
  toggleProductVisibilityFn,
  SaveProductVariantPayload,
} from "@/lib/admin/products";
import { AdminCategory, createCategoryFn } from "@/lib/admin/categories";
import {
  X,
  Loader2,
  Plus,
  Image as ImageIcon,
  Check,
  UploadCloud,
  Trash2,
  Layers,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

interface ProductFormModalProps {
  product?: AdminProduct | null | undefined;
  categories: AdminCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: any) => void;
}

interface VariantItem {
  id?: string | undefined;
  title: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  inventoryItemId?: string | undefined;
  stockQuantity: string;
  image?: string | undefined;
}

export default function ProductFormModal({
  product,
  categories: initialCategories,
  isOpen,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const isEdit = Boolean(product?.id);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);

  // Helper functions to safely extract product values
  const getInitialImages = (prod?: AdminProduct | null): string[] => {
    const list: string[] = [];
    if (prod?.imageUrl && typeof prod.imageUrl === "string" && prod.imageUrl.trim()) {
      list.push(prod.imageUrl.trim());
    }
    if (Array.isArray(prod?.images)) {
      prod.images.forEach((img) => {
        if (img && typeof img === "string" && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (Array.isArray(prod?.variants)) {
      prod.variants.forEach((v) => {
        if (v.image && typeof v.image === "string" && v.image.trim() && !list.includes(v.image.trim())) {
          list.push(v.image.trim());
        }
      });
    }
    return list;
  };

  const getInitialHasVariants = (prod?: AdminProduct | null): boolean => {
    if (!prod?.variants || prod.variants.length === 0) return false;
    if (prod.variants.length > 1) return true;
    const firstTitle = prod.variants[0]?.title;
    return Boolean(firstTitle && firstTitle !== "Default Title");
  };

  const getInitialOptionName = (prod?: AdminProduct | null): string => {
    const firstOpt = prod?.options?.[0];
    if (firstOpt?.name && firstOpt.name !== "Title") {
      return firstOpt.name;
    }
    return "Option";
  };

  const getInitialVariants = (prod?: AdminProduct | null): VariantItem[] => {
    if (prod?.variants && prod.variants.length > 0) {
      if (prod.variants.length === 1 && prod.variants[0]?.title === "Default Title") {
        const firstVar = prod.variants[0];
        return [
          {
            id: firstVar.id,
            title: "Standard",
            price: prod.price !== undefined ? prod.price.toString() : firstVar.price?.toString() || "499",
            compareAtPrice:
              prod.compareAtPrice !== undefined && prod.compareAtPrice !== null
                ? prod.compareAtPrice.toString()
                : firstVar.compareAtPrice?.toString() || "",
            sku: prod.sku || firstVar.sku || "",
            inventoryItemId: firstVar.inventoryItemId,
            stockQuantity:
              prod.stockQuantity !== undefined
                ? prod.stockQuantity.toString()
                : firstVar.stockQuantity?.toString() || "10",
            image: prod.imageUrl || firstVar.image || "",
          },
        ];
      }
      return prod.variants.map((v) => ({
        id: v.id,
        title: v.title || "Option",
        price: v.price !== undefined ? v.price.toString() : "",
        compareAtPrice:
          v.compareAtPrice !== undefined && v.compareAtPrice !== null
            ? v.compareAtPrice.toString()
            : "",
        sku: v.sku || "",
        inventoryItemId: v.inventoryItemId,
        stockQuantity: v.stockQuantity !== undefined ? v.stockQuantity.toString() : "0",
        image: v.image || "",
      }));
    }
    return [
      {
        title: "1 kg",
        price: prod?.price?.toString() || "499",
        compareAtPrice: prod?.compareAtPrice?.toString() || "",
        sku: prod?.sku ? `${prod.sku}-1KG` : "SKU-1KG",
        stockQuantity: "15",
        image: "",
      },
      {
        title: "3 kg",
        price: "1299",
        compareAtPrice: "1499",
        sku: prod?.sku ? `${prod.sku}-3KG` : "SKU-3KG",
        stockQuantity: "10",
        image: "",
      },
    ];
  };

  // Form states initialized with product values
  const [title, setTitle] = useState(product?.title || "");
  const [price, setPrice] = useState(
    product?.price !== undefined && product.price !== null
      ? product.price.toString()
      : product?.variants?.[0]?.price !== undefined && product.variants[0].price !== null
      ? product.variants[0].price.toString()
      : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice !== undefined && product.compareAtPrice !== null
      ? product.compareAtPrice.toString()
      : product?.variants?.[0]?.compareAtPrice !== undefined && product.variants[0].compareAtPrice !== null
      ? product.variants[0].compareAtPrice.toString()
      : ""
  );
  const [category, setCategory] = useState(
    product?.category || initialCategories[0]?.title || "General"
  );
  const [sku, setSku] = useState(product?.sku || product?.variants?.[0]?.sku || "");
  const [stockQuantity, setStockQuantity] = useState(
    product?.stockQuantity !== undefined && product.stockQuantity !== null
      ? product.stockQuantity.toString()
      : product?.variants?.[0]?.stockQuantity !== undefined && product.variants[0].stockQuantity !== null
      ? product.variants[0].stockQuantity.toString()
      : "10"
  );
  const [hidden, setHidden] = useState<boolean>(Boolean(product?.hidden));
  const [description, setDescription] = useState(product?.description || "");

  // Multiple Images state
  const [images, setImages] = useState<string[]>(() => getInitialImages(product));
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Image Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);
  const [galleryPickerVariantIdx, setGalleryPickerVariantIdx] = useState<number | null>(null);

  // Variants state
  const [hasVariants, setHasVariants] = useState<boolean>(() => getInitialHasVariants(product));
  const [optionName, setOptionName] = useState<string>(() => getInitialOptionName(product));
  const [variants, setVariants] = useState<VariantItem[]>(() => getInitialVariants(product));

  // Sync state whenever product, isOpen, or categories change
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setTitle(product.title || "");
      setPrice(
        product.price !== undefined && product.price !== null
          ? product.price.toString()
          : product.variants?.[0]?.price !== undefined && product.variants[0].price !== null
          ? product.variants[0].price.toString()
          : ""
      );
      setCompareAtPrice(
        product.compareAtPrice !== undefined && product.compareAtPrice !== null
          ? product.compareAtPrice.toString()
          : product.variants?.[0]?.compareAtPrice !== undefined && product.variants[0].compareAtPrice !== null
          ? product.variants[0].compareAtPrice.toString()
          : ""
      );
      setCategory(product.category || initialCategories[0]?.title || "General");
      setSku(product.sku || product.variants?.[0]?.sku || "");
      setStockQuantity(
        product.stockQuantity !== undefined && product.stockQuantity !== null
          ? product.stockQuantity.toString()
          : product.variants?.[0]?.stockQuantity !== undefined && product.variants[0].stockQuantity !== null
          ? product.variants[0].stockQuantity.toString()
          : "10"
      );
      setHidden(Boolean(product.hidden));
      setDescription(product.description || "");
      setImages(getInitialImages(product));
      setHasVariants(getInitialHasVariants(product));
      setOptionName(getInitialOptionName(product));
      setVariants(getInitialVariants(product));
    } else {
      setTitle("");
      setPrice("");
      setCompareAtPrice("");
      setCategory(initialCategories[0]?.title || "General");
      setSku("");
      setStockQuantity("10");
      setHidden(false);
      setDescription("");
      setImages([]);
      setHasVariants(false);
      setOptionName("Option");
      setVariants([
        {
          title: "1 kg",
          price: "499",
          compareAtPrice: "",
          sku: "SKU-1KG",
          stockQuantity: "15",
          image: "",
        },
        {
          title: "3 kg",
          price: "1299",
          compareAtPrice: "1499",
          sku: "SKU-3KG",
          stockQuantity: "10",
          image: "",
        },
      ]);
    }

    setError(null);
    setUrlInput("");
    setShowUrlInput(false);
    setIsUploadingImage(false);
    setImageUploadSuccess(false);
    setUploadingVariantIdx(null);
    setGalleryPickerVariantIdx(null);
  }, [isOpen, product, initialCategories]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  // New Category inline creation
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle multiple files upload for product gallery
  const handleMultipleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadSuccess(false);
    setError(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await uploadProductImageFn({
          data: {
            filename: file.name,
            base64Data,
            contentType: file.type,
          },
        });

        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        }
      } catch (err) {
        console.error("Failed to upload image file:", file?.name, err);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      setImageUploadSuccess(true);
      setTimeout(() => setImageUploadSuccess(false), 3000);
    } else {
      setError("Could not upload selected images. Please ensure they are valid image files under 10MB each.");
    }

    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setError("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed]);
    }
    setUrlInput("");
    setError(null);
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle local file selection for specific variant
  const handleVariantFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (.png, .jpg, .webp)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Variant image size exceeds 10MB limit.");
      return;
    }

    setUploadingVariantIdx(index);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await uploadProductImageFn({
            data: {
              filename: `var-${file.name}`,
              base64Data,
              contentType: file.type,
            },
          });

          if (res.success && res.url) {
            handleVariantChange(index, "image", res.url);
          } else {
            setError(res.error || "Failed to upload variant image");
          }
        } catch (err: any) {
          setError(err.message || "Failed to upload variant image");
        } finally {
          setUploadingVariantIdx(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Error reading file");
      setUploadingVariantIdx(null);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setIsCreatingCat(true);
    try {
      const res = await createCategoryFn({ data: { title: newCatName.trim() } });
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category]);
        setCategory(res.category.title);
        setIsAddingNewCat(false);
        setNewCatName("");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCreatingCat(false);
    }
  };

  // Variant helper functions
  const handleAddVariant = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        title: `Option ${nextIdx}`,
        price: price || "499",
        compareAtPrice: compareAtPrice || "",
        sku: sku ? `${sku}-${nextIdx}` : `SKU-${nextIdx}`,
        stockQuantity: "10",
        image: "",
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setError("At least one variant is required when variants are enabled");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantItem,
    value: string
  ) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = copy[index];
      if (target) {
        copy[index] = { ...target, [field]: value };
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Product title is required");
      return;
    }

    if (!hasVariants && !price) {
      setError("Price is required for standard product");
      return;
    }

    if (hasVariants && variants.length === 0) {
      setError("Please add at least one variant option");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formattedVariants: SaveProductVariantPayload[] = hasVariants
        ? variants.map((v) => ({
            id: v.id,
            title: v.title.trim() || "Option",
            price: parseFloat(v.price) || 0,
            compareAtPrice: v.compareAtPrice
              ? parseFloat(v.compareAtPrice)
              : undefined,
            sku: v.sku.trim() || undefined,
            inventoryItemId: v.inventoryItemId,
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
            image: v.image?.trim() || undefined,
          }))
        : [];

      const primaryImg =
        images[0] ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80";

      const payload = {
        id: product?.id,
        title: title.trim(),
        price: hasVariants
          ? Math.min(...formattedVariants.map((v) => v.price))
          : parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        category,
        categoryHandle: category.toLowerCase().replace(/\s+/g, "-"),
        sku: sku.trim() || undefined,
        stockQuantity: hasVariants
          ? formattedVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
          : parseInt(stockQuantity, 10) || 0,
        imageUrl: primaryImg,
        images: images.length > 0 ? images : [primaryImg],
        description: description.trim() || undefined,
        hasVariants,
        optionName: hasVariants ? (optionName.trim() || "Option") : undefined,
        variants: hasVariants ? formattedVariants : undefined,
      };

      const res = await saveProductFn({ data: payload });
      if (res?.success) {
        if (product?.id && Boolean(product.hidden) !== hidden) {
          try {
            await toggleProductVisibilityFn({
              data: {
                productId: product.id,
                handle: product.handle,
                hidden,
              },
            });
          } catch (e) {
            console.warn("Failed to persist visibility:", e);
          }
        }
        onSaved({ ...(res as any).product, hidden });
        onClose();
      } else {
        setError((res as any)?.error || "Failed to save product to Shopify. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product to Shopify");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? "Update product details, variants, images, and live inventory"
                : "Create a new product with local image upload and variant options"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Product Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Canin Maxi Adult Dog Food"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Selector + Add New Category */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Product Category
              </label>
              {!isAddingNewCat && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <Plus className="h-3 w-3" /> Add New Category
                </button>
              )}
            </div>

            {isAddingNewCat ? (
              <div className="flex gap-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Grain Free Treats)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  disabled={isCreatingCat || !newCatName.trim()}
                  onClick={handleCreateCategory}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isCreatingCat ? "Adding..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(false)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Multiple Product Images Gallery Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product Gallery & Images <span className="text-orange-600 font-bold">({images.length} added)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload multiple photos from your device or add via URL. The first photo is your primary cover image.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer self-start sm:self-auto"
              >
                <LinkIcon className="h-3 w-3" />
                {showUrlInput ? "Hide URL Input" : "+ Add by Web URL"}
              </button>
            </div>

            {/* Optional URL input row */}
            {showUrlInput && (
              <div className="flex gap-2 animate-in fade-in">
                <input
                  type="url"
                  placeholder="Paste image URL (e.g. https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Add Image
                </button>
              </div>
            )}

            {/* Hidden Multiple File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              onChange={handleMultipleFilesChange}
              className="hidden"
            />

            {/* Grid of all uploaded images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`group relative rounded-xl border-2 overflow-hidden bg-white shadow-xs aspect-square flex items-center justify-center transition-all ${
                      idx === 0
                        ? "border-orange-500 ring-2 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product Photo ${idx + 1}`}
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                      }}
                    />

                    {/* Primary Badge */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-white" /> Cover
                      </span>
                    )}

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="rounded-lg bg-white/95 p-1.5 text-slate-700 hover:bg-white hover:text-orange-600 shadow-sm transition-colors cursor-pointer"
                          title="Set as Cover Photo"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="rounded-lg bg-white/95 p-1.5 text-slate-700 hover:bg-white hover:text-red-600 shadow-sm transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Trigger Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 hover:bg-orange-50/70 p-5 text-center transition-all group"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 group-hover:scale-105 transition-transform">
                {isUploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">
                {isUploadingImage
                  ? "Uploading images to server..."
                  : images.length > 0
                  ? "+ Click to upload more images (Multiple files allowed)"
                  : "Click to upload product images from computer (Multiple files allowed)"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select one or multiple files • PNG, JPG, JPEG, WEBP up to 10MB each
              </p>
            </div>

            {imageUploadSuccess && (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Images uploaded successfully!
              </p>
            )}
          </div>

          {/* Variants Toggle */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Product Variants
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enable this if the product comes in different sizes, weights, or flavors.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* If NO Variants: Single Price & Stock */}
            {!hasVariants ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required={!hasVariants}
                    placeholder="499.00"
                    value={price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    MRP / Compare (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="799.00"
                    value={compareAtPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required={!hasVariants}
                    placeholder="10"
                    value={stockQuantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const formatted = raw.length > 1 ? raw.replace(/^0+/, "") || "0" : raw;
                      setStockQuantity(formatted);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    SKU (Barcode / Item Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DOG-FOOD-4KG"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ) : (
              /* If HAS Variants: Interactive Variant Table */
              <div className="pt-2 space-y-3">
                {/* Option Name / Attribute Selector */}
                <div className="rounded-xl border border-orange-200/70 bg-orange-50/40 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        Variant Option Type
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Choose or enter what differentiates these variants (e.g. Option, Color, Size, Weight, Flavor)
                      </p>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["Option", "Color", "Size", "Weight", "Flavor"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setOptionName(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            optionName.trim().toLowerCase() === preset.toLowerCase()
                              ? "bg-orange-600 text-white shadow-xs font-bold ring-2 ring-orange-500/20"
                              : "bg-white text-slate-700 hover:bg-orange-100/60 border border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {preset === "Option" ? "Option (General)" : preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 shrink-0">Option Name:</span>
                    <input
                      type="text"
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      placeholder="e.g. Option, Color, Size, Weight, Flavor"
                      className="w-full sm:w-64 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 shadow-2xs"
                    />
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      (Saved to Shopify as &quot;{optionName.trim() || "Option"}&quot;)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white no-scrollbar sm:overflow-visible">
                  <table className="w-full text-left text-xs min-w-[540px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-2.5 py-2.5 w-16 text-center">Image</th>
                        <th className="px-3 py-2.5 min-w-[140px] text-slate-700 font-bold">
                          {optionName.trim() || "Option"} Value
                        </th>
                        <th className="px-3 py-2.5">Price (₹)</th>
                        <th className="px-3 py-2.5">MRP (₹)</th>
                        <th className="px-3 py-2.5">SKU</th>
                        <th className="px-3 py-2.5">Stock</th>
                        <th className="px-3 py-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variants.map((v, idx) => (
                        <tr key={v.id || idx} className="hover:bg-slate-50/50">
                          {/* Variant Image (Upload from local or URL) */}
                          <td className="p-2 w-16 text-center">
                            <div className="flex items-center justify-center">
                              {v.image ? (
                                <div className="relative group h-9 w-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                                  <img
                                    src={v.image}
                                    alt={v.title || "Variant"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <label
                                      htmlFor={`var-img-${idx}`}
                                      className="cursor-pointer text-white hover:text-orange-300 p-0.5"
                                      title="Change local image"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </label>
                                    {images.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setGalleryPickerVariantIdx(idx)}
                                        className="text-white hover:text-orange-300 p-0.5 cursor-pointer"
                                        title="Pick from gallery photos"
                                      >
                                        <ImageIcon className="h-3 w-3" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleVariantChange(idx, "image", "")}
                                      className="text-white hover:text-red-300 p-0.5 cursor-pointer"
                                      title="Remove image"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-0.5">
                                  <label
                                    htmlFor={`var-img-${idx}`}
                                    className="flex items-center justify-center h-9 w-9 rounded-lg border border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/50 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer shrink-0"
                                    title="Upload image from computer"
                                  >
                                    {uploadingVariantIdx === idx ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                                    ) : (
                                      <UploadCloud className="h-3.5 w-3.5" />
                                    )}
                                  </label>
                                  {images.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setGalleryPickerVariantIdx(idx)}
                                      className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors cursor-pointer"
                                      title="Pick from product gallery photos"
                                    >
                                      <ImageIcon className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = window.prompt("Enter image URL for this variant:", v.image || "");
                                      if (url !== null) {
                                        handleVariantChange(idx, "image", url.trim());
                                      }
                                    }}
                                    className="p-0.5 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Or paste image URL"
                                  >
                                    <LinkIcon className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              )}
                              <input
                                id={`var-img-${idx}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleVariantFileChange(idx, e)}
                              />
                            </div>
                          </td>

                          {/* Title / Value */}
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder={
                                optionName.toLowerCase().includes("color")
                                  ? "e.g. Red, Blue, Black"
                                  : optionName.toLowerCase().includes("weight")
                                  ? "e.g. 1 kg, 3 kg, 500g"
                                  : optionName.toLowerCase().includes("size")
                                  ? "e.g. Small, Medium, Large"
                                  : optionName.toLowerCase().includes("flavor")
                                  ? "e.g. Chicken, Beef, Salmon"
                                  : "e.g. Red, 1 kg, Large"
                              }
                              value={v.title}
                              onChange={(e) =>
                                handleVariantChange(idx, "title", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                            />
                          </td>

                          {/* Price */}
                          <td className="p-2 w-28">
                            <input
                              type="number"
                              step="0.01"
                              required
                              placeholder="499"
                              value={v.price}
                              onChange={(e) =>
                                handleVariantChange(idx, "price", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                            />
                          </td>

                          {/* Compare Price */}
                          <td className="p-2 w-24">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="599"
                              value={v.compareAtPrice}
                              onChange={(e) =>
                                handleVariantChange(
                                  idx,
                                  "compareAtPrice",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-600 focus:bg-white focus:outline-none focus:border-orange-500"
                            />
                          </td>

                          {/* SKU */}
                          <td className="p-2 w-32">
                            <input
                              type="text"
                              placeholder="SKU-1"
                              value={v.sku}
                              onChange={(e) =>
                                handleVariantChange(idx, "sku", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-600 focus:bg-white focus:outline-none focus:border-orange-500"
                            />
                          </td>

                          {/* Stock */}
                          <td className="p-2 w-20">
                            <input
                              type="number"
                              min="0"
                              required
                              placeholder="10"
                              value={v.stockQuantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const formatted = raw.length > 1 ? raw.replace(/^0+/, "") || "0" : raw;
                                handleVariantChange(idx, "stockQuantity", formatted);
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                            />
                          </td>

                          {/* Delete */}
                          <td className="p-2 text-center w-12">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              disabled={variants.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors cursor-pointer"
                              title="Delete variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Another Variant
                  </button>

                  <div className="text-[11px] text-slate-500 font-medium">
                    {variants.length} {variants.length === 1 ? "Option" : "Options"} • Total Stock:{" "}
                    <span className="font-bold text-slate-800">
                      {variants.reduce(
                        (sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0),
                        0
                      )}{" "}
                      units
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the product, ingredients, size, and key benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Storefront Visibility */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-xs font-bold text-slate-800">Storefront Visibility</p>
              <p className="text-[11px] text-slate-500">
                {hidden
                  ? "Product is hidden and will not appear to customers on the storefront."
                  : "Product is visible to customers across the storefront."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                hidden
                  ? "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              {hidden ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-purple-600" />
                  Hidden
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  Visible
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isUploadingImage}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {isEdit ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Variant Gallery Photo Selector Modal */}
        {galleryPickerVariantIdx !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Select Photo for Variant: &quot;{variants[galleryPickerVariantIdx]?.title || "Option"}&quot;
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click any product photo to assign it to this variant
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryPickerVariantIdx(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 py-4 max-h-[50vh] overflow-y-auto">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => {
                      handleVariantChange(galleryPickerVariantIdx, "image", img);
                      setGalleryPickerVariantIdx(null);
                    }}
                    className={`group relative aspect-square rounded-xl border-2 overflow-hidden bg-slate-50 p-1 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/20 transition-all cursor-pointer ${
                      variants[galleryPickerVariantIdx]?.image === img
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product photo ${i + 1}`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                      }}
                    />
                    {variants[galleryPickerVariantIdx]?.image === img && (
                      <span className="absolute top-1 right-1 rounded-full bg-orange-600 p-0.5 text-white shadow-xs">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGalleryPickerVariantIdx(null)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
