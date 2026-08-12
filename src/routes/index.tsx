import { createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import HeroCarousel from "@/components/home/HeroCarousel";
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

export const Route = createFileRoute("/")({
  loader: async () => {
    // Fetch live Bestsellers, Hot Picks, New Arrivals, and Collections concurrently
    const [
      { products: allProducts, isLiveShopify },
      { products: bestsellersByCollection },
      { products: hotPicksByCollection },
      { products: newArrivals },
      { collections },
    ] = await Promise.all([
      getProducts({ first: 30 }),
      getProductsByCollection("best-deals", 8),
      getProductsByCollection("hot-picks", 8),
      getProducts({ sortKey: "CREATED_AT", reverse: true, first: 6 }),
      getCollections(50),
    ]);

    // Live Hot Picks rail
    const liveHotPicks: Product[] =
      hotPicksByCollection.length >= 3
        ? hotPicksByCollection.slice(0, 5)
        : allProducts.slice(0, 5);

    // Live Bestsellers rail (automatically populated from Shopify Best Deals / Bestsellers)
    const liveBestsellers: Product[] =
      bestsellersByCollection.length >= 3
        ? bestsellersByCollection.slice(0, 5)
        : allProducts.slice(5, 10);

    // Dynamic 4-column product section
    const liveColumns = [
      {
        title: "Recommended Products",
        items: allProducts.slice(0, 3),
      },
      {
        title: "Top Rated",
        items: allProducts.slice(3, 6),
      },
      {
        title: "New Arrival",
        items: newArrivals.length >= 3 ? newArrivals.slice(0, 3) : allProducts.slice(6, 9),
      },
      {
        title: "Most Ordered",
        items:
          bestsellersByCollection.length >= 3
            ? bestsellersByCollection.slice(0, 3)
            : allProducts.slice(9, 12),
      },
    ];

    return {
      liveHotPicks,
      liveBestsellers,
      liveColumns,
      liveCollections: collections,
      isLiveShopify,
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
  }),
  component: Index,
});

function Index() {
  const { liveHotPicks, liveBestsellers, liveColumns, liveCollections } = Route.useLoaderData();

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
        <BrandStrip />
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
