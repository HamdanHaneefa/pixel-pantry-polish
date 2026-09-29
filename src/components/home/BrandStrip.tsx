import SectionHeading from "./SectionHeading";
import { brands as defaultBrands } from "@/data/home";
import type { SponsorBrand } from "@/lib/admin/sponsors";

interface BrandStripProps {
  sponsors?: SponsorBrand[];
}

export default function BrandStrip({ sponsors }: BrandStripProps) {
  const displayBrands = Array.isArray(sponsors) ? sponsors : defaultBrands;
  if (!displayBrands || displayBrands.length === 0) return null;

  // Build a duplicated list for seamless, infinite horizontal marquee scrolling on mobile
  const baseItems =
    displayBrands.length < 4
      ? [...displayBrands, ...displayBrands, ...displayBrands]
      : displayBrands;

  const marqueeList = [...baseItems, ...baseItems];

  return (
    <section className="bg-background py-6 md:py-10 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />

        {/* Mobile View: Horizontal Slow Automatic Scrolling Marquee */}
        <div className="relative -mx-4 overflow-hidden py-1 sm:hidden">
          {/* Subtle gradient edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent" />

          <div className="animate-brand-marquee flex items-center gap-3 px-4">
            {marqueeList.map((b, idx) => {
              const brandLink = b.link || `/shop?vendor=${encodeURIComponent(b.name)}`;
              return (
                <a
                  key={`${b.id || b.name}-m-${idx}`}
                  href={brandLink}
                  className="flex h-[74px] w-[132px] shrink-0 items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 shadow-[0_2px_8px_#FCECE0] active:scale-95 transition-transform"
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      width={140}
                      height={60}
                      loading="lazy"
                      className="max-h-[75%] max-w-[80%] object-contain select-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent && !parent.querySelector(".brand-fallback-text")) {
                          const span = document.createElement("span");
                          span.className =
                            "brand-fallback-text text-center text-xs font-bold tracking-tight text-foreground/80";
                          span.innerText = b.name;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-center text-xs font-bold tracking-tight text-foreground/80">
                      {b.name}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Tablet & Desktop View: Structured Responsive Centered Flex/Grid */}
        <div className="hidden sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
          {displayBrands.map((b) => {
            const brandLink = b.link || `/shop?vendor=${encodeURIComponent(b.name)}`;
            return (
              <a
                key={b.id || b.name}
                href={brandLink}
                className="group flex h-[80px] sm:h-[90px] md:h-[100px] w-[130px] sm:w-[145px] md:w-[160px] lg:w-[170px] shrink-0 items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 md:p-4 shadow-[0_2px_8px_#FCECE0] hover:shadow-[0_4px_14px_rgba(249,115,22,0.15)] hover:border-[#f97316]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                {b.logo ? (
                  <img
                    src={b.logo}
                    alt={b.name}
                    width={180}
                    height={80}
                    loading="lazy"
                    className="max-h-[80%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector(".brand-fallback-text")) {
                        const span = document.createElement("span");
                        span.className =
                          "brand-fallback-text text-center text-sm font-bold tracking-tight text-foreground/80";
                        span.innerText = b.name;
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-center text-sm font-bold tracking-tight text-foreground/80 group-hover:text-primary transition-colors">
                    {b.name}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}