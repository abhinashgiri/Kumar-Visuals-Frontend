import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

interface VisitorCounterProps {
  pageId: string;
}

const VisitorCounter = ({ pageId }: VisitorCounterProps) => {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    let counts: Record<string, number> = {};

    try {
      const stored = localStorage.getItem("pageViewCounts");
      counts = stored ? JSON.parse(stored) : {};
    } catch {
      counts = {};
    }

    const newValue = (counts[pageId] ?? 0) + 1;
    counts[pageId] = newValue;

    localStorage.setItem("pageViewCounts", JSON.stringify(counts));
    setViewCount(newValue);
  }, [pageId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed bottom-6 right-6 glass-card px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50"
    >
      <Eye className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">
        {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
      </span>
    </motion.div>
  );
};

export default VisitorCounter;
