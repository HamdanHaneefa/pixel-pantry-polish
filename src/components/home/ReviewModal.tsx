import { useState, useEffect } from "react";
import { X, Star, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitProductReviewFn } from "@/lib/reviews";
import type { ProductReview, ProductRatingSummary } from "@/lib/reviews";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productHandle?: string;
  productTitle?: string;
  productImage?: string;
  onReviewSubmitted?: (newReview: ProductReview, newSummary: ProductRatingSummary) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Loved it!",
};

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productHandle,
  productTitle,
  productImage,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage(null);
      setIsEditingProfile(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating from 1 to 5.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitProductReviewFn({
        data: {
          productId: productId || "",
          productHandle: productHandle || "",
          rating,
          comment: comment.trim() || undefined,
          author: author.trim() || "Guest Customer",
          email: email.trim() || undefined,
          honeypot: honeypot.trim() || undefined,
        },
      });

      if (!res.success || !res.review || !res.summary) {
        setErrorMessage(res.error || "Unable to submit your review. Please try again.");
        toast.error(res.error || "Failed to submit review");
        return;
      }

      toast.success("Thank you! Your review has been submitted successfully.");
      if (onReviewSubmitted) {
        onReviewSubmitted(res.review, res.summary);
      }

      // Reset
      setComment("");
      setAuthor("");
      setEmail("");
      setRating(5);
      setIsEditingProfile(false);
      onClose();
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating || rating;
  const displayName = author.trim() || "Guest Customer";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header with Product Info */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {productImage ? (
              <div className="w-10 h-10 rounded-lg border border-slate-200/80 bg-slate-50 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={productImage}
                  alt={productTitle || "Product"}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
                {productTitle || "Product Review"}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Rate & review</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Honeypot field for anti-spam bots */}
          <input
            type="text"
            name="b_website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden="true"
          />

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* User Identity Banner (Google Maps style) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 font-medium leading-none">
                    Posting publicly
                  </p>
                  <p className="text-[13px] font-semibold text-slate-900 truncate mt-0.5">
                    {displayName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-[#FF5B00] hover:text-[#E55200] px-2.5 py-1 rounded-md hover:bg-orange-50 transition cursor-pointer shrink-0"
              >
                {isEditingProfile ? "Done" : "Change"}
              </button>
            </div>

            {/* Collapsible Profile Inputs */}
            {isEditingProfile && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">
                    Your Name (Public)
                  </label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-9 text-xs rounded-lg border-slate-200 bg-white focus-visible:ring-[#FF5B00]"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 mb-1 block">
                    Email Address (Private, for order verification)
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-9 text-xs rounded-lg border-slate-200 bg-white focus-visible:ring-[#FF5B00]"
                    maxLength={100}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Centered Star Rating */}
          <div className="py-2 text-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = currentDisplayRating >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-all duration-150 hover:scale-125 active:scale-95 focus:outline-none cursor-pointer group"
                    title={`${star} Star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]"
                          : "text-slate-200 fill-slate-50 group-hover:text-amber-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="h-5 flex items-center justify-center mt-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-amber-600 animate-in fade-in duration-150">
                {RATING_LABELS[currentDisplayRating] || ""}
              </span>
            </div>
          </div>

          {/* Experience Review Text Area */}
          <div className="space-y-1.5">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your own experience with this product... (optional)"
              rows={4}
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5B00] focus:ring-2 focus:ring-[#FF5B00]/15 focus:outline-none transition-all resize-none leading-relaxed"
              maxLength={1000}
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">
                Ratings without text are welcome
              </span>
              <span className="text-[11px] text-slate-400">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Verified Store Review</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#FF5B00] hover:bg-[#E55200] text-white text-xs font-bold rounded-full shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Review"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
