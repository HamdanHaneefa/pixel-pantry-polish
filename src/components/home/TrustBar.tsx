import { BadgeCheck, CheckCircle2, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Premium Quality", sub: "Carefully Selected" },
  { icon: PackageCheck, title: "Fast Delivery", sub: "Across India" },
  { icon: CheckCircle2, title: "Vet Approved", sub: "Trusted by Experts" },
  { icon: RotateCcw, title: "Easy Returns", sub: "Hassle Free" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "100% Safe Checkout" },
];

export default function TrustBar() {
  return (
    <section className="bg-ink py-6 md:py-7">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-5 px-4 md:grid-cols-5 md:gap-6 md:px-8">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon className="h-7 w-7 shrink-0 text-primary md:h-9 md:w-9" strokeWidth={1.8} />
            <div>
              <p className="text-[13px] font-bold text-ink-foreground md:text-[15px]">{title}</p>
              <p className="text-[11px] text-ink-foreground/70 md:text-[13px]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}