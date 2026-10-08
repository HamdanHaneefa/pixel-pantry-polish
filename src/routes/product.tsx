import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import ProductCard from "@/components/home/ProductCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ShoppingBag, CheckCircle2 } from "lucide-react";
import { columnProducts, type Product } from "@/data/home";
import ProductOverview from "@/components/home/ProductOverview";
import ReviewModal from "@/components/home/ReviewModal";
import { getProductByHandle, getProducts } from "@/lib/shopify/products";
import { optimizeShopifyImage } from "@/lib/utils";
import {
  getProductReviewsFn,
  type ProductReview,
  type ProductRatingSummary,
} from "@/lib/reviews";

const productSearchSchema = z.object({
  handle: z.string().optional(),
});

function formatReviewDate(isoString?: string): string {
  if (!isoString) return "Recently";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

export const Route = createFileRoute("/product")({
  staleTime: 0,
  gcTime: 0,
  shouldReload: () => true,
  validateSearch: (search) => productSearchSchema.parse(search),
  loaderDeps: ({ search: { handle } }) => ({ handle }),
  loader: async ({ deps: { handle } }) => {
    try {
      const { product, isLiveShopify } = await getProductByHandle(handle || "hp1");

      let initialReviews: ProductReview[] = [];
      let initialSummary: ProductRatingSummary = {
        rating: 0,
        reviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };

      if (product) {
        try {
          const res = await getProductReviewsFn({
            data: { productId: product.id, handle: product.handle },
          });
          if (res) {
            initialReviews = res.reviews || [];
            initialSummary = res.summary || initialSummary;
            product.rating = initialSummary.rating;
            product.reviews = initialSummary.reviews;
          }
        } catch (err) {
          console.warn("[product reviews loader error]:", err);
        }
      }

      let recommended: Product[] = [];
      try {
        const recData = await getProducts({ first: 6 });
        recommended = (recData?.products || [])
          .filter((p) => p.id !== product?.id && p.handle !== product?.handle)
          .slice(0, 5);
      } catch {
        // fallback
      }

      return { product, isLiveShopify, initialReviews, initialSummary, recommended };
    } catch (err) {
      console.warn("[product loader error]:", err);
      return {
        product: null,
        isLiveShopify: false,
        initialReviews: [],
        initialSummary: { rating: 0, reviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
        recommended: [],
      };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.product?.title || "Product Detail"} — Petpedia`,
      },
      {
        name: "description",
        content:
          loaderData?.product?.description ||
          "Premium pet food, treats, accessories, and grooming essentials.",
      },
    ],
    links: loaderData?.product?.image
      ? [
          {
            rel: "preload",
            as: "image",
            href: optimizeShopifyImage(loaderData.product.image, 700),
            fetchPriority: "high",
          },
        ]
      : [],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { product, initialReviews, initialSummary, recommended } = Route.useLoaderData();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews || []);
  const [summary, setSummary] = useState<ProductRatingSummary>(
    initialSummary || { rating: 0, reviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  );

  // Sync state if navigation changes to a different product
  useEffect(() => {
    setReviews(initialReviews || []);
    setSummary(
      initialSummary || { rating: 0, reviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
    );
  }, [product?.id, initialReviews, initialSummary]);

  const handleReviewSubmitted = (newReview: ProductReview, newSummary: ProductRatingSummary) => {
    setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
    setSummary(newSummary);
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      <SiteHeader />

      {/* Breadcrumbs */}
      <div className="bg-[#FFF4E9] py-4">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop" className="text-muted-foreground">
                  Shop Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#FF5B00] font-medium line-clamp-1 max-w-[300px] md:max-w-md">
                  {product?.title || "Product Detail"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        {!product ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Available</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              This product is currently hidden, unavailable, or has been removed from the catalog.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-xs"
            >
              Browse Available Products
            </a>
          </div>
        ) : (
          <>
            {/* Top Section: Gallery & Info */}
            <ProductOverview
              product={{
                ...product,
                rating: summary.rating,
                reviews: summary.reviews,
              }}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
            />

            {/* Tabs Section */}
            <div className="mt-16 md:mt-24 border-t border-border/60 pt-10">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/50 rounded-none overflow-x-auto no-scrollbar gap-8">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF5B00] data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    PRODUCT DETAILS
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF5B00] data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    KEY FEATURES
                  </TabsTrigger>
                  <TabsTrigger
                    value="review"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF5B00] data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    REVIEWS ({summary.reviews})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-8">
                  {product?.descriptionHtml ? (
                    <div
                      className="prose max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                  ) : (
                    <>
                      <h3 className="text-[15px] font-bold text-foreground mb-4">Key Health Benefits</h3>
                      <ul className="list-disc pl-5 space-y-2.5 text-[14px] text-muted-foreground max-w-4xl">
                        <li>
                          <strong className="font-medium text-foreground">Brain & Vision Development:</strong>{" "}
                          Taurine and Omega-3 DHA foster sharp eyesight and optimal cognitive function.
                        </li>
                        <li>
                          <strong className="font-medium text-foreground">Immune System Support:</strong>{" "}
                          Vitamin E and antioxidant-rich ingredients work together to strengthen natural defenses.
                        </li>
                        <li>
                          <strong className="font-medium text-foreground">Digestive Wellness:</strong>{" "}
                          Prebiotics, fructo-oligosaccharides, and beet pulp promote gut balance and optimal nutrient absorption.
                        </li>
                        <li>
                          <strong className="font-medium text-foreground">Bone & Muscle Growth:</strong>{" "}
                          Packed with high quality protein and essential minerals to support robust physical growth.
                        </li>
                        <li>
                          <strong className="font-medium text-foreground">High-Quality Protein:</strong> Real
                          ingredients provide essential amino acids required for healthy lean muscle mass.
                        </li>
                      </ul>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="features" className="pt-8 text-muted-foreground">
                  <div className="space-y-4 max-w-3xl text-[14px]">
                    <p>• 100% Genuine, Authenticated Pet Care Product.</p>
                    <p>• Safe, Vet-recommended ingredients formulation.</p>
                    <p>• Carefully packaged to ensure maximum freshness & safety during transit.</p>
                  </div>
                </TabsContent>
                <TabsContent value="review" className="pt-8">
                  <div className="bg-transparent md:bg-white md:rounded-xl md:border md:border-border/60 md:p-8">
                    {/* Top Summary Section */}
                    <div className="flex flex-col md:flex-row gap-8 md:items-center pb-8 border-b border-border/40">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold text-foreground">
                          {summary.reviews > 0 ? summary.rating.toFixed(1) : "0.0"}
                        </span>
                        <div className="flex text-[#FF5B00] mt-2 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                summary.reviews > 0 && i <= Math.round(summary.rating)
                                  ? "fill-current"
                                  : "text-slate-300 stroke-current fill-transparent"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({summary.reviews} {summary.reviews === 1 ? "review" : "reviews"})
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 max-w-sm mx-auto md:mx-0">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = summary.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
                          const pct =
                            summary.reviews > 0 ? Math.round((count / summary.reviews) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground w-3 text-right">
                                {star}
                              </span>
                              <Star className="h-3.5 w-3.5 text-[#FF5B00] fill-current shrink-0" />
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#FF5B00] transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-[18px] font-bold text-foreground">Customer Reviews</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {summary.reviews > 0
                              ? `Showing ${reviews.length} authentic customer ${
                                  reviews.length === 1 ? "review" : "reviews"
                                }`
                              : "Be the first to leave feedback"}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsReviewModalOpen(true)}
                          className="h-9 px-4 bg-[#FF5B00] text-white text-[13px] font-bold rounded-lg hover:bg-[#E55200] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          WRITE REVIEW
                        </button>
                      </div>

                      {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FFF8F4] rounded-2xl border border-[#FFE8DC] p-8">
                          <div className="w-12 h-12 rounded-full bg-[#FFE7D9] flex items-center justify-center mb-3">
                            <Star className="h-6 w-6 text-[#FF5B00]" />
                          </div>
                          <h4 className="text-base font-bold text-foreground mb-1">No Reviews Yet</h4>
                          <p className="text-sm text-muted-foreground max-w-sm mb-5">
                            Have you purchased this item? Share your thoughts with other pet parents to help them decide!
                          </p>
                          <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="h-10 px-6 bg-[#FF5B00] text-white font-bold text-[13px] rounded-lg hover:bg-[#E55200] transition-colors shadow-xs cursor-pointer"
                          >
                            WRITE THE FIRST REVIEW
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {reviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="border-b border-border/50 pb-6 last:border-0 last:pb-0"
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-[#FFE5D9] flex items-center justify-center font-bold text-[#FF5B00] shrink-0 text-sm">
                                    {rev.author.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[14px] font-bold text-foreground leading-none">
                                        {rev.author}
                                      </p>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatReviewDate(rev.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex text-[#FF5B00]">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-3.5 w-3.5 ${
                                        s <= rev.rating
                                          ? "fill-current"
                                          : "text-slate-200 stroke-current fill-transparent"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[14px] font-bold text-foreground mb-1.5">{rev.title}</p>
                              <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
                                {rev.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Recommended Products */}
            <div className="mt-16 md:mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-[24px] font-bold text-foreground">
                  Recommended Products
                </h2>
                <a
                  href="/shop"
                  className="text-[13px] md:text-[15px] font-medium text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5"
                >
                  Browse All Product &rarr;
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                {(recommended.length > 0 ? recommended : columnProducts[0]?.items || []).map(
                  (prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  )
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product?.id}
        productHandle={product?.handle}
        productTitle={product?.title}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
