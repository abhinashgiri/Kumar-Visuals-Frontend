import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";

type Bubble = {
  id: string;
  size: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
};

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Generate bubbles once per mount (no random IDs every render)
  const bubbles: Bubble[] = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const size = Math.random() * 200 + 100;
      return {
        id: `bubble-${i}`,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 10 + 10}s`,
      };
    });
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated Background */}
      <SeoHead pageTitle="Page Not Found" />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background" />

        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-primary/10 blur-3xl animate-float"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              top: bubble.top,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="text-center space-y-6 md:space-y-8 px-4 max-w-2xl animate-fade-in">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold gradient-text leading-none">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold">
            Page Not Found
          </h2>
          <p className="text-base md:text-xl text-muted-foreground">
            Looks like this track doesn&apos;t exist in our catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="btn-premium group w-full sm:w-auto"
            >
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Back to Home
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => globalThis.history.back()}
            className="group w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
