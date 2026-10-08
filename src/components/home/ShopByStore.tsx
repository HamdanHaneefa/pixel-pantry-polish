import { Link } from "@tanstack/react-router";
import SectionHeading from "./SectionHeading";
import { stores } from "@/data/home";

export default function ShopByStore() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title="Shop by store" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-6 md:gap-6">
          {stores.map((s: any) => {
            const title = s.name || s.title || "";
            const link = s.link || `/shop?q=${encodeURIComponent(title)}`;
            return (
              <a key={s.id || title} href={link} className="group flex flex-col items-center gap-3">
                <span
                  className="flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full transition-all group-hover:-translate-y-1 group-hover:shadow-md md:h-[190px] md:w-[190px]"
                  style={{ backgroundColor: s.circle || "#FFE7D6" }}
                >
                  <img
                    src={s.image}
                    alt={title}
                    width={190}
                    height={190}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </span>
                <span className="text-sm font-semibold text-foreground md:text-base group-hover:text-[#FF5B00] transition-colors">
                  {title}
                </span>
                <span
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/85 md:text-sm"
                  style={{ backgroundColor: s.pill || "#FFD2B8" }}
                >
                  {s.offer || "Upto 60% OFF"}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}