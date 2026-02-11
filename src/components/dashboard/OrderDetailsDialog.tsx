import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Package, Hash, Calendar, ShieldCheck, Crown } from "lucide-react";
import { motion } from "framer-motion";

import { OrderApi, PlanMeta } from "@/types/dashboard";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderApi | null;
  plansMetaByKey: Record<string, PlanMeta>;
}

const OrderDetailsDialog: FC<OrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  order,
  plansMetaByKey,
}) => {
  if (!order) return null;

  const isMembership = Boolean(order.membershipPlanKey);
  const meta = isMembership && order.membershipPlanKey ? plansMetaByKey[order.membershipPlanKey] : undefined;
  
  // Exactly as requested: Prefix # and full ID in Uppercase
  const fullOrderID = `#${order._id.toUpperCase()}`; 
  const isPaid = order.status === "PAID";

  const dt = new Date(order.createdAt);
  const formattedDate = dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-none bg-background/80 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
        <div className={`h-1.5 w-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        
        <div className="p-6 md:p-8 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none ${isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {order.status}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[11px] font-bold uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 w-fit">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-black tracking-widest text-primary uppercase break-all">
                    {fullOrderID}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">
                  Receipt Details
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* Billing Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Investment</p>
              <p className="text-lg font-black tracking-tighter">
                {order.currency} {order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1 border-l border-border/50 pl-4">
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Source</p>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                <CreditCard className="h-3.5 w-3.5 text-primary/60" />
                {order.paymentProvider || "Stripe"}
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <Package className="h-3.5 w-3.5" />
              Manifest breakdown
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {isMembership && meta ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="font-black text-sm uppercase italic tracking-tight">{meta.name}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {meta.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                order.items.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.product} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border/60 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate uppercase tracking-tight pr-4">
                        {item.titleSnapshot}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                        License: Personal/Commercial
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black font-mono">
                        {item.currencySnapshot} {item.priceSnapshot.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-4">
             <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 uppercase">
                <ShieldCheck className="h-3 w-3" />
                Verified Digital Asset
             </div>
             <Button
                variant="outline"
                className="rounded-xl h-11 px-8 font-black text-[11px] uppercase tracking-widest border-border/60 hover:bg-muted"
                onClick={() => onOpenChange(false)}
             >
                Exit
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;