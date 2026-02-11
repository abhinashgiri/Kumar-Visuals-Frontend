import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, Sparkles, Music2, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom"; 

import Navigation from "@/components/Navigation";
import MusicCard from "@/components/MusicCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import api from "@/services/api";
import { SectionLoader, Spinner } from "@/components/ui/loader";
import { useSiteSettings } from "@/store/useSiteSettings";
import { SeoHead } from "@/components/SeoHead";

/** ---------- TYPES ---------- */
type ApiProduct = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  thumbnail: { url: string; key: string; contentType: string };
  previewAudio?: { url?: string; key?: string; duration?: number };
  averageRating?: number;
  createdAt?: string;
  isNewTag?: boolean;
  collectionType?: string;
  isExclusive?: boolean; 
  visibility?: "public" | "private" | "draft";
};

type SearchResponse = {
  products: ApiProduct[];
  total: number;
  totalPages: number;
};

const ITEMS_PER_PAGE = 12;

/** ---------- SUB-COMPONENT: Discount Banner (MOVED OUTSIDE) ---------- */
const DiscountBanner = ({ discountBanner }) => {
  if (!discountBanner?.enabled || !discountBanner?.imageUrl) return null;

  const BannerWrapper = ({ children }) => {
    const link = discountBanner.ctaLink;
    // Wrapper style
    const className = "block group cursor-pointer w-full h-full";

    if (link) {
      const isExternal = link.startsWith("http");
      return isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
      ) : (
        <Link to={link} className={className}>{children}</Link>
      );
    }
    return <div className={className}>{children}</div>;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 mt-20 md:mt-28 px-4 mb-[-60px]"
    >
      <div className="container mx-auto max-w-[1400px] p-0">
        <BannerWrapper>
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-primary/10 shadow-2xl bg-background transition-transform duration-500 group-hover:scale-[1.005]">
            
            <div className="block md:hidden">
              {/* 1. Image (Full Width, Auto Height - No Cropping) */}
              <div className="w-full">
                <img
                  src={discountBanner.imageUrl}
                  alt={discountBanner.title || "Discount Offer"}
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
              </div>

              <div className="p-6 space-y-3 bg-background border-t border-border/50">
                 {discountBanner.title && (
                    <h2 className="text-xl font-black italic text-foreground tracking-tighter leading-tight">
                      {discountBanner.title}
                    </h2>
                  )}
                  {discountBanner.subtitle && (
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                      {discountBanner.subtitle}
                    </p>
                  )}
                  {discountBanner.ctaText && (
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 w-full"
                      >
                        {discountBanner.ctaText}
                      </Button>
                    </div>
                  )}
              </div>
            </div>


            <div className="hidden md:block relative h-[250px]">
              
              {/* 1. Image (Background Cover) */}
              <img
                src={discountBanner.imageUrl}
                alt={discountBanner.title || "Discount Offer"}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
              />

              {/* 2. Overlay Gradient & Text */}
              {(discountBanner.title || discountBanner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center">
                  <div className="px-12 w-full max-w-3xl space-y-4 pt-2">
                    
                    {discountBanner.title && (
                      <h2 className="text-5xl font-black italic text-white tracking-tighter drop-shadow-lg leading-tight">
                        {discountBanner.title}
                      </h2>
                    )}

                    {discountBanner.subtitle && (
                      <p className="text-lg text-white/90 font-medium max-w-xl leading-relaxed drop-shadow-md">
                        {discountBanner.subtitle}
                      </p>
                    )}

                    {discountBanner.ctaText && (
                      <div className="pt-4">
                        <Button 
                          className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs px-8 bg-white text-black hover:bg-white/90 border-0 shadow-xl pointer-events-none"
                        >
                          {discountBanner.ctaText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </BannerWrapper>
      </div>
    </motion.section>
  );
};


/** ---------- SUB-COMPONENT: Empty State ---------- */
const EmptyState = memo(({ onReset, isSearch }: { onReset: () => void; isSearch: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center px-4"
  >
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
      <div className="relative p-6 bg-background border border-border shadow-xl rounded-full">
        {isSearch ? <Search className="h-10 w-10 text-muted-foreground" /> : <Music2 className="h-10 w-10 text-muted-foreground" />}
      </div>
    </div>
    <h3 className="text-2xl font-bold mb-2">
      {isSearch ? "No matching tracks found" : "Catalog is currently empty"}
    </h3>
    <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
      {isSearch 
        ? "We couldn't find what you're looking for. Try different keywords or reset your filters." 
        : "Check back later! We're constantly adding new premium studio sounds to our collection."}
    </p>
    {isSearch && (
      <Button 
        onClick={onReset} 
        variant="outline" 
        className="gap-2 rounded-xl h-12 px-6 border-primary/20 hover:bg-primary/5 font-bold"
      >
        <RefreshCcw className="h-4 w-4" /> Reset All Filters
      </Button>
    )}
  </motion.div>
));

/** ---------- HELPER: MusicCard Mapping ---------- */
const mapToMusicCardProps = (p: ApiProduct) => {
  const dateObj = p.createdAt ? new Date(p.createdAt) : null;
  const formattedDate = dateObj 
    ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
    : "";

  const isFeatured = p.collectionType === "dj-collection" || p.collectionType === "popular-pack";
  const previewUrl = p.previewAudio?.url;
  const isVideo = new RegExp(/\.(mp4|webm|ogg|mov)$/i).exec(previewUrl?.toLowerCase()) || p.thumbnail?.contentType?.includes("video");

  return {
    id: p._id,
    title: p.title,
    price: p.price,
    originalPrice: p.mrp,
    coverImage: p.thumbnail?.url || "",
    isNew: !!p.isNewTag, 
    isFeatured,
    isExclusive: !!p.isExclusive, 
    releaseDate: formattedDate,
    rating: p.averageRating ?? 0,
    audioPreview: isVideo ? undefined : previewUrl,
    videoPreview: isVideo ? previewUrl : undefined,
  };
};

/** ---------- MAIN COMPONENT ---------- */
const Shop = () => {

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string} | null>(null);

  // Filter States
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyCollections, setOnlyCollections] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const { settings: siteSettings } = useSiteSettings();

  // Optimized Handlers
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("latest");
    setOnlyDiscounted(false);
    setOnlyNew(false);
    setOnlyCollections(false);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
  }, []);

  // Debounce Optimization
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Auth/User Check
  const { data: userData } = useQuery({
    queryKey: ["user-me-shop"],
    enabled: globalThis.window !== undefined && !!localStorage.getItem("accessToken"),
    queryFn: async () => (await api.get("/users/me")).data,
    staleTime: 1000 * 60 * 5, 
  });

  const purchasedIds = useMemo(() => {
    const products = userData?.user?.purchasedProducts || [];
    return new Set<string>(
      products.map((item: any) => 
        (typeof item === 'object' && item?.product) ? item.product.toString() : item.toString()
      )
    );
  }, [userData]);

  // ** ACCESS DISCOUNT BANNER DATA HERE **
  const discountBanner = siteSettings?.discountBanner;

  // Main Data Query
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery<SearchResponse, Error>({
    queryKey: ["products", { q: debouncedSearch, sortBy }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get("/products/search", { 
        params: { 
          q: debouncedSearch || undefined, 
          sort: sortBy, 
          page: pageParam, 
          limit: ITEMS_PER_PAGE, 
          visibility: "public" 
        } 
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length < lastPage.totalPages ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

  const allProducts = useMemo(() => data?.pages.flatMap((p) => p.products) ?? [], [data]);

  // Optimized Client-side Filtering
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
        if (onlyDiscounted && !(p.mrp && p.mrp > p.price)) return false;
        if (onlyNew && !p.isNewTag) return false;
        if (onlyCollections && !(p.collectionType === "dj-collection" || p.collectionType === "popular-pack")) return false;
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        if (minRating && (p.averageRating ?? 0) < Number(minRating)) return false;
        return true;
    });
  }, [allProducts, onlyDiscounted, onlyNew, onlyCollections, minPrice, maxPrice, minRating]);

  // Infinite Scroll Observer Cleanup
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1, rootMargin: "100px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Header Visual Parsing
  const { headerBadge, titleFirst, titleLast, headerSubtitle } = useMemo(() => {
    const badge = siteSettings?.shopHeader?.badge || "Professional Studio Catalog";
    const title = siteSettings?.shopHeader?.title || "Music Catalog";
    const sub = siteSettings?.shopHeader?.subtitle || "Explore our premium collection of tracks and stems.";
    const parts = title.trim().split(" ");
    return {
      headerBadge: badge,
      titleFirst: parts.slice(0, -1).join(" "),
      titleLast: parts.slice(-1),
      headerSubtitle: sub
    };
  }, [siteSettings]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead pageTitle="Shop" />
      <Navigation />

      {/* --- ADDED DISCOUNT BANNER HERE --- */}
      <DiscountBanner discountBanner={discountBanner} />

      <section className="relative pt-24 md:pt-40 pb-10 md:pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.08),transparent_70%)] -z-10" />
        
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <Sparkles className="h-3 w-3" /> {headerBadge}
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic text-foreground leading-[1.1]">
              {titleFirst} <span className="gradient-text">{titleLast}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium opacity-80">
              {headerSubtitle}
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto glass-card p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-2xl border-primary/10 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="text" 
                placeholder="Search tracks, remixes..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-12 bg-transparent border-none h-12 md:h-14 text-sm md:text-base focus-visible:ring-0 shadow-none" 
              />
            </div>
            <div className="flex items-center gap-2 px-1 pb-1 md:pb-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 md:w-[160px] bg-background/50 h-11 md:h-12 border-none rounded-xl md:rounded-full font-bold text-[11px] uppercase tracking-wider">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price-low">Price: Low</SelectItem>
                    <SelectItem value="price-high">Price: High</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" className="gap-2 h-11 md:h-12 rounded-xl md:rounded-full px-5 font-bold uppercase text-[10px] shrink-0" onClick={() => setFiltersOpen(true)}>
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-32"><SectionLoader label="Scanning studio library..." /></div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MusicCard 
                      {...mapToMusicCardProps(p)} 
                      alreadyPurchased={purchasedIds.has(p._id)} 
                      onPlayClick={p.previewAudio?.url ? () => setSelectedVideo({url: p.previewAudio!.url!, title: p.title}) : undefined} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {hasNextPage && (
              <div ref={observerTarget} className="mt-20 flex justify-center h-20">
                {isFetchingNextPage && <Spinner label="Loading more tracks..." />}
              </div>
            )}
          </>
        ) : (
          <EmptyState onReset={handleResetFilters} isSearch={!!debouncedSearch || onlyDiscounted || onlyNew} />
        )}
      </section>

      {/* VIDEO DIALOG */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-2xl shadow-2xl">
          <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all focus:outline-none">
            <X className="h-5 w-5" />
          </button>
          {selectedVideo && (
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video 
                src={selectedVideo.url} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                playsInline 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FILTER DIALOG */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-w-[420px] p-6 md:p-8 rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black italic">FILTERS</DialogTitle></DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              {[
                { label: "Discounted Items", sub: "Show only deals", state: onlyDiscounted, setter: setOnlyDiscounted },
                { label: "New Releases", sub: "Latest additions", state: onlyNew, setter: setOnlyNew },
                { label: "DJ Collections", sub: "Popular curated packs", state: onlyCollections, setter: setOnlyCollections }
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.sub}</p>
                  </div>
                  <Switch checked={f.state} onCheckedChange={f.setter} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Price</p>
                <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Price</p>
                <Input type="number" placeholder="5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={handleResetFilters}>Reset</Button>
              <Button className="flex-[2] h-12 rounded-xl font-bold bg-primary" onClick={() => setFiltersOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Shop;