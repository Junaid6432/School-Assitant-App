"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b border-white/5 pb-8", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{title}</h1>
        {description && (
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1 italic">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col items-end gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
