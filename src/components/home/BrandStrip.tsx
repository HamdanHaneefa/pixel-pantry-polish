import SectionHeading from "./SectionHeading";
import { brands as defaultBrands } from "@/data/home";
import type { SponsorBrand } from "@/lib/admin/sponsors";

interface BrandStripProps {
  sponsors?: SponsorBrand[];
}

export default function BrandStrip({ sponsors }: BrandStripProps) {
  const displayBrands = Array.isArray(sponsors) ? sponsors : defaultBrands;
  if (!displayBrands || displayBrands.length === 0) return null;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 sm:gap-4 md:gap-5">
          {displayBrands.map((b) => (
            <div
              key={b.id || b.name}
              className="flex h-[80px] sm:h-[90px] md:h-[100px] w-full items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 md:p-4 shadow-[0_2px_8px_#FCECE0] transition-shadow duration-200"
            >
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={b.name}
                  width={180}
                  height={80}
                  loading="lazy"
                  className="max-h-[80%] max-w-[85%] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector(".brand-fallback-text")) {
                      const span = document.createElement("span");
                      span.className = "brand-fallback-text text-center text-sm font-bold tracking-tight text-foreground/80";
                      span.innerText = b.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-center text-sm font-bold tracking-tight text-foreground/80">
                  {b.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}