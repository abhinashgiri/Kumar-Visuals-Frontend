import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ChevronRight, 
  ShoppingBag, 
  Crown, 
  Music, 
  History 
} from "lucide-react";
import { OrderApi, PlanMeta } from "@/types/dashboard";
import { SectionLoader } from "@/components/ui/loader.tsx";
import { motion, AnimatePresence } from "framer-motion";

interface OrdersTabProps {
  ordersLoading: boolean;
  ordersError: string | null;
  visibleOrders: OrderApi[];
  reDownloadingOrderId: string | null;
  plansMetaByKey: Record<string, PlanMeta>;
  onReDownloadOrder: (order: OrderApi) => void;
  onOpenOrderDetails: (order: OrderApi) => void;
}

const formatDate = (value: string | Date) => 
  new Date(value).toLocaleDateString(undefined, { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });

export const OrdersTab: FC<OrdersTabProps> = ({ 
  ordersLoading, 
  ordersError, 
  visibleOrders, 
  reDownloadingOrderId, 
  plansMetaByKey, 
  onReDownloadOrder, 
  onOpenOrderDetails 
}) => {
  const hasOrders = visibleOrders.length > 0;

  return (
    <div className="space-y-6">
      {/* COMPACT HEADER SECTION */}
      <div className="pb-6 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <History className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight italic text-foreground leading-none">
                Transactions
              </h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xl opacity-80">
              Billing history and track acquisitions.
            </p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 rounded-lg border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            {visibleOrders.length} Records
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {ordersLoading && (
          <div className="py-20 flex justify-center">
            <SectionLoader label="Loading history..." />
          </div>
        )}
        
        {!ordersLoading && !hasOrders && (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-[2rem] bg-muted/5">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-muted-foreground">No records found in your account</h3>
          </div>
        )}

        <div className="grid gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {!ordersLoading && hasOrders && visibleOrders.map((order, index) => {
              const isPaid = order.status === "PAID";
              const isMembership = Boolean(order.membershipPlanKey);
              const isReDownloading = reDownloadingOrderId === order._id;
              
              return (
                <motion.div 
                  key={order._id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={`group bg-background/30 hover:bg-background border-border/40 hover:border-primary/20 transition-all duration-300 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-none hover:shadow-lg ${isPaid ? 'border-l-4 border-l-emerald-500/40' : 'border-l-4 border-l-amber-500/40'}`}>
                    <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left Side: Icon & Order Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-colors ${isMembership ? 'bg-amber-500/5 border-amber-500/10 text-amber-600' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                          {isMembership ? <Crown className="h-5 w-5 md:h-6 md:w-6" /> : <Music className="h-5 w-5 md:h-6 md:w-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/50 tracking-widest mb-1 uppercase">
                            {formatDate(order.createdAt)} • {isMembership ? 'Membership' : 'Order'}
                          </p>
                          <h4 className="text-sm md:text-base font-bold truncate text-foreground leading-tight group-hover:text-primary transition-colors">
                            {order.items?.[0]?.titleSnapshot || plansMetaByKey[order.membershipPlanKey!]?.name || "Order #" + order._id.slice(-6)}
                          </h4>
                        </div>
                      </div>

                      {/* Right Side: Price & Actions - Always row-based for better UX */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                         <div className="text-left sm:text-right">
                            <p className="text-[9px] font-bold text-muted-foreground/40 leading-none mb-1 uppercase tracking-tighter">Total Amount</p>
                            <p className="text-sm md:text-base font-black tracking-tight text-foreground whitespace-nowrap">
                              {order.currency} {order.total.toFixed(2)}
                            </p>
                         </div>
                         
                         <div className="flex items-center gap-2">
                           {isPaid && !isMembership && (
                             <Button 
                               size="icon" 
                               variant="secondary" 
                               className="h-9 w-9 rounded-xl shadow-none border border-transparent hover:border-border hover:bg-background transition-all" 
                               onClick={() => onReDownloadOrder(order)} 
                               disabled={isReDownloading}
                               title="Download Assets"
                             >
                               {isReDownloading ? <SectionLoader className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                             </Button>
                           )}
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest gap-2 border-border/60 hover:bg-primary/5 transition-all active:scale-95" 
                             onClick={() => onOpenOrderDetails(order)}
                           >
                             View <ChevronRight className="h-3.5 w-3.5" />
                           </Button>
                         </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;