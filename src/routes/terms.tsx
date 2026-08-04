import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0 flex flex-col">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3 shrink-0">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link to="/" className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" /> Home
          </Link>
          <span className="text-muted-foreground/60 mx-1">{'>'}</span>
          <span className="text-[#FF5B00] font-medium">Terms & Conditions</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] w-full px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 lg:gap-24">
          
          {/* Content */}
          <div className="flex-1 text-muted-foreground text-[14px] leading-relaxed">
            <h1 className="text-3xl md:text-[32px] font-bold text-foreground mb-10 tracking-tight">
              Terms & Conditions
            </h1>

            <div className="space-y-8">
              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  OVERVIEW
                </h2>
                <div className="space-y-4">
                  <p>
                    This website is operated by Petpedika Kerala. Throughout the site, the terms "we", "us", and "our" refer to Petpedika Kerala. Petpedika Kerala offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
                  </p>
                  <p>
                    By visiting our site and/ or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.
                  </p>
                  <p>
                    Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  ONLINE STORE TERMS
                </h2>
                <div className="space-y-4">
                  <p>
                    By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority and have given us your consent to allow any of your minor dependents to use this site.
                  </p>
                  <p>
                    You may not use our products (including pet food, supplements, and accessories) for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
                  </p>
                  <p>
                    You must not transmit any worms or viruses or any code of a destructive nature. A breach or violation of any of the Terms will result in an immediate termination of your Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  GENERAL CONDITIONS
                </h2>
                <div className="space-y-4">
                  <p>
                    We reserve the right to refuse service to anyone for any reason at any time.
                  </p>
                  <p>
                    You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card and sensitive payment information is always encrypted during transfer over networks.
                  </p>
                  <p>
                    You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-foreground uppercase mb-4 tracking-wide">
                  ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION
                </h2>
                <div className="space-y-4">
                  <p>
                    We are not responsible if information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only (including pet nutrition guides and product specifications) and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, or more timely sources of information. Any reliance on the material on this site is at your own risk.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-[360px] shrink-0">
            <div className="bg-[#FFF5EB] rounded-xl p-8 sticky top-32">
              <h3 className="text-[16px] font-bold text-foreground mb-3">
                Have Any More Questions?
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                If you have any inquiries or concerns regarding our shipping policy, feel free to reach out to our customer service team.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex h-11 px-6 bg-[#FF5B00] text-white font-bold text-[13px] rounded-md hover:bg-[#E55200] transition-colors items-center gap-2 shadow-sm"
              >
                CONTACT US
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
