export interface MembershipUsage {
  periodStart: string | null;
  downloadsUsed: number;
  remixRequestsUsed: number;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  roles?: string[];
  createdAt?: string;
  purchasedProducts?: string[];
  membershipUsage?: MembershipUsage;
  membership?: MembershipState;
}

export interface OrderItemApi {
  product: string;
  titleSnapshot: string;
  thumbnailSnapshot?: string;
  priceSnapshot: number;
  mrpSnapshot: number;
  currencySnapshot: string;
  discountPercentSnapshot: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderApi {
  _id: string;
  user: string;
  items: OrderItemApi[];
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentProvider: string;
  paymentOrderId?: string;
  paymentIntentId?: string;
  completedAt?: string;
  createdAt: string;

  membershipPlanKey?: string;
  membershipMonths?: number;
}

export type LibrarySource = "order" | "membership";

export interface LibraryItem {
  id: string;
  title: string;
  thumbnail?: string; 
  format: string;
  purchaseDate: string;
  orderId?: string;
  source: "order" | "membership";
}

export interface UserRatingState {
  rating: number;
  review: string;
}

export interface ProductRatingsApi {
  ratings: {
    userId: string;
    rating: number;
    review?: string;
    createdAt?: string;
  }[];
  averageRating?: number;
  ratingCount?: number;
}

export interface ProductMeta {
  title: string;
}

export type MembershipStatus = "NONE" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export type MembershipState =
  | {
      planKey: string | null;
      startedAt: string | null;
      expiresAt: string | null;
      status: MembershipStatus;
    }
  | null;

export interface ApiMembershipPlan {
  id?: string;
  _id?: string;
  key: string;
  name: string;
  price: number;
  currency: string;
  maxDownloadsPerMonth: number | null;
  allowedFormats: string[];
  commercialUse: boolean;
  remixRequestsPerMonth: number;
  description?: string;
  features?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface PlanMeta {
  key: string;
  name: string;
  currency: string;
  price: number;
  period: string;
  features: string[];
  maxDownloadsPerMonth: number | null;
}