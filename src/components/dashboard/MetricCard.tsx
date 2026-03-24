"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  primary: "text-primary bg-primary/10 border-[#2dd4bf]/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]",
  secondary: "text-[#fb7185] bg-[#fb7185]/10 border-[#fb7185]/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]",
  success: "text-primary bg-primary/10 border-[#2dd4bf]/20",
  danger: "text-[#fb7185] bg-[#fb7185]/10 border-[#fb7185]/20",
  warning: "text-[#fde047] bg-[#fde047]/10 border-[#fde047]/20",
};

export function MetricCard({ title, value, icon: Icon, trend, color = "primary" }: MetricCardProps) {
  return (
    <div className="glass-card p-6 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20",
        color === "primary" ? "bg-[#2dd4bf]" : 
        color === "danger" ? "bg-[#fb7185]" : 
        "bg-[#fde047]"
      )} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              "text-3xl font-black",
              color === "danger" ? "neon-coral" : "neon-teal"
            )}>{value}</h3>
          </div>
          {trend && (
            <div className={cn(
              "text-[10px] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit",
              trend.isUp ? "bg-[#2dd4bf]/10 text-[#2dd4bf]" : "bg-[#fb7185]/10 text-[#fb7185]"
            )}>
              {trend.isUp ? "↑" : "↓"} {trend.value}% vs last month
            </div>
          )}
        </div>
        <div className={cn("p-3.5 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
