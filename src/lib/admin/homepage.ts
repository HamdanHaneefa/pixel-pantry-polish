import { createServerFn } from "@tanstack/react-start";
import { adminAuthMiddleware } from "./auth";
import { storageGet, storageSet } from "@/lib/storage/adapter";
import type {
  FeatureBanner,
  HeroSlide,
  HomepageContent,
  HomepageSectionKey,
  PromoCard,
  Testimonial,
  TestimonialsSection,
} from "@/data/homepageContent";

const STORAGE_KEY = "homepage-content";
const MAX_ITEMS = 12;

let inMemoryContent: Partial<HomepageContent> | null = null;

async function loadContent(): Promise<Partial<HomepageContent>> {
  const loaded = await storageGet<Partial<HomepageContent>>(STORAGE_KEY, inMemoryContent || {});
  inMemoryContent = loaded || {};
  return inMemoryContent;
}

// ---------------------------------------------------------------------------
// Validation helpers — everything stored here is rendered on the public homepage.
// ---------------------------------------------------------------------------

function text(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function color(value: unknown, fallback: string): string {
  const v = text(value, 9);
  return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback;
}

/** Images: site-relative paths, http(s) URLs, or inline data:image URIs from the upload fallback. */
function imageUrl(value: unknown): string {
  const v = text(value, 8 * 1024 * 1024);
  if (/^data:image\/(png|jpe?g|webp|gif|avif|svg\+xml);base64,/i.test(v)) return v;
  if (/^https?:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")))
    return v.slice(0, 2000);
  return "";
}

/** Links: site-relative paths or http(s) URLs only (blocks javascript: etc.). */
function link(value: unknown, fallback = "/shop"): string {
  const v = text(value, 500);
  if (/^https?:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//"))) return v;
  return fallback;
}

function id(value: unknown, prefix: string, index: number): string {
  const v = text(value, 60).replace(/[^a-zA-Z0-9_-]/g, "");
  return v || `${prefix}-${Date.now().toString(36)}-${index}`;
}

function list<T>(value: unknown, map: (item: any, i: number) => T | null): T[] {
  if (!Array.isArray(value)) throw new Error("Expected a list of items");
  return value
    .slice(0, MAX_ITEMS)
    .map(map)
    .filter((x): x is T => x !== null);
}

function sanitizeHeroSlides(data: unknown): HeroSlide[] {
  const slides = list<HeroSlide>(data, (s, i) => {
    const image = imageUrl(s?.image);
    if (!image) return null;
    return {
      id: id(s?.id, "hero", i),
      image,
      mobileImage: imageUrl(s?.mobileImage) || undefined,
      alt: text(s?.alt, 200) || "Petpedia banner",
      link: link(s?.link),
      btnText: text(s?.btnText, 40) || "Shop Now",
      btnColor: color(s?.btnColor, "#FF5500"),
      showButton: s?.showButton !== false,
      showButtonOnMobile: s?.showButtonOnMobile !== false,
      // Positions are only kept for the built-in artwork (they're compiled Tailwind classes).
      desktopBtnPos: /^hero-[123]$/.test(s?.id)
        ? text(s?.desktopBtnPos, 120) || undefined
        : undefined,
      mobileBtnPos: /^hero-[123]$/.test(s?.id)
        ? text(s?.mobileBtnPos, 120) || undefined
        : undefined,
    };
  });
  if (slides.length === 0) throw new Error("Add at least one hero slide with an image");
  return slides;
}

function sanitizePromoCards(data: unknown): PromoCard[] {
  const cards = list<PromoCard>(data, (c, i) => {
    const image = imageUrl(c?.image);
    if (!image) return null;
    return {
      id: id(c?.id, "promo", i),
      title: text(c?.title, 120) || "Promotion",
      image,
      link: link(c?.link),
      bgColor: color(c?.bgColor, "#FFF3E2"),
    };
  });
  if (cards.length === 0) throw new Error("Add at least one promo card with an image");
  return cards;
}

function sanitizeFeatureBanner(b: any): FeatureBanner {
  const image = imageUrl(b?.image);
  if (!image) throw new Error("The feature banner needs a background image");
  return {
    enabled: b?.enabled !== false,
    image,
    bgColor: color(b?.bgColor, "#1E40AF"),
    accentColor: color(b?.accentColor, "#FACC15"),
    headingLine1: text(b?.headingLine1, 60),
    headingLine2: text(b?.headingLine2, 60),
    subtitle: text(b?.subtitle, 160),
    offerLabel: text(b?.offerLabel, 20),
    offerValue: text(b?.offerValue, 12),
    offerSuffix: text(b?.offerSuffix, 20),
    btnText: text(b?.btnText, 30) || "SHOP NOW",
    link: link(b?.link),
  };
}

function sanitizeTestimonials(t: any): TestimonialsSection {
  const items = list<Testimonial>(t?.items, (item, i) => {
    const image = imageUrl(item?.image);
    if (!image) return null;
    const video = text(item?.videoUrl, 500);
    return {
      id: id(item?.id, "t", i),
      name: text(item?.name, 60) || "Happy customer",
      image,
      videoUrl: /^https?:\/\//i.test(video) ? video : undefined,
    };
  });
  return { title: text(t?.title, 80) || "Testimonials from Petpedia", items };
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

/** Public: returns only the sections the admin has customised (merge with defaults client-side). */
export const getHomepageContentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Partial<HomepageContent>> => {
    return await loadContent();
  },
);

interface SaveSectionPayload {
  section: HomepageSectionKey;
  /** New value for the section, or null to restore the built-in default. */
  value: unknown;
}

export const saveHomepageSectionFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((data: SaveSectionPayload) => data)
  .handler(async ({ data }) => {
    try {
      const current = { ...(await loadContent()) };

      if (data.value === null) {
        delete current[data.section];
      } else {
        switch (data.section) {
          case "heroSlides":
            current.heroSlides = sanitizeHeroSlides(data.value);
            break;
          case "promoCards":
            current.promoCards = sanitizePromoCards(data.value);
            break;
          case "featureBanner":
            current.featureBanner = sanitizeFeatureBanner(data.value);
            break;
          case "testimonials":
            current.testimonials = sanitizeTestimonials(data.value);
            break;
          default:
            throw new Error("Unknown homepage section");
        }
      }

      inMemoryContent = current;
      await storageSet(STORAGE_KEY, current);
      return { success: true as const, content: current };
    } catch (err: any) {
      return { success: false as const, error: err?.message || "Failed to save homepage content" };
    }
  });
