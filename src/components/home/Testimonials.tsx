import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import promoTeal from "@/assets/promo-teal.jpg";
import storeFashion from "@/assets/store-fashion.png";
import storeMonsoon from "@/assets/store-monsoon.png";
import animalDog from "@/assets/animal-dog.png";
import animalPuppy from "@/assets/animal-puppy.png";
import animalCat from "@/assets/animal-cat.png";

const CLIPS = [
  { image: storeFashion, name: "Ananya S." },
  { image: promoTeal, name: "Rahul M." },
  { image: storeMonsoon, name: "Priya K." },
  { image: animalDog, name: "Vikram D." },
  { image: animalPuppy, name: "Arjun P." },
  { image: animalCat, name: "Sara L." },
];

export default function Testimonials() {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", dragFree: true });
  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="mb-5 flex items-center justify-between md:mb-7">
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-[26px]">
            Testimonials from Petpedia
          </h2>
          <div className="flex gap-2">
            <button
              aria-label="Previous testimonials"
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md hover:bg-secondary md:h-11 md:w-11"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next testimonials"
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md hover:bg-secondary md:h-11 md:w-11"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {CLIPS.map((c) => (
              <button
                key={c.name}
                className="group relative aspect-[3/4] w-[46%] shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-[30%] md:w-[13.6%]"
                aria-label={`Play testimonial from ${c.name}`}
              >
                <img
                  src={c.image}
                  alt={`${c.name} shares her Petpedia experience`}
                  width={512}
                  height={683}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}