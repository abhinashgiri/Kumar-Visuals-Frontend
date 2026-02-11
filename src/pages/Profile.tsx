import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Lock } from "lucide-react";
import api from "@/services/api";
import { SectionLoader, ButtonSpinner } from "@/components/ui/loader";
import { AppUser as BaseAppUser } from "@/types/dashboard";
import { SeoHead } from "@/components/SeoHead";

// ---- local type: dashboard AppUser + extra fields this page uses ----
interface ProfileUser extends BaseAppUser {
  phone?: string;
  avatarUrl?: string;
}

const PREFERENCES_KEY = "profile-notification-preferences";

const formatIndianDate = (
  value: string | Date | null | undefined
): string => {
  if (!value) return "Recently";

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Recently";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

const Profile = () => {
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newsletter: true,
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // ---------- Load user via React Query (cached) ----------
  const {
    data: userData,
    isLoading: isFetchingUser,
  } = useQuery<{ user?: ProfileUser }, Error>({
    queryKey: ["dashboard-user"],
    queryFn: async () => {
      try {
        const res = await api.get<{ user?: ProfileUser }>("/users/me");
        return res.data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Unable to load profile data.";
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
        throw new Error(msg);
      }
    },
  });

  // When user data arrives, sync it into editable state + localStorage
  useEffect(() => {
    const user = userData?.user;
    if (!user) return;

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatarUrl || "",
    });

    localStorage.setItem("user", JSON.stringify(user));
  }, [userData]);

  // Load notification preferences from localStorage once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "emailNotifications" in parsed
      ) {
        setPreferences((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // ignore corrupted value
    }
  }, []);

  // Persist notification preferences whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // ignore storage failures
    }
  }, [preferences]);

  // ---------- Derived display values ----------
  const initials =
    profileData.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const rolesLabel = useMemo(() => {
    const roles = Array.isArray(userData?.user?.roles)
      ? userData?.user?.roles
      : [];

    if (!roles || roles.length === 0) return "Standard user";

    return roles
      .map((r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase())
      .join(" • ");
  }, [userData]);

  const joinedText = useMemo(() => {
    const createdAt = userData?.user?.createdAt;
    return formatIndianDate(createdAt as any);
  }, [userData]);

  // ---------- Save profile ----------
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      const payload: {
        name?: string;
        phone?: string | null;
        avatarUrl?: string | null;
      } = {
        name: profileData.name,
        phone: profileData.phone || null,
        // avatar is view-only here; still sent if backend expects it
        avatarUrl: profileData.avatar || null,
      };

      const res = await api.put<{ user: ProfileUser }>("/users/me", payload);
      const { user } = res.data;

      setProfileData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatarUrl || "",
      }));

      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast({
        title: "Update failed",
        description:
          err?.response?.data?.message || "Could not update your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ---------- Change password ----------
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Missing fields",
        description: "Fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast({
        title: "Invalid password",
        description: "New password must be different from current password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPasswordLoading(true);

      await api.put("/users/me/password", {
        currentPassword,
        newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      toast({
        title: "Password updated",
        description:
          "Your password has been changed. You may need to sign in again on other devices.",
      });
    } catch (err: any) {
      console.error("Failed to change password:", err);
      toast({
        title: "Password change failed",
        description:
          err?.response?.data?.message ||
          "Could not change your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SeoHead pageTitle="My Profile" />


      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-1.5 md:mb-2">
              Profile
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage your account details, security, and notifications.
            </p>
          </motion.div>

          {/* While fetching user, show loader but keep layout */}
          {isFetchingUser ? (
            <SectionLoader label="Loading your profile..." className="py-10" />
          ) : (
            <>
              {/* Profile Overview */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Card className="glass-card border-border/50">
                  <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <Avatar className="w-16 h-16 md:w-20 md:h-20 shadow-sm">
                        <AvatarImage src={profileData.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl md:text-2xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl md:text-2xl font-semibold truncate">
                            {profileData.name || "User"}
                          </h2>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground bg-muted/40">
                            {rolesLabel}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 break-all">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{profileData.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Member since {joinedText}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main grid: Personal info + Security */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
              >
                {/* Personal Information */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Keep your basic information up to date.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm md:text-base">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Your full name"
                          className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm md:text-base">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="pl-10 h-10 md:h-11 text-sm md:text-base bg-muted/40 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] md:text-xs text-muted-foreground">
                        Email is linked to your account and cannot be changed
                        here.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm md:text-base">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+91 00000 00000"
                          className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      className="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Security – Change Password */}
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">
                      Security
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Use a strong, unique password for your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-sm md:text-base"
                      >
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm md:text-base"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmNewPassword"
                        className="text-sm md:text-base"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={passwordForm.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmNewPassword: e.target.value,
                            }))
                          }
                          className="pl-10 h-10 md:h-11 text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      variant="outline"
                      className="gap-2 h-10 md:h-11 text-sm md:text-base w-full sm:w-auto"
                      disabled={isPasswordLoading}
                    >
                      <Lock className="w-4 h-4" />
                      {isPasswordLoading ? (
                        <>
                          <ButtonSpinner className="ml-1" />
                          Updating...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Choose how you want to hear from us. These preferences
                      are stored on this device.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="email-notifications"
                          className="text-sm md:text-base"
                        >
                          Email Notifications
                        </Label>
                        <p className="text-[11px] md:text-xs text-muted-foreground">
                          Updates about your account and important changes.
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="push-notifications"
                          className="text-sm md:text-base"
                        >
                          Push Notifications
                        </Label>
                        <p className="text-[11px] md:text-xs text-muted-foreground">
                          Receive alerts on your devices where enabled.
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="newsletter"
                          className="text-sm md:text-base"
                        >
                          Newsletter
                        </Label>
                        <p className="text-[11px] md:text-xs text-muted-foreground">
                          Product updates, tips, and occasional promotions.
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={preferences.newsletter}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            newsletter: checked,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
