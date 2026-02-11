import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import ProfileTab from "@/components/dashboard/ProfileTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import LibraryTab from "@/components/dashboard/LibraryTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import OrderDetailsDialog from "@/components/dashboard/OrderDetailsDialog";
import ReviewDialog from "@/components/dashboard/ReviewDialog";

import { useDashboardData } from "@/hooks/useDashboardData";
import { User, ShoppingBag, Library, Settings } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { SeoHead } from "@/components/SeoHead";

/**
 * Types and Constants
 */
type DashboardTab = "profile" | "orders" | "library" | "settings";

const DASHBOARD_TABS = new Set<DashboardTab>([
  "profile",
  "orders",
  "library",
  "settings",
]);

/**
 * Dashboard Component
 * Central hub for user profile, orders, library, and account settings.
 */
const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");

  // Custom hook for managing dashboard business logic
  const {
    userProfile,
    membership,
    ordersLoading,
    ordersError,
    visibleOrders,
    libraryItems,
    downloadingId,
    reDownloadingOrderId,
    plansMetaByKey,
    plansLoading,
    plansError,
    activePlanMeta,
    downloadsUsageText,
    downloadsPeriodText,
    membershipUpdating,
    userRatings,
    orderDetailsOpen,
    selectedOrder,
    ratingDialogOpen,
    ratingTarget,
    ratingValue,
    ratingReview,
    ratingSubmitting,
    currentTargetRating,
    handleLogout,
    handleChangePassword,
    handleDownload,
    handleRedownloadOrder,
    handleCancelMembership,
    handleOrderDetailsOpenChange,
    handleSelectOrder,
    openRatingDialog,
    handleRatingDialogOpenChange,
    setRatingValue,
    setRatingReview,
    handleSubmitRating,
    handleDeleteRating,
  } = useDashboardData();

  /**
   * Sync active tab state with URL query parameters
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab") as DashboardTab | null;

    if (tabParam && DASHBOARD_TABS.has(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-500">
      <Navigation />
      <SeoHead pageTitle="Dashboard" />


      <main className="container mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          
          {/* DASHBOARD HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8 text-center md:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
                My <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-[11px] md:text-sm font-medium text-muted-foreground opacity-80">
                Manage your studio assets, licenses, and premium access.
              </p>
            </div>
            
            <div className="flex justify-center md:block">
               <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-background/50 border-border text-[9px] md:text-[10px] uppercase tracking-widest font-black">
                 <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                 System Active
               </Badge>
            </div>
          </motion.div>

          {/* TABBED NAVIGATION & CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                const tab = v as DashboardTab;
                if (DASHBOARD_TABS.has(tab)) {
                  setActiveTab(tab);
                  navigate(`/dashboard?tab=${tab}`, { replace: true });
                }
              }}
              className="space-y-6 md:space-y-10"
            >
              {/* TAB LIST: Optimized for mobile horizontal scrolling */}
              <div className="relative">
                <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                  <TabsList
                    className="
                      inline-flex items-center justify-start md:justify-center
                      rounded-full bg-muted/30 backdrop-blur-md
                      p-1 h-12 border border-border/50 shadow-sm
                      min-w-max md:min-w-0
                    "
                  >
                    {[
                      { id: "profile", label: "Profile", icon: User },
                      { id: "orders", label: "Orders", icon: ShoppingBag },
                      { id: "library", label: "Vault", icon: Library },
                      { id: "settings", label: "Settings", icon: Settings },
                    ].map((tab) => (
                      <TabsTrigger 
                        key={tab.id}
                        value={tab.id} 
                        className="rounded-full px-4 md:px-8 h-10 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md text-[10px] md:text-xs font-bold transition-all whitespace-nowrap"
                      >
                        <tab.icon className="h-3.5 w-3.5 shrink-0" /> 
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {/* TAB CONTENT SECTIONS */}
              <div className="min-h-[450px] md:min-h-[500px]">
                <TabsContent value="profile" className="mt-0 outline-none">
                  <ProfileTab
                    userProfile={userProfile}
                    onLogout={handleLogout}
                    onChangePassword={handleChangePassword}
                  />
                </TabsContent>

                <TabsContent value="orders" className="mt-0 outline-none">
                  <OrdersTab
                    ordersLoading={ordersLoading}
                    ordersError={ordersError}
                    visibleOrders={visibleOrders}
                    reDownloadingOrderId={reDownloadingOrderId}
                    plansMetaByKey={plansMetaByKey}
                    onReDownloadOrder={handleRedownloadOrder}
                    onOpenOrderDetails={handleSelectOrder}
                  />
                </TabsContent>

                <TabsContent value="library" className="mt-0 outline-none">
                  <LibraryTab
                    ordersLoading={ordersLoading}
                    libraryItems={libraryItems}
                    downloadingId={downloadingId}
                    userRatings={userRatings}
                    onDownload={handleDownload}
                    onOpenRating={openRatingDialog}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-0 outline-none">
                  <SettingsTab
                    membership={membership}
                    plansLoading={plansLoading}
                    plansError={plansError}
                    activePlanMeta={activePlanMeta}
                    downloadsUsageText={downloadsUsageText}
                    downloadsPeriodText={downloadsPeriodText}
                    membershipUpdating={membershipUpdating}
                    onCancelMembership={handleCancelMembership}
                    onChangePlan={() => navigate("/membership?from=dashboard")}
                    onViewBillingHistory={() => setActiveTab("orders")}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>

        {/* INTERACTIVE MODALS */}
        <OrderDetailsDialog
          open={orderDetailsOpen}
          onOpenChange={handleOrderDetailsOpenChange}
          order={selectedOrder}
          plansMetaByKey={plansMetaByKey}
        />

        <ReviewDialog
          open={ratingDialogOpen}
          onOpenChange={handleRatingDialogOpenChange}
          targetTitle={ratingTarget?.title ?? null}
          currentTargetRating={currentTargetRating}
          ratingValue={ratingValue}
          ratingReview={ratingReview}
          ratingSubmitting={ratingSubmitting}
          onChangeRatingValue={setRatingValue}
          onChangeRatingReview={setRatingReview}
          onSubmit={handleSubmitRating}
          onDelete={handleDeleteRating}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;