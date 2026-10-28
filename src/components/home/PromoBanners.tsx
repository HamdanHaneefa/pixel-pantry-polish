import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_HOMEPAGE_CONTENT, type PromoCard } from "@/data/homepageContent";

export default function PromoBanners({
  cards = DEFAULT_HOMEPAGE_CONTENT.promoCards,
}: {
  cards?: PromoCard[];
}) {
  // Duplicate the cards so the looping carousel always has enough slides to fill the row
  const slides = cards.length < 6 ? [...cards, ...cards] : cards;

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
    <section className="bg-background py-5 md:py-10">
      <div
        className="group/scroller relative mx-auto max-w-[1440px] px-4 md:px-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Embla carousel viewport */}
        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex -ml-3 sm:-ml-4 md:-ml-5">
            {slides.map((banner, i) => (
              <div
                key={`${banner.id}-${i}`}
                className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%] pl-3 sm:pl-4 md:pl-5"
              >
                <a
                  href={banner.link}
                  className="group relative block w-full overflow-hidden rounded-2xl md:rounded-[22px] ring-1 ring-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_-12px_rgba(0,0,0,0.22)] select-none cursor-pointer"
                  style={{ backgroundColor: banner.bgColor }}
                  aria-label={banner.title}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    width={1350}
                    height={1200}
                    loading={i < 3 ? "eager" : "lazy"}
                    draggable={false}
                    className="w-full h-auto aspect-[9/8] object-cover block select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.03]"
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
          className="absolute top-[calc(50%-14px)] left-0 md:left-1 lg:-left-1 z-20 hidden h-10 w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5 opacity-0 transition-all duration-200 group-hover/scroller:opacity-100 hover:bg-primary hover:text-primary-foreground hover:ring-primary focus-visible:opacity-100 active:scale-95 sm:flex"
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
          className="absolute top-[calc(50%-14px)] right-0 md:right-1 lg:-right-1 z-20 hidden h-10 w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5 opacity-0 transition-all duration-200 group-hover/scroller:opacity-100 hover:bg-primary hover:text-primary-foreground hover:ring-primary focus-visible:opacity-100 active:scale-95 sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Pagination Dots */}
        <div className="mt-5 md:mt-6 flex justify-center items-center gap-1.5">
          {cards.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Go to ${banner.title}`}
              onClick={(e) => {
                e.preventDefault();
                embla?.scrollTo(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                selected % cards.length === i
                  ? "w-7 bg-primary"
                  : "w-2 bg-foreground/15 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
