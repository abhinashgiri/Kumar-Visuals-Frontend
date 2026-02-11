import { useState, FC } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, ShieldCheck, Headphones, Music2, Download } from "lucide-react";

import api from "@/services/api";
import { SectionLoader, ButtonSpinner } from "@/components/ui/loader";
import { SeoHead } from "@/components/SeoHead";

/**
 * TYPE DEFINITIONS
 */
declare global {
  interface Window {
    Razorpay: any;
  }
}

type ApiMembershipPlan = {
  _id: string;
  key: string;
  name: string;
  price: number;
  currency: string;
  maxDownloadsPerMonth: number | null;
  allowedFormats: string[];
  commercialUse: boolean;
  remixRequestsPerMonth: number;
  features?: string[];
  sortOrder?: number;
  isActive: boolean;
};

type MembershipState = {
  planKey: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  status: "NONE" | "ACTIVE" | "EXPIRED" | "CANCELLED";
} | null;

/**
 * UTILITY: External Script Loader for Payments
 */
async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true); return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const iconMap: Record<string, any> = { BASIC: Zap, PREMIUM: Sparkles, VIP: Crown };
const colorMap: Record<string, string> = { 
    BASIC: "bg-blue-500/10 text-blue-500", 
    PREMIUM: "bg-primary/10 text-primary", 
    VIP: "bg-amber-500/10 text-amber-500" 
};

/**
 * MEMBERSHIP COMPONENT
 * Handles plan visualization and subscription workflows.
 */
const Membership: FC = () => {
  const navigate = useNavigate();
  const [loadingPlanKey, setLoadingPlanKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!globalThis.localStorage?.getItem("accessToken");

  const benefits = [
    { icon: <Music2 className="h-5 w-5" />, title: "Studio Masters", desc: "Crystal clear audio" },
    { icon: <Download className="h-5 w-5" />, title: "Instant Access", desc: "No waiting time" },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Usage License", desc: "Safe for projects" },
    { icon: <Headphones className="h-5 w-5" />, title: "Multi-Device", desc: "Access anywhere" },
  ];

  /**
   * DATA FETCHING: User Membership Status
   */
  const { data: membershipData, refetch: refetchMembership } = useQuery({
    queryKey: ["membership"],
    enabled: isLoggedIn,
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const membership: MembershipState = membershipData?.user?.membership ?? null;
  const activePlanKey = isLoggedIn && membership?.status === "ACTIVE" ? membership.planKey : null;

  /**
   * DATA FETCHING: Available Plans
   */
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => (await api.get("/memberships/plans")).data,
  });

  // Transform and filter plans for display
  const plans = (plansData?.plans ?? [])
    .filter((p: ApiMembershipPlan) => p.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p) => {
      const fallbackFeatures: string[] = [];
      if (p.maxDownloadsPerMonth === null) fallbackFeatures.push("Unlimited Downloads");
      else if (p.maxDownloadsPerMonth > 0) fallbackFeatures.push(`${p.maxDownloadsPerMonth} Downloads per month`);
      if (p.allowedFormats?.length) fallbackFeatures.push(`${p.allowedFormats.join(", ").toUpperCase()} Quality`);
      fallbackFeatures.push(p.commercialUse ? "Commercial License" : "Personal License");
      
      return {
        key: p.key,
        name: p.name,
        price: p.price,
        currency: p.currency || "INR",
        icon: iconMap[p.key] ?? Sparkles,
        color: colorMap[p.key] ?? "bg-slate-500/10 text-slate-500",
        features: p.features?.length ? p.features : fallbackFeatures,
        popular: p.key === "PREMIUM",
      };
    });

  /**
   * HANDLER: Initiate Subscription Process
   */
  const handleStartPlan = async (planKey: string) => {
    setError(null);
    if (!isLoggedIn) { navigate(`/auth?redirect=/membership?plan=${planKey.toLowerCase()}`); return; }
    if (activePlanKey === planKey) { navigate("/dashboard?tab=settings"); return; }
    if (loadingPlanKey) return;

    try {
      setLoadingPlanKey(planKey);
      const checkoutRes = await api.post("/orders/membership", { planKey, currency: "INR" });
      const data = checkoutRes.data;
      const loaded = await loadRazorpayScript();
      
      if (!loaded) {
        setError("Unable to load payment gateway.");
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: "Kumar Music",
        description: `${data.membershipPlanKey} Plan`,
        order_id: data.razorpayOrderId,
handler: async (res: any) => {
  try {
    const verifyRes = await api.post("/orders/verify", { 
      orderId: data.orderId, 
      razorpayOrderId: res.razorpay_order_id, 
      razorpayPaymentId: res.razorpay_payment_id, 
      razorpaySignature: res.razorpay_signature 
    
    });

    if (verifyRes.status === 200 || verifyRes.status === 201) {
      await refetchMembership();

      const successData = { ts: Date.now(), type: "membership" };
      sessionStorage.setItem("lastPaymentSuccess", JSON.stringify(successData));

      // Force navigation
      globalThis.location.href = "/payment/success?type=membership";
    }
  } catch (error_) {
    console.error("Verification failed", error_);
    setError("Verification failed. Please contact support.");
  }
},
        theme: { color: "#7C3AED" },
        modal: {
          ondismiss: () => setLoadingPlanKey(null)
        }
      };
      
      const rzp = new (globalThis as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err?.message || "Checkout failed");
      setLoadingPlanKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      <Navigation />
      <SeoHead pageTitle="Membership Plans" />


      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-20">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          
          {/* 1. HERO SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center space-y-4 px-4"
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
              <Crown className="h-3 w-3 mr-2" /> Premium Access
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic leading-tight">
              Choose Your <span className="gradient-text">Plan</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              Unlock exclusive tracks, commercial licenses, and direct downloads from the studio vault.
            </p>
          </motion.div>

          {/* 2. PRICING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch px-2 sm:px-0">
            {plansLoading ? (
               <div className="col-span-full py-20 flex justify-center">
                 <SectionLoader label="Loading Plans..." />
               </div>
            ) : plans.map((plan) => (
              <motion.div key={plan.key} whileHover={{ y: -5 }} className="h-full">
                <Card className={`relative h-full flex flex-col p-6 sm:p-8 rounded-[2rem] border-border/40 bg-background transition-all duration-300 shadow-sm ${plan.popular ? 'border-primary ring-1 ring-primary/20 shadow-xl scale-100' : 'hover:shadow-md'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6 flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${plan.color}`}>
                      <plan.icon className="h-5 w-5" />
                    </div>
                    {activePlanKey === plan.key && (
                       <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">
                         Current Plan
                       </Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight">₹{plan.price}</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-[12px] sm:text-[13px] font-medium text-muted-foreground leading-tight">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleStartPlan(plan.key)}
                    disabled={loadingPlanKey === plan.key}
                    className={`w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all ${plan.popular ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-muted/50 hover:bg-muted text-foreground border border-border/60'}`}
                  >
                    {loadingPlanKey === plan.key ? (
                      <ButtonSpinner />
                    ) : activePlanKey === plan.key ? (
                      "Manage Plan"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 3. FEATURES LIST SECTION */}
          <div className="pt-6 sm:pt-10 space-y-10 md:space-y-12">
            <h2 className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30 px-4">
              Everything included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border/30 bg-background/50 text-center space-y-2 group hover:border-primary/20 transition-all duration-300">
                  <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all">
                    {benefit.icon}
                  </div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">{benefit.title}</h4>
                  <p className="text-[10px] font-medium text-muted-foreground/60">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. FOOTER CALL-TO-ACTION */}
          <div className="text-center pt-8 px-4">
            <p className="text-[11px] font-medium text-muted-foreground mb-3">Need help or a custom plan?</p>
            <Link to="/contact">
              <Button variant="outline" size="sm" className="rounded-lg text-[10px] font-bold h-9 px-6 border-border/60">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Membership;