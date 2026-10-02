import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroBanner1 from "@/assets/hero-banner-1.webp";
import heroBanner2 from "@/assets/hero-banner-2.webp";
import heroBanner3 from "@/assets/hero-banner-3.webp";
import heroBanner2Mob from "@/assets/hero-banner-2-mob.webp";
import heroBanner1Mob from "@/assets/hero-banner-1-mob.webp";
import heroBanner3Mob from "@/assets/hero-banner-3-mob.webp";

export { heroBanner2, heroBanner2Mob };

const SLIDES = [
  {
    image: heroBanner2,
    mobileImage: heroBanner2Mob,
    alt: "Happy Pets. Happier You. Everything for Your Pet",
    link: "/shop",
    btnText: "Shop Now",
    btnClass: "bg-[#FF5500] text-white hover:bg-[#E04B00] shadow-[0_4px_16px_rgba(255,85,0,0.35)]",
    desktopBtnPos: "md:top-auto md:bottom-[12%] md:left-[6.8%]",
    mobileBtnPos: "top-auto bottom-[15%] left-[8%]",
  },
  {
    image: heroBanner1,
    mobileImage: heroBanner1Mob,
    alt: "PAWSITIVE CHOICES, HAPPIER LIVES - Everything Your Pet Needs",
    link: "/shop",
    btnText: "Shop Now",
    btnClass: "bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-[0_4px_16px_rgba(2,132,199,0.35)]",
    desktopBtnPos: "md:top-auto md:bottom-[9%] md:left-[3.8%]",
    mobileBtnPos: "hidden md:inline-flex",
  },
  {
    image: heroBanner3,
    mobileImage: heroBanner3Mob,
    alt: "First Order Special - 30% OFF On Your First Order - Code: PETPEDIA30",
    link: "/shop",
    btnText: "Shop Now",
    btnClass: "bg-[#059669] text-white hover:bg-[#047857] shadow-[0_4px_16px_rgba(5,150,105,0.35)]",
    desktopBtnPos: "md:top-auto md:bottom-[9%] md:left-[4.8%]",
    mobileBtnPos: "hidden md:inline-flex",
  },
];

export default function HeroCarousel() {
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
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className="min-w-0 flex-[0_0_86%] sm:flex-[0_0_88%] md:flex-[0_0_90%] lg:flex-[0_0_90%] pl-2 sm:pl-2.5 md:pl-3"
              >
                <div className="group relative block w-full aspect-[444/372] md:aspect-[1024/365] overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[28px] bg-secondary shadow-sm select-none transition-all duration-300">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.mobileImage || slide.image}
                    />
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
                  <Link
                    to={slide.link}
                    className="absolute inset-0 z-5 md:hidden"
                    aria-label={slide.alt}
                  />

                  {/* Interactive Shop Now Button Overlay - Only this button navigates */}
                  <Link
                    to={slide.link}
                    className={`absolute ${slide.mobileBtnPos} ${slide.desktopBtnPos} z-10 inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-bold tracking-tight transition-all duration-200 hover:scale-[1.04] active:scale-95 ${slide.btnClass}`}
                  >
                    {slide.btnText}
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
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
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                embla?.scrollTo(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                selected === i
                  ? "w-5 bg-[#FF5500]"
                  : "w-2 bg-[#FFD4B8] hover:bg-[#FFB88E]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}