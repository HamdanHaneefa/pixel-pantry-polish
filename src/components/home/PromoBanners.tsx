import promoGold from "@/assets/promo-gold.jpg";
import promoTeal from "@/assets/promo-teal.jpg";

export default function PromoBanners() {
  return (
    <section className="bg-background py-4 md:py-8">
      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 md:grid-cols-2 md:gap-6 md:px-8">
        <a
          href="#"
          className="relative overflow-hidden rounded-2xl"
          style={{ backgroundColor: "oklch(0.86 0.17 90)" }}
        >
          <img
            src={promoGold}
            alt="Win a gold coin every day with Pedigree"
            width={1200}
            height={640}
            loading="lazy"
            className="h-[170px] w-full object-cover md:h-[280px]"
          />
          <div
            className="absolute inset-0 flex flex-col justify-center px-6 md:px-10"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.88 0.17 92) 0%, oklch(0.88 0.17 92 / 0.85) 42%, transparent 72%)",
            }}
          >
            <p className="text-[13px] font-extrabold tracking-tight text-destructive md:text-xl">
              CHANCE TO
            </p>
            <p className="text-2xl leading-[0.95] font-extrabold tracking-tight text-destructive md:text-5xl">
              WIN
              <br />A GOLD
              <br />
              COIN
            </p>
            <p className="mt-1 text-[13px] font-extrabold text-destructive md:text-xl">EVERY DAY*</p>
          </div>
        </a>

        <a
          href="#"
          className="relative overflow-hidden rounded-2xl"
          style={{ backgroundColor: "oklch(0.79 0.13 200)" }}
        >
          <img
            src={promoTeal}
            alt="Switch to Good Dog puppy baked food"
            width={1200}
            height={640}
            loading="lazy"
            className="h-[170px] w-full object-cover md:h-[280px]"
          />
          <div
            className="absolute inset-0 flex flex-col justify-center px-6 md:px-10"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.82 0.12 200) 0%, oklch(0.82 0.12 200 / 0.8) 40%, transparent 70%)",
            }}
          >
            <p className="text-sm font-medium text-foreground md:text-2xl">Switch to</p>
            <p className="text-xl leading-none font-extrabold tracking-tight text-foreground md:text-4xl">
              GOOD DOG™
            </p>
            <p className="text-base font-extrabold tracking-tight text-foreground md:text-2xl">
              PUPPY BAKED FOOD
            </p>
          </div>
        </a>
      </div>
    </section>
  );
}