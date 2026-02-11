import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MusicCard from "@/components/MusicCard";
import { SectionLoader } from "@/components/ui/loader";
import { ChevronRight, Music2, Sparkles, ArrowLeft } from "lucide-react";

import { useProductDetail } from "@/hooks/useProductDetail";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductTabs } from "@/components/product/ProductTabs";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/SeoHead";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  const {
    loading,
    product,
    coverImage,
    tracklist,
    features,
    relatedMapped,
    discount,
    hasDiscount,
    ratingValue,
    totalReviews,
    ratings,
    ratingsLoading,
    ratingsError,
    loadingUser,
    downloadingFull,
    isFavorite,
    isPlaying,
    hasActiveMembership,
    membershipLimitReached,
    showMembershipDownloadButton,
    isInCartCurrentProduct,
    STAR_INDICES,
    userData,
    handlePlayToggle,
    handleAddToCart,
    handleDownloadFull,
    handleShare,
    toggleFavorite,
  } = useProductDetail(id);

  const showNotFound = !loading && !product;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500 overflow-x-hidden">
      <Navigation />
      <SeoHead pageTitle={product?.title || "Product Details"} />

      {/* Subtle Background Glows for Premium Look */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* --- EASY BREADCRUMB --- */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-10 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50"
          >
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <Link to="/shop" className="hover:text-primary transition-colors">Music Library</Link>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <span className="text-primary truncate max-w-[200px] italic font-black">
              {product?.title || "Details"}
            </span>
          </motion.div>

          {/* --- SIMPLE LOADING STATE --- */}
          {loading && (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <SectionLoader label="Loading track details..." />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 animate-pulse">Connecting to server</p>
            </div>
          )}

          {/* --- CLEAN ERROR STATE --- */}
          {showNotFound && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center space-y-6 max-w-sm mx-auto">
               <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <Music2 className="h-10 w-10 text-muted-foreground/40" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-black italic tracking-tight text-foreground uppercase">Track Not Found</h2>
                 <p className="text-sm text-muted-foreground leading-relaxed">Sorry, the music track you are looking for is no longer available in our library.</p>
               </div>
               <Link to="/shop" className="inline-block pt-2">
                  <Button variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2">
                    <ArrowLeft className="h-3 w-3" /> Go Back to Shop
                  </Button>
               </Link>
            </motion.div>
          )}

          {/* --- MAIN CONTENT --- */}
          {!loading && product && (
            <div className="space-y-20">
              
              {/* 1. PRODUCT HERO SECTION */}
              <section className="relative">
                <ProductHero
                  product={product}
                  coverImage={coverImage}
                  tracklist={tracklist}
                  ratingValue={ratingValue}
                  totalReviews={totalReviews}
                  discount={discount}
                  hasDiscount={hasDiscount}
                  isPlaying={isPlaying}
                  isFavorite={isFavorite}
                  loadingUser={loadingUser}
                  downloadingFull={downloadingFull}
                  hasActiveMembership={hasActiveMembership}
                  membershipLimitReached={membershipLimitReached}
                  showMembershipDownloadButton={showMembershipDownloadButton}
                  isInCartCurrentProduct={isInCartCurrentProduct}
                  userData={userData} // Pass userData to enable block logic
                  onTogglePlay={handlePlayToggle}
                  onAddToCart={handleAddToCart}
                  onDownloadFull={handleDownloadFull}
                  onShare={handleShare}
                  onToggleFavorite={toggleFavorite}
                  STAR_INDICES={STAR_INDICES}
                />
              </section>

              {/* 2. TABS SECTION (Tracklist & Reviews) */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background/40 backdrop-blur-md rounded-[2rem] border border-border/40 overflow-hidden shadow-xl"
              >
                <ProductTabs
                  tracklist={tracklist}
                  features={features}
                  ratings={ratings}
                  ratingsLoading={ratingsLoading}
                  ratingsError={ratingsError}
                  STAR_INDICES={STAR_INDICES}
                  sampleEnabled={Boolean(product.sampleEnabled)}
                  sampleYoutubeUrl={product.sampleYoutubeUrl}
                />
              </motion.section>

              {/* 3. SIMILAR TRACKS SECTION */}
              {relatedMapped.length > 0 && (
                <section className="space-y-10 pt-10">
                  <div className="flex items-center justify-between border-b border-border/20 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-foreground leading-none">
                          Related <span className="gradient-text">Tracks</span>
                        </h2>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">More music you might enjoy</p>
                    </div>
                    <Link to="/shop" className="hidden sm:block text-[10px] font-black uppercase text-primary border-b border-primary/20 hover:border-primary transition-all pb-0.5">
                      Explore All →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {relatedMapped.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <MusicCard {...card} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;