// ---------------------- File Metadata ----------------------
export type ApiFile = {
  key: string;
  filename?: string;
  contentType?: string;
  size?: number;
  isPreview?: boolean;
  fileType?: string;
};

// ---------------------- Track Metadata ----------------------
export type ApiTrack = {
  title: string;
  duration?: string;
};

// ---------------------- Product ----------------------
export type ApiProduct = {
  _id: string;
  title: string;
  artistId?: string;
  price: number;
  mrp?: number;

  thumbnail?: {
    url?: string;
    key?: string;
    contentType?: string;
  };
  
  previewAudio?: {
    url?: string;
    key?: string;
  };

  isExclusive?: boolean;
  description?: string;
  tracklist?: ApiTrack[];
  features?: string[];

  averageRating?: number;
  ratingCount?: number;

  fullDuration?: number;
  previewDuration?: number;
  createdAt?: string;

  isNewTag?: boolean;
  collectionType?: string;

  files?: ApiFile[];
  sampleEnabled?: boolean;
  sampleYoutubeUrl?: string;


  audioFormatText?: string; 
  
  audioFormats?: string[];  
};

// ---------------------- Ratings ----------------------
export type RatingApi = {
  userId: string;
  rating: number;
  review?: string;
  createdAt?: string;
  userNameSnapshot?: string;
};

export type RatingsResponse = {
  ratings: RatingApi[];
  averageRating?: number;
  ratingCount?: number;
};

// ---------------------- Membership ----------------------
export type MembershipState = {
  status: "NONE" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  planKey: string | null;
  expiresAt: string | null;
};

export type MembershipUsage = {
  periodStart: string | null;
  downloadsUsed: number;
  remixRequestsUsed?: number;
};

// ---------------------- User (Me) ----------------------
export type UserMe = {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;

  membership?: {
    status?: "NONE" | "ACTIVE" | "EXPIRED" | "CANCELLED";
    planKey?: string | null;
    expiresAt?: string | null;
  };

  membershipUsage?: MembershipUsage;

  purchasedProducts?: Array<string | { _id: string }>;
};

// ---------------------- Membership Plan ----------------------
export type ApiMembershipPlan = {
  key: string;
  maxDownloadsPerMonth: number | null;
};