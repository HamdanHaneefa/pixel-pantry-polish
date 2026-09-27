import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { brands as defaultBrands } from "@/data/home";

export default function BrandStrip() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Top Brands We Love" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 sm:gap-4 md:gap-5">
          {defaultBrands.map((b) => (
            <Link
              key={b.id || b.name}
              to={b.link || `/shop?vendor=${encodeURIComponent(b.name)}`}
              className="group flex h-[80px] sm:h-[90px] md:h-[100px] w-full items-center justify-center rounded-2xl border border-[#FCECE0] bg-white p-3 md:p-4 shadow-[0_2px_10px_#FCECE0] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_#FCECE0]"
            >
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={b.name}
                  width={180}
                  height={80}
                  loading="lazy"
                  className="max-h-[80%] max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <span className="text-center text-sm font-bold tracking-tight text-foreground/80 transition-colors group-hover:text-primary">
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