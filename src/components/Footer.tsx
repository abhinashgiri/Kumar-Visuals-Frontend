import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteSettings } from "@/store/useSiteSettings";

const Footer = () => {
  const settings = useSiteSettings((s) => s.settings);
  const currentYear = new Date().getFullYear();

  const brandName = settings?.brandName || "KUMAR VISUALS";
  const logoUrl = settings?.logoUrl || null;

  const footerDescription =
    settings?.footerDescription ||
    "Premium music production and DJ remixes. Experience the sound that moves you.";

  const footerCopyright =
    settings?.footerCopyright ||
    `© ${currentYear} ${brandName}. Crafted for music enthusiasts.`;

  const phone = settings?.phonePrimary?.trim() || "+91 6002991150";
  const email = settings?.contactEmail?.trim() || "visualskumarco@gmail.com";
  const addressLine = settings?.addressLine1 || "Mumbai, India";

  const social = settings?.socialLinks || {};

  const socialLinks = [
    { key: "facebook", icon: Facebook, label: "Facebook", url: social.facebook },
    { key: "instagram", icon: Instagram, label: "Instagram", url: social.instagram },
    { key: "twitter", icon: Twitter, label: "Twitter", url: social.twitter },
    { key: "youtube", icon: Youtube, label: "YouTube", url: social.youtube },
  ].filter((item) => !!item.url);

  const fallbackSocialLinks = [
    { key: "facebook", icon: Facebook, label: "Facebook" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "twitter", icon: Twitter, label: "Twitter" },
    { key: "youtube", icon: Youtube, label: "YouTube" },
  ];

  return (
    <footer className="relative border-t border-border/40 bg-background/50 backdrop-blur-md overflow-hidden">
      {/* Subtle Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          
          {/* Brand Identity */}
          <div className="space-y-6 text-center md:text-left">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-10 object-contain mx-auto md:mx-0" />
            ) : (
              <h3 className="text-3xl font-black italic tracking-tighter gradient-text">
                {brandName}
              </h3>
            )}
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xs mx-auto md:mx-0">
              {footerDescription}
            </p>
            <div className="flex justify-center md:justify-start gap-2">
              {(socialLinks.length === 0 ? fallbackSocialLinks : socialLinks).map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  asChild={!!(item as any).url}
                >
                  {(item as any).url ? (
                    <a href={(item as any).url} target="_blank" rel="noreferrer">
                      <item.icon className="h-4 w-4" />
                    </a>
                  ) : (
                    <item.icon className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Discovery Links */}
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Discover</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: "Shop Music", to: "/shop" },
                { label: "About Artist", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "Cart", to: "/cart" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Policies</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Refund Policy", to: "/refund" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Newsletter</h4>
            <p className="text-xs text-muted-foreground font-medium">Join our community for new releases.</p>
            <div className="relative max-w-xs mx-auto md:mx-0 group">
              <Input
                type="email"
                placeholder="Email address"
                className="h-11 bg-muted/20 border-border/50 rounded-xl px-4 text-xs focus:ring-1 focus:ring-primary/30 transition-all pr-12"
              />
              <Button 
                size="icon" 
                className="absolute right-1 top-1 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Strip - Stacked on Mobile */}
        <div className="py-8 border-y border-border/40 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <Phone className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-tight text-muted-foreground">{phone}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <Mail className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-tight text-muted-foreground">{email}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-tight text-muted-foreground">{addressLine}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-center text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground/40 px-4">
          <p>{footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;