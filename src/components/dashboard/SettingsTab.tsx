import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, ShieldCheck, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { MembershipState, PlanMeta } from "@/types/dashboard";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ButtonSpinner } from "@/components/ui/loader";
import { AnimatePresence } from "framer-motion";

interface SettingsTabProps {
  membership: MembershipState;
  plansLoading: boolean;
  plansError: string | null;
  activePlanMeta?: PlanMeta;
  downloadsUsageText: string;
  downloadsPeriodText: string | null;
  membershipUpdating: boolean;
  onCancelMembership: () => void;
  onChangePlan: () => void;
  onViewBillingHistory: () => void;
}

const formatIndianDate = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const SettingsTab: FC<SettingsTabProps> = ({
  membership,
  activePlanMeta,
  downloadsUsageText,
  downloadsPeriodText,
  membershipUpdating,
  onCancelMembership,
  onChangePlan,
  onViewBillingHistory,
}) => {
  const { toast } = useToast();
  
  // Local UI States
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmChange, setConfirmChange] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Derived States
  const hasMembership = Boolean(membership && membership.status !== "NONE");
  const hasActivePlan = Boolean(membership?.status === "ACTIVE" && membership.planKey);
  const expiresOn = membership?.expiresAt ? formatIndianDate(membership.expiresAt) : null;

  // -- Handlers --

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await api.delete("/users/me");
      globalThis.localStorage.clear();
      setConfirmDelete(false);
      toast({ title: "Account deleted", description: "Your account has been permanently removed." });
      globalThis.location.href = "/";
    } catch (err: any) {
      toast({ title: "Delete failed", description: "Could not remove account.", variant: "destructive" });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleConfirmCancel = () => {
    onCancelMembership();
    setConfirmCancel(false);
  };

  const handleConfirmChange = () => {
    onChangePlan();
    setConfirmChange(false);
  };

  return (
    <div className="space-y-6 px-1 sm:px-0">
      
      {/* 1. HEADER */}
      <div className="pb-6 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight italic text-foreground leading-none">
                Access <span className="gradient-text">Control</span>
              </h2>
            </div>
            <p className="text-[11px] md:text-sm text-muted-foreground font-medium max-w-xl">
              Manage your studio membership, billing, and account privacy.
            </p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 rounded-lg border-border text-[9px] md:text-[10px] font-bold text-muted-foreground">
            {hasActivePlan ? "Premium Access" : "Standard User"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 pt-2">
        
        {/* 2. MEMBERSHIP CARD */}
        <Card className="bg-background/30 border-border/40 rounded-2xl overflow-hidden shadow-none">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">
                  Active Subscription
                </p>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {activePlanMeta?.name ?? "Free Studio Plan"}
                </h4>
                {hasMembership && expiresOn && (
                  <p className="text-[11px] text-muted-foreground font-medium italic">
                    Valid until {expiresOn}
                  </p>
                )}
              </div>
              <Badge variant={hasActivePlan ? "secondary" : "outline"} className="rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tighter">
                {hasActivePlan ? "Active" : "None"}
              </Badge>
            </div>

            {hasActivePlan && (
              <div className="space-y-5">
                {/* Stats */}
                <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/5 space-y-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-primary/60" /> Usage quota
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                    {downloadsUsageText}
                  </p>
                  {downloadsPeriodText && <p className="text-[10px] text-muted-foreground/50 italic">{downloadsPeriodText}</p>}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Included Studio Stems</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePlanMeta?.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="text-[10px] sm:text-[11px] font-medium text-foreground/80 truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-wrap gap-2">
              {hasActivePlan ? (
                <>
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-9 px-4 rounded-lg text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => setConfirmCancel(true)}>
                    Cancel Plan
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-9 px-4 rounded-lg text-[10px] font-bold border-border/60" onClick={() => setConfirmChange(true)}>
                    Upgrade / Change
                  </Button>
                </>
              ) : (
                <Button size="sm" className="w-full sm:w-auto h-9 px-6 rounded-lg text-[10px] font-bold" onClick={onChangePlan}>
                  Explore Memberships
                </Button>
              )}
              <Button size="sm" variant="ghost" className="w-full sm:w-auto h-9 px-4 rounded-lg text-[10px] font-bold text-muted-foreground" onClick={onViewBillingHistory}>
                Billing History
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. DANGER ZONE */}
        <div className="p-5 rounded-2xl border border-destructive/10 bg-destructive/[0.01] space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <h5 className="text-sm font-bold">Privacy Controls</h5>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed max-w-lg">
            Permanently delete your account and all associated track licenses. This action is irreversible.
          </p>
          <Button variant="outline" className="w-full sm:w-auto h-9 rounded-lg text-[10px] font-bold border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => setConfirmDelete(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* 4. DIALOGS */}
      <AnimatePresence>
        
        {/* DELETE ACCOUNT DIALOG */}
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-destructive">Delete Account?</DialogTitle>
              <DialogDescription className="text-xs pt-2">
                This will permanently remove your access and all purchased licenses. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="text-[11px] font-bold">Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount} className="text-[11px] font-bold">
                {deletingAccount ? <ButtonSpinner /> : "Confirm Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CANCEL MEMBERSHIP DIALOG */}
        <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Cancel Membership?</DialogTitle>
              <DialogDescription className="text-xs pt-2">
                Your benefits will continue until the end of the current billing cycle ({expiresOn}). After that, your access will revert to free tier.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setConfirmCancel(false)} className="text-[11px] font-bold">Keep Active</Button>
              <Button variant="destructive" onClick={handleConfirmCancel} disabled={membershipUpdating} className="text-[11px] font-bold">
                {membershipUpdating ? <ButtonSpinner /> : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CHANGE PLAN DIALOG */}
        <Dialog open={confirmChange} onOpenChange={setConfirmChange}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Change Plan</DialogTitle>
              <DialogDescription className="text-xs pt-2">
                You are about to browse other membership plans. If you switch, your new benefits will apply immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setConfirmChange(false)} className="text-[11px] font-bold">Cancel</Button>
              <Button onClick={handleConfirmChange} className="text-[11px] font-bold">
                Browse Plans
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </AnimatePresence>
    </div>
  );
};

export default SettingsTab;