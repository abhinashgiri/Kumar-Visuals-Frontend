import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// 1. Premium Glass Card - Added subtle backdrop blur and hover effects
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[2rem] border border-border/50 bg-background/50 backdrop-blur-xl transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group",
        className
      )}
      {...props}
    >
      {/* Subtle Background Glow for premium feel */}
      <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/5 blur-[60px] pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative z-10" {...props} />
    </div>
  )
);
Card.displayName = "Card";

// 2. Card Header - Increased spacing and better typography alignment
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 p-6 md:p-8", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// 3. Card Title - Premium font-weight and tracking
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl md:text-3xl font-black tracking-tight uppercase italic bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent",
      className
    )}
    {...props}
  >
    {children}
    {!children && <span className="sr-only">Card Title</span>}
  </h3>
));
CardTitle.displayName = "CardTitle";

// 4. Card Description - Softer colors and better line-height
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm md:text-base text-muted-foreground/70 font-medium leading-relaxed max-w-[90%]",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// 5. Card Content - Flexible padding
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 md:p-8 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// 6. Card Footer - Professional spacing
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 md:p-8 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };