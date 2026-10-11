import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import TrustBar from "@/components/home/TrustBar";
import MobileTabBar from "@/components/home/MobileTabBar";

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#EFE6DB]/70 ${className}`}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white border border-[#F2E8DC] p-3 shadow-xs">
      {/* Image box */}
      <div className="relative aspect-square w-full rounded-lg bg-[#FAF4ED] animate-pulse flex items-center justify-center overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-[#EFE6DB]/50" />
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-3/4" />
        </div>

        {/* Price & Rating */}
        <div className="pt-2 flex items-center justify-between">
          <div className="space-y-1">
            <SkeletonBar className="h-5 w-20" />
            <SkeletonBar className="h-3 w-12" />
          </div>
          <SkeletonBar className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      <SiteHeader />

      {/* Breadcrumb section skeleton */}
      <div className="bg-[#FFF4E9] py-4 border-b border-[#F4E1D0]/50">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2">
          <SkeletonBar className="h-4 w-12" />
          <span className="text-[#E5DCCF]">/</span>
          <SkeletonBar className="h-4 w-16" />
          <span className="text-[#E5DCCF]">/</span>
          <SkeletonBar className="h-4 w-24 bg-[#FF5B00]/20" />
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-xl p-5 border border-[#F2E8DC] space-y-4">
              <SkeletonBar className="h-5 w-28" />
              <div className="space-y-2.5 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBar className="h-4 w-4 rounded" />
                    <SkeletonBar className="h-3.5 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#F2E8DC] space-y-4">
              <SkeletonBar className="h-5 w-24" />
              <div className="space-y-2.5 pt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBar className="h-4 w-4 rounded" />
                    <SkeletonBar className="h-3.5 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort row skeleton */}
            <div className="flex flex-col gap-4 mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <SkeletonBar className="h-11 w-full lg:w-96 rounded-md bg-white border border-[#E5DCCF]/50" />
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <SkeletonBar className="h-11 w-32 rounded-md bg-white border border-[#E5DCCF]/50" />
                  <SkeletonBar className="h-11 w-44 rounded-md bg-white border border-[#E5DCCF]/50" />
                </div>
              </div>

              {/* Active filters row placeholder */}
              <div className="flex items-center justify-between bg-[#FFF4E9] rounded-md px-4 py-3 border border-[#F4E1D0]">
                <div className="flex items-center gap-2">
                  <SkeletonBar className="h-3.5 w-24" />
                  <SkeletonBar className="h-6 w-20 rounded-full" />
                </div>
                <SkeletonBar className="h-3.5 w-32" />
              </div>
            </div>

            {/* Product Grid Skeleton: 8 items */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
