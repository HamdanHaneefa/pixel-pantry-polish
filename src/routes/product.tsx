import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import ProductCard from "@/components/home/ProductCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ChevronDown, Heart, Share2, Scale, Star, Minus, Plus, HelpCircle, Copy, Facebook, Instagram } from "lucide-react";
import { columnProducts } from "@/data/home";
import ProductOverview from "@/components/home/ProductOverview";
import ReviewModal from "@/components/home/ReviewModal";

export const Route = createFileRoute("/product")({
  component: ProductDetail,
});

function ProductDetail() {
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop" className="text-muted-foreground">Featured Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#FF5B00] font-medium">Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">
        {/* Top Section: Gallery & Info */}
        <ProductOverview />

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
                value="info"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF5B00] data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                MORE INFORMATION
              </TabsTrigger>
              <TabsTrigger 
                value="review"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF5B00] data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 text-[13px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                REVIEW
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-8">
              <h3 className="text-[15px] font-bold text-foreground mb-4">Key Health Benefits</h3>
              <ul className="list-disc pl-5 space-y-2.5 text-[14px] text-muted-foreground max-w-4xl">
                <li><strong className="font-medium text-foreground">Brain & Vision Development:</strong> Taurine and Omega-3 DHA foster sharp eyesight and optimal cognitive function.</li>
                <li><strong className="font-medium text-foreground">Immune System Support:</strong> Vitamin E and antioxidant-rich ingredients work together to strengthen natural defenses.</li>
                <li><strong className="font-medium text-foreground">Digestive Wellness:</strong> Prebiotics, fructo-oligosaccharides, and beet pulp promote gut balance and optimal nutrient absorption.</li>
                <li><strong className="font-medium text-foreground">Bone & Muscle Growth:</strong> Packed with 30% min protein and essential minerals like calcium to support robust physical growth.</li>
                <li><strong className="font-medium text-foreground">Grain-Free & Allergen-Friendly:</strong> Formulated completely without soy, corn, or wheat to minimize food sensitivity risks and support easy digestion.</li>
                <li><strong className="font-medium text-foreground">High-Quality Marine Protein:</strong> Real sardine and mackerel provide essential amino acids required for healthy lean muscle mass.</li>
                <li><strong className="font-medium text-foreground">Radiant Coat & Skin Health:</strong> Rich sources of Omega fatty acids from fish oil, salmon oil, and chicken oil maintain skin hydration and a glossy fur coat.</li>
                <li><strong className="font-medium text-foreground">Natural Defense & Cellular Health:</strong> Hydrolyzed yeast provides beta-glucans, working alongside Rosemary Extract to combat cellular oxidation.</li>
                <li><strong className="font-medium text-foreground">Heart Health & Vitality:</strong> High levels of taurine support optimal cardiac function and maintain high energy levels throughout active kittenhood.</li>
                <li><strong className="font-medium text-foreground">Balanced Metabolic Function:</strong> Essential B-complex vitamins (B1, B6, B12, Niacin, Biotin) help convert food efficiently into day-long energy.</li>
                <li><strong className="font-medium text-foreground">Superior Nutrient Absorption:</strong> Chelated minerals (like Zinc, Copper, and Manganese proteinates) ensure maximum bioavailability for growing bodies.</li>
                <li><strong className="font-medium text-foreground">Controlled Stool & Odor Management:</strong> Natural plant fibers like powdered cellulose help regulate stool consistency and support intestinal transit.</li>
              </ul>
            </TabsContent>
            <TabsContent value="features" className="pt-8 text-muted-foreground">Key features content.</TabsContent>
            <TabsContent value="info" className="pt-8 text-muted-foreground">More information content.</TabsContent>
            <TabsContent value="review" className="pt-8">
              <div className="bg-transparent md:bg-white md:rounded-xl md:border md:border-border/60 md:p-8">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row gap-8 md:items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold text-foreground">4.9</span>
                    <div className="flex text-[#FF5B00] mt-2 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(52,677)</span>
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
                        <span className="text-sm font-medium text-muted-foreground w-3 text-right">{row.star}</span>
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
                    <h3 className="text-[18px] font-bold text-foreground">33 Comments</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="h-9 px-4 bg-[#FF5B00] text-white text-[13px] font-bold rounded-md hover:bg-[#E55200] transition-colors"
                      >
                        WRITE REVIEW
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden md:block">Sort by:</span>
                        <select className="h-9 px-3 bg-white border border-border/60 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#FF5B00]">
                          <option>Most Recent</option>
                          <option>Most Popular</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-[#FFE5D9] flex items-center justify-center">
                            <svg className="h-6 w-6 text-[#FF9E79]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-foreground leading-none mb-1">{i === 1 ? 'Floyd Miles' : 'Kristin Watson'}</p>
                            <p className="text-xs text-muted-foreground">1 days ago</p>
                          </div>
                        </div>
                        <p className="text-[14px] font-bold text-foreground mb-1.5">Best products with best delivery experience</p>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                          Best delivery experience!Go for itt!!My cat loves the food so much its quality is excellent with an excellent container!.Amazon is my favourite app without any hesitation!
                        </p>
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
            <a href="/shop" className="text-[13px] md:text-[15px] font-medium text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
              Browse All Product &rarr;
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {/* Just grabbing some products from the recommended list */}
            {columnProducts[0].items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {columnProducts[1].items.slice(0, 2).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
    </div>
  );
}
