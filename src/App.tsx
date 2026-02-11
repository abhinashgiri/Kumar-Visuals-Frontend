import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "@/components/ScrollToTop";

import PaymentSuccess from "@/pages/PaymentSuccess";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Membership from "./pages/Membership";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Refund from "./pages/Refund";
import ResetPassword from "./pages/ResetPassword";

import AuthRedirect from "./routes/AuthRedirect";

import { SectionLoader } from "@/components/ui/loader";
import { useSiteSettings } from "@/store/useSiteSettings";
import Maintenance from "@/pages/Maintenance";

import { SeoHead } from "@/components/SeoHead";

// ---------------- Protected Routes ----------------
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const logged = localStorage.getItem("isLoggedIn") === "true";
  return logged ? children : <Navigate to="/auth" replace />;
};

// ---------------- Payment Success Protection (UPDATED) ----------------
const PAYMENT_FLAG_KEY = "lastPaymentSuccess";

const PaymentProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation(); // Access navigation state
  const raw = sessionStorage.getItem(PAYMENT_FLAG_KEY);
  
  // 1. Check if user came from payment flow (via navigate state)
  if (location.state?.fromPayment) {
    // Set flag for refresh persistence if not present
    if (!raw) {
        const tokenData = JSON.stringify({ ts: Date.now() });
        sessionStorage.setItem(PAYMENT_FLAG_KEY, tokenData);
    }
    return children;
  }

  // 2. Fallback: Check Session Storage (for page refreshes)
  if (!raw) {
    console.warn("[Guard] No payment flag found. Redirecting to shop.");
    return <Navigate to="/shop" replace />;
  }

  try {
    const data = JSON.parse(raw);
    const now = Date.now();
    const age = now - data.ts;

    // 10 minutes expiry
    const isValid = age >= -5000 && age <= 10 * 60 * 1000;

    if (isValid) {
      return children;
    } else {
      console.warn("[Guard] Payment flag expired or invalid timestamp.");
    }
  } catch (err) {
    console.error("[Guard] Failed to parse payment flag:", err);
  }

  // Cleanup & Redirect
  sessionStorage.removeItem(PAYMENT_FLAG_KEY);
  return <Navigate to="/shop" replace />;
};

// ---------------- React Query (Optimized Config) ----------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 30 * 60 * 1000, 
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ---------------- AppInner: depends on site settings ----------------
const AppInner = () => {
  const fetchSettings = useSiteSettings((s) => s.fetchSettings);
  const isLoaded = useSiteSettings((s) => s.isLoaded);
  const isLoading = useSiteSettings((s) => s.isLoading);
  const error = useSiteSettings((s) => s.error);
  const settings = useSiteSettings((s) => s.settings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Favicon logic
  useEffect(() => {
    if (!settings?.faviconUrl) return;

    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    for (const el of Array.from(existingIcons)) {
      el.remove();
    }

    const ext = settings.faviconUrl.split(".").pop()?.toLowerCase();
    let type = "image/png";
    if (ext === "ico") {
      type = "image/x-icon";
    } else if (ext === "svg") {
      type = "image/svg+xml";
    }

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = type;
    link.href = `${settings.faviconUrl}?v=${Date.now()}`;

    document.head.appendChild(link);
  }, [settings?.faviconUrl]);

  // Loader
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SectionLoader label="Loading Kumar Music..." />
      </div>
    );
  }

  if (error) {
    console.error("Site settings error:", error);
  }

  // Maintenance mode
  if (settings?.maintenanceMode) {
    return <Maintenance />;
  }

  // Normal app routing
  return (
    <>
      <SeoHead />

      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Payment success (Guard updated to accept location state) */}
          <Route
            path="/payment/success"
            element={
              <PaymentProtectedRoute>
                <PaymentSuccess />
              </PaymentProtectedRoute>
            }
          />

          {/* Block /auth if already logged in */}
          <Route
            path="/auth"
            element={
              <AuthRedirect>
                <Auth />
              </AuthRedirect>
            }
          />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

// ---------------- Root App ----------------
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppInner />
        </TooltipProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;