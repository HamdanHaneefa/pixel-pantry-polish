import { useState } from "react";
import { X, Send, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, type Product } from "@/data/home";
import { optimizeShopifyImage } from "@/lib/utils";
import { useCustomer } from "@/context/CustomerContext";
import { toast } from "sonner";

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

export default function AskQuestionModal({ isOpen, onClose, product }: AskQuestionModalProps) {
  const { customer, isAuthenticated } = useCustomer();
  const [name, setName] = useState(customer ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() : "");
  const [contact, setContact] = useState(customer?.phone || customer?.email || "");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleWhatsAppInquiry = () => {
    const textMsg = `Hello Petpedia! I have a question about ${product.title}:\n\n"${question.trim() || "Is this available and what are the details?"}"\n\nProduct Link: ${currentUrl}`;
    const url = `https://api.whatsapp.com/send?phone=919061333733&text=${encodeURIComponent(textMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp to chat with our pet care specialist!");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!contact.trim()) {
      toast.error("Please enter your phone number or email");
      return;
    }
    if (!question.trim()) {
      toast.error("Please enter your question");
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Question submitted successfully! Our pet specialist will get back to you shortly.");
      setQuestion("");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-[#FFF9F3]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5B00]/10 text-[#FF5B00]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Ask a Question</h3>
              <p className="text-xs text-slate-500 font-medium">Quick answers from our pet specialists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product mini-preview */}
        <div className="flex items-center gap-3 bg-slate-50/80 px-6 py-3 border-b border-slate-100">
          <img
            src={optimizeShopifyImage(product.image, 120)}
            alt={product.title}
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-contain bg-white border border-slate-200/60 p-1 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{product.title}</h4>
            <p className="text-xs font-bold text-[#FF5B00] mt-0.5">{formatPrice(product.price)}</p>
          </div>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
              <Input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone or Email *</label>
              <Input
                type="text"
                placeholder="Phone or Email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="h-10 text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Question *</label>
            <Textarea
              placeholder="What would you like to know? (e.g. size guidance, ingredients, expiry date, pet age compatibility...)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={4}
              className="resize-none text-sm bg-white border-slate-200"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20BD5A] transition-colors shadow-xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Ask on WhatsApp
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[#FF5B00] text-white font-semibold text-xs hover:bg-[#E55200] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Submitting…" : "Send Question"}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-1">
            Need urgent help? Call <span className="font-semibold text-slate-600">+91 9061333733</span> (Mon-Sat, 9AM-7PM)
          </p>
        </form>
      </div>
    </div>
  );
}
