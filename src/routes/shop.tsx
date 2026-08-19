import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ChevronDown, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { getProducts, getCollections } from "@/lib/shopify/products";

const shopSearchSchema = z.object({
  q: z.string().optional(),
  pet: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => shopSearchSchema.parse(search),
  loaderDeps: ({ search: { q, pet, category } }) => ({ q, pet, category }),
  loader: async ({ deps: { q, pet, category } }) => {
    const queryParts = [q, pet, category].filter(Boolean);
    const query = queryParts.join(" ");

    const [{ products, isLiveShopify }, { collections }] = await Promise.all([
      getProducts({
        query: query || undefined,
        first: 100,
      }),
      getCollections(50),
    ]);

    return {
      products,
      collections,
      isLiveShopify,
      query: q || "",
      activePet: pet || "",
      activeCategory: category || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Premium Pet Products — Petpedia" },
      { name: "description", content: "Browse our extensive collection of pet foods, treats, toys, and care essentials." },
    ],
  }),
  component: Shop,
});

const PET_TYPES = [
  { id: "dogs", label: "Dogs" },
  { id: "cats", label: "Cats" },
  { id: "rabbits", label: "Rabbits" },
  { id: "hamsters", label: "Hamsters" },
  { id: "guinea-pigs", label: "Guinea Pigs" },
  { id: "birds", label: "Birds" },
  { id: "fish", label: "Fish" },
  { id: "small-pets", label: "Small Pets" },
  { id: "others", label: "Others" },
];

const CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "toys", label: "Toys" },
  { id: "accessories", label: "Accessories" },
  { id: "grooming", label: "Grooming" },
  { id: "travel", label: "Travel" },
  { id: "beds", label: "Bedding" },
  { id: "pet-care", label: "Pet Care" },
  { id: "health", label: "Health" },
];

function ShopFilters({
  activePet,
  activeCategory,
  onSelectPet,
  onSelectCategory,
}: {
  activePet: string;
  activeCategory: string;
  onSelectPet: (pet: string) => void;
  onSelectCategory: (cat: string) => void;
}) {
  return (
    <Accordion type="multiple" defaultValue={["PET TYPE", "PRODUCT CATEGORIES"]} className="w-full">
      <AccordionItem value="PET TYPE" className="border-b border-[#E5DCCF]">
        <AccordionTrigger className="text-[13px] font-bold text-foreground py-5 uppercase tracking-wide hover:no-underline">
          PET TYPE
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-3 pb-2 pt-1">
            {PET_TYPES.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => onSelectPet(activePet === item.id ? "" : item.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={item.id}
                    checked={activePet === item.id}
                    className="border-[#D1C8BA] data-[state=checked]:bg-[#FF5B00] data-[state=checked]:border-[#FF5B00] rounded-sm w-4 h-4"
                  />
                  <label
                    htmlFor={item.id}
                    className="text-[15px] font-medium text-foreground/80 leading-none cursor-pointer group-hover:text-foreground"
                  >
                    {item.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="PRODUCT CATEGORIES" className="border-b border-[#E5DCCF]">
        <AccordionTrigger className="text-[13px] font-bold text-foreground py-5 uppercase tracking-wide hover:no-underline">
          PRODUCT CATEGORIES
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-3 pb-2 pt-1">
            {CATEGORIES.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => onSelectCategory(activeCategory === item.id ? "" : item.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`cat-${item.id}`}
                    checked={activeCategory === item.id}
                    className="border-[#D1C8BA] data-[state=checked]:bg-[#FF5B00] data-[state=checked]:border-[#FF5B00] rounded-sm w-4 h-4"
                  />
                  <label
                    htmlFor={`cat-${item.id}`}
                    className="text-[15px] font-medium text-foreground/80 leading-none cursor-pointer group-hover:text-foreground"
                  >
                    {item.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Shop() {
  const { products, query, activePet, activeCategory } = Route.useLoaderData();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(query);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        q: searchInput.trim() || undefined,
      }),
    });
  };

  const handlePetFilter = (pet: string) => {
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        pet: pet || undefined,
      }),
    });
  };

  const handleCategoryFilter = (category: string) => {
    navigate({
      to: "/shop",
      search: (prev) => ({
        ...prev,
        category: category || undefined,
      }),
    });
  };

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
                  Shop
                </BreadcrumbLink>
              </BreadcrumbItem>
              {activePet && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-muted-foreground capitalize">{activePet}</span>
                  </BreadcrumbItem>
                </>
              )}
              {activeCategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-muted-foreground capitalize">{activeCategory}</span>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#FF5B00] font-medium">
                  Products List
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ShopFilters
              activePet={activePet}
              activeCategory={activeCategory}
              onSelectPet={handlePetFilter}
              onSelectCategory={handleCategoryFilter}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter & Search Row */}
            <div className="flex flex-col gap-4 mb-6 lg:mb-8">
              {/* Desktop Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products (e.g. Dog Food, Brush)..."
                    className="w-full bg-white border-0 h-11 pl-4 pr-10 rounded-md shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#FF5B00]"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                    <Search className="h-5 w-5 text-muted-foreground/60 hover:text-[#FF5B00]" />
                  </button>
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="lg:hidden flex items-center gap-2 bg-white px-4 h-11 rounded-md shadow-sm text-sm font-medium border border-border/50 cursor-pointer">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[400px] overflow-y-auto bg-[#FDF9F3]">
                      <SheetHeader className="mb-4">
                        <SheetTitle className="text-left font-bold text-xl">Filter By</SheetTitle>
                      </SheetHeader>
                      <ShopFilters
                        activePet={activePet}
                        activeCategory={activeCategory}
                        onSelectPet={handlePetFilter}
                        onSelectCategory={handleCategoryFilter}
                      />
                    </SheetContent>
                  </Sheet>

                  <div className="flex items-center gap-2 bg-white h-11 px-4 rounded-md shadow-sm">
                    <span className="text-[13px] font-medium text-muted-foreground whitespace-nowrap">
                      Sort by:
                    </span>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
                        Featured
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF4E9] rounded-md px-4 py-3 border border-[#F4E1D0]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Active Filters:
                  </span>
                  {activePet && (
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                      <span className="text-[13px] font-semibold text-foreground leading-none capitalize">
                        Pet: {activePet}
                      </span>
                      <button
                        onClick={() => handlePetFilter("")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {activeCategory && (
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                      <span className="text-[13px] font-semibold text-foreground leading-none capitalize">
                        Category: {activeCategory}
                      </span>
                      <button
                        onClick={() => handleCategoryFilter("")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {query && (
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                      <span className="text-[13px] font-semibold text-foreground leading-none">
                        "{query}"
                      </span>
                      <button
                        onClick={() => {
                          setSearchInput("");
                          navigate({ to: "/shop", search: (p) => ({ ...p, q: undefined }) });
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {!activePet && !activeCategory && !query && (
                    <span className="text-xs text-muted-foreground italic">All Catalog</span>
                  )}
                </div>
                <div className="text-[14px] font-medium text-muted-foreground">
                  <strong className="text-foreground font-bold">{products.length}</strong> Products
                  found.
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-border/40 my-6">
                <h3 className="text-lg font-bold text-foreground mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try searching with different keywords or clearing active filters.
                </p>
                <button
                  onClick={() => {
                    setSearchInput("");
                    navigate({ to: "/shop", search: () => ({}) });
                  }}
                  className="bg-[#FF5B00] text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-[#E55200] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-10 lg:mt-16 flex justify-center items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF5B00] text-[#FF5B00] transition-colors hover:bg-[#FF5B00] hover:text-white cursor-pointer">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5B00] text-white font-bold text-sm">
                  01
                </button>
                {["02", "03"].map((num) => (
                  <button
                    key={num}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white shadow-sm text-foreground font-medium text-sm transition-colors hover:border-[#FF5B00] hover:text-[#FF5B00] cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF5B00] text-[#FF5B00] transition-colors hover:bg-[#FF5B00] hover:text-white cursor-pointer">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
