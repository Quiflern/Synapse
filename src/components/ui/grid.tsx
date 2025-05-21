
import React from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

/**
 * Grid - A responsive grid component
 * 
 * @param children - The grid items
 * @param columns - Configuration for responsive columns
 * @param className - Additional CSS classes
 */
export const Grid = ({
  children,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  className,
}: GridProps) => {
  const getGridCols = () => {
    return `grid-cols-1 ${
      columns.sm ? `sm:grid-cols-${columns.sm}` : ""
    } ${columns.md ? `md:grid-cols-${columns.md}` : ""} ${
      columns.lg ? `lg:grid-cols-${columns.lg}` : ""
    } ${columns.xl ? `xl:grid-cols-${columns.xl}` : ""}`;
  };

  return (
    <div className={cn(`grid gap-4 ${getGridCols()}`, className)}>
      {children}
    </div>
  );
};

export default Grid;
