import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { animationMode?: 'scan' | 'pulse' | 'wave' | 'none' }
>(({ className, animationMode = 'scan', ...props }, ref) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth tilt (max 6 degrees for subtle effect)
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    // Use requestAnimationFrame for 60fps performance
    requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
        cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
        cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
      }
    });
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (!cardRef.current) return;
    requestAnimationFrame(() => {
      if (cardRef.current) {
        // Reset tilt smoothly
        cardRef.current.style.setProperty('--rotate-x', '0deg');
        cardRef.current.style.setProperty('--rotate-y', '0deg');
        // Instead of instantly teleporting the mouse coordinate which breaks any local glow effects,
        // we rely on CSS opacity transitions to hide the glow smoothly.
        // We do NOT change --mouse-x and --mouse-y to -1000px anymore to avoid instant jumps.
      }
    });
  }, []);

  return (
    <div className={cn("sci-fi-card-container w-full", className)} style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "sci-fi-card rounded-xl text-card-foreground shadow-sm relative group transition-transform duration-300 ease-out will-change-transform bg-transparent border-none",
          animationMode !== 'none' && `anim-${animationMode}`,
          className
        )}
        style={{
          transform: 'rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
          transformStyle: 'preserve-3d'
        }}
        {...props}
      >
        {/* Render children inside a relative container to stay above glowing effects and lift in 3D space */}
        <div className="relative z-10 w-full h-full transform-gpu" style={{ transform: 'translateZ(15px)' }}>
          {props.children}
        </div>
      </div>
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 rounded-t-xl mb-6 bg-transparent", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 bg-transparent", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
