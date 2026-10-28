import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { DEFAULT_HOMEPAGE_CONTENT, type HeroSlide } from "@/data/homepageContent";

export default function HeroCarousel({
  slides = DEFAULT_HOMEPAGE_CONTENT.heroSlides,
}: {
  slides?: HeroSlide[];
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    const id = setInterval(() => embla.scrollNext(), 6000);
    return () => {
      clearInterval(id);
      embla.off("select", onSelect);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="relative w-full overflow-hidden bg-background pt-1.5 pb-0 md:pt-3 md:pb-1">
      <div className="relative w-full overflow-hidden px-0">
        {/* Embla carousel viewport with seamless side peek */}
        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex -ml-2 sm:-ml-2.5 md:-ml-3">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="min-w-0 flex-[0_0_86%] sm:flex-[0_0_88%] md:flex-[0_0_90%] lg:flex-[0_0_90%] pl-2 sm:pl-2.5 md:pl-3"
              >
                <div className="group relative block w-full aspect-[444/372] md:aspect-[1024/365] overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[28px] bg-secondary shadow-sm select-none transition-all duration-300">
                  <picture>
                    <source media="(max-width: 767px)" srcSet={slide.mobileImage || slide.image} />
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      width={1024}
                      height={365}
                      draggable={false}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding={i === 0 ? "sync" : "async"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01] pointer-events-none select-none"
                    />
                  </picture>

                  {/* On mobile, tap anywhere on the banner to navigate */}
                  <a
                    href={slide.link}
                    className="absolute inset-0 z-5 md:hidden"
                    aria-label={slide.alt}
                  />

                  {/* Interactive Shop Now Button Overlay - Only this button navigates */}
                  {slide.showButton && (
                    <a
                      href={slide.link}
                      style={{
                        backgroundColor: slide.btnColor,
                        boxShadow: `0 4px 16px color-mix(in srgb, ${slide.btnColor} 35%, transparent)`,
                      }}
                      className={`absolute ${
                        slide.showButtonOnMobile
                          ? `inline-flex ${slide.mobileBtnPos || "bottom-[10%] left-[6%]"}`
                          : "hidden md:inline-flex"
                      } ${slide.desktopBtnPos || "md:bottom-[10%] md:left-[5%]"} z-10 items-center justify-center gap-1.5 md:gap-2 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-bold tracking-tight text-white transition-all duration-200 hover:scale-[1.04] hover:brightness-95 active:scale-95`}
                    >
                      {slide.btnText}
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={(e) => {
            e.preventDefault();
            prev();
          }}
          className="absolute top-1/2 left-2 sm:left-3 md:left-4 lg:left-6 z-20 hidden h-10 w-10 lg:h-11 lg:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 md:flex"
        >
          <ChevronLeft className="h-5 w-5 lg:h-5 lg:w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={(e) => {
            e.preventDefault();
            next();
          }}
          className="absolute top-1/2 right-2 sm:right-3 md:right-4 lg:right-6 z-20 hidden h-10 w-10 lg:h-11 lg:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 md:flex"
        >
          <ChevronRight className="h-5 w-5 lg:h-5 lg:w-5" />
        </button>

        {/* Mobile Pagination Dots */}
        <div className="mt-3 flex justify-center items-center gap-1.5 md:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                embla?.scrollTo(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                selected === i ? "w-5 bg-[#FF5500]" : "w-2 bg-[#FFD4B8] hover:bg-[#FFB88E]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
