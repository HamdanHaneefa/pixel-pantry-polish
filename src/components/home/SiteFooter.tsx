import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo, SOCIAL_LINKS, WhatsAppIcon } from "./SiteHeader";
import { Link } from "@tanstack/react-router";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", path: "/shop" },
      { label: "Dog", path: "/shop?pet=dogs" },
      { label: "Cat", path: "/shop?pet=cats" },
      { label: "Small Pets", path: "/shop?pet=small-pets" },
      { label: "Brands", path: "/shop" },
      { label: "Offers", path: "/offers" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", path: "/contact" },
      { label: "Track Order", path: "/account#order" },
      { label: "Shipping Policy", path: "/shipping-policy" },
      { label: "Returns & Refunds", path: "/refund-policy" },
      { label: "FAQs", path: "/faqs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Our Blogs", path: "#" },
      { label: "Careers", path: "#" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Privacy Policy", path: "/privacy-policy" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-background pt-10 pb-24 md:pb-10 relative">
      <div className="mx-auto grid max-w-[1440px] gap-9 px-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>
          <p className="mt-3 max-w-[240px] text-sm text-muted-foreground">
            Premium products. Trusted care. Endless love.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href="tel:+919061333733" className="flex items-center gap-2.5 hover:text-primary">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +91 9061333733
              </a>
            </li>
            <li>
              <a
                href="mailto:support@petpedia.in"
                className="flex items-center gap-2.5 hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                support@petpedia.in
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="max-w-[220px]">Edarikode, Kottakkal, Kerala, India – 676501</span>
            </li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className={col.title === "Company" ? "hidden md:block" : ""}>
            <h3 className="mb-3 text-base font-bold text-foreground">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.path.startsWith("http") ? (
                    <a
                      href={l.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.path} className="text-sm text-muted-foreground hover:text-primary">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="hidden md:block">
          <h3 className="mb-3 text-base font-bold text-foreground">Social Media</h3>
          <div className="flex gap-4 text-foreground/70">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-primary"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Channel"
              className="hover:text-primary"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="hidden md:block mx-auto mt-9 max-w-[1440px] border-t border-border px-4 pt-5 md:px-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Petpedia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
