import { createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import ProductCard from "@/components/home/ProductCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ChevronDown, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/data/home";
import pCatfood from "@/assets/p-catfood.png";
import pTreats from "@/assets/p-treats.png";
import pPads from "@/assets/p-pads.png";
import pSupplement from "@/assets/p-supplement.png";
import pLitterbox from "@/assets/p-litterbox.png";
import pLitter from "@/assets/p-litter.png";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Petpedia" },
      { name: "description", content: "Browse our extensive collection of pet products." },
    ],
  }),
  component: Shop,
});

const shopProducts: Product[] = [
  { id: "s1", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pTreats, badges: [{ label: "HOT", tone: "hot" }] },
  { id: "s2", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pSupplement, badges: [{ label: "32% OFF", tone: "off" }, { label: "HOT", tone: "hot" }] },
  { id: "s3", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pLitterbox, badges: [{ label: "SALE", tone: "sale" }] },
  { id: "s4", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pLitter, badges: [{ label: "32% OFF", tone: "off" }] },
  { id: "s5", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [] },
  { id: "s6", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pSupplement, badges: [] },
  { id: "s7", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pPads, badges: [] },
  { id: "s8", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [] },
  { id: "s9", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [{ label: "HOT", tone: "hot" }] },
  { id: "s10", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [{ label: "32% OFF", tone: "off" }, { label: "HOT", tone: "hot" }] },
  { id: "s11", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [{ label: "SALE", tone: "sale" }] },
  { id: "s12", title: "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat", price: 800, mrp: 900, rating: 4, reviews: 740, image: pCatfood, badges: [{ label: "32% OFF", tone: "off" }] },
];

const filters = [
  {
    title: "PET TYPE",
    items: [
      { id: "dogs", label: "Dogs", count: 214 },
      { id: "cats", label: "Cats", count: 14 },
      { id: "rabbits", label: "Rabbits", count: 25 },
      { id: "hamsters", label: "Hamsters", count: 37 },
      { id: "guinea-pigs", label: "Guinea Pigs", count: 24 },
      { id: "birds", label: "Birds", count: 78 },
      { id: "fish", label: "Fish", count: 112 },
      { id: "small-pets", label: "Small Pets", count: 37 },
      { id: "others", label: "Others", count: 78 },
    ],
  }
];

const accordionFilters = [
  "AVAILABILITY",
  "PRICE",
  "PRODUCT CATEGORIES",
  "BREED SIZE",
  "PRODUCT TYPE",
  "SHOP BY BREED",
  "SHOP BY CONCERN",
  "COLOR",
  "FLAVOR",
  "WEIGHT",
  "PET LIFE STAGES",
  "SPECIAL DIET",
  "SIZES"
];

function ShopFilters() {
  return (
    <Accordion type="multiple" defaultValue={["PET TYPE"]} className="w-full">
      {accordionFilters.slice(0, 2).map((title) => (
         <AccordionItem value={title} key={title} className="border-b border-[#E5DCCF]">
          <AccordionTrigger className="text-[13px] font-bold text-foreground py-5 uppercase tracking-wide hover:no-underline">{title}</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 text-sm text-muted-foreground">Filter options...</div>
          </AccordionContent>
        </AccordionItem>
      ))}

      <AccordionItem value="PET TYPE" className="border-b border-[#E5DCCF]">
        <AccordionTrigger className="text-[13px] font-bold text-foreground py-5 uppercase tracking-wide hover:no-underline">PET TYPE</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-3 pb-2 pt-1">
            {filters[0].items.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Checkbox id={item.id} className="border-[#D1C8BA] data-[state=checked]:bg-[#FF5B00] data-[state=checked]:border-[#FF5B00] rounded-sm w-4 h-4" />
                  <label htmlFor={item.id} className="text-[15px] font-medium text-foreground/80 leading-none cursor-pointer group-hover:text-foreground">
                    {item.label}
                  </label>
                </div>
                <span className="text-[13px] text-muted-foreground">({item.count})</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

       {accordionFilters.slice(2).map((title) => (
         <AccordionItem value={title} key={title} className="border-b border-[#E5DCCF]">
          <AccordionTrigger className="text-[13px] font-bold text-foreground py-5 uppercase tracking-wide hover:no-underline">{title}</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 text-sm text-muted-foreground">Filter options...</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function Shop() {
  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      <SiteHeader />
      
      {/* Breadcrumb section */}
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
                <BreadcrumbLink href="#" className="text-muted-foreground">Category</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#FF5B00] font-medium">Products List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ShopFilters />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter & Sort Row (also Search on Mobile) */}
            <div className="flex flex-col gap-4 mb-6 lg:mb-8">
              {/* Desktop Search & Sort */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="relative w-full lg:w-96">
                    <Input 
                      placeholder="Search for anything..." 
                      className="w-full bg-white border-0 h-11 pl-4 pr-10 rounded-md shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#FF5B00]" 
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                 </div>
                 
                 <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="lg:hidden flex items-center gap-2 bg-white px-4 h-11 rounded-md shadow-sm text-sm font-medium border border-border/50">
                          <SlidersHorizontal className="h-4 w-4" />
                          Filter
                        </button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[85vw] max-w-[400px] overflow-y-auto bg-[#FDF9F3]">
                        <SheetHeader className="mb-4">
                          <SheetTitle className="text-left font-bold text-xl">Filter By</SheetTitle>
                        </SheetHeader>
                        <ShopFilters />
                      </SheetContent>
                    </Sheet>
                    
                    <div className="flex items-center gap-2 bg-white h-11 px-4 rounded-md shadow-sm">
                      <span className="text-[13px] font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">Most Popular</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Active Filters Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF4E9] rounded-md px-4 py-3 border border-[#F4E1D0]">
                 <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-muted-foreground">Active Product :</span>
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                      <span className="text-[13px] font-semibold text-foreground leading-none">Dogs</span>
                      <button className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                 </div>
                 <div className="text-[14px] font-medium text-muted-foreground">
                   <strong className="text-foreground font-bold">65,867</strong> Results found.
                 </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {shopProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 lg:mt-16 flex justify-center items-center gap-2">
               <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF5B00] text-[#FF5B00] transition-colors hover:bg-[#FF5B00] hover:text-white">
                 <ChevronLeft className="h-5 w-5" />
               </button>
               <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5B00] text-white font-bold text-sm">
                 01
               </button>
               {['02', '03', '04', '05', '06'].map(num => (
                 <button key={num} className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white shadow-sm text-foreground font-medium text-sm transition-colors hover:border-[#FF5B00] hover:text-[#FF5B00]">
                   {num}
                 </button>
               ))}
               <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF5B00] text-[#FF5B00] transition-colors hover:bg-[#FF5B00] hover:text-white">
                 <ChevronRight className="h-5 w-5" />
               </button>
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
