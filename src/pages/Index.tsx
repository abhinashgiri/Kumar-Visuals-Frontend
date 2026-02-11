import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CategoryCarousel from "@/components/CategoryCarousel";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import VisitorCounter from "@/components/VisitorCounter";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Music2, ShieldCheck, Zap, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import album1 from "@/assets/album1.jpg";
import album2 from "@/assets/album2.jpg";
import album3 from "@/assets/album3.jpg";
import album4 from "@/assets/album4.jpg";
import api from "@/services/api";
import { SectionLoader } from "@/components/ui/loader";
import { SeoHead } from "@/components/SeoHead";

/** * Type Definitions 
 */
type ApiFile = {
  key: string;
  filename?: string;
  contentType?: string;
  size?: number;
  isPreview?: boolean;
  fileType?: string;
};

type ApiProduct = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  thumbnail?: { url?: string; key?: string; contentType?: string };
  previewAudio?: { url?: string; key?: string; duration?: number };
  averageRating?: number;
  createdAt?: string;
  isNewTag?: boolean;
  category?: string;
  files?: ApiFile[];
};

type CarouselItem = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  isNew?: boolean;
  isFeatured?: boolean;
  rating?: number;
  audioPreview?: string;
  videoPreview?: string;
  onPlayClick?: () => void;
};

type HeroStat = { label: string; value: string; icon?: string };
type HeroSection = {
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImageUrl?: string;
  tags?: string[];
  stats?: HeroStat[];
};

type CategoryItem = { name: string; slug: string; icon?: string; isActive?: boolean };
type TestimonialItem = { name: string; role?: string; avatarUrl?: string; rating?: number; quote: string; isActive?: boolean };
type WhyChooseItem = { icon?: string; title: string; description: string; isActive?: boolean };
type SectionHeader = { title: string; subtitle?: string };

type MegaBundle = {
  isEnabled?: boolean;
  badgeText?: string;
  title: string;
  subtitle?: string;
  description?: string;
  playlistsCount?: number;
  discountPercent?: number;
  price?: number;
  originalPrice?: number;
  currency?: string;
  ctaText?: string;
  ctaLink?: string;
  releaseDate?: string;
};

type HomePageSettings = {
  hero: HeroSection;
  categories: CategoryItem[];
  testimonialsEnabled: boolean;
  testimonials: TestimonialItem[];
  whyChooseEnabled: boolean;
  whyChoose: WhyChooseItem[];
  megaBundle: MegaBundle;
  testimonialsHeader?: SectionHeader;
  whyChooseHeader?: SectionHeader;
};

/**
 * Premium Page Loader Component
 */
const PageLoader = ({ title }: { title?: string }) => {
  const displayTitle = title || "Kumar Visuals";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-2xl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none text-primary">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-6 md:gap-10 px-4">
        <div className="relative w-16 h-16 md:w-24 md:h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/10 border-t-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-3 h-3 bg-primary rounded-full blur-[2px]"
          />
        </div>

        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic gradient-text pb-2">
              {displayTitle}
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary/10 overflow-hidden rounded-full">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-primary/80">
              Initializing Experience
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  // Fetch Homepage Data
  const { data: homeSettings, isLoading: homeLoading, isError: homeError, error: homeErrorObj } = useQuery<HomePageSettings, Error>({
    queryKey: ["homepage-settings"],
    queryFn: async () => {
      const res = await api.get<HomePageSettings>("/homepage");
      return res.data;
    },
  });

  // Fetch Products Data
  const { data: allProductsData, isLoading: productsLoading, isError: productsErrorFlag, error: productsErrorObj } = useQuery<ApiProduct[], Error>({
    queryKey: ["home-products"],
    queryFn: async () => {
      const res = await api.get<ApiProduct[]>("/products");
      return res.data;
    },
  });

  const allProducts = allProductsData ?? [];
  const productsError = productsErrorFlag ? productsErrorObj?.message ?? "Unable to load products." : null;
  const homepageError = homeError ? homeErrorObj?.message ?? "Unable to load content." : null;
  const isInitialLoading = (homeLoading && !homeSettings) || (productsLoading && !allProductsData);
  const brandTitle = homeSettings?.hero?.title ?? "Kumar Visuals";

  // Data Mapping Helpers
  const mapToCarouselItem = (p: ApiProduct): CarouselItem => {
    const previewUrl = p.previewAudio?.url;
    const isVideo = new RegExp(/\.(mp4|webm|ogg|mov)$/i).exec(previewUrl) || p.thumbnail?.contentType?.includes("video");
    const fallbackCovers = [album1, album2, album3, album4];
    const cover = p.thumbnail?.url || fallbackCovers[Math.abs(p._id?.codePointAt(0) || 0) % fallbackCovers.length];

    return {
      id: p._id,
      title: p.title,
      price: p.price,
      originalPrice: p.mrp,
      coverImage: cover,
      isNew: p.isNewTag,
      rating: p.averageRating ?? undefined,
      audioPreview: isVideo ? undefined : previewUrl,
      videoPreview: isVideo ? previewUrl : undefined,
      onPlayClick: isVideo && previewUrl ? () => setSelectedVideo({ url: previewUrl, title: p.title }) : undefined,
    };
  };

  const activeCategories = useMemo(() => homeSettings?.categories?.filter((c) => c.isActive !== false) ?? [], [homeSettings]);

  const itemsByCategorySlug = useMemo(() => {
    const map: Record<string, CarouselItem[]> = {};
    if (!allProducts.length || !activeCategories.length) return map;

    for (const cat of activeCategories) {
      if (!cat.slug) continue;
      const productsForCat = allProducts
        .filter((p) => p.category === cat.slug)
        .sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
      map[cat.slug] = productsForCat.map(mapToCarouselItem);
    }
    return map;
  }, [allProducts, activeCategories]);

  const testimonialItems = useMemo(() => {
    if (!homeSettings?.testimonialsEnabled) return [];
    return (homeSettings.testimonials || [])
      .filter((t) => t.isActive !== false)
      .map((t, idx) => ({
        id: `t-${idx}-${t.name}`,
        name: t.name,
        role: t.role ?? "Producer",
        avatar: t.avatarUrl ?? "",
        rating: t.rating ?? 5,
        comment: t.quote,
      }));
  }, [homeSettings]);

  const featureCards = useMemo(() => {
    if (!homeSettings?.whyChooseEnabled) return [];
    const baseIcons = [
      { icon: <Zap className="w-7 h-7 md:w-8 md:h-8" />, bgClass: "bg-primary/10", iconClass: "text-primary" },
      { icon: <ShieldCheck className="w-7 h-7 md:w-8 md:h-8" />, bgClass: "bg-secondary/10", iconClass: "text-secondary" },
      { icon: <Music2 className="w-7 h-7 md:w-8 md:h-8" />, bgClass: "bg-accent/10", iconClass: "text-accent" },
    ];
    return homeSettings.whyChoose
      .filter((w) => w.isActive !== false)
      .map((item, index) => ({
        ...item,
        ...baseIcons[index % baseIcons.length],
        desc: item.description,
      }));
  }, [homeSettings]);

  const megaBundle = homeSettings?.megaBundle;
  const currencyLabel = megaBundle?.currency === "INR" || !megaBundle?.currency ? "₹" : megaBundle.currency;
  const releaseDateLabel = megaBundle?.releaseDate ? new Date(megaBundle.releaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

  // Component Logic for Sections
  const productSectionContent = productsLoading ? (
    <SectionLoader label="Syncing latest releases..." />
  ) : allProducts.length === 0 ? (
    <p className="text-sm text-muted-foreground text-center py-12">No products available yet.</p>
  ) : (
    <div className="space-y-12 md:space-y-24">
      {activeCategories.map((cat) => {
        const items = itemsByCategorySlug[cat.slug] ?? [];
        return items.length > 0 ? <CategoryCarousel key={cat.slug} title={cat.name} items={items} /> : null;
      })}
    </div>
  );

  return (
    
    <div className="min-h-screen bg-[#fafafa] dark:bg-background relative overflow-x-hidden">
      <SeoHead />
      {isInitialLoading && <PageLoader title={brandTitle} />}

      <VisitorCounter pageId="home" />
      <Navigation />

      {!homeSettings && homeLoading ? (
        <SectionLoader label="Loading experience..." className="py-20" />
      ) : (
        <Hero hero={homeSettings?.hero} />
      )}

      <main className="space-y-16 md:space-y-32 pb-16 md:pb-24">
        {/* Main Product Lists */}
        <section className="container mx-auto px-4 pt-6 md:pt-10">
          {(homepageError || productsError) && (
            <p className="text-xs md:text-sm text-red-500 text-center mb-6 font-bold">
              {homepageError || productsError}
            </p>
          )}
          {productSectionContent}
        </section>

        {/* Mega Bundle CTA Section */}
        {megaBundle?.isEnabled && (
          <section className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-background border border-border/50 shadow-2xl p-6 md:p-14 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
              {megaBundle.badgeText && (
                <Badge variant="secondary" className="mb-4 md:mb-6 rounded-full px-4 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {megaBundle.badgeText}
                </Badge>
              )}
              <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter mb-4 text-foreground leading-tight">
                {megaBundle.title} {megaBundle.subtitle && <span className="block md:inline gradient-text">{megaBundle.subtitle}</span>}
              </h2>
              {megaBundle.description && (
                <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 font-medium">
                  {megaBundle.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center">
                {typeof megaBundle.price === "number" && (
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Bundle Price</p>
                    <div className="text-3xl md:text-4xl font-black text-primary italic">
                      {currencyLabel}{megaBundle.price}
                    </div>
                    {!!(megaBundle.originalPrice) && (
                      <div className="text-xs md:text-sm text-muted-foreground/40 line-through font-bold">
                        {currencyLabel}{megaBundle.originalPrice}
                      </div>
                    )}
                  </div>
                )}
                {megaBundle.ctaText && (
                  <Link to={megaBundle.ctaLink || "#"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-black italic uppercase tracking-widest gap-3 shadow-xl hover:scale-105 transition-all">
                      {megaBundle.ctaText} <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
              {releaseDateLabel && (
                <div className="mt-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  Release Date: <span className="text-primary/60">{releaseDateLabel}</span>
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* Why Choose Section */}
        {homeSettings?.whyChooseEnabled && featureCards.length > 0 && (
          <section className="container mx-auto px-4 max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tight text-foreground">
                {homeSettings?.whyChooseHeader?.title || "Why Kumar Visuals"}
              </h2>
              {homeSettings?.whyChooseHeader?.subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground font-medium mt-2">{homeSettings.whyChooseHeader.subtitle}</p>
              )}
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featureCards.map((feature, idx) => (
                <motion.div key={idx} whileHover={{ y: -5 }} className="p-6 md:p-8 rounded-3xl bg-background/40 border border-border/50 hover:border-primary/30 transition-all text-center space-y-4 shadow-sm">
                  <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl flex items-center justify-center ${feature.bgClass} ${feature.iconClass} border border-border/10`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-bold">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {homeSettings?.testimonialsEnabled && testimonialItems.length > 0 && (
          <TestimonialCarousel testimonials={testimonialItems} header={homeSettings?.testimonialsHeader} />
        )}
      </main>

      {/* Video Popup Player */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-xl md:rounded-2xl shadow-2xl mx-4 sm:mx-auto">
          <DialogHeader className="absolute top-2 right-2 md:top-4 md:right-4 z-50">
            <button onClick={() => setSelectedVideo(null)} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </DialogHeader>
          {selectedVideo && (
            <div className="relative aspect-video w-full bg-black">
              <video src={selectedVideo.url} className="w-full h-full object-contain" controls autoPlay playsInline>
                <track kind="captions" srcLang="en" label="English" />
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;