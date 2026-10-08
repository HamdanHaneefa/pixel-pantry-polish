import { createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import HeroCarousel, { heroBanner2, heroBanner2Mob } from "@/components/home/HeroCarousel";
import CategoryStrip from "@/components/home/CategoryStrip";
import ProductRail from "@/components/home/ProductRail";
import PromoBanners from "@/components/home/PromoBanners";
import ShopByAnimal from "@/components/home/ShopByAnimal";
import BrandStrip from "@/components/home/BrandStrip";
import PetStarBanner from "@/components/home/PetStarBanner";
import ProductColumns from "@/components/home/ProductColumns";
import ShopByStore from "@/components/home/ShopByStore";
import Testimonials from "@/components/home/Testimonials";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { getProducts, getCollections, getProductsByCollection } from "@/lib/shopify/products";
import { Product } from "@/data/home";
import { getSponsorsFn } from "@/lib/admin/sponsors";

export const Route = createFileRoute("/")({
  staleTime: 0,
  gcTime: 0,
  shouldReload: () => true,
  loader: async () => {
    // Fetch live Bestsellers, Hot Picks, New Arrivals, Collections, and Sponsors concurrently
    const [
      { products: allProducts, isLiveShopify },
      { products: bestsellersByCollection },
      { products: hotPicksByCollection },
      { products: newArrivals },
      { collections },
      sponsors,
    ] = await Promise.all([
      getProducts({ first: 30 }),
      getProductsByCollection("best-deals", 8),
      getProductsByCollection("hot-picks", 8),
      getProducts({ sortKey: "CREATED_AT", reverse: true, first: 6 }),
      getCollections(50),
      getSponsorsFn().catch(() => []),
    ]);

    // Filter strictly for in-stock items
    const inStockAll = allProducts.filter((p) => (p.stockQuantity ?? 1) > 0 && p.availableForSale !== false);
    const inStockHotPicks = hotPicksByCollection.filter((p) => (p.stockQuantity ?? 1) > 0 && p.availableForSale !== false);
    const inStockBestsellers = bestsellersByCollection.filter((p) => (p.stockQuantity ?? 1) > 0 && p.availableForSale !== false);
    const inStockNew = newArrivals.filter((p) => (p.stockQuantity ?? 1) > 0 && p.availableForSale !== false);

    // Live Hot Picks rail
    const liveHotPicks: Product[] =
      inStockHotPicks.length >= 2
        ? inStockHotPicks.slice(0, 5)
        : inStockAll.slice(0, 5);

    // Live Bestsellers rail
    const liveBestsellers: Product[] =
      inStockBestsellers.length >= 2
        ? inStockBestsellers.slice(0, 5)
        : inStockAll.length > 5
        ? inStockAll.slice(5, 10)
        : inStockAll.slice(0, 5);

    // Dynamic 4-column product section
    const liveColumns = [
      {
        title: "Recommended Products",
        items: inStockAll.slice(0, 3),
      },
      {
        title: "Top Rated",
        items: inStockAll.length > 3 ? inStockAll.slice(3, 6) : inStockAll.slice(0, 3),
      },
      {
        title: "New Arrival",
        items: inStockNew.length >= 1 ? inStockNew.slice(0, 3) : inStockAll.slice(0, 3),
      },
      {
        title: "Most Ordered",
        items:
          inStockBestsellers.length >= 1
            ? inStockBestsellers.slice(0, 3)
            : inStockAll.slice(0, 3),
      },
    ];

    return {
      liveHotPicks,
      liveBestsellers,
      liveColumns,
      liveCollections: collections,
      isLiveShopify,
      sponsors,
    };
  },
  head: () => ({
    meta: [
      { title: "Petpedia — Everything for Your Pet | Food, Toys & Care" },
      {
        name: "description",
        content:
          "Shop premium pet food, toys, grooming and health essentials for dogs, cats, birds and small pets. Top brands, daily deals and fast delivery across India.",
      },
      { property: "og:title", content: "Petpedia — Everything for Your Pet" },
      {
        property: "og:description",
        content:
          "Happy pets, happier you. Quality pet products, trusted brands and better care — delivered across India.",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroBanner2,
        media: "(min-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: heroBanner2Mob,
        media: "(max-width: 767px)",
        fetchPriority: "high",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { liveHotPicks, liveBestsellers, liveColumns, liveCollections, sponsors } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <h1 className="sr-only">Petpedia — everything for your pet</h1>
        <HeroCarousel />
        <CategoryStrip categories={liveCollections} />
        <ProductRail
          title="Hot Picks Of The Week"
          action="Browse All Product"
          products={liveHotPicks}
        />
        <PromoBanners />
        <ShopByAnimal animals={liveCollections} />
        <ProductRail
          title="Bestsellers"
          action="View All"
          products={liveBestsellers}
        />
        <BrandStrip sponsors={sponsors} />
        <PetStarBanner />
        <ProductColumns columns={liveColumns} />
        <ShopByStore />
        <Testimonials />
      </main>
      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
