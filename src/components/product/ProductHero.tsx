import { FC, useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Play,
  Pause,
  Download,
  Music,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  CloudDownload,
  ShieldCheck,
  Video,
  X,
  Crown 
} from "lucide-react";
import { ButtonSpinner } from "@/components/ui/loader";
import { ApiProduct, ApiTrack } from "@/types/product";

// --- HELPER: Identify & Convert URL Types ---
const isYoutubeUrl = (url: string) => url.includes("youtu");

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = new RegExp(regExp).exec(url);
  return (match?.[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}` 
    : url; 
};

interface ProductHeroProps {
  product: ApiProduct;
  coverImage: string;
  tracklist: ApiTrack[];
  ratingValue: number;
  totalReviews: number;
  discount: number;
  hasDiscount: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  loadingUser: boolean;
  downloadingFull: boolean;
  hasActiveMembership: boolean;
  membershipLimitReached: boolean;
  showMembershipDownloadButton: boolean;
  isInCartCurrentProduct: boolean;
  userData?: any; 
  onTogglePlay: () => void;
  onAddToCart: () => void;
  onDownloadFull: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  STAR_INDICES: number[];
}

export const ProductHero: FC<ProductHeroProps> = ({
  product,
  coverImage,
  ratingValue,
  totalReviews,
  discount,
  hasDiscount,
  isPlaying,
  isFavorite,
  loadingUser,
  downloadingFull,
  hasActiveMembership,
  membershipLimitReached,
  showMembershipDownloadButton,
  isInCartCurrentProduct,
  userData,
  onTogglePlay,
  onAddToCart,
  onDownloadFull,
  onShare,
  onToggleFavorite,
  STAR_INDICES,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const mrp = product.mrp;
  const canShowMrp = hasDiscount && mrp !== undefined;

  // --- LOGIC FROM SHOP.TSX ---
  const previewUrl = product.previewAudio?.url;
  
  const isPreviewFileVideo = useMemo(() => {
    if (!previewUrl) return false;
    return !!new RegExp(/\.(mp4|webm|ogg|mov)$/i).exec(previewUrl) || product.thumbnail?.contentType?.includes("video");
  }, [previewUrl, product.thumbnail]);

  // 2. Determine Audio vs Video Source
  const audioSource = isPreviewFileVideo ? undefined : previewUrl;
  const videoSource = isPreviewFileVideo ? previewUrl : undefined;

  const hasVideo = !!videoSource;
  const hasAudio = !!audioSource;

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
          if (isPlaying) onTogglePlay();
        });
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  }, [isPlaying, onTogglePlay]);

  const isAlreadyPurchased = useMemo(() => {
    if (!userData?.purchasedProducts || !Array.isArray(userData.purchasedProducts)) return false;
    return userData.purchasedProducts.some((item: any) => {
      const pid = item.product?._id || item.product;
      return pid?.toString() === product._id?.toString();
    });
  }, [userData, product._id]);

  const handleMainAction = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasVideo) {
      if (isPlaying) onTogglePlay();
      setShowVideo(true);
    } else if (hasAudio) {
      onTogglePlay();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-20 items-start">
      
      {/* HIDDEN AUDIO ELEMENT FOR PLAYBACK */}
      {hasAudio && (
        <audio 
          ref={audioRef} 
          src={audioSource} 
          onEnded={() => isPlaying && onTogglePlay()} 
          preload="metadata"
        >
          <track kind="captions" src="" label="English" />
        </audio>
      )}

      {/* LEFT COLUMN: VISUALS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 space-y-6">
        <div 
          className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border/60 shadow-xl group cursor-pointer"
          onMouseEnter={() => { 
            if (hasAudio && !isPlaying) onTogglePlay(); 
          }}
          onMouseLeave={() => { 
            if (hasAudio && isPlaying) onTogglePlay(); 
          }}
          onClick={handleMainAction}
        >
          <img src={coverImage} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {hasVideo ? (
              <div className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
                <Video className="h-10 w-10 fill-current" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
              </div>
            )}
          </div>

          {/*  LEFT BADGES (NEW & DISCOUNT) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-2">
            {product.isNewTag && (
               <Badge className="bg-foreground text-background font-bold px-3 py-1 uppercase text-[9px] tracking-widest border-none shadow-sm">
                 New
               </Badge>
            )}
            
            {discount > 0 && (
               <Badge variant="destructive" className="font-bold px-3 py-1 uppercase text-[9px] tracking-widest border-none shadow-sm">
                 {discount}% Off
               </Badge>
            )}
          </div>

          {/*  RIGHT BADGE (EXCLUSIVE) */}
          {product.isExclusive && (
             <div className="absolute top-3 right-3 z-20">
               <Badge className="bg-amber-500 text-black font-black px-3 py-1 uppercase text-[10px] tracking-widest border-none shadow-lg flex items-center gap-1 hover:bg-amber-400">
                 <Crown className="h-3 w-3 fill-black/20" /> Exclusive
               </Badge>
             </div>
          )}

          {hasVideo && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
              <Video className="h-3 w-3 text-white" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Watch Preview</span>
            </div>
          )}
        </div>

        {/* METADATA INFO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 text-center flex flex-col items-center">
            <Music className="h-4 w-4 mb-2 text-muted-foreground/40" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5 leading-none">Format</p>
            <p className="text-[11px] font-bold text-foreground truncate w-full px-1">{product.audioFormatText || "WAV / MP3"}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 text-center flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-2 text-emerald-500/40" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5 leading-none">Quality</p>
            <p className="text-[11px] font-bold text-foreground">Studio Master</p>
          </div>
        </div>
      </motion.div>

      {/* RIGHT COLUMN: DETAILS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 flex flex-col pt-2">
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter italic text-foreground leading-[1.1]">
            {product.title}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-0.5">
              {STAR_INDICES.map((i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.floor(ratingValue) ? "text-yellow-500 fill-current" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none">
              {ratingValue.toFixed(1)} / {totalReviews} Reviews
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-5xl font-black tracking-tighter text-primary italic">₹{product.price}</span>
          {canShowMrp && <span className="text-2xl text-muted-foreground/20 line-through font-bold">₹{mrp}</span>}
        </div>

        <Separator className="mb-8 opacity-40" />

        {/* ACTIONS */}
        <div className="space-y-4 mb-12">
          <MembershipActions
            isPurchased={isAlreadyPurchased}
            loadingUser={loadingUser}
            hasActiveMembership={hasActiveMembership}
            showMembershipDownloadButton={showMembershipDownloadButton}
            membershipLimitReached={membershipLimitReached}
            downloadingFull={downloadingFull}
            isInCartCurrentProduct={isInCartCurrentProduct}
            onDownloadFull={onDownloadFull}
            onAddToCart={onAddToCart}
            isExclusive={product.isExclusive} // Pass isExclusive
          />

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className={`h-12 rounded-xl border-border/60 font-black uppercase tracking-widest text-[10px] gap-2 transition-all ${isAlreadyPurchased ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "hover:bg-primary/5"}`} onClick={onToggleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500 border-none" : "text-muted-foreground/60"}`} />
              {isAlreadyPurchased ? "In Your Vault" : isFavorite ? "Saved" : "Save Track"}
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-border/60 hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] gap-2 transition-all" onClick={onShare}>
              <Share2 className="h-4 w-4 text-muted-foreground/60" />
              Share Link
            </Button>
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <div className="space-y-5 border-t border-border/20 pt-10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Description</p>
              <Music className="h-3 w-3 text-muted-foreground/20" />
            </div>

            <div className="relative group">
              <motion.div initial={false} animate={{ height: isExpanded ? "auto" : "90px" }} className="overflow-hidden transition-all duration-300">
                <div className="text-[15px] md:text-[16px] text-foreground/80 font-medium italic leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </motion.div>
              {!isExpanded && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#fafafa] dark:from-background to-transparent pointer-events-none transition-opacity group-hover:opacity-80" />}
            </div>

            <button onClick={() => setIsExpanded(!isExpanded)} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
              <span className="border-b border-primary/20 group-hover:border-primary transition-colors">{isExpanded ? "Show Less" : "Read More"}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        )}
      </motion.div>

      {/* --- UNIVERSAL VIDEO MODAL --- */}
      <AnimatePresence>
        {showVideo && videoSource && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
            onClick={() => setShowVideo(false)}
          >
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-[160] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
              >
                <X className="h-6 w-6" />
              </button>
              
              {isYoutubeUrl(videoSource) ? (
                <iframe
                  src={`${getEmbedUrl(videoSource)}?autoplay=1&modestbranding=1&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={`YouTube video preview for ${product.title}`}
                />
              ) : (
                <video 
                  src={videoSource} 
                  className="w-full h-full object-contain" 
                  controls 
                  autoPlay 
                  playsInline
                >
                  <track kind="captions" src="" label="English" />
                </video>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ... MembershipActions logic (same as before) ...
const MembershipActions: FC<any> = ({
  isPurchased,
  loadingUser,
  hasActiveMembership,
  showMembershipDownloadButton,
  membershipLimitReached,
  downloadingFull,
  isInCartCurrentProduct,
  onDownloadFull,
  onAddToCart,
  isExclusive, // <--- Receive Prop
}) => {
  if (loadingUser) {
    return <Button size="lg" disabled className="w-full h-14 rounded-xl opacity-50 bg-muted border-none"><ButtonSpinner /></Button>;
  }

  // --- CASE 1: ALREADY PURCHASED ---
  if (isPurchased) {
    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">You own this track</span>
        </div>
        <Button size="lg" className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]" onClick={onDownloadFull} disabled={downloadingFull}>
          {downloadingFull ? <ButtonSpinner /> : <><CloudDownload className="h-5 w-5" /> Download Files</>}
        </Button>
      </div>
    );
  }

  // --- CASE 2: EXCLUSIVE PRODUCT (Block Membership) ---
  if (isExclusive) {
    return (
      <div className="space-y-3 w-full animate-in fade-in slide-in-from-bottom-2">
         {/* Exclusive Warning Banner */}
         <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Crown className="h-3.5 w-3.5 text-amber-600" />
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
               Exclusive • Purchase Required
            </p>
         </div>

         {/* Standard Buy Button (Primary Style) */}
         <Button size="lg" className="w-full h-14 rounded-xl btn-premium font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" onClick={onAddToCart} disabled={isInCartCurrentProduct}>
            <ShoppingCart className="h-5 w-5" />
            {isInCartCurrentProduct ? "Item in Cart" : "Buy Now"}
         </Button>
      </div>
    );
  }

  // --- CASE 3: MEMBERSHIP ---
  if (hasActiveMembership && showMembershipDownloadButton) {
    return <Button size="lg" className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" onClick={onDownloadFull} disabled={downloadingFull}>{downloadingFull ? <ButtonSpinner /> : <><Download className="h-5 w-5" /> Download with Membership</>}</Button>;
  }

  // --- CASE 4: LIMIT REACHED ---
  if (hasActiveMembership && membershipLimitReached) {
    return (
      <div className="space-y-3 w-full">
        <div className="py-2 border-b border-border/20 text-center"><p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest italic">Download Limit Reached</p></div>
        <Button size="lg" className="w-full h-14 rounded-xl btn-premium font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" onClick={onAddToCart} disabled={isInCartCurrentProduct}><ShoppingCart className="h-5 w-5" />{isInCartCurrentProduct ? "Item in Cart" : "Buy Separately"}</Button>
      </div>
    );
  }

  // --- CASE 5: STANDARD BUY ---
  return (
    <Button size="lg" className="w-full h-14 rounded-xl btn-premium font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" onClick={onAddToCart} disabled={isInCartCurrentProduct}>
      <ShoppingCart className="h-5 w-5" />
      {isInCartCurrentProduct ? "Item in Cart" : "Add to Cart"}
    </Button>
  );
};