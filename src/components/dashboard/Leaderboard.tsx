"use client";

import { useClassRanking } from "@/hooks/useClassRanking";
import { Loader2, Award, Trophy, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClassPerformanceLeaderboard() {
  const { rankings, loading } = useClassRanking();

  if (loading) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold animate-pulse">Calculating Class Ranks...</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-muted-foreground italic">
        No performance data available to calculate rankings.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden shadow-2xl border-white/5 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2dd4bf]/50 to-transparent opacity-50" />
      
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2 text-foreground uppercase tracking-tighter">
            <Trophy className="w-6 h-6 neon-teal" />
            Class Leaderboard
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Academic Rankings</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="bg-[#2dd4bf]/10 text-primary text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#2dd4bf]/20">
            Weighted Score (Out of 50)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left ghost-table">
          <thead>
            <tr>
              <th className="px-8 py-6">Rank</th>
              <th className="px-8 py-6">Student Record</th>
              <th className="px-4 py-6 text-center">ATT</th>
              <th className="px-4 py-6 text-center">HW</th>
              <th className="px-4 py-6 text-center">QUZ</th>
              <th className="px-4 py-6 text-center">TST</th>
              <th className="px-8 py-6 text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankings.map((student, index) => (
              <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-black text-xl italic tracking-tighter",
                      index === 0 ? "neon-gold" : 
                      index === 1 ? "neon-silver" : 
                      index === 2 ? "text-orange-400" : "text-slate-500"
                    )}>
                      #{student.rank}
                    </span>
                    {index === 0 && <Award className="w-4 h-4 neon-gold animate-pulse" />}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-foreground tracking-tight">{student.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RN: {student.rollNumber}</p>
                  </div>
                </td>
                <td className="px-4 py-6 text-center font-bold text-muted-foreground">{student.attendanceScore}</td>
                <td className="px-4 py-6 text-center font-bold text-muted-foreground">{student.homeworkScore}</td>
                <td className="px-4 py-6 text-center font-bold text-muted-foreground">{student.quizScore}</td>
                <td className="px-4 py-6 text-center font-bold text-muted-foreground">{student.testScore}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-2xl font-black italic tracking-tighter",
                      student.totalScore >= 40 ? "neon-teal" : 
                      student.totalScore >= 30 ? "text-blue-400" : 
                      "neon-coral"
                    )}>
                      {student.totalScore}
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Points</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
