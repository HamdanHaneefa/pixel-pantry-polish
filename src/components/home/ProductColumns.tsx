import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Product, formatPrice } from "@/data/home";

type ProductColumnsProps = {
  columns?: { title: string; items: Product[] }[];
};

export default function ProductColumns({ columns }: ProductColumnsProps) {
  if (!columns || columns.length === 0) return null;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-8 md:px-8">
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 text-base font-bold tracking-tight text-foreground md:text-[19px]">
              {col.title}
            </h2>
            <div className="flex flex-col gap-3">
              {col.items.map((p) => {
                const href = p.handle ? `/product?handle=${p.handle}` : "/shop";
                return (
                  <Link
                    key={p.id}
                    to={href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-[0_14px_30px_-24px_oklch(0.3_0.05_60/0.6)] hover:border-primary/40 group"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      width={512}
                      height={512}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 object-contain rounded-md bg-white/60 p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-foreground">{formatPrice(p.price)}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
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