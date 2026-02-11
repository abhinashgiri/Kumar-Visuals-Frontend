import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, LogOut, Mail, User, UserCircle } from "lucide-react";
import { AppUser } from "@/types/dashboard";

interface ProfileTabProps {
  userProfile: AppUser | null;
  onLogout: () => void;
  onChangePassword: () => void;
}

const formatIndianDate = (value: string | Date | null | undefined): string => {
  if (!value) return "Recently";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Recently";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const ProfileTab: FC<ProfileTabProps> = ({
  userProfile,
  onLogout,
  onChangePassword,
}) => {
  const navigate = useNavigate();
  const hasUser = !!userProfile;

  const { displayName, displayEmail, joinedText, initials, rolesLabel } =
    useMemo(() => {
      const rawName = userProfile?.name?.trim() || "User";
      const rawEmail = userProfile?.email?.trim() || "Not provided";
      const joined = userProfile?.createdAt ? formatIndianDate(userProfile.createdAt) : "Recently";
      const initials = rawName.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase() || "U";
      const roles = Array.isArray(userProfile?.roles) ? userProfile.roles : [];
      const rolesLabel = roles.length > 0 
        ? roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()).join(" • ")
        : "Standard user";

      return { displayName: rawName, displayEmail: rawEmail, joinedText: joined, initials, rolesLabel };
    }, [userProfile]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER SECTION - Responsive Padding & Alignment */}
      <div className="pb-6 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-1">
            <div className="flex items-center gap-2.5 justify-start">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <UserCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight italic text-foreground leading-none">
                Profile <span className="gradient-text">Overview</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xl">
              Personalize your account details and manage security.
            </p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 rounded-lg border-border text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            ID: {userProfile?._id.slice(-8).toUpperCase() || "Guest"}
          </Badge>
        </div>
      </div>

      <div className="pt-2">
        <Card className="bg-background/30 border-border/40 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-none">
          <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8">
            
            {/* User Meta Row - Stack on Mobile, Row on Tablet */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-8">
              {/* Initials circle */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-xl md:text-2xl font-black bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 shadow-sm select-none shrink-0">
                {initials}
              </div>

              <div className="flex-1 space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
                    {displayName}
                  </h3>
                  {hasUser && (
                    <Badge variant="secondary" className="w-fit text-[9px] font-black uppercase px-2 py-0.5 h-auto tracking-tight shrink-0">
                      {rolesLabel}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 md:gap-y-3">
                  <p className="text-muted-foreground flex items-center gap-2 text-xs md:text-sm font-medium truncate">
                    <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary/40 shrink-0" />
                    {displayEmail}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2 text-xs md:text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary/40 shrink-0" />
                    Member since {joinedText}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-border/40 w-full" />

            {/* Actions - Thumb-friendly buttons on mobile */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 sm:h-9 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2.5 border-border/60 hover:bg-primary/5 transition-all active:scale-[0.98]"
                onClick={() => navigate("/profile")}
                disabled={!hasUser}
              >
                <User className="h-3.5 w-3.5" />
                Update Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 sm:h-9 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2.5 border-border/60 hover:bg-primary/5 transition-all active:scale-[0.98]"
                onClick={onChangePassword}
                disabled={!hasUser}
              >
                <Lock className="h-3.5 w-3.5" />
                Change Password
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 sm:h-9 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2.5 border-destructive/20 text-destructive hover:bg-destructive/5 transition-all active:scale-[0.98]"
                onClick={onLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>

            {!hasUser && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[10px] md:text-xs font-bold text-amber-600 flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  Profile synchronization pending. Please refresh page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileTab;