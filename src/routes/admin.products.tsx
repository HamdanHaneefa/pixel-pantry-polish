import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getAdminProductsFn,
  getAdminProductByIdFn,
  toggleProductVisibilityFn,
  AdminProduct,
  AdminProductVariant,
} from "@/lib/admin/products";
import { getCategoriesFn, AdminCategory } from "@/lib/admin/categories";
import StockEditor from "@/components/admin/StockEditor";
import ProductFormModal from "@/components/admin/ProductFormModal";
import VariantStockModal from "@/components/admin/VariantStockModal";
import {
  Search,
  Filter,
  Package,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Pencil,
  Eye,
  EyeOff,
  Layers,
  RotateCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { ProductsSkeleton } from "@/components/admin/AdminSkeletons";

export const Route = createFileRoute("/admin/products")({
  staleTime: 0,
  gcTime: 0,
  shouldReload: () => true,
  loader: async () => {
    const [products, categories] = await Promise.all([
      getAdminProductsFn(),
      getCategoriesFn(),
    ]);
    return { products, categories };
  },
  pendingComponent: ProductsSkeleton,
  component: AdminProductsPage,
});

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
  const [variantStockModalProduct, setVariantStockModalProduct] = useState<AdminProduct | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "HIDDEN">("ALL");
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<string | null>(null);

  const handleToggleVisibility = async (product: AdminProduct) => {
    const newHidden = !product.hidden;
    setUpdatingVisibilityId(product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, hidden: newHidden } : p))
    );
    try {
      await toggleProductVisibilityFn({
        data: {
          productId: product.id,
          handle: product.handle,
          hidden: newHidden,
        },
      });
      router.invalidate();
    } catch (err) {
      console.error("Failed to toggle product visibility:", err);
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, hidden: !newHidden } : p))
      );
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  const handleStockUpdated = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: newStock,
              stockStatus: newStock <= 0 ? "out_of_stock" : newStock <= 5 ? "low_stock" : "in_stock",
            }
          : p
      )
    );
  };

  const handleVariantStockUpdated = (
    productId: string,
    totalStock: number,
    updatedVariants: AdminProductVariant[]
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: totalStock,
              stockStatus: totalStock <= 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock",
              variants: updatedVariants,
            }
          : p
      )
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
        setProducts((prev) =>
          prev.map((p) => (p.id === fresh.id ? fresh : p))
        );
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
        setProducts((prev) =>
          prev.map((p) => (p.id === fresh.id ? fresh : p))
        );
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
      const matchesCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;

      // Stock & Visibility
      let matchesStock = true;
      if (stockFilter === "HIDDEN") matchesStock = Boolean(p.hidden);
      else if (stockFilter === "IN_STOCK") matchesStock = p.stockQuantity > 5 && !p.hidden;
      else if (stockFilter === "LOW_STOCK") matchesStock = p.stockQuantity > 0 && p.stockQuantity <= 5 && !p.hidden;
      else if (stockFilter === "OUT_OF_STOCK") matchesStock = p.stockQuantity <= 0 && !p.hidden;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-500">
            View stock levels, edit details, and add new products with live inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-xs">
            {filteredProducts.length} of {products.length} Products
          </div>
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all disabled:opacity-60 active:scale-[0.99]"
            title="Fetch live real-time stock and product data from Shopify"
          >
            <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.99]"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-4 w-4 my-auto" />
            <input
              type="text"
              placeholder="Search product title, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Simplified Category Selector */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.title}>
                  {cat.title} ({cat.productCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Filter Quick Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setStockFilter("ALL")}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              stockFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStockFilter("IN_STOCK")}
            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              stockFilter === "IN_STOCK"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle className="h-3 w-3" />
            In Stock ({products.filter((p) => p.stockQuantity > 5).length})
          </button>
          <button
            onClick={() => setStockFilter("LOW_STOCK")}
            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              stockFilter === "LOW_STOCK"
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Low Stock ≤ 5 ({products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length})
          </button>
          <button
            onClick={() => setStockFilter("OUT_OF_STOCK")}
            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              stockFilter === "OUT_OF_STOCK"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Out of Stock ({products.filter((p) => p.stockQuantity <= 0 && !p.hidden).length})
          </button>
          <button
            onClick={() => setStockFilter("HIDDEN")}
            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              stockFilter === "HIDDEN"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <EyeOff className="h-3 w-3" />
            Hidden ({products.filter((p) => p.hidden).length})
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-friendly Product Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
            No products matching your search or filter.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={`mob-${product.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              {/* Top Row: Image + Title + Badges */}
              <div className="flex gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-200 bg-slate-50"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {product.category}
                    </span>
                    {product.variants && product.variants.length > 1 && (
                      <span className="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200/60">
                        {product.variants.length} Variants
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug mt-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    SKU: {product.sku}
                  </p>
                </div>
              </div>

              {/* Middle Row: Price + Live Stock Adjustment */}
              <div className="flex items-center justify-between border-t border-b border-slate-100 py-2.5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                    {product.variants && product.variants.length > 1 ? "Starting From" : "Price"}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock controls */}
                <div className="flex flex-col items-end gap-1">
                  {product.variants && product.variants.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => openVariantStockModal(product)}
                      disabled={loadingEditId === product.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/90 hover:bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800 shadow-2xs transition-all cursor-pointer group disabled:opacity-60"
                      title="This product has multiple variants. Click to view & edit variant stock"
                    >
                      {loadingEditId === product.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-600" />
                      ) : (
                        <Layers className="h-3.5 w-3.5 text-orange-600" />
                      )}
                      <span>{product.stockQuantity} in stock</span>
                      <span className="text-[10px] text-orange-600 underline font-semibold group-hover:text-orange-950">
                        Manage ({product.variants.length} Var)
                      </span>
                    </button>
                  ) : (
                    <StockEditor
                      inventoryItemId={product.inventoryItemId}
                      variantId={product.variantId}
                      productId={product.id}
                      initialStock={product.stockQuantity}
                      productTitle={product.title}
                      onStockUpdated={(val) => handleStockUpdated(product.id, val)}
                    />
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      product.stockQuantity <= 0
                        ? "text-rose-600"
                        : product.stockQuantity <= 5
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {product.stockQuantity <= 0
                      ? "Out of Stock"
                      : product.stockQuantity <= 5
                      ? `Low Stock (${product.stockQuantity})`
                      : `In Stock (${product.stockQuantity})`}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(product)}
                  disabled={updatingVisibilityId === product.id}
                  className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    product.hidden
                      ? "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                  title={product.hidden ? "Click to unhide" : "Click to hide"}
                >
                  {product.hidden ? (
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
                <button
                  type="button"
                  onClick={() => openEditModal(product)}
                  disabled={loadingEditId === product.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/80 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loadingEditId === product.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Product</span>
                    </>
                  )}
                </button>
                <a
                  href={`/product?handle=${product.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Full Data Table (≥ 768px) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-3 py-2.5 w-[30%] bg-slate-50">Product</th>
                <th scope="col" className="px-2.5 py-2.5 w-[11%] bg-slate-50">Category</th>
                <th scope="col" className="px-2.5 py-2.5 w-[11%] bg-slate-50">Price</th>
                <th scope="col" className="px-2.5 py-2.5 w-[12%] bg-slate-50">SKU</th>
                <th scope="col" className="px-2.5 py-2.5 w-[15%] bg-slate-50">Live Stock</th>
                <th scope="col" className="px-2.5 py-2.5 w-[10%] bg-slate-50">Visibility</th>
                <th scope="col" className="px-3 py-2.5 w-[11%] text-right bg-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3.5 py-10 text-center text-slate-400">
                    No products matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Product Info */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-9 w-9 shrink-0 rounded-lg object-cover border border-slate-200 bg-slate-50"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-bold text-slate-900 leading-snug truncate"
                            title={product.title}
                          >
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 truncate text-[10px] text-slate-400">
                            <span className="font-mono shrink-0">
                              ID: {product.id.split("/").pop()}
                            </span>
                            {product.variants && product.variants.length > 1 && (
                              <span className="inline-flex items-center rounded bg-orange-50 px-1 py-0.2 text-[9px] font-bold text-orange-700 border border-orange-200/60 shrink-0">
                                {product.variants.length} Var
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="px-2.5 py-2">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 truncate max-w-full" title={product.category}>
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-2.5 py-2 font-bold text-slate-900">
                      {product.variants && product.variants.length > 1 ? (
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase leading-none mb-0.5">
                          From
                        </span>
                      ) : null}
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice ? (
                        <span className="ml-1 text-[10px] text-slate-400 line-through font-normal">
                          ₹{product.compareAtPrice.toFixed(2)}
                        </span>
                      ) : null}
                    </td>

                    {/* SKU */}
                    <td className="px-2.5 py-2 text-xs font-mono font-medium text-slate-600">
                      <span className="truncate block" title={product.sku || ""}>
                        {product.sku || "—"}
                      </span>
                    </td>

                    {/* Quick Stock Editor */}
                    <td className="px-2.5 py-2">
                      <div className="space-y-0.5">
                        {product.variants && product.variants.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => openVariantStockModal(product)}
                            disabled={loadingEditId === product.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50/80 hover:bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800 shadow-2xs transition-all cursor-pointer group disabled:opacity-60"
                            title="Click to view & edit variant stock"
                          >
                            {loadingEditId === product.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
                            ) : (
                              <Layers className="h-3 w-3 text-orange-600" />
                            )}
                            <span>{product.stockQuantity}</span>
                            <span className="text-[10px] text-orange-600 font-semibold group-hover:underline">
                              ({product.variants.length} Var)
                            </span>
                          </button>
                        ) : (
                          <StockEditor
                            inventoryItemId={product.inventoryItemId}
                            variantId={product.variantId}
                            productId={product.id}
                            initialStock={product.stockQuantity}
                            productTitle={product.title}
                            onStockUpdated={(val) => handleStockUpdated(product.id, val)}
                            compact={true}
                          />
                        )}
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider ${
                            product.stockQuantity <= 0
                              ? "text-rose-600"
                              : product.stockQuantity <= 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {product.stockQuantity <= 0
                            ? "Out of Stock"
                            : product.stockQuantity <= 5
                            ? `Low (${product.stockQuantity})`
                            : `In Stock (${product.stockQuantity})`}
                        </span>
                      </div>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="px-2.5 py-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(product)}
                        disabled={updatingVisibilityId === product.id}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          product.hidden
                            ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                        title={product.hidden ? "Hidden from storefront. Click to show." : "Visible on storefront. Click to hide."}
                      >
                        {product.hidden ? (
                          <>
                            <EyeOff className="h-3 w-3 text-purple-600" />
                            <span>Hidden</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit & Storefront Link */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          disabled={loadingEditId === product.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                          title="Edit product details"
                        >
                          {loadingEditId === product.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Pencil className="h-3 w-3 text-orange-500" />
                              <span>Edit</span>
                            </>
                          )}
                        </button>
                        <a
                          href={`/product?handle=${product.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Preview on live store"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        />
      )}

      {/* Quick Variant Stock Manager Modal */}
      <VariantStockModal
        isOpen={Boolean(variantStockModalProduct)}
        product={variantStockModalProduct}
        onClose={() => setVariantStockModalProduct(null)}
        onStockUpdated={handleVariantStockUpdated}
      />
    </div>
  );
}
