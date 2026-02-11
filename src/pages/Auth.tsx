import { useEffect, useState, useCallback, FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Music2, Mail, Lock, User, AlertTriangle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ButtonSpinner, SectionLoader } from "@/components/ui/loader";
import EmailVerificationStep from "@/components/auth/EmailVerificationStep";
import { useSiteSettings } from "@/store/useSiteSettings";
import { SeoHead } from "@/components/SeoHead";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: unknown) => void;
            ux_mode?: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface AppUser {
  _id: string;
  name: string;
  email: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: {
      message?: string;
      locked?: boolean;
      lockUntil?: string;
      remainingAttempts?: number;
      failedLoginAttempts?: number;
    };
  };
}

const saveAuthData = (accessToken: string, user: AppUser) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
};

const Auth: FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const settings = useSiteSettings((s) => s.settings);
  const allowSignup = settings?.allowSignup ?? true;

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const handleTabChange = (val: string) => {
    if (val === "signup" && !allowSignup) {
      toast({
        title: "Signups disabled",
        description: "New registrations are currently turned off.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(val as "signin" | "signup");
  };

  useEffect(() => {
    if (!allowSignup && activeTab === "signup") {
      setActiveTab("signin");
    }
  }, [allowSignup, activeTab]);

  const [isLoading, setIsLoading] = useState(false);
  const [signupStepLoading, setSignupStepLoading] = useState(false);

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [lockUntil, setLockUntil] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");

  const resetLockState = () => {
    setIsLocked(false);
    setLockMessage(null);
    setLockUntil(null);
    setRemainingAttempts(null);
  };

  // Google OAuth Handler
  const handleGoogleResponse = useCallback(
    async (googleResponse: unknown) => {
      const response = googleResponse as { credential?: string } | null;
      const idToken = response?.credential;
      if (!idToken) return;

      try {
        setIsLoading(true);
        const res = await api.post("/auth/google", { idToken });
        const data = res.data as { accessToken: string; user: AppUser };

        if (data.accessToken && data.user) {
          saveAuthData(data.accessToken, data.user);
          toast({ title: "Login Successful", description: "Welcome!" });
          navigate("/shop");
        }
      } catch (error) {
        const apiError = error as ApiErrorShape;
        toast({
          title: "Error",
          description: apiError.response?.data?.message || "Google login failed.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  // Initialize Google SDK and Button
  useEffect(() => {
    if (typeof window === "undefined") return;

    const renderGoogleButton = () => {
      const google = window.google;
      const btn = document.getElementById("googleLoginBtn");

      if (!google || !btn) return;

      // Clear existing button to prevent duplicates
      btn.innerHTML = "";

      // Calculate width dynamically based on container or window
      const containerWidth = btn.clientWidth || Math.min(window.innerWidth - 48, 400);

      google.accounts.id.renderButton(btn, {
        theme: "filled",
        size: "large",
        width: containerWidth,
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
      });
    };

    const initGoogleSDK = () => {
      const google = window.google;
      if (!google) return;

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      });

      renderGoogleButton();
    };

    if (globalThis.google) {
      initGoogleSDK();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleSDK;
      document.head.appendChild(script);
    }

    window.addEventListener("resize", renderGoogleButton);
    return () => {
      window.removeEventListener("resize", renderGoogleButton);
    };
  }, [handleGoogleResponse]);

  const handleLoginError = (apiError: ApiErrorShape) => {
    const status = apiError.response?.status;
    const data = apiError.response?.data;

    if (status === 403) {
      toast({
        title: "Email not verified",
        description: data?.message || "Please verify your email address before logging in.",
        variant: "destructive",
      });
      return;
    }

    if (status === 423 || data?.locked) {
      setIsLocked(true);
      setLockMessage(data?.message || "Your account is locked due to multiple failed attempts.");
      setLockUntil(data?.lockUntil || null);
      setRemainingAttempts(0);

      const extra = data?.lockUntil && !Number.isNaN(new Date(data.lockUntil).getTime())
        ? ` Locked until ${new Date(data.lockUntil).toLocaleTimeString()}.`
        : "";

      toast({
        title: "Account locked",
        description: "Too many failed attempts. Your account is locked for 30 minutes." + extra,
        variant: "destructive",
      });
      return;
    }

    if (status === 401 && data?.remainingAttempts !== undefined) {
      setIsLocked(false);
      setLockUntil(null);
      setRemainingAttempts(data.remainingAttempts ?? null);

      let errorDescription = "Wrong password.";

      if (data.remainingAttempts > 0) {
        const plural = data.remainingAttempts === 1 ? "" : "s";
        errorDescription = `Wrong password. ${data.remainingAttempts} attempt${plural} left before your account locks.`;
      }

      toast({
        title: "Invalid credentials",
        description: errorDescription,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login failed",
      description: data?.message || "Invalid credentials.",
      variant: "destructive",
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: signInForm.email,
        password: signInForm.password,
      });

      const data = res.data as { accessToken: string; user: AppUser };

      if (!data.accessToken || !data.user) {
        throw new Error("Invalid login response");
      }

      resetLockState();
      saveAuthData(data.accessToken, data.user);

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/shop");
    } catch (error: unknown) {
      const apiError = error as ApiErrorShape;
      handleLoginError(apiError);
      setSignInForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowSignup) {
      toast({
        title: "Signups disabled",
        description: "New registrations are currently turned off.",
        variant: "destructive",
      });
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSignupStepLoading(true);
    setIsOtpStep(false);
    setOtpCode("");

    try {
      await api.post("/auth/register/start", {
        name: signUpForm.name,
        email: signUpForm.email,
        password: signUpForm.password,
      });

      setVerificationEmail(signUpForm.email);
      setIsOtpStep(true);
      setOtpCode("");

      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit verification code.",
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorShape;
      toast({
        title: "Registration failed",
        description: apiError.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSignupStepLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationEmail || otpCode.length !== 6) return;
    setIsLoading(true);

    try {
      const res = await api.post("/auth/verify/email", {
        email: verificationEmail,
        otp: otpCode,
      });

      const data = res.data as { accessToken: string; user: AppUser };
      if (!data.accessToken || !data.user) {
        throw new Error("Invalid verify response");
      }

      resetLockState();
      setIsOtpStep(false);
      setOtpCode("");
      saveAuthData(data.accessToken, data.user);

      toast({
        title: "Account verified!",
        description: "Your email has been verified and your account is active.",
      });
      navigate("/shop");
    } catch (error: unknown) {
      const apiError = error as ApiErrorShape;
      toast({
        title: "Verification failed",
        description: apiError.response?.data?.message || "Invalid or expired code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!signUpForm.email || !signUpForm.name || !signUpForm.password) {
      toast({
        title: "Cannot resend",
        description: "Please fill the signup form again.",
        variant: "destructive",
      });
      setIsOtpStep(false);
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register/start", {
        name: signUpForm.name,
        email: signUpForm.email,
        password: signUpForm.password,
      });

      toast({
        title: "Code resent",
        description: "We have sent a new verification code to your email.",
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorShape;
      toast({
        title: "Failed to resend",
        description: apiError.response?.data?.message || "Could not resend the code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedLockUntil = lockUntil && !Number.isNaN(new Date(lockUntil).getTime())
    ? new Date(lockUntil).toLocaleString()
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500 flex flex-col">
      <Navigation />
      <SeoHead pageTitle="Login / Register" />

      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-12 md:pb-20 flex-grow">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-10 space-y-3 md:space-y-4"
          >
            <div className="flex justify-center">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Studio Logo"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md rounded-full"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Music2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-foreground leading-none">
                Studio <span className="gradient-text">Access</span>
              </h1>
              <p className="text-xs md:text-sm font-medium text-muted-foreground italic px-4">
                Sign in to manage your studio vault and orders.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-background border-border/50 rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <CardContent className="p-6 md:p-10">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8 rounded-xl bg-muted/20 p-1 h-10 md:h-11 border border-border/40">
                    <TabsTrigger
                      value="signin"
                      className="text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      disabled={!allowSignup}
                      className="text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <div
                    id="googleLoginBtn"
                    className="w-full mb-6 flex justify-center min-h-[44px]" 
                  />

                  <div className="relative mb-6 md:mb-8">
                    <Separator className="bg-border/40" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
                      Or continue with
                    </span>
                  </div>

                  <TabsContent value="signin" className="space-y-5 md:space-y-6 mt-0">
                    {isLocked && (
                      <div className="p-3 md:p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex gap-3 animate-in zoom-in-95">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-destructive">Account Locked</p>
                          <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground leading-relaxed">
                            {lockMessage || "Multiple failed attempts. Try again later."}
                          </p>
                          {formattedLockUntil && (
                             <p className="text-[10px] font-bold text-destructive/60 uppercase">Until: {formattedLockUntil}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {!isLocked && remainingAttempts !== null && (
                       <Badge variant="outline" className="w-full justify-center py-2 border-amber-500/20 bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                         {remainingAttempts} Attempts Remaining
                       </Badge>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-4 md:space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-11 h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-1 focus:ring-primary/30 text-sm font-medium transition-all"
                            required
                            value={signInForm.email}
                            disabled={isLoading || isLocked}
                            onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
                          <Link
                            to="/forgot-password"
                            className="text-[10px] font-black uppercase text-primary hover:underline transition-all"
                          >
                            Reset?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-11 h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-1 focus:ring-primary/30 text-sm font-medium transition-all"
                            required
                            value={signInForm.password}
                            disabled={isLoading || isLocked}
                            onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || isLocked}
                        className="w-full h-11 md:h-12 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-lg shadow-primary/20 gap-2 italic transition-all active:scale-[0.98]"
                      >
                        {isLoading ? <ButtonSpinner /> : <>{isLocked ? "Access Denied" : "Login"} <ArrowRight className="h-3.5 w-3.5" /></>}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <AnimatePresence mode="wait">
                      {isOtpStep && verificationEmail ? (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                          <EmailVerificationStep
                            email={verificationEmail}
                            otp={otpCode}
                            setOtp={setOtpCode}
                            loading={isLoading}
                            onVerify={handleVerifyOtp}
                            onResend={handleResendOtp}
                            onChangeEmail={() => {
                              setIsOtpStep(false);
                              setOtpCode("");
                            }}
                          />
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSignUp} className="space-y-4 md:space-y-5">
                          {signupStepLoading && (
                             <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                               <SectionLoader label="Sending OTP..." />
                             </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                              <Input
                                type="text"
                                placeholder="Kumar Sharma"
                                className="pl-11 h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-1 focus:ring-primary/30 text-sm font-medium transition-all"
                                required
                                value={signUpForm.name}
                                disabled={!allowSignup || isLoading || signupStepLoading}
                                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-11 h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 focus:ring-1 focus:ring-primary/30 text-sm font-medium transition-all"
                                required
                                value={signUpForm.email}
                                disabled={!allowSignup || isLoading || signupStepLoading}
                                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 text-sm font-medium transition-all"
                                required
                                value={signUpForm.password}
                                disabled={!allowSignup || isLoading || signupStepLoading}
                                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-10 md:h-11 rounded-xl bg-muted/20 border-border/50 text-sm font-medium transition-all"
                                required
                                value={signUpForm.confirmPassword}
                                disabled={!allowSignup || isLoading || signupStepLoading}
                                onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-11 md:h-12 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-lg shadow-primary/20 gap-2 italic transition-all active:scale-[0.98]"
                            disabled={!allowSignup || isLoading || signupStepLoading}
                          >
                            Register <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;