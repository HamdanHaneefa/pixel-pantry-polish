import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAdminProductsFn, AdminProduct } from "@/lib/admin/products";
import { getAdminOrdersFn, AdminOrder } from "@/lib/admin/orders";
import StockEditor from "@/components/admin/StockEditor";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { DashboardSkeleton } from "@/components/admin/AdminSkeletons";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [products, ordersRes] = await Promise.all([
      getAdminProductsFn(),
      getAdminOrdersFn(),
    ]);
    return {
      products,
      orders: ordersRes?.orders || [],
      missingOrdersScope: !!ordersRes?.missingScope,
    };
  },
  pendingComponent: DashboardSkeleton,
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { products: initialProducts, orders, missingOrdersScope } = Route.useLoaderData();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === "UNFULFILLED");
  const lowStockProducts = products.filter((p) => p.stockQuantity <= 5);

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

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Store Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status of your Shopify catalog, stock levels, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Package className="h-4 w-4 text-slate-500" />
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.99]"
          >
            <ShoppingCart className="h-4 w-4" />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Orders */}
        <Link
          to="/admin/orders"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-blue-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{orders.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">recorded</span>
          </div>
        </Link>

        {/* Pending Fulfillment */}
        <Link
          to="/admin/orders"
          className="group rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending Orders
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-amber-900">{pendingOrders.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-amber-700">need action</span>
          </div>
        </Link>

        {/* Low Stock Alerts */}
        <Link
          to="/admin/products"
          className="group rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-rose-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-rose-700">
              Stock Warnings
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-rose-900">{lowStockProducts.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-rose-700">≤ 5 units</span>
          </div>
        </Link>

        {/* Total Catalog */}
        <Link
          to="/admin/products"
          className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-emerald-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Catalog
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{products.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">live items</span>
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Recent Orders Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Customer Orders</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Latest orders placed on Shopify</p>
              </div>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors shrink-0"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {missingOrdersScope ? (
              <div className="py-6 px-4 text-center rounded-xl bg-amber-50/70 border border-amber-200/80 my-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-amber-900">Shopify Permission Required</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  App needs <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">read_orders</code> scope to display customer orders.
                </p>
                <Link
                  to="/admin/orders"
                  className="inline-block mt-2.5 text-xs font-bold text-amber-900 underline hover:text-amber-950"
                >
                  View Setup Guide &rarr;
                </Link>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No orders found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-between gap-2 py-3 hover:bg-slate-50 cursor-pointer rounded-xl px-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{order.name}</span>
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            order.fulfillmentStatus === "FULFILLED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60"
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                        {order.customer.name} • {order.itemCount} item(s)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        ₹{order.total.toFixed(2)}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Quick-Adjust Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Stock Attention Required</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Products running low or out of stock in Shopify
                </p>
              </div>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors shrink-0"
              >
                All Products <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-emerald-600 font-medium">
                ✓ All catalog products have sufficient stock!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2.5 sm:gap-3 py-3 rounded-xl px-1 sm:px-2 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-200 bg-slate-50"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs sm:text-sm font-bold text-slate-900 truncate"
                          title={product.title}
                        >
                          {product.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] font-medium text-slate-500 truncate">
                            {product.category}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-extrabold text-slate-900">
                            ₹{product.price}
                          </span>
                          {product.stockQuantity <= 0 ? (
                            <span className="inline-flex rounded bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 text-[9px] font-black uppercase text-rose-700">
                              Out of stock
                            </span>
                          ) : (
                            <span className="inline-flex rounded bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                              {product.stockQuantity} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Stepper Editor */}
                    <div className="shrink-0 pl-1">
                      <StockEditor
                        compact
                        inventoryItemId={product.inventoryItemId}
                        variantId={product.variantId}
                        productId={product.id}
                        initialStock={product.stockQuantity}
                        productTitle={product.title}
                        onStockUpdated={(newVal) => handleStockUpdated(product.id, newVal)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
