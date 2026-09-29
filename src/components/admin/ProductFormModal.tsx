import { useState, useRef, useEffect, useMemo } from "react";
import {
  AdminProduct,
  saveProductFn,
  deleteProductFn,
  uploadProductImageFn,
  createStagedUploadTargetFn,
  toggleProductVisibilityFn,
  getAdminProductByIdFn,
  SaveProductVariantPayload,
  textToDescriptionHtml,
  htmlToStructuredText,
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
  AlertCircle,
} from "lucide-react";

interface ProductFormModalProps {
  product?: AdminProduct | null | undefined;
  categories: AdminCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: any) => void;
  onDeleted?: (deletedId: string) => void;
}

interface OptionItem {
  id?: string | undefined;
  name: string;
}

interface VariantItem {
  id?: string | undefined;
  groupId?: string | undefined;
  title: string;
  optionValues: Record<string, string>;
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
  onDeleted,
}: ProductFormModalProps) {
  const isEdit = Boolean(product?.id);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);

  // Helper functions to safely extract product values
  const getInitialImages = (prod?: AdminProduct | null): string[] => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addImg = (url?: string | null) => {
      if (!url || typeof url !== "string" || !url.trim()) return;
      const trimmed = url.trim();
      const cleanKey = trimmed
        .split("?")[0]
        ?.split("/")
        .pop()
        ?.toLowerCase()
        ?.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, "")
        ?.replace(/^\d+[-_]/, "") || trimmed;

      if (seen.has(cleanKey)) return;
      seen.add(cleanKey);
      list.push(trimmed);
    };

    if (prod?.imageUrl) addImg(prod.imageUrl);
    if (Array.isArray(prod?.images)) {
      prod.images.forEach(addImg);
    }
    if (Array.isArray(prod?.variants)) {
      prod.variants.forEach((v) => addImg(v.image));
    }
    return list;
  };

  const getInitialHasVariants = (prod?: AdminProduct | null): boolean => {
    if (!prod?.variants || prod.variants.length === 0) return false;
    if (prod.variants.length > 1) return true;
    const firstTitle = prod.variants[0]?.title;
    return Boolean(firstTitle && firstTitle !== "Default Title");
  };

  const getInitialOptionList = (prod?: AdminProduct | null): OptionItem[] => {
    if (prod?.options && prod.options.length > 0) {
      const valid = prod.options
        .filter((o) => o.name && o.name !== "Title")
        .map((o) => ({ id: o.id, name: o.name }));
      if (valid.length > 0) return valid;
    }
    return [{ name: "Color" }];
  };

  const getInitialVariants = (
    prod?: AdminProduct | null,
    initialOpts?: OptionItem[]
  ): VariantItem[] => {
    const opts = initialOpts || getInitialOptionList(prod);
    if (prod?.variants && prod.variants.length > 0) {
      if (prod.variants.length === 1 && prod.variants[0]?.title === "Default Title") {
        const firstVar = prod.variants[0];
        const initialVals: Record<string, string> = {};
        opts.forEach((o, i) => {
          initialVals[o.name] = i === 0 ? "Standard" : "Default";
        });
        return [
          {
            id: firstVar.id,
            groupId: "group-1",
            title: "Standard",
            optionValues: initialVals,
            price:
              prod.price !== undefined
                ? prod.price.toString()
                : firstVar.price?.toString() || "499",
            compareAtPrice:
              prod.compareAtPrice !== undefined && prod.compareAtPrice !== null
                ? prod.compareAtPrice.toString()
                : firstVar.compareAtPrice?.toString() || "",
            sku: prod.sku || firstVar.sku || "",
            inventoryItemId: firstVar.inventoryItemId,
            stockQuantity:
              prod.stockQuantity !== undefined
                ? prod.stockQuantity.toString()
                : firstVar.stockQuantity?.toString() || "0",
            image: prod.imageUrl || firstVar.image || "",
          },
        ];
      }

      const groupMap = new Map<string, string>();
      let groupCounter = 1;

      return prod.variants.map((v, vIdx) => {
        const optionValues: Record<string, string> = {};

        if (Array.isArray(v.selectedOptions) && v.selectedOptions.length > 0) {
          v.selectedOptions.forEach((so) => {
            if (so.name && so.name !== "Title") {
              optionValues[so.name] = so.value;
            }
          });
        }

        if (v.title && v.title.includes(" / ")) {
          const parts = v.title.split(" / ");
          opts.forEach((o, i) => {
            if (!optionValues[o.name] && parts[i]) {
              optionValues[o.name] = parts[i].trim();
            }
          });
        } else if (opts[0] && !optionValues[opts[0].name]) {
          optionValues[opts[0].name] = v.title || "Option";
        }

        opts.forEach((o, oIdx) => {
          if (!optionValues[o.name]) {
            optionValues[o.name] =
              oIdx === 0
                ? (v.title?.split(" / ")[0]?.trim() || `Option ${vIdx + 1}`)
                : (v.title?.split(" / ")[oIdx]?.trim() || (vIdx === 0 ? "Standard" : `Option ${vIdx + 1}`));
          }
        });

        const optName0 = opts[0]?.name || "Option";
        const primaryKey = (optionValues[optName0] || v.title?.split(" / ")[0] || `Group ${vIdx + 1}`).trim().toLowerCase();
        if (!groupMap.has(primaryKey)) {
          groupMap.set(primaryKey, `group-${groupCounter++}`);
        }
        const groupId = groupMap.get(primaryKey)!;

        return {
          id: v.id,
          groupId,
          title: v.title || "Option",
          optionValues,
          price: v.price !== undefined ? v.price.toString() : "",
          compareAtPrice:
            v.compareAtPrice !== undefined && v.compareAtPrice !== null
              ? v.compareAtPrice.toString()
              : "",
          sku: v.sku || "",
          inventoryItemId: v.inventoryItemId,
          stockQuantity: v.stockQuantity !== undefined ? v.stockQuantity.toString() : "0",
          image: v.image || "",
        };
      });
    }

    const defaultVals1: Record<string, string> = {};
    const defaultVals2: Record<string, string> = {};
    opts.forEach((o, i) => {
      if (o.name.toLowerCase().includes("color")) {
        defaultVals1[o.name] = "Red";
        defaultVals2[o.name] = "Blue";
      } else if (o.name.toLowerCase().includes("size")) {
        defaultVals1[o.name] = "Small";
        defaultVals2[o.name] = "Medium";
      } else {
        defaultVals1[o.name] = i === 0 ? "Option 1" : "Small";
        defaultVals2[o.name] = i === 0 ? "Option 2" : "Large";
      }
    });

    return [
      {
        groupId: "group-1",
        title: opts.map((o) => defaultVals1[o.name]).filter(Boolean).join(" / "),
        optionValues: defaultVals1,
        price: prod?.price?.toString() || "499",
        compareAtPrice: prod?.compareAtPrice?.toString() || "",
        sku: prod?.sku ? `${prod.sku}-1` : "SKU-1",
        stockQuantity: "15",
        image: "",
      },
      {
        groupId: "group-2",
        title: opts.map((o) => defaultVals2[o.name]).filter(Boolean).join(" / "),
        optionValues: defaultVals2,
        price: "1299",
        compareAtPrice: "1499",
        sku: prod?.sku ? `${prod.sku}-2` : "SKU-2",
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
      : "0"
  );
  const [hidden, setHidden] = useState<boolean>(Boolean(product?.hidden));
  const [description, setDescription] = useState(product?.description || "");
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

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
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);

  // Variants state
  const [hasVariants, setHasVariants] = useState<boolean>(() => getInitialHasVariants(product));
  const [optionList, setOptionList] = useState<OptionItem[]>(() => getInitialOptionList(product));
  const [variants, setVariants] = useState<VariantItem[]>(() =>
    getInitialVariants(product, getInitialOptionList(product))
  );
  const [variantViewMode, setVariantViewMode] = useState<"categorized" | "table">("categorized");
  const [categorizeByIdx, setCategorizeByIdx] = useState<number>(0);

  const populateFormFromProduct = (prod: AdminProduct) => {
    setTitle(prod.title || "");
    setPrice(
      prod.price !== undefined && prod.price !== null
        ? prod.price.toString()
        : prod.variants?.[0]?.price !== undefined && prod.variants[0].price !== null
        ? prod.variants[0].price.toString()
        : ""
    );
    setCompareAtPrice(
      prod.compareAtPrice !== undefined && prod.compareAtPrice !== null
        ? prod.compareAtPrice.toString()
        : prod.variants?.[0]?.compareAtPrice !== undefined && prod.variants[0].compareAtPrice !== null
        ? prod.variants[0].compareAtPrice.toString()
        : ""
    );
    setCategory(prod.category || initialCategories[0]?.title || "General");
    setSku(prod.sku || prod.variants?.[0]?.sku || "");
    setStockQuantity(
      prod.stockQuantity !== undefined && prod.stockQuantity !== null
        ? prod.stockQuantity.toString()
        : prod.variants?.[0]?.stockQuantity !== undefined && prod.variants[0].stockQuantity !== null
        ? prod.variants[0].stockQuantity.toString()
        : "0"
    );
    setHidden(Boolean(prod.hidden));
    setDescription(prod.description || "");
    setImages(getInitialImages(prod));
    const initialOpts = getInitialOptionList(prod);
    setOptionList(initialOpts);
    setHasVariants(getInitialHasVariants(prod));
    setVariants(getInitialVariants(prod, initialOpts));
  };

  const handleRefreshLive = async () => {
    if (!product?.id) return;
    setIsRefreshingLive(true);
    try {
      const fresh = await getAdminProductByIdFn({
        data: { id: product.id, handle: product.handle },
      });
      if (fresh) {
        populateFormFromProduct(fresh);
        onSaved(fresh);
      }
    } catch (err) {
      console.warn("Live refresh failed:", err);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Sync state whenever product, isOpen, or categories change
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      populateFormFromProduct(product);
    } else {
      setTitle("");
      setPrice("");
      setCompareAtPrice("");
      setCategory(initialCategories[0]?.title || "General");
      setSku("");
      setStockQuantity("0");
      setHidden(false);
      setDescription("");
      setImages([]);
      setHasVariants(false);
      setOptionList([{ id: "opt-1", name: "Option" }]);
      setVariants([
        {
          groupId: "group-1",
          title: "1 kg",
          price: "499",
          compareAtPrice: "",
          sku: "SKU-1KG",
          stockQuantity: "15",
          image: "",
          optionValues: { Option: "1 kg" },
        },
        {
          groupId: "group-2",
          title: "3 kg",
          price: "1299",
          compareAtPrice: "1499",
          sku: "SKU-3KG",
          stockQuantity: "10",
          image: "",
          optionValues: { Option: "3 kg" },
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

  // Submitting & Deleting
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteProduct = async () => {
    if (!product?.id) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteProductFn({ data: { id: product.id } });
      if (!res.success) {
        throw new Error(res.error || "Failed to delete product from Shopify");
      }
      onDeleted?.(product.id);
      onClose();
    } catch (err: any) {
      console.error("[handleDeleteProduct] Error:", err);
      setError(err?.message || "Failed to delete product");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Uploads a local file either directly to Shopify Staged Cloud Storage or via server fallback
  const uploadLocalImage = async (file: File): Promise<string> => {
    // 1. Direct Shopify Staged Upload (fastest, supports large files, no server body size limits)
    try {
      const stageRes = await createStagedUploadTargetFn({
        data: {
          filename: file.name,
          mimeType: file.type || "image/png",
        },
      });

      if (stageRes?.success && stageRes.target) {
        const { url, parameters, resourceUrl } = stageRes.target;
        const formData = new FormData();
        for (const p of parameters) {
          formData.append(p.name, p.value);
        }
        formData.append("file", file);

        const uploadRes = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.status >= 200 && uploadRes.status < 300) {
          return resourceUrl;
        }
        console.warn("[uploadLocalImage] Direct staged upload HTTP status:", uploadRes.status);
      }
    } catch (directErr) {
      console.warn("[uploadLocalImage] Direct upload failed, trying server fallback:", directErr);
    }

    // 2. Fallback to server function uploadProductImageFn
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
        contentType: file.type || "image/png",
      },
    });

    if (res?.success && res.url) {
      return res.url;
    }

    throw new Error(res?.error || "Could not upload image file. Please check file format and size.");
  };

  // Process batch of selected or dropped files
  const processSelectedFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadSuccess(false);
    setError(null);

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of filesArray) {
      if (!file) continue;
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Exceeds 10MB limit`);
        continue;
      }

      try {
        const url = await uploadLocalImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      } catch (err: any) {
        console.error("Failed to upload image file:", file.name, err);
        errors.push(`${file.name}: ${err.message || "Upload failed"}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => {
        const next = [...prev];
        for (const u of uploadedUrls) {
          if (!next.includes(u)) next.push(u);
        }
        return next;
      });
      setImageUploadSuccess(true);
      setTimeout(() => setImageUploadSuccess(false), 3500);
      if (errors.length > 0) {
        setError(`Uploaded ${uploadedUrls.length} photo(s). Some files had errors: ${errors.join(", ")}`);
      }
    } else {
      setError(
        errors.length > 0
          ? `Could not upload selected images: ${errors.join("; ")}`
          : "Could not upload selected images. Please ensure they are valid image files under 10MB each."
      );
    }

    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle multiple files upload for product gallery
  const handleMultipleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processSelectedFiles(e.target.files);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setError("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    const cleanKey = trimmed
      .split("?")[0]
      ?.split("/")
      .pop()
      ?.toLowerCase()
      ?.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, "")
      ?.replace(/^\d+[-_]/, "") || trimmed;

    const alreadyExists = images.some((img) => {
      const existingClean = img
        .split("?")[0]
        ?.split("/")
        .pop()
        ?.toLowerCase()
        ?.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, "")
        ?.replace(/^\d+[-_]/, "") || img;
      return existingClean === cleanKey;
    });

    if (!alreadyExists) {
      setImages((prev) => [...prev, trimmed]);
      setError(null);
    } else {
      setError("This image has already been added.");
    }
    setUrlInput("");
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

    // Reset input so choosing the same file again triggers onChange
    e.target.value = "";

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
      const url = await uploadLocalImage(file);
      if (url) {
        handleVariantChange(index, "image", url);
        // Also ensure it is present in the main product image gallery so it attaches to product media on Shopify
        setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
      }
    } catch (err: any) {
      console.error("Failed to upload variant image:", file.name, err);
      setError(err.message || "Failed to upload variant image");
    } finally {
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

  // Helper to generate the next logical and unique sub-variant value (e.g. Size: Small, Medium, Large, XL...)
  const getNextSubVariantValue = (
    optName: string,
    existingVals: string[]
  ): string => {
    const existingLower = new Set(existingVals.map((s) => s.trim().toLowerCase()));
    const nameLower = optName.toLowerCase();
    const isSize = nameLower.includes("size");
    const isWeight =
      nameLower.includes("weight") ||
      nameLower.includes("pack") ||
      nameLower.includes("kg") ||
      nameLower.includes("gm");

    const sizeCandidates = ["Small", "Medium", "Large", "XL", "2XL", "3XL", "4XL"];
    const weightCandidates = ["250g", "500g", "1 kg", "2 kg", "5 kg"];
    const candidates = isSize ? sizeCandidates : isWeight ? weightCandidates : [];

    for (const c of candidates) {
      if (!existingLower.has(c.toLowerCase())) {
        return c;
      }
    }

    const cleanName = optName.trim() || "Option";
    let num = existingVals.length + 1;
    while (existingLower.has(`${cleanName} ${num}`.toLowerCase())) {
      num++;
    }
    return `${cleanName} ${num}`;
  };

  // Multi-option management helpers
  const handleAddOption = (suggestedName?: string) => {
    if (optionList.length >= 3) return;
    const existingNamesLower = optionList.map((o) => o.name.toLowerCase());
    const presets = ["Size", "Color", "Weight", "Flavor", "Material", "Style"];
    const name =
      suggestedName?.trim() ||
      presets.find((p) => !existingNamesLower.includes(p.toLowerCase())) ||
      `Option ${optionList.length + 1}`;

    const nextOptions = [...optionList, { name }];
    setOptionList(nextOptions);

    // Update variants so they don't have empty option values
    setVariants((prev) => {
      return prev.map((v, idx) => {
        const nextVals = { ...v.optionValues };
        if (!nextVals[name] || !nextVals[name].trim()) {
          const isSize = name.toLowerCase().includes("size");
          const defaultVal = isSize
            ? (idx === 0 ? "Medium" : idx === 1 ? "Large" : `Size ${idx + 1}`)
            : (idx === 0 ? "Standard" : `Option ${idx + 1}`);
          nextVals[name] = defaultVal;
        }
        return {
          ...v,
          optionValues: nextVals,
          title: nextOptions
            .map((o) => nextVals[o.name] || "")
            .filter(Boolean)
            .join(" / "),
        };
      });
    });
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (optionList.length <= 1) return;
    const removed = optionList[indexToRemove];
    const nextOptions = optionList.filter((_, idx) => idx !== indexToRemove);
    setOptionList(nextOptions);

    setVariants((prev) =>
      prev.map((v) => {
        const nextVals = { ...v.optionValues };
        if (removed) {
          delete nextVals[removed.name];
        }
        return {
          ...v,
          optionValues: nextVals,
          title: nextOptions
            .map((o) => nextVals[o.name] || "")
            .filter(Boolean)
            .join(" / "),
        };
      })
    );
  };

  const handleRenameOption = (idx: number, newName: string) => {
    const oldOpt = optionList[idx];
    if (!oldOpt) return;
    const oldName = oldOpt.name;
    const nextOptions = optionList.map((o, i) => (i === idx ? { ...o, name: newName } : o));
    setOptionList(nextOptions);

    if (oldName !== newName) {
      setVariants((prev) =>
        prev.map((v) => {
          const nextVals = { ...v.optionValues };
          if (oldName in nextVals) {
            nextVals[newName] = nextVals[oldName] ?? "";
            delete nextVals[oldName];
          }
          return {
            ...v,
            optionValues: nextVals,
            title: nextOptions
              .map((o) => nextVals[o.name] || "")
              .filter(Boolean)
              .join(" / "),
          };
        })
      );
    }
  };

  // Variant helper functions (Flat table view)
  const handleAddVariant = () => {
    const nextIdx = variants.length + 1;
    const initialVals: Record<string, string> = {};
    optionList.forEach((o, oIdx) => {
      if (oIdx === 0) {
        initialVals[o.name] = primaryGroups[0]?.primaryValue || "Standard";
      } else {
        const existingInGroup = variants
          .filter((v) => (v.optionValues?.[primaryOptName] || "").trim() === (initialVals[primaryOptName] || "").trim())
          .map((v) => (v.optionValues?.[o.name] || "").trim())
          .filter(Boolean);
        initialVals[o.name] = getNextSubVariantValue(o.name, existingInGroup);
      }
    });

    const nextTitle = optionList.map((o) => initialVals[o.name] || "").filter(Boolean).join(" / ");
    const parentVar = variants.find(
      (v) => (v.optionValues?.[primaryOptName] || "").trim() === (initialVals[primaryOptName] || "").trim()
    ) || variants[0];
    const targetGroupId = parentVar?.groupId || `group-${nextIdx}`;

    setVariants((prev) => [
      ...prev,
      {
        groupId: targetGroupId,
        title: nextTitle,
        optionValues: initialVals,
        price: price || (variants[0]?.price ? variants[0].price : "499"),
        compareAtPrice:
          compareAtPrice || (variants[0]?.compareAtPrice ? variants[0].compareAtPrice : ""),
        sku: sku ? `${sku}-${nextIdx}` : `SKU-${nextIdx}`,
        stockQuantity: "10",
        image: variants[0]?.image || "",
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

  const handleVariantOptionValueChange = (
    varIdx: number,
    optName: string,
    val: string
  ) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = copy[varIdx];
      if (target) {
        const nextVals = {
          ...target.optionValues,
          [optName]: val,
        };
        const nextTitle = optionList
          .map((o) => (o.name === optName ? val : nextVals[o.name] || ""))
          .filter(Boolean)
          .join(" / ");
        copy[varIdx] = {
          ...target,
          optionValues: nextVals,
          title: nextTitle || val,
        };
      }
      return copy;
    });
  };

  // Check for duplicate variant combinations
  // NOTE: Incomplete variants with empty inputs are skipped from duplicate detection so typing is never interrupted.
  const duplicateCombination = useMemo(() => {
    if (!hasVariants) return null;
    const seen = new Set<string>();
    for (const v of variants) {
      // Check if ALL options have a non-empty value
      const hasAnyEmpty = optionList.some(
        (o) => !(v.optionValues?.[o.name] || "").trim()
      );
      if (hasAnyEmpty) {
        // Skip incomplete variants while editing
        continue;
      }
      const key = optionList
        .map((o) => (v.optionValues?.[o.name] || "").trim().toLowerCase())
        .join(" / ");
      if (seen.has(key)) {
        return optionList
          .map((o) => (v.optionValues?.[o.name] || "").trim())
          .join(" / ");
      }
      seen.add(key);
    }
    return null;
  }, [hasVariants, variants, optionList]);

  // Categorized view:
  // Primary option = used for grouping outer cards (Option 1 / active category, e.g. Color)
  // Secondary option = used for table rows (Option 2 / sub-variant, e.g. Size)
  const safeCatIdx = Math.min(Math.max(categorizeByIdx, 0), Math.max(optionList.length - 1, 0), 2);
  const primaryOptName = optionList[safeCatIdx]?.name || "Option";
  const remainingOpts = optionList.filter((_, i) => i !== safeCatIdx);
  const secondaryOptName = remainingOpts[0]?.name || "Variant";
  const tertiaryOptName = remainingOpts[1]?.name;

  const primaryGroups = useMemo(() => {
    const groups: Array<{
      groupId: string;
      primaryValue: string;
      image: string;
      items: Array<{ variant: VariantItem; originalIndex: number }>;
    }> = [];
    const groupMap = new Map<string, (typeof groups)[0]>();

    variants.forEach((v, idx) => {
      const gid =
        v.groupId ||
        (v.optionValues?.[primaryOptName]
          ? `grp-val-${v.optionValues[primaryOptName].trim()}`
          : `grp-idx-${idx}`);

      const rawVal = v.optionValues?.[primaryOptName];
      const val = typeof rawVal === "string" ? rawVal : "";

      if (!groupMap.has(gid)) {
        const newGrp = {
          groupId: gid,
          primaryValue: val,
          image: v.image || "",
          items: [],
        };
        groupMap.set(gid, newGrp);
        groups.push(newGrp);
      }
      const grp = groupMap.get(gid)!;
      if (val !== undefined && grp.primaryValue !== val) {
        grp.primaryValue = val;
      }
      if (!grp.image && v.image) {
        grp.image = v.image;
      }
      grp.items.push({ variant: v, originalIndex: idx });
    });

    return groups;
  }, [variants, primaryOptName]);

  const handleAddSubVariant = (groupId: string) => {
    const groupVariants = variants.filter((v) => (v.groupId || "") === groupId);
    const parentVar = groupVariants[0] || variants[0];
    const primaryValue = parentVar?.optionValues?.[primaryOptName] || "";

    // Get all existing secondary values in this primary group
    const existingSecondary = variants
      .filter((v) => (v.groupId || "") === groupId)
      .map((v) => (v.optionValues?.[secondaryOptName] || "").trim())
      .filter(Boolean);

    const nextSecondaryVal = getNextSubVariantValue(secondaryOptName, existingSecondary);

    const newOptionValues: Record<string, string> = {
      [primaryOptName]: primaryValue,
      [secondaryOptName]: nextSecondaryVal,
    };
    if (tertiaryOptName) {
      newOptionValues[tertiaryOptName] = "Standard";
    }

    const nextTitle = optionList
      .map((o) => newOptionValues[o.name] || "")
      .filter(Boolean)
      .join(" / ");

    const nextCount = existingSecondary.length + 1;
    const parentSku = parentVar?.sku || (sku ? `${sku}-${primaryValue.replace(/\s+/g, "")}` : "SKU");

    setVariants((prev) => [
      ...prev,
      {
        groupId,
        title: nextTitle,
        optionValues: newOptionValues,
        price: parentVar?.price || price || "499",
        compareAtPrice: parentVar?.compareAtPrice || compareAtPrice || "",
        sku: `${parentSku}-${nextCount}`,
        stockQuantity: "10",
        image: parentVar?.image || "",
      },
    ]);
  };

  const handleAddPrimaryGroup = () => {
    const existingPrimaryVals = primaryGroups.map((g) => g.primaryValue.trim().toLowerCase());
    const colorSequence = ["Black", "White", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Red", "Grey"];
    let nextVal = "";
    if (primaryOptName.toLowerCase().includes("color")) {
      for (const c of colorSequence) {
        if (!existingPrimaryVals.includes(c.toLowerCase())) {
          nextVal = c;
          break;
        }
      }
    }
    if (!nextVal) {
      let count = primaryGroups.length + 1;
      while (existingPrimaryVals.includes(`${primaryOptName} ${count}`.toLowerCase())) {
        count++;
      }
      nextVal = `${primaryOptName} ${count}`;
    }

    const firstGroupItems = primaryGroups[0]?.items || [];
    const secondaryDefault = firstGroupItems[0]?.variant.optionValues?.[secondaryOptName] || "Standard";

    const newOptionValues: Record<string, string> = {
      [primaryOptName]: nextVal,
      [secondaryOptName]: secondaryDefault,
    };
    if (tertiaryOptName) {
      newOptionValues[tertiaryOptName] = firstGroupItems[0]?.variant.optionValues?.[tertiaryOptName] || "Standard";
    }

    const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setVariants((prev) => [
      ...prev,
      {
        groupId: newGroupId,
        title: `${nextVal} / ${secondaryDefault}`,
        optionValues: newOptionValues,
        price: variants[0]?.price || price || "499",
        compareAtPrice: variants[0]?.compareAtPrice || compareAtPrice || "",
        sku: sku ? `${sku}-${primaryGroups.length + 1}` : `SKU-${primaryGroups.length + 1}`,
        stockQuantity: "10",
        image: "",
      },
    ]);
  };

  const handleRenamePrimaryGroup = (groupId: string, newVal: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if ((v.groupId || "") === groupId) {
          const nextVals = { ...v.optionValues, [primaryOptName]: newVal };
          return {
            ...v,
            optionValues: nextVals,
            title: optionList
              .map((o) => nextVals[o.name] || "")
              .filter(Boolean)
              .join(" / "),
          };
        }
        return v;
      })
    );
  };

  const handlePrimaryGroupImageChange = (groupId: string, newImg: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if ((v.groupId || "") === groupId) {
          return {
            ...v,
            image: newImg,
          };
        }
        return v;
      })
    );
    if (newImg && !images.includes(newImg)) {
      setImages((prev) => [...prev, newImg]);
    }
  };

  const handleDeletePrimaryGroup = (groupId: string) => {
    if (primaryGroups.length <= 1) {
      setError(`Cannot delete the last ${primaryOptName} group. A product must have at least one variant.`);
      return;
    }
    setVariants((prev) =>
      prev.filter((v) => (v.groupId || "") !== groupId)
    );
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

    if (hasVariants) {
      if (optionList.length === 0) {
        setError("Please define at least one variant option type");
        return;
      }
      const emptyOptName = optionList.some((o) => !o.name.trim());
      if (emptyOptName) {
        setError("Please enter a name for all variant option types (e.g. Color, Size)");
        return;
      }
      const optNameSet = new Set<string>();
      for (const o of optionList) {
        const lower = o.name.trim().toLowerCase();
        if (optNameSet.has(lower)) {
          setError(`Option name "${o.name.trim()}" is duplicated. Each option name must be unique.`);
          return;
        }
        optNameSet.add(lower);
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v) {
          for (const o of optionList) {
            if (!(v.optionValues?.[o.name] || "").trim()) {
              setError(`Variant #${i + 1} is missing a value for "${o.name}". Please fill in all option values.`);
              return;
            }
          }
        }
      }
      if (duplicateCombination) {
        setError(
          `Duplicate variant found: "${duplicateCombination}". In Shopify, each variant must have a unique combination of option values.`
        );
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const formattedVariants: SaveProductVariantPayload[] = hasVariants
        ? variants.map((v) => {
            const cleanOptionValues: Record<string, string> = {};
            optionList.forEach((o) => {
              const oName = o.name.trim();
              cleanOptionValues[oName] = (v.optionValues?.[o.name] || "").trim() || "Standard";
            });

            const cleanTitle = optionList
              .map((o) => cleanOptionValues[o.name.trim()])
              .filter(Boolean)
              .join(" / ");

            return {
              id: v.id,
              title: cleanTitle || v.title.trim() || "Option",
              price: parseFloat(v.price) || 0,
              compareAtPrice: v.compareAtPrice
                ? parseFloat(v.compareAtPrice)
                : undefined,
              sku: v.sku.trim() || undefined,
              inventoryItemId: v.inventoryItemId,
              stockQuantity: parseInt(v.stockQuantity, 10) || 0,
              image: v.image?.trim() || undefined,
              optionValues: cleanOptionValues,
              selectedOptions: optionList.map((o) => ({
                name: o.name.trim(),
                value: cleanOptionValues[o.name.trim()] || "Standard",
              })),
            };
          })
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
        optionName: hasVariants ? (optionList[0]?.name.trim() || "Option") : undefined,
        options: hasVariants
          ? optionList.map((o) => ({ id: o.id, name: o.name.trim() }))
          : undefined,
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
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                type="button"
                onClick={handleRefreshLive}
                disabled={isRefreshingLive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                title="Fetch latest live data & inventory from Shopify backend"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-500 ${isRefreshingLive ? "animate-spin" : ""}`} />
                <span>{isRefreshingLive ? "Syncing..." : "Sync Shopify"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                  type="text"
                  placeholder="Paste image URL (e.g. https://... or /uploads/...)"
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
              onClick={() => {
                if (!isUploadingImage) fileInputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  await processSelectedFiles(e.dataTransfer.files);
                }
              }}
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
                  ? "Uploading images to Shopify..."
                  : images.length > 0
                  ? "+ Click or drag to upload more images from computer"
                  : "Click or drag to upload product images from computer (Multiple files allowed)"}
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
              <div className="pt-2 space-y-4">
                {/* Variant Options Definition Section (Shopify allows 1 to 3 options) */}
                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 p-4 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Variant Option Types
                        </label>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
                          {optionList.length} of 3 Options Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Define attributes that differentiate your variants, such as Color and Size (Shopify allows up to 3 options).
                      </p>
                    </div>
                  </div>

                  {/* Active Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {optionList.map((opt, optIdx) => (
                      <div
                        key={opt.id || optIdx}
                        onClick={() => {
                          setCategorizeByIdx(optIdx);
                          if (variantViewMode !== "categorized") setVariantViewMode("categorized");
                        }}
                        className={`rounded-xl border-2 p-3 shadow-2xs space-y-2 transition-all cursor-pointer ${
                          safeCatIdx === optIdx && optionList.length > 1
                            ? "border-orange-400 bg-orange-50/50 ring-1 ring-orange-200"
                            : "border-slate-200/90 bg-white hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center justify-center h-4.5 w-4.5 rounded-md text-[10px] font-bold ${safeCatIdx === optIdx && optionList.length > 1 ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"}`}>
                              {optIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {optIdx === 0 ? "Option 1 (Primary Category)" : `Option ${optIdx + 1} (Sub-variant)`}
                            </span>
                          </div>

                          {optionList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Remove this option"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            value={opt.name}
                            onChange={(e) => handleRenameOption(optIdx, e.target.value)}
                            placeholder="e.g. Color, Size, Weight, Flavor"
                            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 shadow-2xs"
                          />
                        </div>
                        {optionList.length > 1 && (
                          <div
                            onClick={() => {
                              if (safeCatIdx !== optIdx) {
                                setCategorizeByIdx(optIdx);
                                const newPrimary = optionList[optIdx]?.name;
                                if (newPrimary) {
                                  setVariants((prev) => {
                                    const map = new Map<string, string>();
                                    let counter = 1;
                                    return prev.map((v) => {
                                      const pVal = (v.optionValues?.[newPrimary] || "").trim().toLowerCase();
                                      if (!map.has(pVal)) {
                                        map.set(pVal, `group-${counter++}`);
                                      }
                                      return { ...v, groupId: map.get(pVal)! };
                                    });
                                  });
                                }
                              }
                            }}
                            className={`text-[10px] font-semibold text-center py-1 rounded-md transition-all cursor-pointer ${safeCatIdx === optIdx ? "text-orange-600 bg-orange-100/60 font-bold" : "text-slate-400 hover:text-orange-500"}`}
                          >
                            {safeCatIdx === optIdx ? `✓ Grouped by ${opt.name}` : `Click to group by ${opt.name}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Sub Variant (Only shows Size, Weight, and Custom Option) */}
                  {optionList.length < 3 && (
                    <div className="pt-1 border-t border-orange-100/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Add Sub Variant:
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Add secondary option (Size, Weight, etc.)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {["Size", "Weight"]
                            .filter(
                              (preset) =>
                                !optionList.some(
                                  (o) => o.name.trim().toLowerCase() === preset.toLowerCase()
                                )
                            )
                            .map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleAddOption(preset)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-orange-300 bg-white text-xs font-semibold text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all cursor-pointer shadow-2xs"
                              >
                                <Plus className="h-3 w-3" />
                                Add {preset}
                              </button>
                            ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3 w-3" />
                            Custom Option
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Duplicate Variant Warning Alert */}
                {duplicateCombination && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-bold">Duplicate Variant Detected</p>
                      <p className="text-[11px] text-red-600 mt-0.5">
                        Multiple variants have the same combination: &quot;{duplicateCombination}&quot;.
                        In Shopify, each variant must have a unique combination of option values. Please modify one of the values.
                      </p>
                    </div>
                  </div>
                )}

                {/* View Mode Toggle Header (when multiple options exist) */}
                {optionList.length > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Variant Structure
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Grouped by {primaryOptName}, showing {secondaryOptName}
                      </span>
                    </div>

                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setVariantViewMode("categorized")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          variantViewMode === "categorized"
                            ? "bg-white font-bold text-orange-600 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Categorized View
                      </button>
                      <button
                        type="button"
                        onClick={() => setVariantViewMode("table")}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          variantViewMode === "table"
                            ? "bg-white font-bold text-orange-600 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Table View
                      </button>
                    </div>
                  </div>
                )}

                {/* CATEGORIZED VIEW: Grouped by Option 1 (e.g. Color with nested Sizes) */}
                {optionList.length > 1 && variantViewMode === "categorized" && (
                  <div className="space-y-4">
                    {primaryGroups.map((grp) => (
                      <div
                        key={grp.groupId}
                        className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:border-orange-200"
                      >
                        {/* Group Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-50 via-orange-50/20 to-white border-b border-slate-200/80">
                          <div className="flex items-center gap-3">
                            {/* Group Image Thumbnail */}
                            <div className="relative group/grpimg h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center">
                              {grp.image ? (
                                <img
                                  src={grp.image}
                                  alt={grp.primaryValue || "Category"}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-orange-50 text-orange-500">
                                  <UploadCloud className="h-5 w-5" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/grpimg:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <label
                                  htmlFor={`grp-img-upload-${grp.groupId}`}
                                  className="cursor-pointer text-white hover:text-orange-300 p-0.5"
                                  title="Upload category photo"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </label>
                                {images.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (grp.items[0]) {
                                        setGalleryPickerVariantIdx(grp.items[0].originalIndex);
                                      }
                                    }}
                                    className="text-white hover:text-orange-300 p-0.5 cursor-pointer"
                                    title="Pick from product gallery photos"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <input
                                id={`grp-img-upload-${grp.groupId}`}
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const dataUrl = await new Promise<string>((res, rej) => {
                                      const reader = new FileReader();
                                      reader.onload = () => res(reader.result as string);
                                      reader.onerror = rej;
                                      reader.readAsDataURL(file);
                                    });
                                    handlePrimaryGroupImageChange(grp.groupId, dataUrl);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                              />
                            </div>

                            {/* Category Name & Editable Input */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase tracking-wide">
                                  {primaryOptName}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {grp.items.length}{" "}
                                  {grp.items.length === 1 ? secondaryOptName : `${secondaryOptName}s`}{" "}
                                  • Total Stock:{" "}
                                  <strong className="text-slate-800 font-bold">
                                    {grp.items.reduce(
                                      (sum, it) =>
                                        sum + (parseInt(it.variant.stockQuantity, 10) || 0),
                                      0
                                    )}{" "}
                                    units
                                  </strong>
                                </span>
                              </div>
                              <input
                                type="text"
                                required
                                value={grp.primaryValue}
                                onChange={(e) =>
                                  handleRenamePrimaryGroup(grp.groupId, e.target.value)
                                }
                                placeholder={`e.g. ${primaryOptName} Value`}
                                className="text-sm font-bold text-slate-900 bg-white rounded-lg px-2.5 py-1 border border-slate-300 focus:bg-white focus:outline-none focus:border-orange-500 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Category Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleAddSubVariant(grp.groupId)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-2.5 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add {secondaryOptName}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePrimaryGroup(grp.groupId)}
                              disabled={primaryGroups.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors cursor-pointer"
                              title={`Delete entire ${grp.primaryValue || primaryOptName} category`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Sub-table: Sizes / Secondary Options under this Category */}
                        <div className="overflow-x-auto p-2">
                          <table className="w-full text-left text-xs min-w-[500px]">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                                <th className="p-2 w-36 text-slate-700 font-bold">
                                  {secondaryOptName}
                                </th>
                                {tertiaryOptName && (
                                  <th className="p-2 w-28 text-slate-700 font-bold">
                                    {tertiaryOptName}
                                  </th>
                                )}
                                <th className="p-2 w-24">Price (₹)</th>
                                <th className="p-2 w-24">MRP (₹)</th>
                                <th className="p-2 w-32">SKU</th>
                                <th className="p-2 w-20">Stock</th>
                                <th className="p-2 w-14 text-center">Photo</th>
                                <th className="p-2 w-10 text-center">Del</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {grp.items.map(({ variant: v, originalIndex: idx }) => (
                                <tr key={v.id || idx} className="hover:bg-slate-50/50">
                                  {/* Secondary Option Input (e.g. Size) */}
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Small, 1 kg"
                                      value={v.optionValues?.[secondaryOptName] || ""}
                                      onChange={(e) =>
                                        handleVariantOptionValueChange(
                                          idx,
                                          secondaryOptName,
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                                    />
                                  </td>

                                  {/* Tertiary Option Input (if present) */}
                                  {tertiaryOptName && (
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        placeholder="e.g. Material"
                                        value={v.optionValues?.[tertiaryOptName] || ""}
                                        onChange={(e) =>
                                          handleVariantOptionValueChange(
                                            idx,
                                            tertiaryOptName,
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                                      />
                                    </td>
                                  )}

                                  {/* Price */}
                                  <td className="p-2 w-24">
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
                                        handleVariantChange(idx, "compareAtPrice", e.target.value)
                                      }
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-600 focus:bg-white focus:outline-none focus:border-orange-500"
                                    />
                                  </td>

                                  {/* SKU */}
                                  <td className="p-2 w-32">
                                    <input
                                      type="text"
                                      placeholder="SKU"
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
                                        const formatted =
                                          raw.length > 1 ? raw.replace(/^0+/, "") || "0" : raw;
                                        handleVariantChange(idx, "stockQuantity", formatted);
                                      }}
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                                    />
                                  </td>

                                  {/* Mini Photo Column */}
                                  <td className="p-2 text-center w-14">
                                    <div className="flex items-center justify-center">
                                      <div className="relative group/mini h-8 w-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
                                        {v.image || grp.image ? (
                                          <img
                                            src={v.image || grp.image}
                                            alt={v.title || "Variant"}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                          />
                                        ) : (
                                          <ImageIcon className="h-3.5 w-3.5 text-slate-300" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/mini:opacity-100 transition-opacity flex items-center justify-center">
                                          <label
                                            htmlFor={`var-sub-img-${idx}`}
                                            className="cursor-pointer text-white hover:text-orange-300 p-0.5"
                                            title="Override photo for this variant"
                                          >
                                            <RefreshCw className="h-3 w-3" />
                                          </label>
                                        </div>
                                      </div>
                                      <input
                                        id={`var-sub-img-${idx}`}
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        className="hidden"
                                        onChange={(e) => handleVariantFileChange(idx, e)}
                                      />
                                    </div>
                                  </td>

                                  {/* Delete Sub-variant */}
                                  <td className="p-2 text-center w-10">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariant(idx)}
                                      disabled={variants.length <= 1}
                                      className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors cursor-pointer"
                                      title="Delete size"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Button to add another Primary Category */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddPrimaryGroup}
                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/60 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another {primaryOptName} Group (e.g. New {primaryOptName})
                      </button>

                      <div className="text-[11px] text-slate-500 font-medium">
                        {variants.length} Total Variants • Total Stock:{" "}
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

                {/* FLAT TABLE VIEW (when single option OR user toggles Table View) */}
                {(optionList.length === 1 || variantViewMode === "table") && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white no-scrollbar sm:overflow-visible">
                  <table className="w-full text-left text-xs min-w-[580px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-2.5 py-2.5 w-20 text-center">Image</th>
                        {optionList.map((opt, oIdx) => (
                          <th key={oIdx} className="px-3 py-2.5 min-w-[130px] text-slate-700 font-bold">
                            {opt.name.trim() || `Option ${oIdx + 1}`}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 w-28">Price (₹)</th>
                        <th className="px-3 py-2.5 w-24">MRP (₹)</th>
                        <th className="px-3 py-2.5 w-32">SKU</th>
                        <th className="px-3 py-2.5 w-20">Stock</th>
                        <th className="px-3 py-2.5 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variants.map((v, idx) => (
                        <tr key={v.id || idx} className="hover:bg-slate-50/50">
                          {/* Variant Image */}
                          <td className="p-2 w-20 text-center">
                            <div className="flex items-center justify-center">
                              {uploadingVariantIdx === idx ? (
                                <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-orange-50 border border-orange-200">
                                  <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                                </div>
                              ) : v.image ? (
                                <div className="relative group h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
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
                                      title="Upload new image from computer"
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
                                <div className="flex items-center gap-1">
                                  <label
                                    htmlFor={`var-img-${idx}`}
                                    className="flex items-center justify-center h-10 w-10 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 hover:border-orange-500 hover:bg-orange-100/60 text-orange-600 transition-colors cursor-pointer shrink-0"
                                    title="Upload variant image from computer"
                                  >
                                    <UploadCloud className="h-4 w-4" />
                                  </label>
                                  <div className="flex flex-col gap-0.5">
                                    {images.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setGalleryPickerVariantIdx(idx)}
                                        className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors cursor-pointer"
                                        title="Pick from product gallery photos"
                                      >
                                        <ImageIcon className="h-3 w-3" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url = window.prompt("Enter image URL for this variant:", v.image || "");
                                        if (url !== null && url.trim()) {
                                          handleVariantChange(idx, "image", url.trim());
                                          setImages((prev) => (prev.includes(url.trim()) ? prev : [...prev, url.trim()]));
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                      title="Or paste image URL"
                                    >
                                      <LinkIcon className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              <input
                                id={`var-img-${idx}`}
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                                onChange={(e) => handleVariantFileChange(idx, e)}
                              />
                            </div>
                          </td>

                          {/* Dynamic Option Value Inputs */}
                          {optionList.map((opt, oIdx) => (
                            <td key={oIdx} className="p-2">
                              <input
                                type="text"
                                required
                                placeholder={
                                  opt.name.toLowerCase().includes("color")
                                    ? "e.g. Red, Blue"
                                    : opt.name.toLowerCase().includes("size")
                                    ? "e.g. Small, Medium"
                                    : opt.name.toLowerCase().includes("weight")
                                    ? "e.g. 1 kg, 500g"
                                    : opt.name.toLowerCase().includes("flavor")
                                    ? "e.g. Chicken, Beef"
                                    : `e.g. Value ${idx + 1}`
                                }
                                value={v.optionValues?.[opt.name] ?? ""}
                                onChange={(e) =>
                                  handleVariantOptionValueChange(idx, opt.name, e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                              />
                            </td>
                          ))}

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
                    {variants.length} {variants.length === 1 ? "Variant" : "Variants"} • Total Stock:{" "}
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
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="product-description-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Product Description
              </label>

              {/* Mode Toggle: Write vs Live Preview */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDescTab("write")}
                  className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                    descTab === "write"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setDescTab("preview")}
                  className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                    descTab === "preview"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            {/* Quick Structure Formatting Helpers */}
            {descTab === "write" && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => {
                    setDescription((prev) => {
                      const trimmed = prev.trimEnd();
                      return trimmed ? `${trimmed}\n• ` : "• ";
                    });
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 transition-colors shadow-2xs cursor-pointer"
                  title="Add bullet point"
                >
                  + Bullet List (•)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDescription((prev) => {
                      const trimmed = prev.trimEnd();
                      return trimmed ? `${trimmed}\n\nKey Benefits:\n• ` : "Key Benefits:\n• ";
                    });
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 transition-colors shadow-2xs cursor-pointer"
                  title="Add benefits section"
                >
                  + Key Benefits
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDescription((prev) => {
                      const trimmed = prev.trimEnd();
                      return trimmed ? `${trimmed}\n\n` : "";
                    });
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 transition-colors shadow-2xs cursor-pointer"
                  title="Add paragraph break"
                >
                  + New Paragraph
                </button>
                {description && (
                  <button
                    type="button"
                    onClick={() => setDescription("")}
                    className="ml-auto text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {descTab === "write" ? (
              <textarea
                id="product-description-input"
                rows={8}
                placeholder="Paste or write structured product details with paragraphs and bullet points:&#10;&#10;Pet Towel - Super Soft & Gentle&#10;Absorbs 5 times more water than regular towels. Easy to clean and store in a supplied carry case.&#10;&#10;Key Benefits:&#10;• Fast Drying & Easy Care&#10;• Safe & gentle for dogs and cats"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-orange-500 resize-y font-normal"
              />
            ) : (
              <div className="w-full min-h-[180px] max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 leading-relaxed shadow-inner">
                {description.trim() ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-700 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3"
                    dangerouslySetInnerHTML={{ __html: textToDescriptionHtml(description) }}
                  />
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    No description written yet. Type or paste your description in the "Write" tab to see a live preview here.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 px-0.5">
              <span>
                💡 Paste multi-line structured text, paragraphs, and bullets (• or -). All formatting will be preserved on your store.
              </span>
              <span className="shrink-0 font-mono">
                {description.length} chars • {description.split("\n").filter(Boolean).length} lines
              </span>
            </div>
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
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {isEdit && product?.id ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting || isDeleting || isUploadingImage}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                title="Permanently delete this product from Shopify"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Product</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || isDeleting}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isDeleting || isUploadingImage}
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
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete &quot;{product?.title}&quot;?
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                This will permanently remove this product, all its variants, images, and live inventory from Shopify and your online store. This action <span className="font-semibold text-red-600">cannot be undone</span>.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setError(null);
                  }}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Yes, Delete Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
