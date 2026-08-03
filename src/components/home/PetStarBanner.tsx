import { ChevronRight } from "lucide-react";
import promoBlue from "@/assets/promo-blue.jpg";

export default function PetStarBanner() {
  return (
    <section className="bg-background py-4 md:py-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ backgroundColor: "oklch(0.48 0.19 260)" }}
        >
          <img
            src={promoBlue}
            alt="PetStar starter puppy food with flat 20% off"
            width={1600}
            height={640}
            loading="lazy"
            className="h-[240px] w-full object-cover object-center opacity-95 md:h-[400px]"
          />
          <div
            className="absolute inset-0 grid items-center px-6 md:grid-cols-3 md:px-14"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.42 0.19 262) 0%, oklch(0.42 0.19 262 / 0.85) 30%, transparent 55%, oklch(0.42 0.19 262 / 0.85) 78%)",
            }}
          >
            <div>
              <h3 className="text-2xl leading-tight font-extrabold tracking-tight text-primary-foreground md:text-5xl">
                Nutrition for
                <br />
                <span style={{ color: "oklch(0.87 0.17 92)" }}>Happy Tails</span>
              </h3>
              <p className="mt-2 max-w-[220px] text-[13px] text-primary-foreground/90 md:mt-4 md:text-lg">
                Balanced food for a strong start in life.
              </p>
            </div>
            <div />
            <div className="hidden flex-col items-center md:flex">
              <p className="text-lg font-bold text-primary-foreground">FLAT</p>
              <p
                className="text-6xl leading-none font-extrabold"
                style={{ color: "oklch(0.87 0.17 92)" }}
              >
                20%
              </p>
              <p className="text-xl font-bold text-primary-foreground">OFF</p>
              <a
                href="#"
                className="mt-5 inline-flex items-center gap-1 rounded-full px-7 py-3 text-sm font-extrabold text-foreground"
                style={{ backgroundColor: "oklch(0.87 0.17 92)" }}
              >
                SHOP NOW <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <a
            href="#"
            className="absolute bottom-5 left-6 inline-flex items-center gap-1 rounded-full px-5 py-2.5 text-xs font-extrabold text-foreground md:hidden"
            style={{ backgroundColor: "oklch(0.87 0.17 92)" }}
          >
            SHOP NOW <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}