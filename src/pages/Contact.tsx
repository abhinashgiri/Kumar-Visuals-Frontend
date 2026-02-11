import { useState, FC } from "react";
import { motion } from "framer-motion";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ButtonSpinner, SectionLoader } from "@/components/ui/loader";
import { useSiteSettings } from "@/store/useSiteSettings";
import { SeoHead } from "@/components/SeoHead";

const Contact: FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { settings, isLoading: settingsLoading } = useSiteSettings();

  const contactEmail = settings?.contactEmail?.trim() || "care@kumarmusic.com";
  const phonePrimary = settings?.phonePrimary?.trim() || "+91 8597591784";
  const cityLine = [settings?.addressLine1, settings?.city].filter(Boolean).join(", ") || "Mumbai, Maharashtra";

  const faqItems = settings?.faqs?.length ? settings.faqs.map(f => ({ q: f.question, a: f.answer })) : [
    { q: "How do I access my purchased music?", a: "After purchase, you'll receive instant download links via email and your dashboard vault." },
    { q: "What audio quality do you provide?", a: "We provide premium 320 Kbps MP3 and Studio-grade WAV formats for all releases." }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post("/contact", formData);
      toast({ title: "Message sent!", description: "We’ll get back to you as soon as possible." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast({ title: `"Error" ${error}`, description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="Contact Us" />


      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 md:pt-40 pb-12 md:pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6"
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
              <MessageCircle className="h-3 w-3 mr-2" /> Support Hub
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter italic leading-[1.1] text-foreground">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-xl mx-auto italic opacity-80 px-2">
              Have a question or want to collaborate? Our studio team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTACT CONTENT --- */}
      <section className="container mx-auto px-6 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT: Info Cards - Stacked on mobile, 4 columns on desktop */}
          <div className="lg:col-span-4 space-y-4">
            {[
              { icon: Mail, label: "Email Us", val: contactEmail, href: `mailto:${contactEmail}`, color: "text-primary" },
              { icon: Phone, label: "Call Us", val: phonePrimary, href: `tel:${phonePrimary}`, color: "text-secondary" },
              { icon: MapPin, label: "Studio Location", val: cityLine, color: "text-accent" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-background/40 backdrop-blur-md border-border/50 p-5 md:p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:bg-background transition-colors shrink-0">
                      <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm md:text-base font-bold text-foreground hover:text-primary truncate block transition-colors">{item.val}</a>
                      ) : (
                        <p className="text-sm md:text-base font-bold text-foreground truncate">{item.val}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: Contact Form */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-8 w-full">
            <Card className="bg-background border-border/50 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
               {isSubmitting && <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center"><SectionLoader label="Dispatching Message..." /></div>}
               
               <h2 className="text-2xl md:text-3xl font-black italic tracking-tight mb-6 md:mb-10">Send a <span className="text-primary">Direct Message</span></h2>
               
               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] md:text-[11px] font-black uppercase text-muted-foreground ml-1">Your Name</label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="h-11 md:h-12 rounded-xl bg-muted/20 border-border/40 focus:bg-background transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] md:text-[11px] font-black uppercase text-muted-foreground ml-1">Email Address</label>
                    <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className="h-11 md:h-12 rounded-xl bg-muted/20 border-border/40 focus:bg-background transition-all" placeholder="john@example.com" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="subject" className="text-[10px] md:text-[11px] font-black uppercase text-muted-foreground ml-1">Subject</label>
                    <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="h-11 md:h-12 rounded-xl bg-muted/20 border-border/40 focus:bg-background transition-all" placeholder="Collaboration / Inquiry" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="message" className="text-[10px] md:text-[11px] font-black uppercase text-muted-foreground ml-1">Message Content</label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required className="min-h-[140px] md:min-h-[180px] rounded-2xl bg-muted/20 border-border/40 resize-none p-4 md:p-5 focus:bg-background transition-all" placeholder="How can we help you?" />
                  </div>
                  <div className="md:col-span-2 pt-2 md:pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 gap-2 italic active:scale-95 transition-transform">
                      {isSubmitting ? <ButtonSpinner /> : <><Send className="h-4 w-4" /> Dispatch Message</>}
                    </Button>
                  </div>
               </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-2">
             <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter flex items-center justify-center gap-3">
               <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Common Queries
             </h2>
             <p className="text-xs md:text-base text-muted-foreground font-medium">Quick resolutions for your support needs</p>
          </div>

          <div className="grid gap-4 md:gap-5">
            {faqItems.map((faq, i) => (
              <motion.div key={i} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-background/40 border-border/40 p-5 md:p-6 rounded-2xl hover:border-primary/20 transition-all shadow-sm">
                  <h3 className="text-sm md:text-base font-bold text-foreground mb-1.5 flex items-start gap-3 leading-snug">
                    <span className="text-primary mt-1 shrink-0">•</span> {faq.q}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed ml-6 opacity-90">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;