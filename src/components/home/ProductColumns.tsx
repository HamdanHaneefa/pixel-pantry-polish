import { Star } from "lucide-react";
import { columnProducts, formatPrice } from "@/data/home";

export default function ProductColumns() {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-4 md:gap-8 md:px-8">
        {columnProducts.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 text-base font-bold tracking-tight text-foreground md:text-[19px]">
              {col.title}
            </h2>
            <div className="flex flex-col gap-3">
              {col.items.map((p) => (
                <article
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-[0_14px_30px_-24px_oklch(0.3_0.05_60/0.6)]"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground">
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
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}