import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  toYouTubeEmbedUrl,
  type Testimonial,
  type TestimonialsSection,
} from "@/data/homepageContent";

export default function Testimonials({
  section = DEFAULT_HOMEPAGE_CONTENT.testimonials,
}: {
  section?: TestimonialsSection;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", dragFree: true });
  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);
  const [playing, setPlaying] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  if (section.items.length === 0) return null;

  const embedUrl = playing?.videoUrl ? toYouTubeEmbedUrl(playing.videoUrl) : null;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="mb-5 flex items-center justify-between md:mb-7">
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-[26px]">
            {section.title}
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
            {section.items.map((c) => {
              const hasVideo = Boolean(c.videoUrl);
              const content = (
                <>
                  <img
                    src={c.image}
                    alt={`${c.name} shares their Petpedia experience`}
                    width={512}
                    height={683}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {hasVideo && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/90 text-primary-foreground transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      </span>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-left text-xs font-semibold text-white">
                    {c.name}
                  </span>
                </>
              );
              const cls =
                "group relative aspect-[3/4] w-[46%] shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-[30%] md:w-[13.6%]";
              return hasVideo ? (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPlaying(c)}
                  className={`${cls} cursor-pointer`}
                  aria-label={`Play testimonial from ${c.name}`}
                >
                  {content}
                </button>
              ) : (
                <div key={c.id} className={cls}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video player modal */}
      {playing?.videoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPlaying(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Testimonial from ${playing.name}`}
        >
          <div
            className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPlaying(null)}
              aria-label="Close video"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Testimonial from ${playing.name}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-[9/16] w-full"
              />
            ) : (
              <video
                src={playing.videoUrl}
                poster={playing.image}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] w-full bg-black object-contain"
              />
            )}
            <p className="px-4 py-3 text-sm font-semibold text-white">{playing.name}</p>
          </div>
        </div>
      )}
    </section>
  );
}
