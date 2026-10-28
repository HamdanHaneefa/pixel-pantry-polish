/**
 * Admin-editable homepage content (hero slides, promo cards, feature banner, testimonials).
 *
 * The admin only stores sections it has edited; anything missing falls back to the
 * built-in defaults below, so the storefront looks the same until a section is customised.
 */
import heroBanner1 from "@/assets/hero-banner-1.webp";
import heroBanner2 from "@/assets/hero-banner-2.webp";
import heroBanner3 from "@/assets/hero-banner-3.webp";
import heroBanner1Mob from "@/assets/hero-banner-1-mob.webp";
import heroBanner2Mob from "@/assets/hero-banner-2-mob.webp";
import heroBanner3Mob from "@/assets/hero-banner-3-mob.webp";
import promoPetbey from "@/assets/promo-petbey.webp";
import promoBeteRoyale from "@/assets/promo-beteroyale.webp";
import promoPetfuel from "@/assets/promo-petfuel.webp";
import promoBlue from "@/assets/promo-blue.jpg";
import promoTeal from "@/assets/promo-teal.jpg";
import storeFashion from "@/assets/store-fashion.webp";
import storeMonsoon from "@/assets/store-monsoon.webp";
import animalDog from "@/assets/animal-dog.webp";
import animalPuppy from "@/assets/animal-puppy.webp";
import animalCat from "@/assets/animal-cat.webp";

export interface HeroSlide {
  id: string;
  image: string;
  mobileImage?: string | undefined;
  alt: string;
  link: string;
  btnText: string;
  btnColor: string;
  showButton: boolean;
  /** Show the button on mobile too (some banner artwork has no room for it). */
  showButtonOnMobile: boolean;
  /** Fine-tuned Tailwind positions for the built-in artwork; custom slides use a standard spot. */
  desktopBtnPos?: string | undefined;
  mobileBtnPos?: string | undefined;
}

export interface PromoCard {
  id: string;
  title: string;
  image: string;
  link: string;
  bgColor: string;
}

export interface FeatureBanner {
  enabled: boolean;
  image: string;
  bgColor: string;
  accentColor: string;
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  offerLabel: string;
  offerValue: string;
  offerSuffix: string;
  btnText: string;
  link: string;
}

export interface Testimonial {
  id: string;
  name: string;
  image: string;
  /** Optional YouTube link or direct video (.mp4/.webm) URL; enables the play button. */
  videoUrl?: string | undefined;
}

export interface TestimonialsSection {
  title: string;
  items: Testimonial[];
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  promoCards: PromoCard[];
  featureBanner: FeatureBanner;
  testimonials: TestimonialsSection;
}

export type HomepageSectionKey = keyof HomepageContent;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroSlides: [
    {
      id: "hero-1",
      image: heroBanner2,
      mobileImage: heroBanner2Mob,
      alt: "Happy Pets. Happier You. Everything for Your Pet",
      link: "/shop",
      btnText: "Shop Now",
      btnColor: "#FF5500",
      showButton: true,
      showButtonOnMobile: true,
      desktopBtnPos: "md:top-auto md:bottom-[12%] md:left-[6.8%]",
      mobileBtnPos: "top-auto bottom-[15%] left-[8%]",
    },
    {
      id: "hero-2",
      image: heroBanner1,
      mobileImage: heroBanner1Mob,
      alt: "PAWSITIVE CHOICES, HAPPIER LIVES - Everything Your Pet Needs",
      link: "/shop",
      btnText: "Shop Now",
      btnColor: "#0284C7",
      showButton: true,
      showButtonOnMobile: false,
      desktopBtnPos: "md:top-auto md:bottom-[9%] md:left-[3.8%]",
    },
    {
      id: "hero-3",
      image: heroBanner3,
      mobileImage: heroBanner3Mob,
      alt: "First Order Special - 30% OFF On Your First Order - Code: FIRST30",
      link: "/shop",
      btnText: "Shop Now",
      btnColor: "#059669",
      showButton: true,
      showButtonOnMobile: false,
      desktopBtnPos: "md:top-auto md:bottom-[9%] md:left-[4.8%]",
    },
  ],
  promoCards: [
    {
      id: "petbey",
      title: "Petbey — Online Pet Marketplace",
      image: promoPetbey,
      link: "/shop",
      bgColor: "#FAF5EE",
    },
    {
      id: "bete-royale",
      title: "Bête Royale — Pets Accessories",
      image: promoBeteRoyale,
      link: "/shop?category=accessories",
      bgColor: "#3B1123",
    },
    {
      id: "petfuel",
      title: "petFuel — Good Food, Clean Care, Happy Pets",
      image: promoPetfuel,
      link: "/shop?category=food",
      bgColor: "#FFF3E2",
    },
  ],
  featureBanner: {
    enabled: true,
    image: promoBlue,
    bgColor: "#1E40AF",
    accentColor: "#FACC15",
    headingLine1: "Nutrition for",
    headingLine2: "Happy Tails",
    subtitle: "Balanced food for a strong start in life.",
    offerLabel: "FLAT",
    offerValue: "20%",
    offerSuffix: "OFF",
    btnText: "SHOP NOW",
    link: "/shop",
  },
  testimonials: {
    title: "Testimonials from Petpedia",
    items: [
      { id: "t-1", name: "Ananya S.", image: storeFashion },
      { id: "t-2", name: "Rahul M.", image: promoTeal },
      { id: "t-3", name: "Priya K.", image: storeMonsoon },
      { id: "t-4", name: "Vikram D.", image: animalDog },
      { id: "t-5", name: "Arjun P.", image: animalPuppy },
      { id: "t-6", name: "Sara L.", image: animalCat },
    ],
  },
};

/** Merge stored (possibly partial) content over the defaults. */
export function resolveHomepageContent(stored?: Partial<HomepageContent> | null): HomepageContent {
  const s = stored || {};
  return {
    heroSlides: s.heroSlides?.length ? s.heroSlides : DEFAULT_HOMEPAGE_CONTENT.heroSlides,
    promoCards: s.promoCards?.length ? s.promoCards : DEFAULT_HOMEPAGE_CONTENT.promoCards,
    featureBanner: s.featureBanner
      ? { ...DEFAULT_HOMEPAGE_CONTENT.featureBanner, ...s.featureBanner }
      : DEFAULT_HOMEPAGE_CONTENT.featureBanner,
    testimonials: s.testimonials
      ? { ...DEFAULT_HOMEPAGE_CONTENT.testimonials, ...s.testimonials }
      : DEFAULT_HOMEPAGE_CONTENT.testimonials,
  };
}

/** Turn a YouTube watch/short/share link into an embeddable URL; returns null for non-YouTube links. */
export function toYouTubeEmbedUrl(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}
