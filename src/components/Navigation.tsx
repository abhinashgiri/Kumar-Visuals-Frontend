import { useState, useEffect, FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  Search,
  Music2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import SearchModal from "./SearchModal";
import { useSiteSettings } from "@/store/useSiteSettings";

const Navigation: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCartCount } = useCart();
  const { toggleTheme } = useTheme();
  const cartItemCount = getCartCount();
  const queryClient = useQueryClient(); 
  const settings = useSiteSettings((s) => s.settings);
  const logoUrl = settings?.logoUrl;
  const brandName = settings?.brandName?.trim() || "KUMAR";

  const BrandHeading = (
    <h1 className="text-xl md:text-2xl font-black tracking-tighter italic gradient-text">
      {brandName}
    </h1>
  );

  // --- Auth Check Logic ---
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    checkAuth();
    
    // Cross-tab sync support
    globalThis.addEventListener("storage", checkAuth);
    return () => globalThis.removeEventListener("storage", checkAuth);
  }, [location]); 

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(globalThis.scrollY > 20);
    };
    globalThis.addEventListener("scroll", handleScroll);
    return () => globalThis.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Close Mobile Menu on Route Change ---
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Membership", path: "/membership" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    // 1. Clear React Query Cache (Most Important for Data Privacy)
    queryClient.clear(); 

    // 2. Clear Local Storage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user"); 

    // 3. Update State & UI
    setIsLoggedIn(false);
    toast({ title: "Logged out", description: "See you again soon!" });
    navigate("/");
  };

  return (
    <>
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm" 
            : "py-5 bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* --- LOGO --- */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Music2 className="h-4 w-4 text-primary" />
                  </div>
                  {BrandHeading}
                </div>
              )}
            </Link>

            {/* --- DESKTOP NAV LINKS --- */}
            <div className="hidden md:flex items-center bg-muted/20 backdrop-blur-md border border-border/40 px-1.5 py-1 rounded-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl relative ${
                    isActive(link.path)
                      ? "text-primary bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* --- RIGHT ACTIONS --- */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-primary/5 transition-colors hidden sm:flex"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={toggleTheme}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
              </Button>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-primary/5 transition-colors">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-1 flex items-center justify-center text-[8px] font-black bg-primary text-white border-2 border-background">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* AUTH DROPDOWN */}
              <div className="hidden md:block ml-1">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-9 gap-2 rounded-xl border-border/60 px-3 hover:bg-primary/5 transition-all">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-border/40 backdrop-blur-xl">
                      <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Manage Profile</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link to="/dashboard" className="flex items-center w-full">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-primary/60" /> 
                          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link to="/profile" className="flex items-center w-full">
                          <User className="mr-3 h-4 w-4 text-primary/60" /> 
                          <span className="text-xs font-bold uppercase tracking-widest">My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive">
                        <LogOut className="mr-3 h-4 w-4" /> 
                        <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button size="sm" className="h-9 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 italic">
                      Login
                    </Button>
                  </Link>
                )}
              </div>

              {/* MOBILE MENU TOGGLE */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-xl"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* --- MOBILE OVERLAY --- */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileMenuOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="p-4 rounded-3xl bg-background border border-border/60 shadow-2xl space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start h-11 rounded-2xl border-border/40 bg-muted/10 text-[11px] font-black uppercase tracking-widest"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="mr-3 h-4 w-4 text-primary" /> Search Items
              </Button>

              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center h-12 px-4 rounded-xl text-xs font-bold transition-all ${
                      isActive(link.path) 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-border/40">
                {isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/dashboard" className="w-full">
                      <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase">Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="w-full h-11 rounded-xl text-[10px] font-black uppercase text-destructive">Logout</Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] italic">Sign In / Register</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;