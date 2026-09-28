import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "./SiteHeader";
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
      { label: "Offers", path: "/offers" }
    ] 
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", path: "/contact" }, 
      { label: "Track Order", path: "https://shopify.com/77079314626/account" }, 
      { label: "Shipping Policy", path: "/shipping-policy" }, 
      { label: "Returns & Refunds", path: "/refund-policy" }, 
      { label: "FAQs", path: "/faqs" }
    ],
  },
  { 
    title: "Company", 
    links: [
      { label: "About Us", path: "/about" }, 
      { label: "Our Blogs", path: "#" }, 
      { label: "Careers", path: "#" }, 
      { label: "Terms of Service", path: "/terms" }, 
      { label: "Privacy Policy", path: "/privacy-policy" }
    ] 
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
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className={col.title === "Company" ? "hidden md:block" : ""}>
            <h3 className="mb-3 text-base font-bold text-foreground">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.path.startsWith("http") ? (
                    <a href={l.path} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
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
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="X" className="hover:text-primary">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.7L18.9 2Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-primary">
              <Youtube className="h-5 w-5" />
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