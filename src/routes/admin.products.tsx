import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getAdminProductsFn,
  getAdminProductByIdFn,
  toggleProductVisibilityFn,
  toggleProductCodFn,
  AdminProduct,
  AdminProductVariant,
} from "@/lib/admin/products";
import { getCategoriesFn, AdminCategory } from "@/lib/admin/categories";
import StockEditor from "@/components/admin/StockEditor";
import PriceEditor from "@/components/admin/PriceEditor";
import ProductFormModal from "@/components/admin/ProductFormModal";
import VariantStockModal from "@/components/admin/VariantStockModal";
import ProductActionConfirmModal, {
  type ProductActionConfirmConfig,
} from "@/components/admin/ProductActionConfirmModal";
import {
  Search,
  Package,
  ExternalLink,
  Plus,
  Pencil,
  Layers,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SHIPPING_TIERS, WEIGHT_SHIPPING_TAG } from "@/data/shippingTiers";

import { ProductsSkeleton } from "@/components/admin/AdminSkeletons";

export const Route = createFileRoute("/admin/products")({
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
  loader: async () => {
    const [products, categories] = await Promise.all([getAdminProductsFn(), getCategoriesFn()]);
    return { products, categories };
  },
  pendingComponent: ProductsSkeleton,
  component: AdminProductsPage,
});

type StockFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "HIDDEN";

const STOCK_FILTERS: Array<{ key: StockFilter; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "IN_STOCK", label: "In stock" },
  { key: "LOW_STOCK", label: "Low stock" },
  { key: "OUT_OF_STOCK", label: "Out of stock" },
  { key: "HIDDEN", label: "Hidden" },
];

/** Hidden products only count under "Hidden"; stock tabs cover visible products. */
function matchesStockFilter(p: AdminProduct, filter: StockFilter): boolean {
  switch (filter) {
    case "ALL":
      return true;
    case "HIDDEN":
      return Boolean(p.hidden);
    case "IN_STOCK":
      return !p.hidden && p.stockQuantity > 5;
    case "LOW_STOCK":
      return !p.hidden && p.stockQuantity > 0 && p.stockQuantity <= 5;
    case "OUT_OF_STOCK":
      return !p.hidden && p.stockQuantity <= 0;
  }
}

function deliveryLabel(product: AdminProduct): string {
  if (product.shippingTag === WEIGHT_SHIPPING_TAG) return "Delivery by weight";
  const tier = SHIPPING_TIERS.find((t) => t.tag === product.shippingTag);
  if (!tier) return "Free delivery";
  return tier.amount === 0 ? "Free delivery" : `${tier.label} delivery`;
}

function StatusButton({
  onClick,
  disabled,
  dot,
  label,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  dot: string;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60 cursor-pointer"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </button>
  );
}

function AdminProductsPage() {
  const router = useRouter();
  const { products: initialProducts, categories: initialCategories } = Route.useLoaderData();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [variantStockModalProduct, setVariantStockModalProduct] = useState<AdminProduct | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<string | null>(null);
  const [updatingCodId, setUpdatingCodId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ProductActionConfirmConfig | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const requestToggleCod = (product: AdminProduct) => {
    const currentVal = product.isCodAvailable !== false;
    setConfirmDialog({
      type: "cod",
      product,
      targetValue: !currentVal,
    });
  };

  const requestToggleVisibility = (product: AdminProduct) => {
    const isCurrentlyHidden = Boolean(product.hidden);
    setConfirmDialog({
      type: "visibility",
      product,
      targetValue: !isCurrentlyHidden,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { type, product, targetValue } = confirmDialog;
    setIsConfirmLoading(true);

    if (type === "cod") {
      setUpdatingCodId(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isCodAvailable: targetValue } : p)),
      );
      try {
        await toggleProductCodFn({
          data: {
            productId: product.id,
            handle: product.handle,
            isCodAvailable: targetValue,
          },
        });
        toast.success(
          targetValue
            ? `COD enabled for "${product.title}"`
            : `"${product.title}" set to Prepaid Only`,
        );
        router.invalidate();
        setConfirmDialog(null);
      } catch (err) {
        console.error("Failed to toggle COD:", err);
        toast.error("Failed to update COD setting");
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isCodAvailable: !targetValue } : p)),
        );
      } finally {
        setUpdatingCodId(null);
        setIsConfirmLoading(false);
      }
    } else {
      // Visibility
      const newHidden = !targetValue;
      setUpdatingVisibilityId(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, hidden: newHidden } : p)),
      );
      try {
        await toggleProductVisibilityFn({
          data: {
            productId: product.id,
            handle: product.handle,
            hidden: newHidden,
          },
        });
        toast.success(
          newHidden
            ? `"${product.title}" hidden from storefront`
            : `"${product.title}" is now visible on storefront`,
        );
        router.invalidate();
        setConfirmDialog(null);
      } catch (err) {
        console.error("Failed to toggle product visibility:", err);
        toast.error("Failed to update product visibility");
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, hidden: !newHidden } : p)),
        );
      } finally {
        setUpdatingVisibilityId(null);
        setIsConfirmLoading(false);
      }
    }
  };

  const handleStockUpdated = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: newStock,
              stockStatus:
                newStock <= 0 ? "out_of_stock" : newStock <= 5 ? "low_stock" : "in_stock",
            }
          : p,
      ),
    );
  };

  const handleVariantStockUpdated = (
    productId: string,
    totalStock: number,
    updatedVariants: AdminProductVariant[],
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: totalStock,
              stockStatus:
                totalStock <= 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock",
              variants: updatedVariants,
            }
          : p,
      ),
    );
  };

  const handleProductSaved = (saved: any) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...saved };
        return copy;
      }
      return [saved, ...prev];
    });
    router.invalidate();
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
    router.invalidate();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (prod: AdminProduct) => {
    setLoadingEditId(prod.id);
    try {
      // Always fetch fresh, authoritative product data from the Shopify backend
      const fresh = await getAdminProductByIdFn({
        data: { id: prod.id, handle: prod.handle },
      });
      const target = fresh || prod;
      setEditingProduct(target);
      if (fresh) {
        setProducts((prev) => prev.map((p) => (p.id === fresh.id ? fresh : p)));
      }
      setIsModalOpen(true);
    } catch (err) {
      console.warn("Could not fetch fresh product details from backend:", err);
      setEditingProduct(prod);
      setIsModalOpen(true);
    } finally {
      setLoadingEditId(null);
    }
  };

  const openVariantStockModal = async (prod: AdminProduct) => {
    setLoadingEditId(prod.id);
    try {
      const fresh = await getAdminProductByIdFn({
        data: { id: prod.id, handle: prod.handle },
      });
      const target = fresh || prod;
      setVariantStockModalProduct(target);
      if (fresh) {
        setProducts((prev) => prev.map((p) => (p.id === fresh.id ? fresh : p)));
      }
    } catch {
      setVariantStockModalProduct(prod);
    } finally {
      setLoadingEditId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      // Category
      const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;

      return matchesSearch && matchesCategory && matchesStockFilter(p, stockFilter);
    });
  }, [products, search, selectedCategory, stockFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<StockFilter, number> = {
      ALL: products.length,
      IN_STOCK: 0,
      LOW_STOCK: 0,
      OUT_OF_STOCK: 0,
      HIDDEN: 0,
    };
    for (const p of products) {
      for (const key of ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "HIDDEN"] as const) {
        if (matchesStockFilter(p, key)) counts[key]++;
      }
    }
    return counts;
  }, [products]);

  const renderStock = (product: AdminProduct, compact: boolean) => (
    <div className="flex flex-col items-start gap-1">
      {product.variants && product.variants.length > 1 ? (
        <button
          type="button"
          onClick={() => openVariantStockModal(product)}
          disabled={loadingEditId === product.id}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer whitespace-nowrap"
          title="View and edit stock for each variant"
        >
          {loadingEditId === product.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          ) : (
            <Layers className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="font-semibold">{product.stockQuantity}</span>
          <span className="text-slate-500">· {product.variants.length} variants</span>
        </button>
      ) : (
        <StockEditor
          inventoryItemId={product.inventoryItemId}
          variantId={product.variantId}
          productId={product.id}
          initialStock={product.stockQuantity}
          productTitle={product.title}
          onStockUpdated={(val) => handleStockUpdated(product.id, val)}
          compact={compact}
        />
      )}
      {product.stockQuantity <= 5 && (
        <span
          className={`text-xs font-medium ${
            product.stockQuantity <= 0 ? "text-red-600" : "text-amber-600"
          }`}
        >
          {product.stockQuantity <= 0 ? "Out of stock" : "Low stock"}
        </span>
      )}
    </div>
  );

  const renderPrice = (product: AdminProduct) => (
    <PriceEditor
      productId={product.id}
      variantId={product.variantId}
      initialPrice={product.price}
      initialCompareAtPrice={product.compareAtPrice}
      productTitle={product.title}
      onPriceUpdated={(newPrice, newCompare) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, price: newPrice, compareAtPrice: newCompare ?? undefined }
              : p,
          ),
        );
      }}
    />
  );

  const renderCod = (product: AdminProduct) => {
    const cod = product.isCodAvailable !== false;
    return (
      <StatusButton
        onClick={() => requestToggleCod(product)}
        disabled={updatingCodId === product.id}
        dot={cod ? "bg-emerald-500" : "bg-amber-500"}
        label={cod ? "COD" : "Prepaid only"}
        title={
          cod ? "Cash on Delivery allowed. Click to change." : "Prepaid only. Click to change."
        }
      />
    );
  };

  const renderVisibility = (product: AdminProduct) => (
    <StatusButton
      onClick={() => requestToggleVisibility(product)}
      disabled={updatingVisibilityId === product.id}
      dot={product.hidden ? "bg-slate-400" : "bg-emerald-500"}
      label={product.hidden ? "Hidden" : "Visible"}
      title={
        product.hidden
          ? "Hidden from the storefront. Click to show."
          : "Visible on the storefront. Click to hide."
      }
    />
  );

  const editButton = (product: AdminProduct, className = "") => (
    <button
      type="button"
      onClick={() => openEditModal(product)}
      disabled={loadingEditId === product.id}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer ${className}`}
    >
      {loadingEditId === product.id ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
      ) : (
        <Pencil className="h-3.5 w-3.5 text-slate-400" />
      )}
      Edit
    </button>
  );

  const viewLink = (product: AdminProduct) => (
    <a
      href={`/product?handle=${product.handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      title="View on storefront"
      aria-label={`View ${product.title} on storefront`}
    >
      <ExternalLink className="h-4 w-4" />
    </a>
  );

  const thumb = (product: AdminProduct, size: string) => (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50`}
    >
      <img
        src={product.imageUrl}
        alt=""
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLElement).style.visibility = "hidden";
        }}
      />
    </div>
  );

  const emptyState = (
    <div className="px-4 py-14 text-center">
      <Package className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-2 text-sm font-medium text-slate-700">No products found</p>
      <p className="text-sm text-slate-500">Try a different search or filter.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage stock, prices and what's shown on your store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await router.invalidate();
              } finally {
                setTimeout(() => setIsRefreshing(false), 400);
              }
            }}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
            title="Reload products and stock from Shopify"
          >
            <RotateCcw className={`h-4 w-4 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
        {/* Status tabs */}
        <div className="overflow-x-auto border-b border-slate-200 no-scrollbar">
          <div className="flex min-w-max gap-1 px-3">
            {STOCK_FILTERS.map((f) => {
              const active = stockFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStockFilter(f.key)}
                  className={`-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "border-orange-500 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                      active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {statusCounts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & category */}
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-pointer sm:w-56"
          >
            <option value="ALL">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title} ({cat.productCount})
              </option>
            ))}
          </select>
        </div>

        {/* MOBILE: product cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredProducts.length === 0
            ? emptyState
            : filteredProducts.map((product) => (
                <div key={`mob-${product.id}`} className="space-y-3 p-4">
                  <div className="flex gap-3">
                    {thumb(product, "h-14 w-14")}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {product.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {product.category}
                        {product.sku ? ` · ${product.sku}` : ""} · {deliveryLabel(product)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    {renderPrice(product)}
                    {renderStock(product, false)}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderVisibility(product)}
                    {renderCod(product)}
                    <div className="ml-auto flex items-center gap-1">
                      {editButton(product)}
                      {viewLink(product)}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* DESKTOP: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] table-fixed text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th scope="col" className="w-[31%] px-4 py-2.5 font-medium">
                  Product
                </th>
                <th scope="col" className="w-[12%] px-3 py-2.5 font-medium">
                  Category
                </th>
                <th scope="col" className="w-[15%] px-3 py-2.5 font-medium">
                  Price
                </th>
                <th scope="col" className="w-[15%] px-3 py-2.5 font-medium">
                  Stock
                </th>
                <th scope="col" className="w-[10%] px-3 py-2.5 font-medium">
                  Payment
                </th>
                <th scope="col" className="w-[8%] px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="w-[9%] px-4 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7}>{emptyState}</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        {thumb(product, "h-10 w-10")}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900" title={product.title}>
                            {product.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {product.sku || "No SKU"} · {deliveryLabel(product)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="truncate px-3 py-3 align-middle text-slate-600"
                      title={product.category}
                    >
                      {product.category}
                    </td>
                    <td className="px-3 py-3 align-middle">{renderPrice(product)}</td>
                    <td className="px-3 py-3 align-middle">{renderStock(product, true)}</td>
                    <td className="px-3 py-3 align-middle">{renderCod(product)}</td>
                    <td className="px-3 py-3 align-middle">{renderVisibility(product)}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1">
                        {editButton(product)}
                        {viewLink(product)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <ProductFormModal
          key={editingProduct?.id || "new-product"}
          isOpen={isModalOpen}
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleProductSaved}
          onDeleted={handleProductDeleted}
        />
      )}

      {/* Quick Variant Stock Manager Modal */}
      <VariantStockModal
        isOpen={Boolean(variantStockModalProduct)}
        product={variantStockModalProduct}
        onClose={() => setVariantStockModalProduct(null)}
        onStockUpdated={handleVariantStockUpdated}
      />

      {/* Confirmation Modal for COD and Visibility Toggles */}
      <ProductActionConfirmModal
        isOpen={Boolean(confirmDialog)}
        config={confirmDialog}
        isLoading={isConfirmLoading}
        onClose={() => {
          if (!isConfirmLoading) {
            setConfirmDialog(null);
          }
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
