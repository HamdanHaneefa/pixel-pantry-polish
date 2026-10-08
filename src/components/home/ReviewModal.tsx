import { useState, useEffect } from "react";
import { X, Star, Loader2 } from "lucide-react";
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
  onReviewSubmitted?: (newReview: ProductReview, newSummary: ProductRatingSummary) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Excellent!",
};

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productHandle,
  productTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage(null);
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

    if (!title.trim()) {
      setErrorMessage("Please enter a short headline for your review.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage("Please write at least 5 characters in your review feedback.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitProductReviewFn({
        data: {
          productId: productId || "",
          productHandle: productHandle || "",
          rating,
          title: title.trim(),
          comment: comment.trim(),
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

      // Reset form
      setTitle("");
      setComment("");
      setAuthor("");
      setEmail("");
      setRating(5);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-white rounded-[22px] shadow-2xl flex flex-col transform transition-transform animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <div>
            <h2 className="text-[19px] font-bold text-foreground">Write a Review</h2>
            {productTitle && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-[380px]">
                {productTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review dialog"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Star Rating Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-foreground">
                Overall Rating <span className="text-[#FF5B00]">*</span>
              </label>
              <span className="text-xs font-medium text-[#FF5B00]">
                {RATING_LABELS[currentDisplayRating] || ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-[#FFF9F5] border border-[#FFE7D9] rounded-xl w-fit">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  title={`${star} Star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      currentDisplayRating >= star
                        ? "fill-[#FF5B00] text-[#FF5B00]"
                        : "text-slate-300 fill-transparent hover:text-[#FF5B00]/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">
              Headline / Title <span className="text-[#FF5B00]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My pup loves this food!"
              className="h-11 border-border/70 text-[14px] rounded-lg focus-visible:ring-[#FF5B00]"
              maxLength={120}
              required
            />
          </div>

          {/* Review Content */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">
              Detailed Review <span className="text-[#FF5B00]">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other pet parents what you liked, how your pet reacted, packaging, quality..."
              rows={4}
              className="flex min-h-[110px] w-full rounded-lg border border-border/70 bg-transparent px-3 py-2.5 text-[14px] shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5B00] resize-none"
              maxLength={1000}
              required
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Author Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground">
                Your Name <span className="text-muted-foreground font-normal">(Public)</span>
              </label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="h-11 border-border/70 text-[14px] rounded-lg focus-visible:ring-[#FF5B00]"
                maxLength={60}
              />
            </div>

            {/* Email (Optional, kept private) */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground">
                Email Address <span className="text-muted-foreground font-normal">(Private)</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="h-11 border-border/70 text-[14px] rounded-lg focus-visible:ring-[#FF5B00]"
                maxLength={100}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            No account required. Your email is kept private and will never be shared publicly.
          </p>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#FF5B00] text-white font-bold text-[14px] tracking-wide rounded-xl hover:bg-[#E55200] active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  SUBMITTING REVIEW...
                </>
              ) : (
                "SUBMIT REVIEW"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
