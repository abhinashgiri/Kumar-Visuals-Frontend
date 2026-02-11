import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  CalendarDays, 
  Crown, 
  Layers, 
  Sparkles, 
  Award, 
  Search, 
  Cloud
} from "lucide-react";
import { LibraryItem, UserRatingState } from "@/types/dashboard";
import { SectionLoader, ButtonSpinner } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LibraryTabProps {
  ordersLoading: boolean;
  libraryItems: LibraryItem[];
  downloadingId: string | null;
  userRatings: Record<string, UserRatingState>;
  onDownload: (item: LibraryItem) => void;
  onOpenRating: (item: LibraryItem) => void;
}

const formatIndianDate = (value: string | null | undefined): string => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Recent";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const LibraryTab: FC<LibraryTabProps> = ({ 
  ordersLoading, 
  libraryItems, 
  downloadingId, 
  userRatings, 
  onDownload, 
  onOpenRating 
}) => {
  const hasItems = libraryItems.length > 0;

  // Handler to open link in new tab
  const handleAccessFiles = (item: LibraryItem) => {
    onDownload(item);


    const downloadUrl = (item as any).download?.url;
    
    if (downloadUrl) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } else {
      console.warn("Download URL not found for item:", item.title);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="pb-6 border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 -z-10" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-background border border-border shadow-sm">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight italic text-foreground leading-none">
                Digital <span className="gradient-text">Vault</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xl pl-1">
              Access your high-fidelity masters and premium studio stems.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-secondary/50 border-secondary-foreground/10">
               {libraryItems.length} {libraryItems.length === 1 ? "Item" : "Items"} Unlocked
             </Badge>
          </div>
        </div>
      </div>

      <div className="pt-2 min-h-[300px]">
        {ordersLoading && !hasItems && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <SectionLoader label="Unlocking Vault..." />
          </div>
        )}

        {/* EMPTY STATE */}
        {!ordersLoading && !hasItems && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/60 rounded-[2rem] bg-muted/5 group hover:border-primary/20 transition-colors"
          >
            <div className="p-6 bg-background rounded-full mb-6 shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
              <Cloud className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">Your Vault is Empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              Start your collection today. Purchased tracks and membership content will appear here instantly.
            </p>
            <Link to="/shop">
              <Button className="rounded-xl font-bold gap-2 h-11 px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Search className="h-4 w-4" /> Browse Catalog
              </Button>
            </Link>
          </motion.div>
        )}

        {/* ITEMS GRID */}
        {hasItems && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {libraryItems.map((item, index) => {
                const userRating = userRatings[item.id];
                const isProcessing = downloadingId === item.id;
                const isMembership = item.source === "membership";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    layout
                  >
                    <Card className={cn(
                        "group h-full overflow-hidden transition-all duration-300 rounded-2xl border bg-background/50 backdrop-blur-sm",
                        "hover:shadow-xl hover:shadow-primary/5",
                        isMembership 
                          ? "border-amber-500/20 hover:border-amber-500/50" 
                          : "border-border/60 hover:border-primary/30"
                      )}>
                      <CardContent className="p-4 flex flex-col h-full relative">
                        {/* Background Gradient Hover Effect */}
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                          isMembership 
                            ? "bg-gradient-to-b from-amber-500/5 via-transparent to-transparent"
                            : "bg-gradient-to-b from-primary/5 via-transparent to-transparent"
                        )} />

                        {/* Top Section: Art + Meta */}
                        <div className="flex gap-3.5 mb-4 relative z-10">
                          {/* Artwork */}
                          <div className="relative shrink-0">
                            <div className={cn(
                              "w-[60px] h-[60px] rounded-xl overflow-hidden border shadow-sm group-hover:shadow-md transition-all",
                              isMembership ? "border-amber-500/20" : "border-border"
                            )}>
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Music className="h-5 w-5 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            
                            {/* Membership Crown Badge */}
                            {isMembership && (
                              <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 rounded-full shadow-lg ring-2 ring-background">
                                <Crown className="h-2.5 w-2.5 text-white fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Title & Source */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-[15px] leading-snug truncate text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                               <Badge variant="outline" className={cn(
                                 "rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider border h-5",
                                 isMembership 
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                  : "bg-primary/5 text-primary border-primary/20"
                               )}>
                                  {isMembership ? "Membership" : "Purchase"}
                               </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Rating Section - Compact & Clean */}
                        <div className="mb-4 relative z-10">
                          <AnimatePresence mode="wait">
                            {userRating ? (
                              <div className="px-3 py-2 rounded-lg bg-secondary/30 border border-secondary space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/80">
                                    <Award className="h-3 w-3 text-primary" /> Rated {userRating.rating}/5
                                  </div>
                                  <button onClick={() => onOpenRating(item)} className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">Edit</button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => onOpenRating(item)} 
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-dashed border-border/80 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group/rate"
                              >
                                <span className="text-[10px] font-bold text-muted-foreground/70 group-hover/rate:text-primary">Leave a Rating</span>
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Sparkles key={s} className="h-2.5 w-2.5 text-muted-foreground/20 group-hover/rate:text-primary/40" />
                                  ))}
                                </div>
                              </button>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40 relative z-10">
                            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-bold text-[9px] uppercase tracking-wider">
                              <CalendarDays className="h-3 w-3" />
                              {formatIndianDate(item.purchaseDate)}
                            </div>
                            
                            <Button 
                              size="sm" 
                              className={cn(
                                "h-8 pl-3 pr-4 rounded-lg font-bold text-[10px] gap-2 shadow-sm transition-all",
                                isMembership 
                                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                              )}
                              onClick={() => handleAccessFiles(item)} 
                              disabled={isProcessing}
                            >
                              {isProcessing ? <ButtonSpinner className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
                              {isProcessing ? "Opening..." : "Access Files"}
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryTab;