import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { brands } from "@/data/home";

export default function BrandStrip() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 md:gap-6">
          {brands.map((b) => (
            <Link
              key={b.name}
              to={`/shop?vendor=${encodeURIComponent(b.name)}`}
              className="group flex h-[76px] sm:h-[84px] md:h-[96px] w-full items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 md:p-4 shadow-[0_2px_10px_#FCECE0] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_#FCECE0]"
            >
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={b.name}
                  width={180}
                  height={80}
                  loading="lazy"
                  className="max-h-[75%] max-w-[80%] object-contain transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <span className="text-center text-sm sm:text-base font-bold tracking-tight text-foreground/80 transition-colors group-hover:text-primary md:text-lg">
                  {b.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}