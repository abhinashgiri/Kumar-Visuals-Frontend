import { FC } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type LoaderProps = {
  label?: string;
  className?: string;
};

/**
 * CORE COMPONENT: The Quantum Ring
 * A high-end triple-layer SVG spinner
 */
const QuantumRing = ({ size = "h-5 w-5", stroke = 2.5 }) => (
  <div className={cn("relative", size)}>
    <motion.svg
      viewBox="0 0 50 50"
      className="h-full w-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth={stroke}
        className="stroke-primary/10"
      />
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth={stroke}
        className="stroke-primary"
        strokeLinecap="round"
        initial={{ strokeDasharray: "1, 150", strokeDashoffset: 0 }}
        animate={{
          strokeDasharray: ["1, 150", "90, 150", "90, 150"],
          strokeDashoffset: [0, -35, -124],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
    <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1/3 w-1/3 rounded-full bg-primary blur-[2px]" 
        />
    </div>
  </div>
);

export const Spinner: FC<LoaderProps> = ({ label, className }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <QuantumRing size="h-4 w-4" stroke={3} />
    {label && (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 animate-pulse">
        {label}
      </span>
    )}
  </div>
);

/**
 * Full page loader – Frosted Vault Style
 */
export const PageLoader: FC<LoaderProps> = ({ label = "Synchronizing Vault" }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-xl"
  >
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-20 w-20">
        {/* Triple layered orbital rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
                rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ padding: `${i * 8}px` }}
          >
            <div className="h-full w-full rounded-full border-t-2 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          </motion.div>
        ))}
      </div>
      
      <div className="space-y-2 text-center">
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-black uppercase tracking-[0.3em] text-foreground italic"
        >
          {label}
        </motion.p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          Decrypting Creative Assets...
        </p>
      </div>
    </div>
  </motion.div>
);

/**
 * Section loader – Best for cards/tabs
 */
export const SectionLoader: FC<LoaderProps> = ({
  label = "Retrieving Data",
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-4 py-20 text-center",
      className
    )}
  >
    <div className="relative">
        <QuantumRing size="h-10 w-10" stroke={2} />
        <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary rounded-full blur-xl"
        />
    </div>
    <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
            {label}
        </p>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto" />
    </div>
  </div>
);

/**
 * Tiny spinner for inside buttons
 */
export const ButtonSpinner: FC<{ className?: string }> = ({ className }) => (
  <motion.span
    className={cn(
      "inline-block h-3.5 w-3.5 rounded-full border-2 border-current/20 border-t-current",
      className
    )}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
  />
);