// useDashboardData.ts
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

import {
  ApiMembershipPlan,
  AppUser,
  LibraryItem,
  MembershipState,
  MembershipUsage,
  OrderApi,
  PlanMeta,
  UserRatingState,
} from "@/types/dashboard";

// ---------- HELPERS ----------

const buildPlanMeta = (p: ApiMembershipPlan): PlanMeta | null => {
  if (p.isActive === false) return null;

  const fallbackFeatures: string[] = [];

  if (p.maxDownloadsPerMonth === null) {
    fallbackFeatures.push("Unlimited Track Downloads");
  } else if (typeof p.maxDownloadsPerMonth === "number") {
    fallbackFeatures.push(`${p.maxDownloadsPerMonth} Track Downloads per month`);
  }

  if (p.allowedFormats && p.allowedFormats.length > 0) {
    const upper = p.allowedFormats.map((f) => f.toUpperCase()).join(", ");
    fallbackFeatures.push(`${upper} Quality`);
  }

  fallbackFeatures.push(
    p.commercialUse ? "Commercial Use License" : "Personal Use License",
  );

  if (p.remixRequestsPerMonth > 0) {
    fallbackFeatures.push(
      `Custom Remix Requests (${p.remixRequestsPerMonth}/month)`,
    );
  }

  return {
    key: p.key,
    name: p.name,
    currency: p.currency || "INR",
    price: p.price,
    period: "month",
    features:
      p.features && p.features.length > 0 ? p.features : fallbackFeatures,
    maxDownloadsPerMonth:
      typeof p.maxDownloadsPerMonth === "number"
        ? p.maxDownloadsPerMonth
        : null,
  };
};

const getDownloadsUsageText = (
  membership: MembershipState,
  activePlanKey: string | null,
  planLimit: number | null,
  downloadsUsed: number,
): string => {
  if (membership?.status !== "ACTIVE" || !activePlanKey) {
    return "No active membership downloads.";
  }

  if (planLimit === null) {
    return "Unlimited downloads included in your plan.";
  }

  const remaining = Math.max(planLimit - downloadsUsed, 0);
  return `${downloadsUsed}/${planLimit} downloads used this month (${remaining} left).`;
};

const getDownloadsPeriodText = (
  downloadsUsage: MembershipUsage | undefined,
): string | null => {
  const periodStart = downloadsUsage?.periodStart;
  if (!periodStart) return null;

  const start = new Date(periodStart);
  if (Number.isNaN(start.getTime())) return null;

  return `Current usage period started on ${start.toLocaleDateString()}. Downloads reset monthly.`;
};

const getCurrentTargetRating = (
  ratingTarget: { productId: string; title: string } | null,
  userRatings: Record<string, UserRatingState>,
): UserRatingState | undefined => {
  if (!ratingTarget) return undefined;
  return userRatings[ratingTarget.productId];
};

// ---------- MAIN HOOK ----------

export const useDashboardData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // loading + error states for each resource
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const [plansMetaByKey, setPlansMetaByKey] = useState<Record<string, PlanMeta>>(
    {},
  );
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const [userRatings, setUserRatings] = useState<
    Record<string, UserRatingState>
  >({});

  // local UI state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reDownloadingOrderId, setReDownloadingOrderId] = useState<
    string | null
  >(null);
  const [membershipUpdating, setMembershipUpdating] = useState(false);

  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderApi | null>(null);

  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    productId: string;
    title: string;
  } | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingReview, setRatingReview] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // ---------- Fetch helpers ----------

  const fetchUser = useCallback(async (signal?: AbortSignal) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await api.get<{ user?: AppUser }>("/users/me", { signal });
      setUserProfile(res.data?.user ?? null);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        // aborted
      } else {
        console.error("Failed to load user:", err);
        setUserError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load user",
        );
      }
    } finally {
      setUserLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async (signal?: AbortSignal) => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const res = await api.get<{ plans: ApiMembershipPlan[] }>(
        "/memberships/plans",
        { signal },
      );
      const raw = res.data;
      if (!raw || !Array.isArray(raw.plans)) {
        throw new Error("Invalid membership plans response format");
      }
      const map: Record<string, PlanMeta> = {};
      for (const plan of raw.plans) {
        const meta = buildPlanMeta(plan);
        if (meta) map[plan.key] = meta;
      }
      setPlansMetaByKey(map);
    } catch (err: any) {
      if (err?.name === "CanceledError") {
        // aborted
      } else {
        console.error("Failed to load plans:", err);
        setPlansError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load plans",
        );
      }
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await api.get<OrderApi[]>("/orders", { signal });
      setOrders(res.data || []);
    } catch (err: any) {
      if (err?.name === "CanceledError") {
        // aborted
      } else {
        console.error("Failed to load orders:", err);
        setOrdersError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load orders",
        );
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

const fetchLibrary = useCallback(async (signal?: AbortSignal) => {
  setLibraryLoading(true);
  try {
    const res = await api.get<{
      libraryItems: LibraryItem[];
      userRatings: Record<string, UserRatingState>;
    }>("/users/library", { signal });
    setLibraryItems(res.data.libraryItems || []);
    setUserRatings(res.data.userRatings || {});
  } catch (err: any) {
    if (err?.name !== "CanceledError") {
      console.error("Failed to load library:", err);
      setLibraryError(err?.response?.data?.message || "Failed to load library");
    }
  } finally {
    setLibraryLoading(false);
  }
}, []);

  // initial load on mount
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      await Promise.allSettled([
        fetchUser(ac.signal),
        fetchPlans(ac.signal),
        fetchOrders(ac.signal),
        fetchLibrary(ac.signal),
      ]);
    })();
    return () => ac.abort();
  }, [fetchUser, fetchPlans, fetchOrders, fetchLibrary]);

  // ---------- HANDLERS ----------

/**
 * Core function to fetch a secure link and open it
 */
const downloadProduct = async (productId: string, title: string) => {
  try {
    const res = await api.get<{ download?: { url: string; type: string } }>(
      "/products/download",
      { params: { productId } }
    );

    const data = res.data;
    
    if (!data?.download?.url) {
      throw new Error(`Download link not available for: ${title}`);
    }

    // Open Google Drive/External link in a new tab
    window.open(data.download.url, "_blank", "noopener,noreferrer");

    return true;
  } catch (err: any) {
    console.error(`Failed to download ${title}:`, err);
    throw err;
  }
};



  const handleDownload = async (item: LibraryItem) => {
    try {
      setDownloadingId(item.id);
      toast({
        title: "Preparing download",
        description: `Fetching secure link for ${item.title}...`,
      });
      await downloadProduct(item.id, item.title);
    } catch (err: any) {
      console.error("Download failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not start download. Please try again.";
      toast({
        title: "Download failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

const handleRedownloadOrder = async (order: OrderApi) => {
  try {
    if (reDownloadingOrderId) return;
    setReDownloadingOrderId(order._id);

    // 1. Validation
    if (order.status !== "PAID") {
      toast({
        title: "Order not paid",
        description: "Only successfully paid orders can be downloaded.",
        variant: "destructive",
      });
      return;
    }

    const items = order.items || [];
    if (items.length === 0) {
      throw new Error("No products found in this order.");
    }

    toast({
      title: "Opening downloads",
      description: `Preparing ${items.length} track(s)...`,
    });

    // 2. Loop through all items and open each in a new tab
    // We use a regular for-loop to ensure they trigger correctly
    for (const item of items) {
      // Small delay between tabs to prevent browser popup blockers from stopping them
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await downloadProduct(
        item.product, 
        item.titleSnapshot || "Track"
      );
    }

    // 3. Refresh usage data
    await fetchUser();
    await fetchLibrary();

  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Could not open download links.";
    toast({
      title: "Download failed",
      description: msg,
      variant: "destructive",
    });
  } finally {
    setReDownloadingOrderId(null);
  }
};


  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  const handleChangePassword = () => {
    navigate("/profile#security");
  };

  const handleLogoutAllDevices = async () => {
    try {
      await api.post("/auth/logout-all").catch(() => {});
    } finally {
      toast({
        title: "Logged out from all devices",
        description: "We'll sign you out from all active sessions.",
      });
    }
  };

  const handleCancelMembership = async () => {
    try {
      setMembershipUpdating(true);
      await api.post("/orders/membership/cancel");
      await fetchUser();
      await fetchLibrary();
      toast({
        title: "Cancellation scheduled",
        description:
          "Your membership will not renew after the current period.",
      });
    } catch (err: any) {
      console.error("Failed to cancel membership", err);
      toast({
        title: "Cancellation failed",
        description:
          err?.response?.data?.message ||
          "Could not cancel membership. Try again.",
        variant: "destructive",
      });
    } finally {
      setMembershipUpdating(false);
    }
  };

  const openRatingDialog = (item: LibraryItem) => {
    setRatingTarget({ productId: item.id, title: item.title });
    const existing = userRatings[item.id];
    if (existing) {
      setRatingValue(existing.rating);
      setRatingReview(existing.review);
    } else {
      setRatingValue(5);
      setRatingReview("");
    }
    setRatingDialogOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingTarget) return;
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      toast({
        title: "Invalid rating",
        description: "Please select a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }
    try {
      setRatingSubmitting(true);
      await api.post(`/ratings/${ratingTarget.productId}`, {
        rating: ratingValue,
        review: ratingReview || undefined,
      });

      setUserRatings((prev) => ({
        ...prev,
        [ratingTarget.productId]: {
          rating: ratingValue,
          review: ratingReview,
        },
      }));

      toast({
        title: "Thanks for your review!",
        description: "Your rating has been saved.",
      });
      setRatingDialogOpen(false);

      await fetchLibrary();
    } catch (err: any) {
      console.error("Failed to submit rating:", err);
      toast({
        title: "Review failed",
        description:
          err?.response?.data?.message ||
          "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!ratingTarget) return;
    try {
      setRatingSubmitting(true);
      await api.delete(`/ratings/${ratingTarget.productId}`);
      setUserRatings((prev) => {
        const copy = { ...prev };
        delete copy[ratingTarget.productId];
        return copy;
      });
      toast({
        title: "Review deleted",
        description: "Your rating has been removed.",
      });
      await fetchLibrary();
    } catch (err: any) {
      console.error("Failed to delete rating:", err);
      toast({
        title: "Delete failed",
        description:
          err?.response?.data?.message ||
          "Could not delete your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleOrderDetailsOpenChange = (open: boolean) => {
    setOrderDetailsOpen(open);
    if (!open) setSelectedOrder(null);
  };

  const handleSelectOrder = (order: OrderApi) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleRatingDialogOpenChange = (open: boolean) => {
    setRatingDialogOpen(open);
    if (!open) setRatingTarget(null);
  };

  // ---------- Derived values ----------

  const membership = userProfile?.membership ?? null;
  const activePlanKey = membership?.planKey ?? null;
  const activePlanMeta = activePlanKey
    ? plansMetaByKey[activePlanKey]
    : undefined;

  const downloadsUsage: MembershipUsage | undefined =
    userProfile?.membershipUsage;
  const planLimit =
    activePlanMeta &&
    typeof activePlanMeta.maxDownloadsPerMonth === "number"
      ? activePlanMeta.maxDownloadsPerMonth
      : null;
  const downloadsUsed = downloadsUsage?.downloadsUsed ?? 0;

  const downloadsUsageText = getDownloadsUsageText(
    membership,
    activePlanKey,
    planLimit,
    downloadsUsed,
  );
  const downloadsPeriodText = getDownloadsPeriodText(downloadsUsage);

  const visibleOrders = orders.filter((order) => {
    const isMembershipOrder = !!order.membershipPlanKey;
    if (isMembershipOrder && order.status === "PENDING") return false;
    return true;
  });

  const currentTargetRating = getCurrentTargetRating(
    ratingTarget,
    userRatings,
  );

  // ---------- Refetchers ----------

  const refetchUser = useCallback(() => fetchUser(), [fetchUser]);
  const refetchPlans = useCallback(() => fetchPlans(), [fetchPlans]);
  const refetchOrders = useCallback(() => fetchOrders(), [fetchOrders]);
  const refetchLibrary = useCallback(() => fetchLibrary(), [fetchLibrary]);
  const refetchAllData = useCallback(() => {
    fetchUser();
    fetchPlans();
    fetchOrders();
    fetchLibrary();
  }, [fetchUser, fetchPlans, fetchOrders, fetchLibrary]);

  return {
    // data
    userProfile,
    userLoading,
    userError,
    membership,
    ordersLoading,
    ordersError,
    visibleOrders,
    libraryItems,
    libraryLoading,
    libraryError,
    downloadingId,
    reDownloadingOrderId,
    plansMetaByKey,
    plansLoading,
    plansError,
    activePlanMeta,
    downloadsUsageText,
    downloadsPeriodText,
    membershipUpdating,
    userRatings,

    // dialogs
    orderDetailsOpen,
    selectedOrder,
    ratingDialogOpen,
    ratingTarget,
    ratingValue,
    ratingReview,
    ratingSubmitting,
    currentTargetRating,

    // handlers
    handleLogout,
    handleChangePassword,
    handleLogoutAllDevices,
    handleDownload,
    handleRedownloadOrder,
    handleCancelMembership,
    handleOrderDetailsOpenChange,
    handleSelectOrder,
    openRatingDialog,
    handleRatingDialogOpenChange,
    setRatingValue,
    setRatingReview,
    handleSubmitRating,
    handleDeleteRating,

    // refetchers
    refetchUser,
    refetchPlans,
    refetchOrders,
    refetchLibrary,
    refetchAllData,
  };
};
