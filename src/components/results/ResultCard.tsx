"use client";

import Link from "next/link";
import { Eye, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types";

interface ResultCardProps {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    percentage: number;
    grade: string;
    status: string;
    marks: Record<string, number>;
  };
  onEdit: (student: any) => void;
  onWhatsApp: (student: any) => void;
  onViewDmc: (student: any) => void;
}

// Show only 3 key subjects on the card for brevity
const CARD_SUBJECTS = ["English", "Math", "General Science"];

function CircularBadge({ percentage }: { percentage: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const color =
    percentage >= 80 ? "#2dd4bf" :
    percentage >= 60 ? "#6366f1" :
    percentage >= 33 ? "#fde047" : "#fb7185";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-black italic" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  );
}

function SubjectBar({ subject, score }: { subject: string; score: number }) {
  const color =
    score >= 80 ? "#2dd4bf" :
    score >= 33 ? "#6366f1" : "#fb7185";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">
          {subject}
        </span>
        <span className="text-[9px] font-black italic leading-none" style={{ color }}>{score}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(score, 100)}%`, background: color, boxShadow: `0 0 8px ${color}30` }}
        />
      </div>
    </div>
  );
}

export function ResultCard({ student, onEdit, onWhatsApp, onViewDmc }: ResultCardProps) {
  const statusColor =
    student.status === "Pass" ? "#2dd4bf" :
    student.status === "Fail" ? "#fb7185" : "#94a3b8";

  return (
    <div className="glass-card overflow-hidden border-white/5 shadow-2xl relative group">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2dd4bf]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#2dd4bf]/10 transition-all opacity-50" />
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div>
          <p className="font-black text-white text-base tracking-tight uppercase italic leading-none">{student.name}</p>
          <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mt-2 leading-none">
            Vector Access: #{student.rollNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className="text-xl font-black italic leading-none" style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}40` }}>
            {student.grade === "-" ? student.status : student.grade}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border transition-all"
            style={{ 
              borderColor: `${statusColor}30`, 
              color: statusColor,
              background: `${statusColor}10`,
              boxShadow: `0 0 10px ${statusColor}10`
            }}
          >
            {student.status === "N/A" ? "Pending" : student.status}
          </span>
        </div>
      </div>

      {/* Body — Subject bars + Circular badge */}
      <div className="px-5 py-4 flex items-center gap-6">
        <div className="flex-1 space-y-3">
          {CARD_SUBJECTS.map((sub) => (
            <SubjectBar key={sub} subject={sub} score={student.marks?.[sub] ?? 0} />
          ))}
        </div>
        <CircularBadge percentage={student.percentage} />
      </div>

      {/* Footer — Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <button
          onClick={() => onEdit(student)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[#94a3b8] hover:text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-inner"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Sync
        </button>
        <button
          onClick={() => onViewDmc(student)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[#94a3b8] hover:text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-inner"
        >
          <Eye className="w-3.5 h-3.5" />
          DMC
        </button>
        <button
          onClick={() => onWhatsApp(student)}
          className="px-4 py-2.5 rounded-xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/5 hover:bg-[#2dd4bf]/10 text-[#2dd4bf] active:scale-95 transition-all shadow-inner"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
