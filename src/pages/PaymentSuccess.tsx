import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowRight, Music2, Download, Zap, ShieldCheck } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";

const PaymentSuccess = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const type = params.get("type") || "order"; 
  const orderId = params.get("orderId"); 

  const isMembership = type === "membership";
  const title = isMembership ? "Membership Active" : "Payment Confirmed";

  const mainHeading = isMembership
    ? "Welcome to the Inner Circle"
    : "Transaction Successful";

  const shortRef = orderId ? orderId.slice(-8).toUpperCase() : "DONE";
  const fullOrderId = orderId ? `#${orderId.toUpperCase()}` : "PROCESSING...";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="Payment Successful" />

      <main className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* --- MAIN HEADER --- */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic text-foreground leading-none">
              {title.split(' ')[0]} <span className="gradient-text">{title.split(' ')[1]}</span>
            </h1>
            
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em] opacity-60">
              Access Granted • Ref #{shortRef}
            </p>
          </motion.div>

          {/* --- SUCCESS CARD --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              
              <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">
                
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-black italic tracking-tight text-foreground">
                    {mainHeading}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                    {isMembership ? (
                      <>
                        Your premium plan is now active. You have been granted full access to the studio's 
                        <span className="text-foreground font-bold"> exclusive vault features and multi-track stems.</span>
                      </>
                    ) : (
                      <>
                        Your studio selections are now ready. All tracks have been added to your 
                        <span className="text-foreground font-bold"> digital library for instant high-fidelity download.</span>
                      </>
                    )}
                  </p>
                </div>

                <Separator className="bg-border/40" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[
                    { icon: Zap, t: isMembership ? "Tier Active" : "Instant Access", d: isMembership ? "Benefits synced" : "Files ready" },
                    { icon: Download, t: "Vault Access", d: "Lifetime storage" },
                    { icon: ShieldCheck, t: "Secure", d: "Order verified" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-border/40 bg-muted/20 text-left space-y-1 group hover:border-primary/20 transition-all">
                      <item.icon className="h-4 w-4 text-emerald-500/60 mb-2" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">{item.t}</h4>
                      <p className="text-[10px] font-medium text-muted-foreground leading-none">{item.d}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                  <Link to={isMembership ? "/dashboard?tab=settings" : "/dashboard?tab=library"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 gap-2 italic">
                      {isMembership ? "Manage Membership" : "Go to My Library"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to="/shop" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] border-border/60 hover:bg-primary/5 transition-all gap-2">
                      Browse More <Music2 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Receipt dispatched to your email • Order ID: {fullOrderId}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="text-center">
             <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
               ← Back to Home
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;