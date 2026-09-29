/**
 * Skeleton loading components for admin dashboard pages.
 * Used as pendingComponent on routes so users see smooth loaders instead of a frozen screen.
 */

import { Loader2 } from "lucide-react";

/* ── shared pulse bar ─────────────────────────────────────────────── */
function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

/* ── small stat card skeleton ────────────────────────────────────── */
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Bar className="h-3 w-20" />
        <Bar className="h-8 w-8 rounded-xl" />
      </div>
      <Bar className="h-7 w-24" />
      <Bar className="h-2.5 w-32" />
    </div>
  );
}

/* ── table row skeleton ──────────────────────────────────────────── */
function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
      <Bar className="h-10 w-10 rounded-xl shrink-0" />
      {Array.from({ length: cols }).map((_, i) => (
        <Bar
          key={i}
          className="h-3.5 flex-1"
          style={{ maxWidth: `${60 + Math.random() * 80}px` } as any}
        />
      ))}
    </div>
  );
}

/* ── spinning header loader ──────────────────────────────────────── */
function PageLoadingHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Loading data…</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Dashboard (admin/index) skeleton
   ═══════════════════════════════════════════════════════════════════ */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <PageLoadingHeader title="Dashboard" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Two column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <Bar className="h-4 w-28" />
            <Bar className="h-3 w-16" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={3} />
          ))}
        </div>

        {/* Low stock panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <Bar className="h-4 w-32" />
            <Bar className="h-3 w-16" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={2} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Products & Inventory skeleton
   ═══════════════════════════════════════════════════════════════════ */
export function ProductsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <PageLoadingHeader title="Products & Inventory" />

      {/* Toolbar / filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Bar className="h-9 w-48 rounded-xl" />
        <Bar className="h-9 w-32 rounded-xl" />
        <Bar className="h-9 w-28 rounded-xl" />
        <div className="ml-auto flex gap-2">
          <Bar className="h-9 w-24 rounded-xl" />
          <Bar className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Product table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/60">
          {["w-10", "w-40", "w-20", "w-16", "w-20", "w-16"].map((w, i) => (
            <Bar key={i} className={`h-3 ${w}`} />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0"
          >
            <Bar className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bar className="h-3.5 w-36" />
              <Bar className="h-2.5 w-20" />
            </div>
            <Bar className="h-4 w-14 rounded-full" />
            <Bar className="h-8 w-20 rounded-lg" />
            <Bar className="h-7 w-7 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Orders skeleton
   ═══════════════════════════════════════════════════════════════════ */
export function OrdersSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <PageLoadingHeader title="Orders" />

      {/* Summary stat pills */}
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-9 w-28 rounded-xl" />
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-2.5">
        <Bar className="h-9 w-56 rounded-xl" />
        <Bar className="h-9 w-28 rounded-xl" />
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white shadow-xs p-4 flex items-center gap-4"
          >
            <Bar className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bar className="h-3.5 w-28" />
              <Bar className="h-2.5 w-40" />
            </div>
            <Bar className="h-5 w-16 rounded-full" />
            <Bar className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sponsors skeleton
   ═══════════════════════════════════════════════════════════════════ */
export function SponsorsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <PageLoadingHeader title="Sponsors & Brands" />

      {/* Add button placeholder */}
      <div className="flex justify-end">
        <Bar className="h-9 w-32 rounded-xl" />
      </div>

      {/* Grid of sponsor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white shadow-xs p-4 space-y-3"
          >
            <Bar className="h-16 w-16 rounded-xl mx-auto" />
            <Bar className="h-4 w-24 mx-auto" />
            <Bar className="h-3 w-32 mx-auto" />
            <div className="flex justify-center gap-2 pt-1">
              <Bar className="h-7 w-14 rounded-lg" />
              <Bar className="h-7 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
