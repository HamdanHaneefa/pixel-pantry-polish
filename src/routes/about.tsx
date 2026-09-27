import { createFileRoute, Link } from "@tanstack/react-router";
import SiteHeader from "@/components/home/SiteHeader";
import TrustBar from "@/components/home/TrustBar";
import SiteFooter from "@/components/home/SiteFooter";
import MobileTabBar from "@/components/home/MobileTabBar";
import { Home, Play, Award, Headset, Heart } from "lucide-react";
import promoTeal from "@/assets/promo-teal.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F3] pb-20 md:pb-0">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#FFF5EB] border-b border-[#FFE4C4] py-3">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 flex items-center gap-2 text-[13px]">
          <Link to="/" className="text-muted-foreground hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" /> Home
          </Link>
          <span className="text-muted-foreground/60 mx-1">{'>'}</span>
          <span className="text-[#FF5B00] font-medium">About Us</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-10 md:py-16">
        
        {/* Section 1: Hero */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start mb-16 md:mb-24">
          <div className="w-full md:w-[45%]">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-[1.15] tracking-tight">
              Dedicated To Every Pet's Wellbeing Always
            </h1>
          </div>
          <div className="w-full md:w-[55%] space-y-5 text-[15px] text-muted-foreground leading-relaxed">
            <p>
              Welcome to Petpedia, your trusted destination for premium pet products, expert care, and everything your furry, feathered, and finned companions need to live happy, healthy lives.
            </p>
            <p>
              We believe that pets are more than just animals—they are cherished members of the family. They bring unconditional love, joy, companionship, and unforgettable moments into our lives.
            </p>
            <p>
              Since our journey began, we've been committed to creating a shopping experience that pet parents can rely on. Whether you're welcoming a playful puppy, caring for a curious kitten, nurturing a colorful bird, maintaining a thriving aquarium, or looking after small pets, we provide carefully selected products to support every stage of your pet's life.
            </p>
          </div>
        </div>

        {/* Section 1b: Mission Banner */}
        <div className="w-full bg-[#2C1E5C] rounded-xl p-8 md:p-12 mb-16 md:mb-24">
          <h3 className="text-[#BCAEE5] text-[13px] font-bold uppercase tracking-wider mb-3">
            Our Mission
          </h3>
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-snug">
            Our mission is to become the most trusted destination for pet owners
          </h2>
        </div>

        {/* Section 2: Love Care Quality */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center mb-16 md:mb-24">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-[42px] font-bold text-foreground leading-[1.15] tracking-tight mb-6">
              Love Care Quality<br />Delivered To Pets
            </h2>
            <div className="space-y-5 text-[15px] text-muted-foreground leading-relaxed mb-8">
              <p>
                Welcome to Petpedia, your trusted destination for premium pet products, expert care, and everything your furry, feathered, and finned companions need to live happy, healthy lives.
              </p>
              <p>
                We believe that pets are more than just animals—they are cherished members of the family. They bring unconditional love, joy, companionship, and unforgettable moments into our lives.
              </p>
            </div>
            <Link 
              to="/contact" 
              className="inline-flex h-12 px-8 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors items-center gap-2 shadow-sm"
            >
              CONTACT US
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <div className="w-full aspect-[4/3] rounded-[24px] bg-[#FF8C38] overflow-hidden flex items-center justify-center relative shadow-sm">
              <img
                src={promoTeal}
                alt="Pet Care and Love"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>


        {/* Section 3: Driven by Care */}
        <div className="mb-20 md:mb-32 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Driven by Care, Guided by Trust
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-16 max-w-3xl mx-auto">
            We are committed to honesty, compassion, quality, innovation, and sustainability, ensuring every pet receives the care, comfort, and pet parents confidence with every purchase.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FF5B00] flex items-center justify-center mb-5 text-[#FF5B00]">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Quality First</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FF5B00] flex items-center justify-center mb-5 text-[#FF5B00]">
                <Headset className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Customer Commitment</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FF5B00] flex items-center justify-center mb-5 text-[#FF5B00]">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Love for Pets</h3>
            </div>
          </div>
        </div>

        {/* Section 4: Top Brands */}
        <div className="mb-20 md:mb-32">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Top Brands We Love</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {['Orijen', 'Drools', 'Acana', 'Whiskas', 'Royal Canin', 'Open Farm', 'Purina'].map((brand, i) => (
              <div key={i} className="bg-white border border-border/60 rounded-xl px-6 py-4 flex items-center justify-center min-w-[140px] h-[70px] shadow-sm hover:border-[#FF5B00]/40 transition-colors">
                <span className="font-bold text-foreground/80 text-xl tracking-tight">{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Testimonials */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Hear From Happy Pet Parents
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Watch real stories from happy customers who trust us for premium pet food, grooming essentials, toys, healthcare products, and everyday pet care.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[9/16] rounded-xl bg-muted/30 overflow-hidden relative group cursor-pointer border border-border/40 shadow-sm">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#FF5B00] rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
