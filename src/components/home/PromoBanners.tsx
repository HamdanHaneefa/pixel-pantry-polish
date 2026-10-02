import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import promoPetbey from "@/assets/promo-petbey.webp";
import promoBeteRoyale from "@/assets/promo-beteroyale.webp";
import promoPetfuel from "@/assets/promo-petfuel.webp";

const PROMO_BANNERS = [
  {
    id: "petbey",
    title: "Petbey — Online Pet Marketplace",
    image: promoPetbey,
    link: "/shop",
    bgColor: "#FAF5EE",
    alt: "Petbey Online Pet Marketplace - Find, Buy, Care. Healthy pets, happy homes.",
  },
  {
    id: "bete-royale",
    title: "Bête Royale — Pets Accessories",
    image: promoBeteRoyale,
    link: "/shop?category=accessories",
    bgColor: "#3B1123",
    alt: "Bête Royale Pets Accessories - Comfort, style and care for your furry friends.",
  },
  {
    id: "petfuel",
    title: "petFuel — Good Food, Clean Care, Happy Pets",
    image: promoPetfuel,
    link: "/shop?category=food",
    bgColor: "#FFF3E2",
    alt: "petFuel - Good Food, Clean Care, Happy Pets. Premium pet food and grooming.",
  },
];

export default function PromoBanners() {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!embla) return;

    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();

    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  // Gentle autoplay rotation every 5s, paused when user is hovering
  useEffect(() => {
    if (!embla || isHovered) return;

    const interval = setInterval(() => {
      embla.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [embla, isHovered]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="bg-background py-4 md:py-8">
      <div
        className="group/scroller relative mx-auto max-w-[1440px] px-4 md:px-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Embla carousel viewport */}
        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex -ml-3 sm:-ml-4 md:-ml-6">
            {PROMO_BANNERS.map((banner, i) => (
              <div
                key={banner.id}
                className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(50%-12px)] pl-3 sm:pl-4 md:pl-6"
              >
                <a
                  href={banner.link}
                  className="group relative block w-full overflow-hidden rounded-lg md:rounded-xl shadow-sm transition-all duration-300 hover:shadow-md select-none cursor-pointer"
                  style={{ backgroundColor: banner.bgColor }}
                  aria-label={banner.title}
                >
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    width={1350}
                    height={1200}
                    loading={i < 2 ? "eager" : "lazy"}
                    draggable={false}
                    className="w-full h-auto aspect-[9/8] object-contain block select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          aria-label="Previous promo banner"
          onClick={(e) => {
            e.preventDefault();
            prev();
          }}
          className="absolute top-1/2 left-6 md:left-11 z-20 hidden h-10 w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg border border-black/5 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Next promo banner"
          onClick={(e) => {
            e.preventDefault();
            next();
          }}
          className="absolute top-1/2 right-6 md:right-11 z-20 hidden h-10 w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg border border-black/5 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Pagination Dots */}
        <div className="mt-3.5 md:mt-4 flex justify-center items-center gap-2">
          {PROMO_BANNERS.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Go to ${banner.title}`}
              onClick={(e) => {
                e.preventDefault();
                embla?.scrollTo(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                selected === i
                  ? "w-6 bg-primary"
                  : "w-2 bg-primary/25 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}