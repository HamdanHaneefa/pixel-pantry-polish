import { ChevronRight } from "lucide-react";
import { DEFAULT_HOMEPAGE_CONTENT, type FeatureBanner } from "@/data/homepageContent";

export default function PetStarBanner({
  banner = DEFAULT_HOMEPAGE_CONTENT.featureBanner,
}: {
  banner?: FeatureBanner;
}) {
  if (!banner.enabled) return null;

  const { bgColor, accentColor } = banner;
  const hasOffer = Boolean(banner.offerLabel || banner.offerValue || banner.offerSuffix);
  const alt = [
    banner.headingLine1,
    banner.headingLine2,
    banner.offerValue && `${banner.offerLabel} ${banner.offerValue} ${banner.offerSuffix}`,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <section className="bg-background py-4 md:py-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: bgColor }}>
          <img
            src={banner.image}
            alt={alt}
            width={1600}
            height={640}
            loading="lazy"
            className="h-[240px] w-full object-cover object-center opacity-95 md:h-[400px]"
          />
          <div
            className="absolute inset-0 grid items-center px-6 md:grid-cols-3 md:px-14"
            style={{
              background: `linear-gradient(90deg, ${bgColor} 0%, color-mix(in srgb, ${bgColor} 85%, transparent) 30%, transparent 55%, color-mix(in srgb, ${bgColor} 85%, transparent) 78%)`,
            }}
          >
            <div>
              <h3 className="text-2xl leading-tight font-extrabold tracking-tight text-white md:text-5xl">
                {banner.headingLine1}
                {banner.headingLine2 && (
                  <>
                    <br />
                    <span style={{ color: accentColor }}>{banner.headingLine2}</span>
                  </>
                )}
              </h3>
              {banner.subtitle && (
                <p className="mt-2 max-w-[220px] text-[13px] text-white/90 md:mt-4 md:text-lg">
                  {banner.subtitle}
                </p>
              )}
            </div>
            <div />
            <div className="hidden flex-col items-center md:flex">
              {hasOffer && (
                <>
                  {banner.offerLabel && (
                    <p className="text-lg font-bold text-white">{banner.offerLabel}</p>
                  )}
                  {banner.offerValue && (
                    <p
                      className="text-6xl leading-none font-extrabold"
                      style={{ color: accentColor }}
                    >
                      {banner.offerValue}
                    </p>
                  )}
                  {banner.offerSuffix && (
                    <p className="text-xl font-bold text-white">{banner.offerSuffix}</p>
                  )}
                </>
              )}
              <a
                href={banner.link}
                className="mt-5 inline-flex items-center gap-1 rounded-full px-7 py-3 text-sm font-extrabold text-foreground hover:opacity-90 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                {banner.btnText} <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <a
            href={banner.link}
            className="absolute bottom-5 left-6 inline-flex items-center gap-1 rounded-full px-5 py-2.5 text-xs font-extrabold text-foreground md:hidden hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentColor }}
          >
            {banner.btnText} <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
