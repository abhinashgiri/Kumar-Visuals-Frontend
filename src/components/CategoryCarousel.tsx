import { useRef, useState, FC } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicCard from "@/components/MusicCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface CategoryCarouselProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    coverImage: string;
    isNew?: boolean;
    isFeatured?: boolean;
    releaseDate?: string;
    rating?: number;
    audioPreview?: string;
    videoPreview?: string;
    onPlayClick?: () => void;
  }>;
}

const CategoryCarousel: FC<CategoryCarouselProps> = ({ title, items }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  );

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  if (!items || items.length === 0) return null;

  const hasMultipleItems = items.length > 1;

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="mb-12 md:mb-24 px-1"
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Disc className="h-4 w-4 text-primary animate-spin-slow" />
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight italic text-foreground leading-none truncate">
              {title}
            </h2>
          </div>
          <p className="hidden sm:block text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Premium Studio Selections
          </p>
        </div>

        {hasMultipleItems && (
          <div className="flex gap-1.5 md:gap-2 shrink-0 self-end mb-[-1.25rem] z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all bg-background shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all bg-background shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* CAROUSEL CONTENT */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: hasMultipleItems,
          dragFree: true,
        }}
        plugins={hasMultipleItems ? [autoplayPlugin.current] : []}
        className="w-full"
        onMouseEnter={() => hasMultipleItems && autoplayPlugin.current.stop()}
        onMouseLeave={() => hasMultipleItems && autoplayPlugin.current.play()}
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {items.map((item, idx) => (
            <CarouselItem
              key={item.id}
              // Basis breakdown: 
              // Mobile: 85% (peek effect)
              // Tablet: 50% (2 cards)
              // Desktop: 33% (3 cards)
              // Large Desktop: 25% (4 cards)
              className="pl-3 md:pl-4 basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
              >
                <MusicCard {...item} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </motion.section>
  );
};

export default CategoryCarousel;