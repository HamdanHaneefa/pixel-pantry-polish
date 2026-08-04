import { useState } from "react";
import { ChevronDown, Heart, Share2, Scale, Star, Minus, Plus, HelpCircle, Copy, Facebook, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import pCatfood from "@/assets/p-catfood.png";
import type { Product } from "@/data/home";
import { Link } from "@tanstack/react-router";

export default function ProductOverview({ product }: { product?: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  const thumbnails = [pCatfood, pCatfood, pCatfood, pCatfood, pCatfood];
  // In a real app we'd use `product` prop to display real data. 
  // We'll use the static data for now to match the UI screenshot exactly.

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Left: Gallery */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 flex-1 min-w-0">
        {/* Thumbnails Wrapper */}
        <div className="relative md:w-[100px] shrink-0">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar w-full pb-2 md:pb-0">
            {thumbnails.map((thumb, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveThumb(idx)}
                className={`w-[80px] h-[80px] md:w-full md:h-[100px] shrink-0 rounded-lg overflow-hidden border-2 ${activeThumb === idx ? "border-[#FF5B00]" : "border-border/50 hover:border-border"} bg-white p-2 transition-colors`}
              >
                <img src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          <button className="md:hidden absolute -right-2 top-[40px] -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-[#FF5B00] text-white rounded-full shadow-md z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        {/* Main Image */}
        <div className="flex-1 bg-white rounded-xl border border-border/60 p-6 flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
          <img src={thumbnails[activeThumb]} alt="Product Main" className="w-full h-full max-h-[400px] object-contain" />
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col gap-6 flex-1 min-w-0 text-left">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-[#FF5B00]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">4.7 Star Rating</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">(21,671 User feedback)</span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-foreground leading-tight mb-4">
            {product?.title || "Kitty Yums Ocean Fish Kitten (1 to 12 Months) Cat Dry Food"}
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Taurine Promotes Strong Vision Development Omega 3 DHA Helps Promote Healthy Brain Development Vitamin E.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg text-muted-foreground line-through">₹1200.00</span>
          <span className="text-[28px] font-bold text-[#FF5B00]">₹800.00</span>
          <span className="bg-[#FFE246] text-[#695A00] text-xs font-bold px-2.5 py-1 rounded-sm ml-2">17% OFF</span>
        </div>

        {/* Delivery Check */}
        <div className="pt-2">
          <p className="text-sm font-medium text-foreground mb-2">Check delivery date</p>
          <div className="flex gap-3 max-w-[400px]">
            <Input placeholder="Enter PIN code" className="flex-1 bg-white border-border/60 h-11 focus-visible:ring-[#FF5B00]" />
            <button className="h-11 px-6 rounded-md border border-[#FF5B00] text-[#FF5B00] font-medium hover:bg-[#FF5B00]/5 transition-colors">
              Check
            </button>
          </div>
        </div>

        {/* Variants */}
        <div className="flex gap-4 max-w-[400px] pt-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">Size</p>
            <div className="relative">
              <select className="w-full h-11 px-4 bg-white border border-border/60 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#FF5B00] text-[15px]">
                <option>4kg</option>
                <option>7kg</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">Colour</p>
            <div className="relative">
              <select className="w-full h-11 px-4 bg-white border border-border/60 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#FF5B00] text-[15px]">
                <option>Black</option>
                <option>Red</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="flex gap-4 pt-4 max-w-[400px]">
          <div className="flex items-center border border-border/60 rounded-md bg-white h-12 w-[120px] shrink-0">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex-1 flex justify-center items-center h-full hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-[15px] w-8 text-center">{quantity.toString().padStart(2, '0')}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="flex-1 flex justify-center items-center h-full hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button className="flex-1 bg-[#FF5B00] text-white rounded-md font-bold text-[15px] hover:bg-[#E55200] transition-colors shadow-sm">
            ADD TO CART
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 mt-2 border-t border-border/60">
          <div className="flex items-center gap-6">
            <Link to="/wishlist" className="flex items-center gap-2 text-[13px] md:text-[14px] text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="h-4 w-4" /> Add to Wishlist
            </Link>
            <button className="flex items-center gap-2 text-[13px] md:text-[14px] text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" /> Ask a question
            </button>
          </div>
          <div className="flex items-center gap-3 text-[13px] md:text-[14px] text-muted-foreground">
            <span className="hidden sm:inline">Share product:</span>
            <button className="hover:text-foreground transition-colors"><Copy className="h-4 w-4" /></button>
            <button className="hover:text-foreground transition-colors"><Facebook className="h-4 w-4" /></button>
            <button className="hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.7L18.9 2Z" /></svg>
            </button>
            <button className="hover:text-foreground transition-colors"><Instagram className="h-4 w-4" /></button>
            <button className="hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
