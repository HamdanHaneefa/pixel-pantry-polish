import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home, Phone, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
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
          <span className="text-[#FF5B00] font-medium">Contact Us</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1440px] px-4 md:px-8 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Connect With Us For Trusted Support
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-3xl">
              Field service management software is a digital system used to manage job scheduling, technician assignments, and daily field operations.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16 md:mb-24">
            
            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="First name*" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Last name*" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email*" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="Phone Number*" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Subject" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full bg-transparent border-b border-border/60 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <textarea 
                placeholder="Enter Message" 
                className="w-full h-full min-h-[200px] bg-transparent border border-border/60 rounded-xl p-4 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF5B00] focus:border-[#FF5B00] resize-none transition-colors shadow-sm"
              ></textarea>
            </div>
            
          </div>

          <div className="mb-16 md:mb-24">
            <label className="flex items-start gap-3 cursor-pointer mb-8">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input type="checkbox" className="peer w-5 h-5 appearance-none border border-border/60 rounded focus:outline-none focus:ring-2 focus:ring-[#FF5B00]/20 checked:bg-[#FF5B00] checked:border-[#FF5B00] transition-colors" />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[14px] text-muted-foreground leading-snug">
                Join the Petpedika family! Subscribe for expert pet advice, fresh blog updates, and special offers.
              </span>
            </label>

            <button className="h-12 px-8 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors inline-flex items-center gap-2 shadow-sm">
              Send Message
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
              Get in Touch With Petpedika Today
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full border border-border/60 flex items-center justify-center text-[#FF5B00] bg-white">
                  <Phone className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-0.5">Contact Number</h4>
                  <p className="text-[15px] font-medium text-foreground">+971 503533460</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full border border-border/60 flex items-center justify-center text-[#FF5B00] bg-white">
                  <Mail className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-0.5">General Inquiries</h4>
                  <p className="text-[15px] font-medium text-foreground">Petpedika@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full border border-border/60 flex items-center justify-center text-[#FF5B00] bg-white">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-0.5">Business Adress</h4>
                  <p className="text-[15px] font-medium text-foreground leading-snug pr-4">
                    Office No. 202, 2nd Floor, Trade Centre Building, MG Road, Ernakulam, Kochi, Kerala - 682016
                  </p>
                </div>
              </div>

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
