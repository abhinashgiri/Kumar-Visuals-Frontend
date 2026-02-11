// useSiteSettings.ts

import { create } from "zustand";
import api from "@/services/api";

/** ---------- Types (match SiteSettings.model.js) ---------- */

type FaqItem = {
  question: string;
  answer: string;
};

type SocialLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  soundcloud?: string;
  spotify?: string;
};

// New Type for Headers
type SectionHeader = {
  badge?: string;
  title?: string;
  subtitle?: string;
};

type DiscountBanner = {
  enabled?: boolean;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
};

export type SiteSettings = {
  key: string;
  maintenanceMode: boolean;
  allowSignup: boolean;

  contactEmail?: string;
  supportEmail?: string;

  maxUploadSize: number;

  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  brandName?: string;

  // --- NEW HEADER FIELDS ---
  shopHeader?: SectionHeader;
  philosophyHeader?: SectionHeader;

  // Contact
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phonePrimary?: string;
  phoneSecondary?: string;

  aboutKumar?: string;

  // Footer
  footerDescription?: string;
  footerCopyright?: string;

  socialLinks: SocialLinks;
  
  //  DISCOUNT BANNER (NEW)
  discountBanner?: DiscountBanner;
  faqs: FaqItem[];
};



type SiteSettingsState = {
  settings: SiteSettings | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
};

export const useSiteSettings = create<SiteSettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    // If already loading, skip
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const res = await api.get("/site");


      const root = res.data;
      const payload =
        root?.data ??
        root?.settings ??
        root;

      set({
        settings: payload as SiteSettings,
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to load site settings:", err);
      set({
        isLoaded: true,
        isLoading: false,
        error:
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load site settings",
      });
    }
  },
}));