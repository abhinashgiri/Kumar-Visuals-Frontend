import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Trash2, Send, Sparkles } from "lucide-react";
import { UserRatingState } from "@/types/dashboard";
import { motion } from "framer-motion";
import { ButtonSpinner } from "@/components/ui/loader";

/**
 * PROPS DEFINITION
 */
interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTitle: string | null;
  currentTargetRating: UserRatingState | undefined;
  ratingValue: number;
  ratingReview: string;
  ratingSubmitting: boolean;
  onChangeRatingValue: (value: number) => void;
  onChangeRatingReview: (value: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
}

/**
 * REVIEW DIALOG COMPONENT
 * Handles asset rating and text feedback with a responsive interface.
 */
const ReviewDialog: FC<ReviewDialogProps> = ({
  open,
  onOpenChange,
  targetTitle,
  currentTargetRating,
  ratingValue,
  ratingReview,
  ratingSubmitting,
  onChangeRatingValue,
  onChangeRatingReview,
  onSubmit,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 1. RESPONSIVE DIALOG CONTENT */}
      <DialogContent className="max-w-[95vw] sm:max-w-md border-none bg-background/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] overflow-hidden p-6 sm:p-8 gap-0">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 blur-[60px] pointer-events-none" />

        {targetTitle && (
          <div className="relative z-10">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-2.5 rounded-2xl border transition-colors ${ratingValue >= 4 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-black tracking-tight uppercase italic text-foreground">
                    {currentTargetRating ? "Refine Review" : "Rate Asset"}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 truncate max-w-full">
                    {targetTitle}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
              {/* 2. INTERACTIVE RATING AREA */}
              <div className="space-y-3 text-center py-4 sm:py-6 bg-muted/30 rounded-[1.5rem] border border-border/50">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Select Rating
                </Label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onChangeRatingValue(star)}
                      className="relative p-1 group"
                    >
                      <Star
                        className={`h-7 w-7 sm:h-8 sm:w-8 transition-all duration-300 ${
                          star <= ratingValue
                            ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                            : "text-muted-foreground/30 stroke-[1.5px] group-hover:text-muted-foreground"
                        }`}
                      />
                      {star <= ratingValue && (
                        <motion.div 
                          layoutId="star-glow"
                          className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold text-yellow-600/70 uppercase tracking-tighter">
                   {ratingValue === 5 ? "Masterpiece" : ratingValue === 4 ? "Excellent" : ratingValue === 3 ? "Good" : ratingValue === 2 ? "Average" : ratingValue === 1 ? "Needs Improvement" : "Awaiting Rating"}
                </p>
              </div>

              {/* 3. FEEDBACK TEXTAREA */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <Label htmlFor="reviewText" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    Written Feedback
                  </Label>
                </div>
                <Textarea
                  id="reviewText"
                  rows={4}
                  placeholder="Tell the artist what you loved about these stems..."
                  className="resize-none rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 text-xs sm:text-sm italic font-medium leading-relaxed"
                  value={ratingReview}
                  onChange={(e) => onChangeRatingReview(e.target.value)}
                />
              </div>
            </div>

            {/* 4. RESPONSIVE ACTIONS BAR */}
            <div className="mt-6 sm:mt-8 flex flex-row items-center justify-between gap-3 border-t border-border/50 pt-6">
              <div className="shrink-0">
                {currentTargetRating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive font-bold gap-2 transition-all"
                    onClick={onDelete}
                    disabled={ratingSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Delete</span>
                  </Button>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold border-border/50 hover:bg-muted text-[11px] sm:text-xs"
                  onClick={() => onOpenChange(false)}
                  disabled={ratingSubmitting}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={ratingSubmitting || ratingValue === 0}
                  className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all border-b-4 border-primary/20 text-[11px] sm:text-xs"
                >
                  {ratingSubmitting ? <ButtonSpinner /> : <Send className="h-3.5 w-3.5" />}
                  {ratingSubmitting ? "Syncing" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;