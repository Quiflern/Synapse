
import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: "glow" | "scale" | "border" | "none";
}

export const HoverCard = ({
  className,
  children,
  hoverEffect = "glow",
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "glass-card transition-all duration-300",
        hoverEffect === "glow" && "hover:shadow-[0_0_30px_rgba(0,102,255,0.3)]",
        hoverEffect === "scale" && "hover:scale-[1.02]",
        hoverEffect === "border" && "hover:border-electric/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string; // Added className prop
  hoverEffect?: "glow" | "scale" | "border" | "none";
}

export const FeatureCard = ({ title, description, icon, className, hoverEffect = "scale" }: FeatureCardProps) => {
  return (
    <HoverCard className={cn("flex flex-col items-start gap-4 p-6 h-full", className)} hoverEffect={hoverEffect}>
      <div className="bg-electric/10 p-3 rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-white theme-light:text-gray-800">{title}</h3>
      <p className="text-sm text-gray-400 theme-light:text-gray-600">{description}</p>
    </HoverCard>
  );
};
