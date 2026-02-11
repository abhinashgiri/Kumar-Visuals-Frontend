import { useState, FC } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Music2, Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ButtonSpinner } from "@/components/ui/loader";
import { SeoHead } from "@/components/SeoHead";

const ForgotPassword: FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast({ title: "Reset link sent!", description: "Check your inbox for instructions." });
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to send link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      toast({ title: "Email resent!", description: "A new link has been dispatched." });
    } catch  {
      toast({ title: "Error", description: "Failed to resend link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="Forgot Password" />


      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          {/* HEADER SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 space-y-4"
          >
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:blur-2xl transition-all" />
                <div className="relative w-16 h-16 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
                  <Music2 className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-foreground leading-none">
                Reset <span className="gradient-text">Password</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground italic">
                {sent ? "Instructions dispatched to your inbox." : "Enter your email to reclaim access."}
              </p>
            </div>
          </motion.div>

          {/* MAIN CARD */}
          <AnimatePresence mode="wait">
            <motion.div
              key={sent ? "sent" : "input"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                <CardContent className="p-8 md:p-10">
                  {sent ? (
                    <div className="space-y-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-foreground">Email Dispatched!</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                          We&apos;ve sent a secure reset link to:
                          <br />
                          <span className="text-foreground font-bold break-all">{email}</span>
                        </p>
                      </div>

                      <div className="pt-4 space-y-3 border-t border-border/40">
                        <Button
                          variant="outline"
                          onClick={handleResend}
                          disabled={loading}
                          className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/60 hover:bg-primary/5 transition-all"
                        >
                          {loading ? <ButtonSpinner /> : "Resend Link"}
                        </Button>

                        <Link to="/auth" className="block">
                          <Button variant="ghost" className="w-full text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest">
                            Return to Login
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Email Address
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                          <Input
                            type="email"
                            placeholder="vault@kumarmusic.com"
                            className="pl-11 h-12 rounded-xl bg-muted/20 border-border/50 focus:ring-1 focus:ring-primary/30 text-sm font-medium transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 gap-2 italic transition-all active:scale-95"
                      >
                        {loading ? <ButtonSpinner /> : <><Send className="h-3.5 w-3.5" /> Dispatch Reset Link</>}
                      </Button>

                      <div className="text-center">
                        <Link
                          to="/auth"
                          className="text-[11px] font-bold text-muted-foreground/60 hover:text-primary transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Nevermind, I remember
                        </Link>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* HELP TEXT */}
          <div className="mt-8 text-center">
            <p className="text-[11px] font-medium text-muted-foreground italic opacity-60">
              Need more help? <Link to="/contact" className="text-primary hover:underline">Contact studio support</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;