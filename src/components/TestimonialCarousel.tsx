import { useRef, FC } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  comment: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  header?: {
    title: string;
    subtitle?: string;
  };
}

const TestimonialCarousel: FC<TestimonialCarouselProps> = ({ testimonials, header }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!testimonials || testimonials.length === 0) return null;

  const hasMultiple = testimonials.length > 1;
  const title = header?.title || "Trusted By Producers";
  const subtitle = header?.subtitle || "Success stories from our global community";

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-12 md:py-20 overflow-hidden"
    >
      {/* --- HEADER SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 md:mb-14 space-y-3"
      >
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-foreground leading-[1.1]">
          {title.includes(" ") ? (
            <>
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">{title.split(" ").slice(-1)}</span>
            </>
          ) : (
            <span className="gradient-text">{title}</span>
          )}
        </h2>
        {subtitle && (
          <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-70 px-4">
            {subtitle}
          </p>
        )}
      </motion.div>

      <div className="relative max-w-6xl mx-auto">
        <Carousel
          opts={{
            align: "start",
            loop: hasMultiple,
          }}
          plugins={hasMultiple ? [autoplayPlugin.current] : []}
          className="w-full"
          onMouseEnter={() => hasMultiple && autoplayPlugin.current.stop()}
          onMouseLeave={() => hasMultiple && autoplayPlugin.current.play()}
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((t, idx) => (
              <CarouselItem
                key={t.id}
                // Mobile: 88% width for peek effect | Tablet: 50% | Desktop: 33%
                className="pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="h-full py-2" // Added padding for card shadow
                >
                  <Card className="h-full bg-background/40 backdrop-blur-sm border-border/50 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:shadow-xl transition-all duration-500 group flex flex-col">
                    <Quote className="h-6 w-6 md:h-8 md:w-8 text-primary/10 mb-4 group-hover:text-primary/20 transition-colors" />

                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(t.rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed italic mb-6 md:mb-8 flex-1">
                      "{t.comment}"
                    </p>

                    <div className="flex items-center gap-3 border-t border-border/30 pt-5">
                      <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs text-primary">{t.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {t.name}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Controls - Optimized positioning */}
          {hasMultiple && (
            <div className="flex lg:justify-end justify-center gap-3 mt-8">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all rounded-xl" />
              <CarouselNext className="static translate-y-0 h-10 w-10 border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all rounded-xl" />
            </div>
          )}
        </Carousel>
      </div>
    </motion.section>
  );
};

export default TestimonialCarousel;