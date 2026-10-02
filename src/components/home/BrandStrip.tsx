import SectionHeading from "./SectionHeading";
import { brands as defaultBrands } from "@/data/home";
import type { SponsorBrand } from "@/lib/admin/sponsors";

interface BrandStripProps {
  sponsors?: SponsorBrand[];
}

export default function BrandStrip({ sponsors }: BrandStripProps) {
  const displayBrands = Array.isArray(sponsors) && sponsors.length > 0 ? sponsors : defaultBrands;
  if (!displayBrands || displayBrands.length === 0) return null;

  // Build a seamless list for infinite marquee scrolling across all screen sizes
  const baseItems =
    displayBrands.length < 6
      ? [...displayBrands, ...displayBrands, ...displayBrands, ...displayBrands]
      : displayBrands.length < 12
      ? [...displayBrands, ...displayBrands]
      : displayBrands;

  const marqueeList = [...baseItems, ...baseItems];

  return (
    <section className="bg-background py-6 md:py-10 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />

        {/* Unified Continuous Smooth Auto-Scrolling Marquee on All Screen Sizes */}
        <div className="relative -mx-4 md:-mx-8 overflow-hidden py-2">
          {/* Subtle gradient edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 md:w-28 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 md:w-28 bg-gradient-to-l from-background to-transparent" />

          <div className="animate-brand-marquee flex items-center gap-3.5 sm:gap-4 md:gap-5 px-4 md:px-8">
            {marqueeList.map((b, idx) => {
              const brandLink = b.link || `/shop?vendor=${encodeURIComponent(b.name)}`;
              return (
                <a
                  key={`${b.id || b.name}-${idx}`}
                  href={brandLink}
                  className="flex h-[76px] sm:h-[86px] md:h-[96px] w-[132px] sm:w-[148px] md:w-[164px] shrink-0 select-none items-center justify-center rounded-md border border-[#FCECE0] bg-white p-2.5 sm:p-3 md:p-3.5 shadow-[0_2px_8px_#FCECE0] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(249,115,22,0.12)] hover:border-[#f97316]/40 cursor-pointer"
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      width={180}
                      height={80}
                      loading="lazy"
                      draggable={false}
                      className="max-h-[84%] max-w-[88%] w-auto h-auto object-contain select-none pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent && !parent.querySelector(".brand-fallback-text")) {
                          const span = document.createElement("span");
                          span.className =
                            "brand-fallback-text text-center text-xs sm:text-sm font-bold tracking-tight text-foreground/80";
                          span.innerText = b.name;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-center text-xs sm:text-sm font-bold tracking-tight text-foreground/80 select-none">
                      {b.name}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}