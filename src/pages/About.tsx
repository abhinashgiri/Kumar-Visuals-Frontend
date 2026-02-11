import { useMemo, FC } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Music, Award, Users, Headphones, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { SectionLoader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/store/useSiteSettings";
import { SeoHead } from "@/components/SeoHead";

/** --------- API types ---------- */
type AboutHero = { title: string; subtitle: string; };
type AboutJourney = { title: string; description: string[]; };
type AboutStat = { icon: string; value: string; label: string; isActive?: boolean; };
type AboutPhilosophy = { title: string; description: string; accentColor?: string; isActive?: boolean; };
type AboutPageData = { hero: AboutHero; journey: AboutJourney; stats: AboutStat[]; philosophy: AboutPhilosophy[]; };

const ICON_MAP: Record<string, LucideIcon> = { Music, Users, Award, Headphones };

const About: FC = () => {
  const { data: aboutData, isLoading } = useQuery<AboutPageData, Error>({
    queryKey: ["about-page"],
    queryFn: async () => (await api.get<AboutPageData>("/about")).data,
    staleTime: 1000 * 60 * 5,
  });

  const { settings: siteSettings } = useSiteSettings();

  const activeStats = useMemo(() => (aboutData?.stats ?? []).filter((s) => s.isActive !== false), [aboutData]);
  const philosophyCards = useMemo(() => (aboutData?.philosophy ?? []).filter((p) => p.isActive !== false), [aboutData]);

  const phTitle = siteSettings?.philosophyHeader?.title || "Our Philosophy";
  const phSubtitle = siteSettings?.philosophyHeader?.subtitle || "Core pillars of creation";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <SectionLoader label="Unlocking the story..." className="py-40" />
      </div>
    );
  }

  const fullTitle = aboutData?.hero?.title || "About Us";
  const titleWords = fullTitle.trim().split(" ");
  const titleStart = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : "";
  const titleEnd = titleWords.slice(-1);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="About Us" />


      <main className="container mx-auto px-6 pt-32 md:pt-44 pb-20 space-y-24 md:space-y-32">
        
        {/* --- HERO SECTION --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
            <Sparkles className="h-3 w-3 mr-2" /> Our Identity
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic leading-[1.1] text-foreground">
            {titleStart} <span className="gradient-text">{titleEnd}</span>
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
            {aboutData?.hero?.subtitle}
          </p>
        </motion.section>

        {/* --- JOURNEY SECTION --- */}
        <section className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-background/40 backdrop-blur-xl border border-border/50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <h2 className="text-2xl md:text-4xl font-black italic mb-8 border-b border-border/40 pb-6 tracking-tight">
              The <span className="text-primary">Journey</span>
            </h2>
            <div className="space-y-6 text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
              {aboutData?.journey?.description.map((para, i) => (
                <p key={i} className="opacity-90">{para}</p>
              ))}
            </div>
          </motion.div>
        </section>

        {/* --- STATS GRID --- */}
        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {activeStats.map((stat, idx) => {
              const Icon = ICON_MAP[stat.icon] ?? Music;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  className="bg-background/60 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-[2rem] text-center space-y-4 shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary/10 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl md:text-4xl font-black italic tracking-tighter text-foreground">
                      {stat.value}
                    </div>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* --- PHILOSOPHY SECTION --- */}
        <section className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tight">
              {phTitle}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">
              {phSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {philosophyCards.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 md:p-10 rounded-[2.5rem] border border-border/40 bg-background/20 backdrop-blur-sm space-y-5 hover:bg-background/40 transition-all relative group"
              >
                <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Sparkles className="h-8 w-8" style={{ color: item.accentColor }} />
                </div>
                <h3 className="text-xl md:text-2xl font-black italic tracking-tight" style={{ color: item.accentColor }}>
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- CTA SECTION  --- */}
        <section className="max-w-5xl mx-auto px-2">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-background border border-primary/10 shadow-2xl p-10 md:p-24 text-center"
          >
            {/* Subtle light glow instead of dark gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)] -z-10" />
            
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6 text-foreground">
              Experience the <span className="gradient-text">Visual Sound</span>
            </h2>
            
            <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-medium italic">
              Step into our sonic universe and discover why thousands of music lovers trust our premium studio productions.
            </p>
            
            <Link to="/shop">
              <Button size="lg" className="h-14 px-12 rounded-2xl font-black italic uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground">
                Explore Vault <Music className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;