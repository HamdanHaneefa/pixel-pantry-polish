import { Facebook, Instagram, Youtube, ChevronUp } from "lucide-react";
import { Logo } from "./SiteHeader";
import { Link } from "@tanstack/react-router";

const COLUMNS = [
  { title: "Shop", links: ["All Products", "Dog", "Cat", "Small Pets", "Brands", "Offers"] },
  {
    title: "Customer Care",
    links: ["Contact Us", "Track Order", "Shipping Policy", "Returns & Refunds", "FAQs"],
  },
  { title: "Company", links: ["About Us", "Our Blogs", "Careers", "Store Locator", "Privacy Policy"] },
];

export default function SiteFooter() {
  return (
    <>
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
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    {l}
                  </a>
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
      
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-[80px] right-4 z-40 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#3B226D] text-white shadow-md md:hidden hover:bg-[#2A1752]"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </>
  );
}