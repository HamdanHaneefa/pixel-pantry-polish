import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import type { Product } from "@/data/home";

export default function ProductRail({
  title,
  action,
  products,
}: {
  title: string;
  action?: string;
  products: Product[];
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <SectionHeading title={title} action={action} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}