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
import { bestsellers, hotPicks } from "@/data/home";

export const Route = createFileRoute("/")({
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <h1 className="sr-only">Petpedia — everything for your pet</h1>
        <HeroCarousel />
        <CategoryStrip />
        <ProductRail title="Hot Picks Of The Week" action="Browse All Product" products={hotPicks} />
        <PromoBanners />
        <ShopByAnimal />
        <ProductRail title="Bestsellers" action="View All" products={bestsellers} />
        <BrandStrip />
        <PetStarBanner />
        <ProductColumns />
        <ShopByStore />
        <Testimonials />
      </main>
      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
