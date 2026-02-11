import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Music,
  Headphones,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, FC } from "react";
import heroBackground from "@/assets/hero-bg.jpg";

/** ---------- Types ---------- */

type HeroStatFromApi = {
  label: string;
  value: string;
  icon?: string; 
};

type HeroData = {
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImageUrl?: string;
  tags?: string[];
  stats?: HeroStatFromApi[];
};

type HeroProps = {
  hero?: HeroData;
};

/** ---------- Configuration ---------- */

const BASE_PILLS = [
  {
    id: "pill-dj-remix",
    icon: Music,
    defaultText: "DJ Remixes",
    glowClass: "bg-primary/30",
    iconClass: "text-primary",
  },
  {
    id: "pill-production",
    icon: Headphones,
    defaultText: "Productions",
    glowClass: "bg-secondary/30",
    iconClass: "text-secondary",
  },
  {
    id: "pill-premium",
    icon: Award,
    defaultText: "Premium Quality",
    glowClass: "bg-accent/30",
    iconClass: "text-accent",
  },
];

const BASE_STATS = [
  {
    id: "stat-releases",
    icon: Music,
    defaultValue: "100+",
    defaultLabel: "Premium Releases",
    colorClass: "text-primary",
    borderClass: "border-primary/20",
  },
  {
    id: "stat-listeners",
    icon: Headphones,
    defaultValue: "50K+",
    defaultLabel: "Happy Listeners",
    colorClass: "text-secondary",
    borderClass: "border-secondary/20",
  },
  {
    id: "stat-rating",
    icon: Award,
    defaultValue: "4.9★",
    defaultLabel: "Average Rating",
    colorClass: "text-accent",
    borderClass: "border-accent/20",
  },
];

const Hero: FC<HeroProps> = ({ hero }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Derive Content
  const title = hero?.title ?? "KUMAR";
  const subtitle = hero?.subtitle ?? "Experience professionally crafted music with crystal-clear audio quality. Exclusive remixes, original productions, and premium content designed for true music enthusiasts.";
  const primaryButtonText = hero?.primaryButtonText ?? "Explore Catalog";
  const primaryButtonLink = hero?.primaryButtonLink ?? "/products";
  const secondaryButtonText = hero?.secondaryButtonText ?? "Explore Memberships";
  const secondaryButtonLink = hero?.secondaryButtonLink ?? "/memberships";

  const rawBg = hero?.backgroundImageUrl ?? "";
  const bgImage = rawBg && rawBg.trim().length > 0 ? rawBg.trim() : heroBackground;

  const tagsFromApi = hero?.tags && hero.tags.length > 0 ? hero.tags : null;

  const heroPills = (tagsFromApi ?? BASE_PILLS.map((p) => p.defaultText)).map(
    (text, index) => {
      const base = BASE_PILLS[index % BASE_PILLS.length];
      return { id: base.id, icon: base.icon, text, glowClass: base.glowClass, iconClass: base.iconClass };
    }
  );

  const statsFromApi = hero?.stats ?? [];
  const heroStats = BASE_STATS.map((base, index) => {
    const apiStat = statsFromApi[index];
    return {
      id: base.id,
      icon: base.icon, 
      value: apiStat?.value ?? base.defaultValue,
      label: apiStat?.label ?? base.defaultLabel,
      colorClass: base.colorClass,
      borderClass: base.borderClass,
    };
  });

  const floatingTags = tagsFromApi?.slice(0, 3) ?? [];

  // Subtitle Highlighting
  const highlight1 = "professionally crafted music";
  const highlight2 = "crystal-clear audio quality";

  const renderSubtitle = () => {
    if (!subtitle.includes(highlight1) || !subtitle.includes(highlight2)) return subtitle;
    const firstStart = subtitle.indexOf(highlight1);
    const firstEnd = firstStart + highlight1.length;
    const secondStart = subtitle.indexOf(highlight2, firstEnd);
    const secondEnd = secondStart + highlight2.length;

    return (
      <>
        {subtitle.slice(0, firstStart)}
        <span className="text-primary font-bold">{highlight1}</span>
        {subtitle.slice(firstEnd, secondStart)}
        <span className="text-accent font-bold">{highlight2}</span>
        {subtitle.slice(secondEnd)}
      </>
    );
  };

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    globalThis.addEventListener("mousemove", handleMouseMove);
    return () => globalThis.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden pt-24 pb-12 md:pt-36 md:pb-24">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={`${title} Background`}
          className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_90%)]" />
      </div>

      <div
        className={`container mx-auto px-4 z-10 transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12">
          
          {/* Title Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="relative inline-block">
              <h1 
                className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter italic gradient-text select-none drop-shadow-2xl px-2 leading-[1.1]"
                style={{
                  transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                  transition: "transform 0.1s ease-out"
                }}
              >
                {title}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2 md:mt-4 opacity-70">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-foreground">Premium Audio Hub</span>
              </div>
            </div>

            <p className="text-base md:text-xl text-muted-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed italic drop-shadow-sm px-4">
              {renderSubtitle()}
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-2">
            {heroPills.map((item) => (
              <div key={item.id} className="group relative">
                <div className="relative flex items-center gap-2 bg-background/40 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-border/50 hover:border-primary/40 transition-all duration-300">
                  <item.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${item.iconClass}`} />
                  <span className="text-[10px] md:text-sm font-bold tracking-tight">
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-6 sm:px-0">
            <Link to={primaryButtonLink} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-black italic uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full border-b-4 border-primary/20 active:border-b-0"
              >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                {primaryButtonText}
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>

            <Link to={secondaryButtonLink} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-black italic uppercase tracking-widest gap-3 border-border/60 backdrop-blur-md bg-background/20 hover:bg-primary/5 transition-all w-full"
              >
                <Award className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {secondaryButtonText}
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto pt-6 md:pt-10 px-4">
            {heroStats.map((stat) => (
              <div 
                key={stat.id} 
                className={`group relative p-4 md:p-6 rounded-[1.25rem] md:rounded-[1.5rem] bg-background/40 backdrop-blur-xl border ${stat.borderClass} hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl`}
              >
                <div className="space-y-1 text-center relative z-10">
                  <p className={`text-2xl md:text-5xl font-black italic transition-colors ${stat.colorClass}`}>
                    {stat.value}
                  </p>
                  <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] leading-none">
                    {stat.label}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 rounded-[1.25rem] md:rounded-[1.5rem] transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Tags (Hidden on Mobile/Tablet) */}
      {floatingTags.length > 0 && (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 hidden xl:flex flex-col gap-3">
          {floatingTags.map((tag) => (
            <div
              key={tag}
              className="bg-background/20 backdrop-blur-md border border-border/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-all rotate-90 origin-right mb-12 cursor-default"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;