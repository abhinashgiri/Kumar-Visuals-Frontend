import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Music2, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ButtonSpinner } from "@/components/ui/loader";
import { SeoHead } from "@/components/SeoHead";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirm) {
      toast({
        title: "Passwords do not match",
        description: "Please enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await api.post(`/auth/reset-password/${token}`, { password });

      setDone(true);

      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });

      setTimeout(() => {
        navigate("/auth");
      }, 1200);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset failed",
        description:
          error?.response?.data?.message || "Link is invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SeoHead pageTitle="Reset Password" />


      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8 space-y-2">
            <div className="flex justify-center mb-3 md:mb-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Music2 className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Set New Password
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground">
              {done
                ? "Your password has been successfully updated."
                : "Enter your new password below to secure your account."}
            </p>
          </div>

          {/* Card */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-5 md:p-6">
              {done ? (
                <div className="space-y-5 md:space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base md:text-lg">
                      Password Updated
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      You can now sign in with your new password.
                    </p>
                  </div>

                  <Link to="/auth">
                    <Button className="w-full h-10 md:h-11 text-sm md:text-base">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-sm md:text-base"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm md:text-base"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 md:h-11 text-sm md:text-base"
                    disabled={loading || !token}
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>

                  <div className="text-center pt-3 md:pt-4">
                    <Link
                      to="/auth"
                      className="text-xs md:text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
