import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import ProductCard from "@/components/home/ProductCard";
import { getProducts, getProductsByCollection } from "@/lib/shopify/products";
import type { Product } from "@/data/home";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

export const Route = createFileRoute("/offers")({
  staleTime: 1000 * 60,
  gcTime: 1000 * 60 * 5,
  loader: async () => {
    try {
      const [{ products: bestDeals }, { products: allProducts }] = await Promise.all([
        getProductsByCollection("best-deals", 50).catch(() => ({ products: [] })),
        getProducts({ first: 50 }).catch(() => ({ products: [] })),
      ]);

      // Deduplicate products
      const seenIds = new Set<string>();
      const combined: Product[] = [];

      for (const p of [...bestDeals, ...allProducts]) {
        const id = p.id || p.handle;
        if (id && !seenIds.has(id) && (p.stockQuantity ?? 1) > 0 && p.availableForSale !== false) {
          seenIds.add(id);
          combined.push(p);
        }
      }

      return { products: combined };
    } catch (err) {
      console.warn("[offers loader error]:", err);
      return { products: [] };
    }
  },
  component: OffersPage,
});

function OffersPage() {
  const { products } = Route.useLoaderData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  const paginatedOffers = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link
            to="/"
            className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[#FF5B00] font-medium">Offers</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-foreground">Latest Offers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {products.length} exclusive deals & offers
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 p-8 shadow-xs">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No offers available right now</h3>
            <p className="text-sm text-gray-500 mb-6">Check back soon for new special deals.</p>
            <Link
              to="/shop"
              className="bg-[#FF5B00] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E55200] transition-colors shadow-sm"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginatedOffers.map((product) => (
              <ProductCard key={product.id || product.handle} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 md:gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-[#FF5B00] hover:text-[#FF5B00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 md:gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#FF5B00] text-white"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {String(pageNum).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-[#FF5B00] hover:text-[#FF5B00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
