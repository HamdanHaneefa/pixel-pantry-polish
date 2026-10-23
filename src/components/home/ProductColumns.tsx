import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Product, formatPrice } from "@/data/home";
import { optimizeShopifyImage } from "@/lib/utils";

type ProductColumnsProps = {
  columns?: { title: string; items: Product[] }[];
};

export default function ProductColumns({ columns }: ProductColumnsProps) {
  const validColumns = (columns || []).filter((col) => col.items && col.items.length > 0);
  if (validColumns.length === 0) return null;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-8 md:px-8">
        {validColumns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 text-base font-bold tracking-tight text-foreground md:text-[19px] h-7 flex items-center">
              {col.title}
            </h2>
            <div className="flex flex-col gap-3">
              {col.items.map((p) => {
                const handle = p.handle || p.id;
                return (
                  <Link
                    key={p.id}
                    to="/product"
                    search={{ handle }}
                    className="flex items-center gap-3.5 rounded-2xl border border-[#FCECE0] bg-white p-3 shadow-[0_2px_10px_#FCECE0] transition-all duration-300 hover:shadow-[0_6px_20px_#FCECE0] hover:-translate-y-0.5 group h-[104px]"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[#FAF4ED] p-1 flex items-center justify-center overflow-hidden border border-[#F4E6D8]/50">
                      <img
                        src={optimizeShopifyImage(p.image, 160)}
                        alt={p.title}
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                      <h3 className="line-clamp-2 text-[13px] leading-[18px] font-medium text-foreground group-hover:text-primary transition-colors h-[36px]">
                        {p.title}
                      </h3>
                      <div className="mt-auto">
                        <p className="text-sm font-bold text-foreground leading-none">
                          {formatPrice(p.price)}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 leading-none">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-3 w-3 ${n <= p.rating ? "fill-primary text-primary" : "text-primary/40"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-foreground">({p.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
