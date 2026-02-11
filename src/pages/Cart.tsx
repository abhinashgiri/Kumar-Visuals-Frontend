import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  ArrowRight,
  Tag,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Music2,
  Check,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import api from "@/services/api";
import { PageLoader, ButtonSpinner } from "@/components/ui/loader";
import { useToast } from "@/components/ui/use-toast";
import { SeoHead } from "@/components/SeoHead";

type CartItem = {
  id: string;
  title: string;
  artist: string;
  format: string;
  price: number;
  coverImage: string;
};

type UserProfile = {
  name: string;
  email: string;
  phone?: string | null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Cart = () => {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart() as {
    cartItems: CartItem[];
    removeFromCart: (id: string) => void;
    getCartTotal: () => number;
    clearCart: () => void;
  };

  const { toast } = useToast();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const subtotal = getCartTotal();

  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const promoApplied = !!appliedCode && promoDiscountAmount > 0;

  //  SINGLE SOURCE OF TRUTH (matches backend)
  const discountedTotal = Math.max(0, subtotal - promoDiscountAmount);
  const convenienceFee = promoApplied && discountedTotal === 0 ? 1 : 0;
  const payableTotal = discountedTotal + convenienceFee;

  useEffect(() => {
    setPromoError(null);
    setPromoSuccess(null);
    setPromoDiscountAmount(0);
    setAppliedCode(null);
  }, [subtotal, cartItems.length]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setError(null);
    }
  }, [cartItems.length]);

  useEffect(() => {
    const token =
      "localStorage" in globalThis
        ? globalThis.localStorage.getItem("accessToken")
        : null;

    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        const user = (res.data as { user?: any })?.user;
        if (user) {
          setUserProfile({
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
          });
        }
      } catch {}
    };

    void fetchProfile();
  }, []);

  const resetPromoState = () => {
    setPromoError(null);
    setPromoSuccess(null);
    setPromoDiscountAmount(0);
    setAppliedCode(null);
  };

  const applyPromoCode = async () => {
    if (promoApplied) {
      resetPromoState();
      return;
    }

    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCode.trim();
    if (!code) {
      setPromoError("Enter a valid promo code");
      return;
    }

    try {
      setIsApplyingPromo(true);

      const res = await api.post("/promos/apply", {
        code,
        subtotal,
        productIds: cartItems.map((i) => i.id),
      });

      const data = res.data as {
        code: string;
        discountAmount: number;
      };

      setAppliedCode(data.code);
      setPromoDiscountAmount(data.discountAmount);
      setPromoSuccess(`Promo applied! You saved ₹${data.discountAmount}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Promo code is invalid or cannot be applied.";

      setPromoError(msg);
      setPromoSuccess(null);
      setPromoDiscountAmount(0);
      setAppliedCode(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const showErrorToast = (title: string, msg: string) => {
    setError(msg);
    toast({
      variant: "destructive",
      title,
      description: msg,
    });
  };

  const getAuthToken = () =>
    "localStorage" in globalThis
      ? globalThis.localStorage.getItem("accessToken")
      : null;

  const buildPrefill = (): Record<string, string> => {
    const prefill: Record<string, string> = {};
    if (userProfile?.name) prefill.name = userProfile.name;
    if (userProfile?.email) prefill.email = userProfile.email;
    if (userProfile?.phone) prefill.contact = userProfile.phone;
    return prefill;
  };

  //  Handles verification and Cart Clearing
  const handlePaymentVerification = async (orderId: string, response: any) => {
    try {
      if (!orderId) {
        throw new Error("Order ID is missing during verification.");
      }

      // 1. Loader Start
      setIsCheckoutLoading(true);
      console.log("Verifying payment for Order:", orderId);

      // 2. Verify Payment with Backend
      await api.post("/orders/verify", {
        orderId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      console.log("Verification success! Clearing cart...");

      //  3. CLEAR CART HERE (Critical Step)
      clearCart();

      toast({
        title: "Payment successful",
        description: "Your order has been placed. Redirecting...",
      });

      // 4. Navigate to Success Page
      // Using explicit string concatenation to prevent undefined issues
      navigate(`/payment/success?type=order&orderId=${orderId}`, {
        state: { fromPayment: true, type: "order", orderId }, // Pass in state as backup
        replace: true,
      });
    } catch (err: any) {
      console.error("Verification Error:", err);

      // Stop Loader if verification fails
      setIsCheckoutLoading(false);

      showErrorToast(
        "Payment verification failed",
        err?.response?.data?.message ||
          "Payment verification failed. Please contact support."
      );
    }
  };

  const handleCheckout = async () => {
    setError(null);

    if (!cartItems.length) {
      showErrorToast("Cart empty", "Cart is empty.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Login required", "Please log in to continue.");
      navigate("/auth?redirect=/cart");
      return;
    }

    try {
      setIsCheckoutLoading(true);

      const res = await api.post("/orders", {
        productIds: cartItems.map((i) => i.id),
        currency: "INR",
        promoCode: appliedCode || null,
      });

      const data = res.data;

      // Ensure backend returned an Order ID
      if (!data.orderId) {
        throw new Error("Failed to create order. No Order ID returned.");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showErrorToast("Payment error", "Unable to load payment gateway.");
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: "Kumar Visuals Studio",
        description: "Music purchase",
        order_id: data.razorpayOrderId,
        // Passing the ID explicitly from the scope
        handler: (response: any) =>
          handlePaymentVerification(data.orderId, response),
        ...(Object.keys(buildPrefill()).length
          ? { prefill: buildPrefill() }
          : {}),
        theme: { color: "#7C3AED" },
      };

      const rzp = new globalThis.Razorpay(options);
      
      // Handle failures/closure
      rzp.on('payment.failed', function (response: any){
          console.error("Payment Failed:", response.error);
          setIsCheckoutLoading(false); // Stop loader on failure
          showErrorToast("Payment Failed", response.error.description || "Transaction failed.");
      });

      rzp.open();

    } catch (err: any) {
      // Logic for Duplicates...
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("Duplicate purchase")
      ) {
        const duplicates = err.response.data.alreadyPurchased || [];

        if (Array.isArray(duplicates) && duplicates.length > 0) {
          duplicates.forEach((dup: { id: string }) => {
            removeFromCart(dup.id);
          });

          toast({
            variant: "default",
            title: "Library Updated",
            description: `Removed ${duplicates.length} item(s) you already own. Please checkout again.`,
          });
          
          setIsCheckoutLoading(false); // Stop loader
          return;
        }
      }

      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      showErrorToast("Checkout Failed", msg);
      
      setIsCheckoutLoading(false); // Stop loader
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="Cart" />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* HEADER SECTION */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6 mb-8"
          >
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic text-foreground leading-none">
                Shopping <span className="gradient-text">Cart</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground italic">
                Review your studio selections before finalizing.
              </p>
            </div>
            {cartItems.length > 0 && (
              <Badge
                variant="secondary"
                className="w-fit px-4 py-1.5 rounded-xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest border-none"
              >
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}{" "}
                Ready
              </Badge>
            )}
          </motion.div>

          {error && cartItems.length > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 animate-pulse">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-background/40 border border-dashed border-border rounded-[2.5rem]"
            >
              <div className="p-6 bg-muted/30 rounded-full mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
              </div>

              <h2 className="text-xl font-bold mb-2 text-foreground">
                Your cart is silent
              </h2>

              <p className="text-sm text-muted-foreground max-w-xs mb-8 font-medium">
                You haven&apos;t added any tracks to your vault yet. Start
                exploring our latest drops.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/shop">
                  <Button className="rounded-xl font-black uppercase tracking-widest text-[11px] h-11 px-8 gap-2 shadow-lg shadow-primary/10">
                    Browse Catalog <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold text-[11px] h-11 px-8 border-border/60"
                  >
                    Return Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ITEM LIST AREA */}
              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <Card className="bg-background/40 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all rounded-[1.5rem] overflow-hidden shadow-sm group">
                        <CardContent className="p-3 md:p-4 flex items-center gap-4 md:gap-6">
                          <div className="relative shrink-0">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/10 rounded-xl group-hover:opacity-0 transition-opacity" />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-bold text-sm md:text-base text-foreground truncate leading-tight mb-0.5">
                              {item.title}
                            </h3>
                            <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1.5">
                              {item.artist}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-black uppercase tracking-tighter h-5 px-2 bg-muted/30 border-border/40 w-fit"
                            >
                              {item.format}
                            </Badge>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2 shrink-0">
                            <p className="text-base md:text-lg font-black text-primary italic leading-none">
                              ₹{item.price}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all"
                            >
                              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* SUMMARY SIDEBAR */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-background border-border/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
                      <Zap className="h-32 w-32 text-primary" />
                    </div>

                    <h2 className="text-xl font-black italic tracking-tight mb-6 text-foreground">
                      Order <span className="text-primary">Summary</span>
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span>Subtotal</span>
                        <span className="text-foreground">₹{subtotal}</span>
                      </div>

                      {promoApplied && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-500"
                        >
                          <span>Promo ({appliedCode})</span>
                          <span>-₹{promoDiscountAmount}</span>
                        </motion.div>
                      )}

                      {convenienceFee > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
                        >
                          <span>Convenience Fee</span>
                          <span>₹{convenienceFee}</span>
                        </motion.div>
                      )}

                      <Separator className="bg-border/40 my-4" />

                      <div className="flex justify-between items-center text-lg font-black italic">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary text-2xl">
                          ₹{payableTotal}
                        </span>
                      </div>
                    </div>

                    {/* PROMO SECTION */}
                    <div className="space-y-3 mb-8">
                      <label
                        htmlFor="promo-code"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1"
                      >
                        Got a voucher?
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 group">
                          <Input
                            id="promo-code"
                            placeholder="CODE"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className={`h-10 rounded-xl bg-muted/20 border-border/50 text-xs px-4 focus:ring-1 focus:ring-primary/30 transition-all ${
                              promoApplied ? "border-emerald-500/50 pr-10" : ""
                            }`}
                            disabled={isApplyingPromo || promoApplied}
                          />
                          {promoApplied && (
                            <Check className="absolute right-3 top-2.5 h-4 w-4 text-emerald-500" />
                          )}
                        </div>

                        <Button
                          variant={promoApplied ? "destructive" : "outline"}
                          onClick={applyPromoCode}
                          disabled={
                            isApplyingPromo || (!promoApplied && !promoCode.trim())
                          }
                          className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
                        >
                          {isApplyingPromo ? (
                            <ButtonSpinner />
                          ) : promoApplied ? (
                            "Remove"
                          ) : (
                            <>
                              <Tag className="h-3 w-3 mr-1.5" /> Apply
                            </>
                          )}
                        </Button>
                      </div>

                      {promoError && (
                        <p className="text-destructive text-[10px] font-bold px-1 animate-in fade-in slide-in-from-top-1">
                          {promoError}
                        </p>
                      )}
                      {promoSuccess && (
                        <p className="text-emerald-500 text-[10px] font-bold px-1 italic animate-in fade-in slide-in-from-top-1">
                          {promoSuccess}
                        </p>
                      )}
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 gap-3 mb-4 italic group"
                      onClick={handleCheckout}
                      disabled={isCheckoutLoading || cartItems.length === 0}
                    >
                      {isCheckoutLoading ? (
                        <ButtonSpinner />
                      ) : (
                        <>
                          Proceed to Pay{" "}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <Link to="/shop">
                      <Button
                        variant="ghost"
                        className="w-full text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors"
                      >
                        Add more items
                      </Button>
                    </Link>

                    {/* TRUST BADGES */}
                    <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-3 gap-2">
                      {[
                        { icon: ShieldCheck, label: "Secure" },
                        { icon: Zap, label: "Instant" },
                        { icon: Music2, label: "Studio" },
                      ].map((badge, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >
                          <badge.icon className="h-4 w-4 text-emerald-500/50" />
                          <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40">
                            {badge.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isCheckoutLoading && <PageLoader label="Processing Transaction..." />}

      <Footer />
    </div>
  );
};

export default Cart;