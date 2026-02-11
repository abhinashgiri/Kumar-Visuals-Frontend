import { motion } from "framer-motion";
import { Wrench, Clock3, Mail, Phone, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/store/useSiteSettings";
import { SeoHead } from "@/components/SeoHead";

const EQUALIZER_SCALES = [0.4, 0.9, 0.6, 1, 0.5];

const Maintenance = () => {
  const settings = useSiteSettings((s) => s.settings);

  const logoUrl = settings?.logoUrl;
  const brandName = settings?.brandName || "Kumar Music";

  const supportEmail =
    settings?.supportEmail || settings?.contactEmail || "care@kumarmusic.com";

  const phone = settings?.phonePrimary || "+91 8597591784";
  const phoneHref = phone.replace(/\s+/g, "");

  return (

    <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col transition-colors duration-500">
      <SeoHead pageTitle="Maintenance" />
      <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-background border border-border/50 rounded-[2.5rem] p-8 md:p-12 text-center space-y-8 shadow-2xl">
            
            {/* BRANDING SECTION (Logo or Brand Name) */}
            <div className="flex justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                     <Music2 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-black italic tracking-tighter gradient-text uppercase">
                    {brandName}
                  </h1>
                </div>
              )}
            </div>

            {/* MAIN STATUS */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-foreground leading-none">
                Site Maintenance
              </h2>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">
                  <Wrench className="w-3 h-3" /> Updating
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/40">
                  <Clock3 className="w-3 h-3" /> Back Soon
                </span>
              </div>
            </div>

            {/* ANIMATED EQUALIZER */}
            <div className="flex items-end justify-center gap-1.5 h-10">
              {EQUALIZER_SCALES.map((scale, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.4, scale, 0.6, scale * 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5 + i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-2 rounded-full bg-gradient-to-t from-primary/10 via-primary to-primary/40 origin-bottom"
                />
              ))}
            </div>

            {/* SIMPLE CONTACT INFO */}
            <div className="pt-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground italic">
                Need urgent help with your purchase?
              </p>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl font-bold text-xs uppercase tracking-widest gap-2 border-border/60 hover:bg-primary/5 transition-all"
                  asChild
                >
                  <a href={`mailto:${supportEmail}`}>
                    <Mail className="w-4 h-4" /> Email Support
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  className="h-11 rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground/60 border border-transparent hover:border-border/40"
                  asChild
                >
                  <a href={`tel:${phoneHref}`}>
                    <Phone className="w-3.5 h-3.5 mr-2" /> {phone}
                  </a>
                </Button>
              </div>
            </div>

            {/* FINAL FOOTER NOTE */}
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pt-4">
              Your files and account are safe.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Maintenance;