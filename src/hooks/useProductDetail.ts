import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

import {
  ApiMembershipPlan,
  ApiProduct,
  MembershipUsage,
  RatingsResponse,
  RatingApi,
  UserMe,
  ApiTrack,
} from "@/types/product";

import album1 from "@/assets/album1.jpg";
import album2 from "@/assets/album2.jpg";
import album3 from "@/assets/album3.jpg";
import album4 from "@/assets/album4.jpg";

const S3_PUBLIC_BASE_URL = import.meta.env.VITE_S3_PUBLIC_BASE_URL || "";
const fallbackCovers = [album1, album2, album3, album4];
const STAR_INDICES = [0, 1, 2, 3, 4];

// ---------- SMALL HOOKS / HELPERS ----------

const useProductQueries = (id: string | undefined) => {
  const {
    data: productData,
    isLoading: productLoading,
  } = useQuery<ApiProduct, Error>({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing product id");
      }
      const res = await api.get<ApiProduct>(`/products/id/${id}`);
      return res.data;
    },
  });

  const { data: relatedData } = useQuery<ApiProduct[], Error>({
    queryKey: ["product-related", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing product id");
      }
      const res = await api.get<ApiProduct[]>(`/products/id/${id}/related`);
      return res.data;
    },
  });

  const {
    data: ratingsData,
    isLoading: ratingsLoading,
    isError: ratingsErrorFlag,
    error: ratingsErrorObj,
  } = useQuery<RatingsResponse, Error>({
    queryKey: ["product-ratings", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing product id");
      }
      const res = await api.get<RatingsResponse>(`/ratings/${id}`);
      return res.data;
    },
  });

  const product = productData ?? null;
  const related = relatedData ?? [];
  const ratings: RatingApi[] = ratingsData?.ratings ?? [];
  const ratingsError = ratingsErrorFlag
    ? ratingsErrorObj?.message || "Could not load reviews."
    : null;

  return {
    product,
    related,
    ratings,
    ratingsData,
    ratingsLoading,
    ratingsError,
    productLoading,
  };
};

const useMembershipInfo = () => {
  const hasToken =
    "localStorage" in globalThis &&
    !!globalThis.localStorage.getItem("accessToken");

  const {
    data: userData,
    isLoading: loadingUser,
  } = useQuery<{ user?: UserMe }>({
    queryKey: ["membership"],
    enabled: hasToken,
    queryFn: async () => {
      try {
        const res = await api.get<{ user?: UserMe }>("/users/me");
        return res.data;
      } catch {
        return { user: undefined };
      }
    },
  });

  const user = userData?.user ?? null;
  const membershipUsage: MembershipUsage | null =
    user?.membershipUsage ?? null;

  const hasActiveMembership = (() => {
    const end = user?.membership?.expiresAt;
    const status = user?.membership?.status;
    if (status !== "ACTIVE" || !end) return false;
    return new Date(end) > new Date();
  })();

  const membershipPlanKey = user?.membership?.planKey ?? null;

  const { data: membershipPlansData } = useQuery<{
    plans: ApiMembershipPlan[];
  }>({
    queryKey: ["membership-plans"],
    enabled: hasActiveMembership && !!membershipPlanKey,
    queryFn: async () => {
      try {
        const res = await api.get<{ plans: ApiMembershipPlan[] }>(
          "/memberships/plans"
        );
        return res.data;
      } catch (err) {
        console.error("Failed to load membership plans:", err);
        return { plans: [] };
      }
    },
  });

  let membershipMaxDownloads: number | null = null;
  if (membershipPlansData && membershipPlanKey) {
    const plan = membershipPlansData.plans.find(
      (p) => p.key === membershipPlanKey
    );
    membershipMaxDownloads =
      typeof plan?.maxDownloadsPerMonth === "number"
        ? plan.maxDownloadsPerMonth
        : null;
  }

  const hasMembershipDownloadsLeft = (() => {
    if (!hasActiveMembership) return false;
    if (membershipMaxDownloads === null) return true;
    if (!membershipUsage) return true;
    return membershipUsage.downloadsUsed < membershipMaxDownloads;
  })();

  const membershipLimitReached =
    hasActiveMembership && !hasMembershipDownloadsLeft;

  return {
    user,
    loadingUser,
    hasActiveMembership,
    hasMembershipDownloadsLeft,
    membershipLimitReached,
  };
};

const usePreviewAudio = (product: ApiProduct | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!product?.files || !S3_PUBLIC_BASE_URL) return undefined;
    const previewFile = product.files.find(
      (f) => f.isPreview === true || f.fileType === "preview"
    );
    return previewFile ? `${S3_PUBLIC_BASE_URL}/${previewFile.key}` : undefined;
  }, [product]);

  useEffect(() => {
    if (!previewUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(previewUrl);
    audio.volume = 0.5;

    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
    };

    audio.addEventListener("ended", handleEnded);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [previewUrl]);

  const handlePlayToggle = () => {
    if (!audioRef.current) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.log("Audio play failed:", err);
        setIsPlaying(false);
      });
  };

  return { isPlaying, handlePlayToggle };
};

const buildTracklist = (product: ApiProduct | null): ApiTrack[] => {
  if (product?.tracklist?.length) return product.tracklist;

  if (!product) return [];

  const fullDuration = product.fullDuration ?? 0;
  const minutes = Math.floor(fullDuration / 60);
  const seconds = String(fullDuration % 60).padStart(2, "0");

  return [
    {
      title: product.title,
      duration: fullDuration ? `${minutes}:${seconds}` : "",
    },
  ];
};

const buildFeatures = (product: ApiProduct | null): string[] =>
  product?.features?.length
    ? product.features
    : [
        "320 Kbps Premium Audio Quality",
        "Instant Digital Download",
        "Lifetime Access",
      ];

const mapRelatedProducts = (related: ApiProduct[]) =>
  related.map((p) => {
    // 1. Cover Image logic
    const cover =
      p.thumbnail?.url ||
      fallbackCovers[
        Math.abs(p._id?.codePointAt(0) ?? 0) % fallbackCovers.length
      ];

    // 2. Direct Preview URL logic (Simplified)
    const audioPreview = p.previewAudio?.url || undefined;

    const isFeatured =
      p.collectionType === "dj-collection" ||
      p.collectionType === "popular-pack";

    return {
      id: p._id,
      title: p.title,
      price: p.price,
      originalPrice: p.mrp,
      coverImage: cover,
      isNew: p.isNewTag,
      isFeatured,
      releaseDate: p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      rating: p.averageRating ?? 0,
      audioPreview, 
    };
  });

// ---------- MAIN HOOK (LOWER COMPLEXITY) ----------

export const useProductDetail = (id: string | undefined) => {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();

  const [isFavorite, setIsFavorite] = useState(false);
  const [downloadingFull, setDownloadingFull] = useState(false);

  const {
    product,
    related,
    ratings,
    ratingsData,
    ratingsLoading,
    ratingsError,
    productLoading,
  } = useProductQueries(id);

  const {
    user,
    loadingUser,
    hasActiveMembership,
    hasMembershipDownloadsLeft,
    membershipLimitReached,
  } = useMembershipInfo();

  const { isPlaying, handlePlayToggle } = usePreviewAudio(product);

  const coverImage =
    product?.thumbnail?.url ||
    (product
      ? fallbackCovers[
          Math.abs(product._id?.codePointAt(0) ?? 0) % fallbackCovers.length
        ]
      : fallbackCovers[0]);

  const derivedAverageFromRatings = useMemo(() => {
    if (!ratings.length) return undefined;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }, [ratings]);

  const ratingValue =
    ratingsData?.averageRating ??
    product?.averageRating ??
    derivedAverageFromRatings ??
    0;

  

  const totalReviews =
    ratingsData?.ratingCount ?? product?.ratingCount ?? ratings.length;

  const tracklist = buildTracklist(product);
  const features = buildFeatures(product);
  const relatedMapped = useMemo(() => mapRelatedProducts(related), [related]);

  const showMembershipDownloadButton =
      hasActiveMembership && 
      hasMembershipDownloadsLeft && 
      !product?.isExclusive;

  const mrp = product?.mrp;
  const hasDiscountValue =
    mrp !== undefined && product?.price !== undefined && mrp > product.price;
  const discount =
    hasDiscountValue && mrp && product?.price !== undefined
      ? Math.round(((mrp - product.price) / mrp) * 100)
      : 0;

  const isInCartCurrentProduct = !!(product && isInCart(product._id));
  const loading = productLoading;

// --- REFINED PURCHASED LOGIC ---
  const isPurchased = useMemo(() => {
    if (!user || !product || !user.purchasedProducts) return false;
    
    const purchased = user.purchasedProducts;
    
    return purchased.some((p: any) => {
      const purchasedProductId = p.product?._id || p.product;
      
      return purchasedProductId?.toString() === product._id?.toString();
    });
  }, [user, product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (isPurchased) {
      toast({
        title: "Already purchased",
        description: "You already own this track.",
        variant: "destructive",
      });
      return;
    }

    if (isInCartCurrentProduct) {
      toast({
        title: "Already in cart",
        description: "This track is already in your cart.",
      });
      return;
    }

    const fallbackIndex =
      Math.abs(product._id?.codePointAt(0) ?? 0) % fallbackCovers.length;

    addToCart({
      id: product._id,
      title: product.title,
      artist: product.artistId || "Kumar",
      price: product.price,
      coverImage: product.thumbnail?.url || fallbackCovers[fallbackIndex],
      format: "MP3 320 Kbps",
    });

    toast({
      title: "Added to cart",
      description: product.title,
    });
  };

const handleDownloadFull = async () => {
    if (!product || downloadingFull) return;

    try {
      setDownloadingFull(true);

      toast({
        title: "Preparing download",
        description: "Verifying access...",
      });

      const res = await api.get<any>(
        "/products/download",
        {
          params: { productId: product._id },
        }
      );

      const downloadUrl = res.data?.downloadUrl || res.data?.download?.url;

      if (downloadUrl) {
        // Create invisible link to trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            link.remove();
        }, 100);

        toast({
          title: "Download started",
          description: "Your file is downloading in a new tab.",
        });
      } else {
        console.error("URL Extraction Failed. Keys found:", Object.keys(res.data));
        throw new Error("Download link not found in response.");
      }
    } catch (err: any) {
      console.error("Download Error:", err);
      
      const serverMsg = err?.response?.data?.message;
      const clientMsg = err?.message; 
      
      const finalMessage = serverMsg || clientMsg || "Could not retrieve the file. Please contact support.";

      toast({
        title: "Download Failed",
        description: finalMessage,
        variant: "destructive",
      });
    } finally {
      setDownloadingFull(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(globalThis.location.href);
      toast({
        title: "Link copied",
        description: "Product URL copied to clipboard.",
      });
    } catch {
      toast({
        title: "Could not copy link",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  return {
    // state
    loading,
    product,
    coverImage,
    tracklist,
    features,
    relatedMapped,
    discount,
    hasDiscount: hasDiscountValue,
    ratingValue,
    totalReviews,
    ratings,
    ratingsLoading,
    ratingsError,
    loadingUser,
    downloadingFull,
    isFavorite,
    isPlaying,
    isPurchased,
    hasActiveMembership,
    membershipLimitReached,
    showMembershipDownloadButton,
    isInCartCurrentProduct,
    STAR_INDICES,
    userData: user, // also returning user data for direct UI checks
    // handlers
    handlePlayToggle,
    handleAddToCart,
    handleDownloadFull,
    handleShare,
    toggleFavorite,
  };
};