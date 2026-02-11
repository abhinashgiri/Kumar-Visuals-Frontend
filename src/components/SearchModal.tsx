import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionLoader } from "@/components/ui/loader";
import api from "@/services/api";

import album1 from "@/assets/album1.jpg";
import album2 from "@/assets/album2.jpg";
import album3 from "@/assets/album3.jpg";
import album4 from "@/assets/album4.jpg";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchProductApi = {
  _id: string;
  title: string;
  artistId?: string;
  price: number;
  thumbnail?: { url?: string };
  category?: string;
};

const fallbackCovers = [album1, album2, album3, album4];

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchProductApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  const trendingSearches = ["Remixes", "DJ Mix", "Electronic", "Latest Releases"];

  // Debounced backend search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<{
          products: SearchProductApi[];
          total?: number;
        }>("/products/search", {
          params: { q: searchQuery.trim(), limit: 10 },
          signal: controller.signal,
        });

        setResults(res.data?.products || []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Search error:", err);
        setResults([]);
        setError(
          err?.response?.data?.message ||
            "Could not search right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  const saveRecentTerm = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  };

  const handleProductClick = (id: string, title: string) => {
    saveRecentTerm(title);
    onOpenChange(false);
    navigate(`/product/${id}`);
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    saveRecentTerm(term);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
      setError(null);
    }
  }, [open]);

  const getCover = (p: SearchProductApi) => {
    if (p.thumbnail?.url) return p.thumbnail.url;
    const index = Math.abs(p._id?.codePointAt(0) ?? 0) % fallbackCovers.length;
    return fallbackCovers[index];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-[min(100vw-2rem,720px)]
          w-full
          p-0
          gap-0
          rounded-2xl
          sm:rounded-3xl
        "
      >
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for tracks, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                pl-10
                h-11 sm:h-12
                text-sm sm:text-base
                bg-background/60
                border-border/50
              "
              autoFocus
            />
            <kbd
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                pointer-events-none
                hidden sm:inline-flex
                h-6 select-none items-center gap-1
                rounded border bg-muted px-2
                font-mono text-[10px] font-medium
                text-muted-foreground
              "
            >
              <span>ESC</span>
            </kbd>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-4 sm:px-6 pb-4 sm:pb-6">
          {searchQuery ? (
            <div className="space-y-2">
              {loading && <SectionLoader label="Searching tracks..." />}

              {!loading && error && (
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              )}

              {!loading && !error && results.length > 0 && (
                <>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                    {results.length} result
                    {results.length > 1 ? "s" : ""} found
                  </p>
                  {results.map((product) => (
                    <button
                      key={product._id}
                      onClick={() =>
                        handleProductClick(product._id, product.title)
                      }
                      className="
                        w-full
                        flex items-center gap-3 sm:gap-4
                        p-2.5 sm:p-3
                        rounded-lg
                        hover:bg-muted/50
                        transition-colors
                        text-left
                        group
                      "
                    >
                      <img
                        src={getCover(product)}
                        alt={product.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                          {product.title}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          {product.artistId || "Kumar"}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-semibold text-primary text-sm sm:text-base">
                          ₹{product.price}
                        </p>
                        {product.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] sm:text-xs"
                          >
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-xs sm:text-sm font-semibold">
                    Trending Searches
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrendingClick(term)}
                      className="
                        px-3 py-1.5
                        rounded-full
                        bg-primary/10 text-primary
                        text-xs sm:text-sm
                        hover:bg-primary/20
                        transition-colors
                      "
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-semibold">
                      Recent Searches
                    </p>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="
                          w-full text-left
                          px-3 py-2
                          rounded-lg
                          hover:bg-muted/50
                          transition-colors
                          text-xs sm:text-sm
                        "
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div
          className="
            border-t border-border/50
            px-4 sm:px-6 py-3
            flex flex-wrap items-center justify-between
            gap-2
            text-[10px] sm:text-xs text-muted-foreground
          "
        >
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                Enter
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                ESC
              </kbd>
              <span>Close</span>
            </div>
          </div>
          <span className="hidden sm:inline">
            Press Ctrl+K to search anytime
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
