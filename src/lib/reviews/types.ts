export interface ProductReview {
  id: string;
  productId: string;
  productHandle?: string;
  author: string;
  email?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string; // ISO string
  status: "approved" | "pending";
  verifiedPurchase?: boolean;
}

export interface ProductRatingSummary {
  rating: number; // e.g. 4.8 or 0 if no reviews
  reviews: number; // total count e.g. 12
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface SubmitReviewInput {
  productId: string;
  productHandle?: string;
  rating: number;
  author: string;
  email?: string;
  title: string;
  comment: string;
  honeypot?: string; // anti-spam
}
