import { useState, useRef, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ShoppingCart, Heart, Video, Music2, Star, Headphones, BarChart2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
// 1. Import useSiteSettings Hook
import { useSiteSettings } from "@/store/useSiteSettings"; 

interface MusicCardProps {
  id: string;
  title: string;
  brandName?: string; 
  price: number;
  originalPrice?: number;
  coverImage?: string;
  audioPreview?: string;
  videoPreview?: string;
  onPlayClick?: () => void;
  isNew?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean; 
  releaseDate?: string;
  rating?: number;
  alreadyPurchased?: boolean;
}

const MusicCard = memo(({
  id,
  title,
  brandName: customBrandName, 
  price,
  originalPrice,
  coverImage,
  audioPreview,
  videoPreview,
  onPlayClick,
  isNew,
  isExclusive, 
  releaseDate,
  rating,
  alreadyPurchased = false,
}: MusicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // 2. Access Settings from Zustand Store
  const settings = useSiteSettings((state) => state.settings);
  
  // 3. Logic: Prop priority > Settings priority > Default priority
  const finalBrandName = customBrandName || settings?.brandName || "Kumar Visuals";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const inCart = isInCart(id);

  useEffect(() => {
    if (!audioPreview) return;

    // 1. Initialize or Update Audio Object
    if (audioRef.current?.src !== audioPreview) {
      if (audioRef.current) {
        audioRef.current.pause(); 
      }
      
      const audio = new Audio(audioPreview);
      audio.preload = "auto"; 
      audio.volume = 0.5;
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    if (isHovered) {
      // 2. Safe Play Promise
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isHovered) setIsPlaying(true);
            else {
                audio.pause(); 
                audio.currentTime = 0;
            }
          })
          .catch((err) => {
            console.log("Audio playback interrupted:", err);
            setIsPlaying(false);
          });
      }
    } else {
      // 3. Safe Pause
      audio.pause();
      audio.currentTime = 0; 
      setIsPlaying(false);
    }

    return () => {
      audio.pause();
    };
  }, [isHovered, audioPreview]);
  // ---  AUDIO LOGIC END ---

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoPreview && onPlayClick) {
      onPlayClick();
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (alreadyPurchased) return;
    if (inCart) {
      toast({ title: "In Cart", description: "This track is already in your cart." });
      return;
    }

    addToCart({ 
      id, 
      title, 
      artist: finalBrandName, 
      price, 
      coverImage: coverImage || "", 
      format: "MP3 320 Kbps" 
    });
    
    toast({ title: "Added to Cart", description: `${title} is ready for checkout.` });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // ---  DISCOUNT LOGIC ---
  const validOriginalPrice = originalPrice || 0;
  const hasDiscount = validOriginalPrice > price;

  const discount = hasDiscount
    ? Math.round(((validOriginalPrice - price) / validOriginalPrice) * 100) 
    : 0;

  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "group relative overflow-hidden bg-white/60 backdrop-blur-2xl border-white/40 transition-all duration-500 rounded-[1.5rem]",
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-primary/20",
          isPlaying && "ring-1 ring-primary/30"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link 
          to={`/product/${id}`} 
          className="absolute inset-0 z-0"
          aria-label={`View details for ${title}`}
        />

        {/* IMAGE AREA */}
        <div className="relative aspect-square overflow-hidden m-2.5 rounded-[1.2rem] bg-slate-100 z-10 pointer-events-none">
          <motion.img 
            animate={{ scale: isHovered ? 1.05 : 1 }} 
            transition={{ duration: 1.2 }}
            src={coverImage || "https://via.placeholder.com/400x400.png?text=Cover"}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover" 
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* LEFT BADGES (NEW, VIDEO/AUDIO) */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
            <AnimatePresence>
              {isNew && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Badge className="bg-primary hover:bg-primary/90 text-white border-none shadow-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    NEW
                  </Badge>
                </motion.div>
              )}
              
              {(videoPreview || audioPreview) && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Badge className="bg-black/60 backdrop-blur-md text-white border-none px-2 py-1 h-auto w-auto rounded-md flex items-center gap-1">
                      {videoPreview ? <Video className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/*  RIGHT SIDE: EXCLUSIVE BADGE */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
             {isExclusive && (
               <Badge className="bg-amber-500 text-black border-none shadow-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                 <Crown className="w-3 h-3 fill-black/20" /> EXCLUSIVE
               </Badge>
             )}
          </div>

          {/* FAVORITE BUTTON */}
          {/* Note: Logic added to push heart down if Exclusive badge exists */}
          <button 
            onClick={handleToggleFavorite}
            className={cn(
              "absolute right-3 z-20 pointer-events-auto p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 duration-300 focus:opacity-100 focus:translate-y-0",
              isExclusive ? "top-12" : "top-3" 
            )}
          >
            <Heart className={cn("w-3.5 h-3.5 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400")} />
          </button>

          {/* PLAY / VISUALIZER CENTER */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 10 }} 
                  className="pointer-events-auto"
                >
                  <Button 
                    onClick={videoPreview ? handleVideoClick : undefined} 
                    size="icon"
                    className={cn(
                      "w-14 h-14 rounded-full p-0 bg-white/95 border border-slate-200 text-primary shadow-xl transition-all duration-300",
                      videoPreview ? "hover:bg-primary hover:text-white" : "",
                      isPlaying && !videoPreview && "bg-primary text-white scale-110 shadow-primary/20"
                    )}
                  >
                    {videoPreview ? (
                      <Video className="w-5 h-5 fill-current" />
                    ) : isPlaying ? (
                      <BarChart2 className="w-6 h-6 fill-current animate-pulse" /> 
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ADD TO CART BUTTON */}
          <div className="absolute bottom-3 left-3 right-3 pointer-events-auto z-30 overflow-hidden">
             <div className="translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]">
              <Button 
                onClick={handleAddToCart} 
                disabled={alreadyPurchased}
                className={cn(
                  "w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg border-none transition-all",
                  alreadyPurchased ? "bg-slate-200 text-slate-500 cursor-default hover:bg-slate-200" : inCart ? "bg-primary text-white shadow-primary/20" : "bg-primary/90 text-white hover:bg-primary"
                )}
              >
                {alreadyPurchased ? "Purchased" : inCart ? "In Cart" : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
              </Button>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-5 pt-1 pb-6 space-y-4 relative z-10 pointer-events-none">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Music2 className="w-2.5 h-2.5 text-primary/40" /> 
                {finalBrandName} 
              </p>
              
              {hasDiscount && discount > 0 && (
                <Badge className="bg-rose-500 hover:bg-rose-500 text-white text-[9px] font-black px-1.5 py-0 rounded-sm italic">
                  {discount}%
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none italic">
                  ₹{price}
                </span>

                {/* --- ZERO ISSUE HERE --- */}
                {hasDiscount && (
                  <span className="text-[11px] text-slate-300 line-through font-bold">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
              {releaseDate && (
                <span className="text-[8px] font-bold uppercase text-slate-300 mt-1.5 tracking-wider">
                  OFFICIAL RELEASE: {releaseDate}
                </span>
              )}
            </div>
            
            {rating && rating > 0 ? (
              <div className="flex items-center gap-1 bg-slate-55 px-2 py-1 rounded-md border border-slate-100">
                <span className="text-[10px] font-black text-slate-800 leading-none">{rating.toFixed(1)}</span>
                <Star className="w-2 h-2 fill-primary text-primary" />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

MusicCard.displayName = "MusicCard";

export default MusicCard;