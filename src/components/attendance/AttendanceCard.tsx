"use client";

import { MessageSquare, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    parentName?: string;
    parentWhatsApp?: string;
  };
  status: string; // "Present" | "Absent" | "Leave" | ""
  onToggle: (studentId: string, status: string) => void;
  onWhatsApp: (student: any) => void;
}

const STATUS_OPTIONS = [
  {
    value: "Present",
    label: "Present",
    icon: CheckCircle2,
    activeClass: "bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]",
    inactiveClass: "bg-white/5 text-slate-500 border-white/5",
  },
  {
    value: "Absent",
    label: "Absent",
    icon: AlertCircle,
    activeClass: "bg-[#fb7185]/20 text-[#fb7185] border-[#fb7185]/30 shadow-[0_0_15px_rgba(251,113,133,0.2)]",
    inactiveClass: "bg-white/5 text-slate-500 border-white/5",
  },
  {
    value: "Leave",
    label: "Leave",
    icon: Clock,
    activeClass: "bg-[#fde047]/20 text-[#fde047] border-[#fde047]/30 shadow-[0_0_15px_rgba(253,224,71,0.2)]",
    inactiveClass: "bg-white/5 text-slate-500 border-white/5",
  },
] as const;

export function AttendanceCard({ student, status, onToggle, onWhatsApp }: AttendanceCardProps) {
  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusColors: Record<string, string> = {
    Present: "#2dd4bf",
    Absent:  "#fb7185",
    Leave:   "#fde047",
    "":      "rgba(255,255,255,0.05)",
  };

  return (
    <div
      className="rounded-3xl glass-panel overflow-hidden border-white/5 transition-all duration-300 group hover:-translate-y-1"
    >
      {/* Status bar glow at top */}
      <div
        className={cn(
          "h-1.5 w-full transition-all duration-500",
          status === "Present" ? "bg-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.8)]" : 
          status === "Absent" ? "bg-[#fb7185] shadow-[0_0_15px_rgba(251,113,133,0.8)]" : 
          status === "Leave" ? "bg-[#fde047] shadow-[0_0_15px_rgba(253,224,71,0.8)]" : "bg-white/5"
        )}
      />

      <div className="p-5">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-[#0f172a] flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, #2dd4bf, #14b8a6)` }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-base tracking-tight truncate">{student.name}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate mt-0.5">
              Roll No: {student.rollNumber}
            </p>
          </div>

          <div className={cn(
             "w-2.5 h-2.5 rounded-full animate-pulse",
             status === "Present" ? "bg-[#2dd4bf] shadow-[0_0_8px_#2dd4bf]" : 
             status === "Absent" ? "bg-[#fb7185] shadow-[0_0_8px_#fb7185]" : 
             status === "Leave" ? "bg-[#fde047] shadow-[0_0_8px_#fde047]" : "bg-white/10"
          )} />
        </div>

        <div className="flex gap-2 text-left">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, activeClass, inactiveClass }) => {
            const isActive = status === value;
            return (
              <button
                key={value}
                onClick={() => onToggle(student.id, value)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all duration-300 border text-[9px] font-black uppercase tracking-tighter",
                  isActive ? activeClass : inactiveClass
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && "animate-bounce")} strokeWidth={2.5} />
                {label}
              </button>
            );
          })}

          {status === "Absent" && (
            <button
              onClick={() => onWhatsApp(student)}
              className="px-4 flex items-center justify-center rounded-2xl bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20 active:scale-95 transition-all hover:bg-[#2dd4bf]/20"
              title="Alert Guardian"
            >
              <MessageSquare className="w-5 h-5 shadow-[0_0_10px_rgba(45,212,191,0.3)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
