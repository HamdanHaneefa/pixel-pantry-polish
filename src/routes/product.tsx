import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Star, ShoppingBag } from "lucide-react";
import { columnProducts } from "@/data/home";
import ProductOverview from "@/components/home/ProductOverview";
import ReviewModal from "@/components/home/ReviewModal";
import { getProductByHandle } from "@/lib/shopify/products";

const productSearchSchema = z.object({
  handle: z.string().optional(),
});

export const Route = createFileRoute("/product")({
  validateSearch: (search) => productSearchSchema.parse(search),
  loaderDeps: ({ search: { handle } }) => ({ handle }),
  loader: async ({ deps: { handle } }) => {
    const { product, isLiveShopify } = await getProductByHandle(handle || "hp1");
    return { product, isLiveShopify };
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
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
            <ProductOverview product={product} />

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
                REVIEWS ({product?.reviews || 740})
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
                {/* Top Section */}
                <div className="flex flex-col md:flex-row gap-8 md:items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold text-foreground">
                      {product?.rating || 4.9}
                    </span>
                    <div className="flex text-[#FF5B00] mt-2 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product?.reviews || 52677})
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 max-w-sm mx-auto md:mx-0">
                    {[
                      { star: 5, val: 120, pct: 100 },
                      { star: 4, val: 79, pct: 60 },
                      { star: 3, val: 56, pct: 40 },
                      { star: 2, val: 0, pct: 0 },
                      { star: 1, val: 0, pct: 0 },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-3 text-right">
                          {row.star}
                        </span>
                        <Star className="h-3.5 w-3.5 text-[#FF5B00] fill-current shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-foreground" style={{ width: `${row.pct}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-6 text-right">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[18px] font-bold text-foreground">Customer Reviews</h3>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="h-9 px-4 bg-[#FF5B00] text-white text-[13px] font-bold rounded-md hover:bg-[#E55200] transition-colors cursor-pointer"
                    >
                      WRITE REVIEW
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {[
                      {
                        name: "Floyd Miles",
                        time: "1 day ago",
                        title: "Best products with fast delivery experience",
                        comment:
                          "My pet loves this so much! Quality is excellent, packaging was super neat and secure. Will definitely buy regularly!",
                      },
                      {
                        name: "Kristin Watson",
                        time: "3 days ago",
                        title: "Superb quality and authentic!",
                        comment:
                          "Very happy with this purchase. Genuine product and fast delivery to my doorstep.",
                      },
                    ].map((rev, i) => (
                      <div key={i} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-[#FFE5D9] flex items-center justify-center font-bold text-[#FF5B00]">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-foreground leading-none mb-1">
                              {rev.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{rev.time}</p>
                          </div>
                        </div>
                        <p className="text-[14px] font-bold text-foreground mb-1.5">{rev.title}</p>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recommended Products */}
        <div className="mt-16 md:mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-[24px] font-bold text-foreground">Recommended Products</h2>
            <a
              href="/shop"
              className="text-[13px] md:text-[15px] font-medium text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5"
            >
              Browse All Product &rarr;
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {columnProducts[0]?.items.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
        </>
        )}
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
    </div>
  );
}
