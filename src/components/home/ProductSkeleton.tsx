import SiteHeader from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import TrustBar from "@/components/home/TrustBar";
import MobileTabBar from "@/components/home/MobileTabBar";

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#EFE6DB]/70 ${className}`} />;
}

export default function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      <SiteHeader />

      {/* Breadcrumbs */}
      <div className="bg-[#FFF4E9] py-4 border-b border-[#F4E1D0]/50">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2">
          <SkeletonBar className="h-4 w-12" />
          <span className="text-[#E5DCCF]">/</span>
          <SkeletonBar className="h-4 w-16" />
          <span className="text-[#E5DCCF]">/</span>
          <SkeletonBar className="h-4 w-36 bg-[#FF5B00]/20" />
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 space-y-12">
        {/* Product Overview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl p-6 lg:p-10 border border-[#F2E8DC]">
          {/* Left Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-[#FAF4ED] animate-pulse flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#EFE6DB]/60" />
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-[#FAF4ED] animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <SkeletonBar className="h-4 w-28 bg-[#FF5B00]/20" />
              <SkeletonBar className="h-8 w-full" />
              <SkeletonBar className="h-8 w-3/4" />
              <div className="flex items-center gap-2 pt-1">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-4 w-16" />
              </div>
            </div>

            <div className="flex items-baseline gap-3 border-y border-[#F2E8DC] py-4">
              <SkeletonBar className="h-10 w-32" />
              <SkeletonBar className="h-6 w-20" />
            </div>

            {/* Variant options */}
            <div className="space-y-3">
              <SkeletonBar className="h-4 w-20" />
              <div className="flex gap-2">
                <SkeletonBar className="h-10 w-24 rounded-lg" />
                <SkeletonBar className="h-10 w-24 rounded-lg" />
                <SkeletonBar className="h-10 w-24 rounded-lg" />
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <SkeletonBar className="h-12 w-32 rounded-xl" />
              <SkeletonBar className="h-12 flex-1 rounded-xl bg-[#FF5B00]/30" />
            </div>

            {/* Trust features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <SkeletonBar className="h-14 rounded-xl" />
              <SkeletonBar className="h-14 rounded-xl" />
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
