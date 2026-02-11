
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLoader } from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Badge } from "./ui/badge";
import { SeoHead } from "./SeoHead";

type LegalSection = {
  _id: string;
  heading: string;
  content: string;
};

type LegalPageData = {
  slug: "privacy-policy" | "terms-and-conditions" | "refund-policy";
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LegalPageProps = {
  slug: "privacy-policy" | "terms-and-conditions" | "refund-policy";
  fallbackTitle: string;
  fallbackSubtitle?: string;
};

const LegalPage = ({ slug, fallbackTitle, fallbackSubtitle }: LegalPageProps) => {
  const { data, isLoading, isError, error } = useQuery<LegalPageData, Error>({
    queryKey: ["legal-page", slug],
    queryFn: async () => {
      const res = await api.get<{ data: LegalPageData }>(`/legal/${slug}`);
      return res.data.data;
    },
  });

  const page = data;
  const title = page?.title ?? fallbackTitle;
  const subtitle = page?.subtitle ?? fallbackSubtitle ?? "";
  const sections = page?.sections ?? [];



  const lastUpdatedDate = page?.updatedAt || page?.createdAt;
  const lastUpdated = lastUpdatedDate
    ? new Date(lastUpdatedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const showInactive = page?.isActive === false;

  // Helper to split title for the gradient effect
  const titleWords = title.split(" ");
  const mainTitle = titleWords.slice(0, -1).join(" ");
  const lastWord = titleWords.at(-1);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />

  <SeoHead pageTitle={title} />


      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-24">
        <div className="max-w-4xl mx-auto">
          
          {/* --- LOADING STATE --- */}
          {isLoading && !page ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <SectionLoader label="Unlocking protocol..." />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">
                Establishing Secure Connection
              </p>
            </div>
          ) : (
            <>
              {/* --- HEADER SECTION --- */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-12 space-y-4 text-center md:text-left"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    Official Document
                  </p>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic text-foreground leading-[0.9] md:leading-none">
                  {mainTitle}{" "}
                  <span className="gradient-text">{lastWord}</span>
                </h1>

                {subtitle && (
                  <p className="text-sm md:text-base font-medium text-muted-foreground italic max-w-2xl leading-relaxed">
                    {subtitle}
                  </p>
                )}

                {isError && (
                  <div className="mt-6 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-xs font-bold text-destructive animate-in fade-in zoom-in-95">
                    {error?.message || "Protocol Error: Failed to sync documentation."}
                  </div>
                )}

                {showInactive && (
                  <Badge variant="outline" className="mt-4 border-muted-foreground/20 text-muted-foreground/40">
                    STATUS: DECLASSIFIED / INACTIVE
                  </Badge>
                )}
              </motion.div>

              {/* --- CONTENT SECTIONS --- */}
              {!isError && !showInactive && sections.length > 0 && (
                <div className="space-y-6 md:space-y-8">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section._id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-background/40 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden group">
                        <CardHeader className="pb-2 pt-8 px-6 md:px-10">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary/30 group-hover:text-primary transition-colors">
                              0{index + 1}
                            </span>
                            <CardTitle className="text-lg md:text-xl font-bold tracking-tight text-foreground/90 italic">
                              {section.heading}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 md:px-10 pb-10">
                          <p className="text-[14px] md:text-15px text-muted-foreground leading-relaxed font-medium opacity-90 whitespace-pre-line">
                            {section.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* --- EMPTY STATE --- */}
              {!isError && !showInactive && !isLoading && sections.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-muted/10 rounded-[3rem] border border-dashed border-border/60"
                >
                  <div className="bg-background/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 italic">
                    Documentation pending in vault.
                  </p>
                </motion.div>
              )}

              {/* --- FOOTER META --- */}
              {!isError && !showInactive && lastUpdated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-center mt-20 pt-10 border-t border-border/20"
                >
                  <div className="inline-flex flex-col items-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic mb-2">
                      Verified Protocol
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground/40 bg-muted/30 px-4 py-1.5 rounded-full">
                      Last Updated: {lastUpdated}
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;