import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import heroPets from "@/assets/hero-pets.jpg";
import hero2 from "@/assets/hero-2.jpg";

const SLIDES = [
  {
    image: heroPets,
    eyebrow: "Happy Pets. Happier You.",
    title: ["Everything for", "Your Pet"],
    sub: "Quality products. Better care.",
    bg: "oklch(0.944 0.031 63)",
  },
  {
    image: hero2,
    eyebrow: "Fresh Stock. Every Week.",
    title: ["Play More.", "Worry Less."],
    sub: "Toys, treats and daily essentials.",
    bg: "oklch(0.94 0.04 160)",
  },
  {
    image: heroPets,
    eyebrow: "Vet Approved Nutrition.",
    title: ["Healthy Bowls,", "Wagging Tails"],
    sub: "Top brands at the best prices.",
    bg: "oklch(0.945 0.03 250)",
  },
];

function PawMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="18" cy="18" rx="7" ry="9" />
      <ellipse cx="34" cy="13" rx="7" ry="9.5" />
      <ellipse cx="49" cy="21" rx="6.5" ry="8.5" />
      <path d="M32 28c8 0 15 6.5 15 13.5S40 55 32 55s-15-5.5-15-13.5S24 28 32 28Z" />
    </svg>
  );
}

export default function HeroCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
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
    <section className="relative bg-background pt-3 pb-2 md:pt-4">
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl md:rounded-3xl" ref={emblaRef}>
          <div className="flex">
            {SLIDES.map((slide, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                <div
                  className="relative overflow-hidden rounded-2xl md:rounded-3xl"
                  style={{ backgroundColor: slide.bg }}
                >
                  <div className="grid items-center md:grid-cols-[1fr_1.05fr]">
                    <div className="relative z-10 px-5 py-7 md:px-12 md:py-14">
                      <p className="flex items-center gap-2 text-[15px] font-medium text-foreground/80 md:text-xl">
                        {slide.eyebrow}
                        <span className="text-primary">⚡</span>
                      </p>
                      <h1 className="mt-1.5 text-[28px] leading-[1.08] font-extrabold tracking-tight text-foreground md:mt-3 md:text-[58px]">
                        {slide.title[0]}
                        <br />
                        <span className="inline-flex items-center gap-3">
                          {slide.title[1]}
                          <Heart
                            className="h-5 w-5 text-primary md:h-11 md:w-11"
                            strokeWidth={2.2}
                          />
                        </span>
                      </h1>
                      <p className="mt-2 text-[13px] text-foreground/70 md:mt-4 md:text-xl">
                        {slide.sub}
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_oklch(0.638_0.221_36.5)] transition-transform hover:scale-[1.02] md:mt-7 md:px-8 md:py-4 md:text-lg"
                      >
                        Shop Now <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                      </a>
                      <PawMark className="pointer-events-none absolute bottom-4 left-6 h-8 w-8 text-primary/15 md:h-14 md:w-14" />
                    </div>
                    <div className="relative h-[180px] md:h-[420px]">
                      <img
                        src={slide.image}
                        alt="Happy pets with Petpedia products"
                        width={1600}
                        height={900}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover"
                      />
                      <PawMark className="pointer-events-none absolute top-6 left-2 hidden h-12 w-12 text-primary/20 md:block" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          aria-label="Previous slide"
          onClick={prev}
          className="absolute top-1/2 left-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-lg transition-colors hover:bg-secondary md:flex"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          aria-label="Next slide"
          onClick={next}
          className="absolute top-1/2 right-1 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-lg transition-colors hover:bg-secondary md:flex"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>

        <div className="mt-3 flex justify-center gap-1.5 md:hidden">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => embla?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                selected === i ? "w-4 bg-primary" : "w-1.5 bg-primary/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}