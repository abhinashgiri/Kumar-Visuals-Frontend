import { FC } from "react";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SectionLoader } from "@/components/ui/loader";
import { ShieldCheck, Music, Disc, Clock } from "lucide-react";
import { ApiTrack, RatingApi } from "@/types/product";

interface ProductTabsProps {
  tracklist: ApiTrack[];
  features: string[];
  ratings: RatingApi[];
  ratingsLoading: boolean;
  ratingsError: string | null;
  STAR_INDICES: number[];
  sampleEnabled?: boolean;
  sampleYoutubeUrl?: string;
}

export const ProductTabs: FC<ProductTabsProps> = ({
  tracklist,
  features,
  ratings,
  ratingsLoading,
  ratingsError,
  STAR_INDICES,
  sampleEnabled,
  sampleYoutubeUrl,
}) => {
  const tabCount = 3 + (sampleEnabled && sampleYoutubeUrl ? 1 : 0);

  return (
    <Tabs defaultValue="tracklist" className="mb-20">
      {/* ---------------- Tabs Header ---------------- */}
      <TabsList
        className="grid w-full max-w-lg mx-auto bg-muted/20 p-1 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${tabCount}, 1fr)` }}
      >
        <TabsTrigger value="tracklist" className="rounded-lg">Tracklist</TabsTrigger>
        <TabsTrigger value="features" className="rounded-lg">Features</TabsTrigger>
        <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
        {sampleEnabled && sampleYoutubeUrl && (
          <TabsTrigger value="sample" className="rounded-lg">Sample</TabsTrigger>
        )}
      </TabsList>

      {/* ---------------- Tracklist Content ---------------- */}
      <TabsContent value="tracklist" className="mt-8">
        <Card className="glass-card p-6 min-h-[200px]">
          {/* 1. Empty State Check */}
          {!tracklist || tracklist.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-3 opacity-60">
              <Disc className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">
                No tracks listed for this product.
              </p>
            </div>
          ) : (
            /* 2. Dynamic Loop with Scroll Area */
            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {tracklist.map((track, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10"
                >
                  {/* Serial Number */}
                  <span className="text-xs font-bold text-muted-foreground/50 w-6 text-center font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  {/* Icon */}
                  <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary shrink-0">
                    <Music className="h-4 w-4" />
                  </div>

                  {/* Track Details (Title & Duration) */}
                  <div className="flex-1 flex justify-between items-center gap-4">
                    {/* Title from Backend */}
                    <p className="font-medium text-sm md:text-base text-foreground line-clamp-1">
                      {track.title} 
                    </p>
                    
                    {/* Duration from Backend */}
                    {track.duration && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded shrink-0">
                        <Clock className="h-3 w-3 opacity-70" />
                        {track.duration}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      {/* ---------------- Features Content ---------------- */}
      <TabsContent value="features" className="mt-8">
        <Card className="glass-card p-6 grid md:grid-cols-2 gap-4">
          {features.length === 0 ? (
             <p className="text-muted-foreground text-center col-span-2 py-8">No specific features listed.</p>
          ) : (
            features.map((f, idx) => (
              <div key={idx} className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/30 transition-colors">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                <span className="text-sm leading-relaxed">{f}</span>
              </div>
            ))
          )}
        </Card>
      </TabsContent>

      {/* ---------------- Reviews Content ---------------- */}
      <TabsContent value="reviews" className="mt-8">
        <Card className="glass-card p-6">
          {ratingsLoading && <SectionLoader label="Loading reviews..." />}

          {!ratingsLoading && ratingsError && (
            <p className="text-sm text-destructive text-center py-8">{ratingsError}</p>
          )}

          {!ratingsLoading && !ratingsError && ratings.length === 0 && (
            <div className="text-center py-10 space-y-2">
               <p className="text-muted-foreground">No reviews yet.</p>
               <p className="text-xs text-muted-foreground/50">Be the first to review this track!</p>
            </div>
          )}

          {!ratingsLoading &&
            !ratingsError &&
            ratings.map((review, idx) => (
              <div key={idx} className="border-b border-border/40 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-sm">
                      {review.userNameSnapshot || "Verified Customer"}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1 border-primary/20 text-primary">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1 mb-2">
                  {STAR_INDICES.map((i) => (
                    <ReviewStar
                      key={i}
                      filled={i <= Math.round(review.rating)}
                    />
                  ))}
                </div>

                {review.review && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.review}
                  </p>
                )}
              </div>
            ))}
        </Card>
      </TabsContent>

      {/* ---------------- Sample (YouTube) ---------------- */}
      {sampleEnabled && sampleYoutubeUrl && (
        <TabsContent value="sample" className="mt-8">
          <Card className="glass-card p-6 bg-black/5">
            <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                src={toYoutubeEmbed(sampleYoutubeUrl)}
                className="w-full h-full"
                title="YouTube sample video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};

/* ---------------- Helpers ---------------- */

const ReviewStar: FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`h-3.5 w-3.5 ${
      filled
        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
        : "text-slate-200 dark:text-slate-800"
    }`}
    viewBox="0 0 24 24"
  >
    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.854L19.335 24 12 19.897 4.665 24 6 15.277 0 9.423l8.332-1.268z" />
  </svg>
);

function toYoutubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    return url; 
  } catch {
    return "";
  }
}