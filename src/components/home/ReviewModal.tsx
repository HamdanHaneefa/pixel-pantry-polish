import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-[500px] bg-white rounded-[20px] shadow-2xl flex flex-col transform transition-transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-center px-6 py-5 relative">
          <h2 className="text-[18px] font-bold text-foreground">Write Review</h2>
          <button 
            onClick={onClose}
            className="absolute right-5 w-8 h-8 flex items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-5">
          
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors focus:outline-none"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={(hoverRating || rating) >= star ? "#FFE4C4" : "transparent"} 
                    stroke="#FFE4C4" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`transition-all ${((hoverRating || rating) >= star) ? "scale-110" : "scale-100"}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground">Review Title</label>
            <Input placeholder="Enter Review Title" className="h-11 border-border/60 text-[14px]" />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground">Review</label>
            <textarea 
              placeholder="Enter Review" 
              className="flex min-h-[120px] w-full rounded-md border border-border/60 bg-transparent px-3 py-3 text-[14px] shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground">
              Your Name <span className="text-muted-foreground font-normal">(Public)</span>
            </label>
            <Input placeholder="Enter your name" className="h-11 border-border/60 text-[14px]" />
          </div>

          <button 
            onClick={onClose}
            className="w-full h-12 mt-4 bg-[#FF5B00] text-white font-bold text-[14px] rounded-md hover:bg-[#E55200] transition-colors shadow-sm"
          >
            SUBMIT NOW
          </button>
        </div>

      </div>
    </div>
  );
}
