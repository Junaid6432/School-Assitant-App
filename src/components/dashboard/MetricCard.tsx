"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: "primary" | "secondary" | "success" | "danger" | "warning";
}

const colorMap = {
  primary: "text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_var(--color-primary)]",
  secondary: "text-secondary bg-secondary/10 border-secondary/20 shadow-[0_0_15px_var(--color-secondary)]",
  success: "text-success bg-success/10 border-success/20 shadow-[0_0_15px_var(--color-success)]",
  danger: "text-danger bg-danger/10 border-danger/20 shadow-[0_0_15px_var(--color-danger)]",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
};

export function MetricCard({ title, value, icon: Icon, trend, color = "primary" }: MetricCardProps) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setProgress(Math.floor(Math.random() * 40) + 40);
  }, []);

  return (
    <div className="glass-card p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-4 -top-4 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-30",
        color === "primary" ? "bg-primary" : 
        color === "success" ? "bg-success" : 
        color === "danger" ? "bg-danger" : 
        color === "warning" ? "bg-amber-500" :
        "bg-secondary"
      )} />

      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          </div>
          {trend && (
            <div className={cn(
              "text-[10px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit mt-1",
              trend.isUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {trend.isUp ? "↑" : "↓"} {trend.value}% vs last month
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl border transition-all duration-300 group-hover:scale-110", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {/* Progress Indicator Visualization */}
      <div className="mt-auto relative z-10 w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            color === "primary" ? "bg-primary" : 
            color === "success" ? "bg-success" : 
            color === "danger" ? "bg-danger" : 
            color === "warning" ? "bg-amber-500" :
            "bg-secondary"
          )}
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}
