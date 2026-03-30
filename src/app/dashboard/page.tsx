"use client";

import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
  Award,
  Star,
  Trophy,
  Menu,
  X 
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ClassPerformanceLeaderboard } from "@/components/dashboard/Leaderboard";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useClassRanking } from "@/hooks/useClassRanking";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  doc 
} from "firebase/firestore";

export default function Dashboard() {
  const { teacher, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendancePercent: 0,
    pendingHomework: 0,
    weakStudentsCount: 0
  });
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [strugglingStudents, setStrugglingStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  const { rankings, loading: loadingRankings } = useClassRanking();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!teacher?.assignedClass) {
      setLoading(false);
      return;
    }

    const className = teacher.assignedClass;
    const today = new Date().toISOString().split('T')[0];

    // 1. Students Listener (Total count and filtering groups)
    const studentsQuery = query(
      collection(db, "students"),
      where("emisCode", "==", teacher.emisCode),
      where("teacherId", "==", teacher.teacherId)
    );

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const allStudents: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(allStudents);
      
      const weak = allStudents.filter((s: any) => (s.currentTotalScore || 0) < 40);
      const top = [...allStudents]
        .filter((s: any) => (s.currentTotalScore || 0) > 0)
        .sort((a, b) => (b.currentTotalScore || 0) - (a.currentTotalScore || 0))
        .slice(0, 3);

      setStats(prev => ({
        ...prev,
        totalStudents: snapshot.size,
        weakStudentsCount: weak.length
      }));
      setTopStudents(top);
      setStrugglingStudents(weak.slice(0, 5));
      setLoading(false);
    }, (error) => {
      console.error("Dashboard Students fetch failed:", error);
      setLoading(false);
    });

    // 2. Attendance Listener for Today
    const attendanceId = `${teacher.teacherId}_${today}`;
    const attendanceDocRef = doc(db, "attendance", attendanceId);
    const unsubAttendance = onSnapshot(attendanceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const present = data.presentCount || 0;
        const total = data.totalStudents || 1;
        setStats(prev => ({
          ...prev,
          attendancePercent: Math.round((present / total) * 100)
        }));
      } else {
        setStats(prev => ({ ...prev, attendancePercent: 0 }));
      }
    });

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [teacher, authLoading]);

  if (!isMounted || authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  if (!teacher?.assignedClass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">No Class Assigned</h2>
        <p className="text-muted-foreground max-w-md">
          Welcome, {teacher?.name || 'Teacher'}! You haven't been assigned a class yet. 
          Please contact the administrator to assign you a class so you can manage students and attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, <span className="text-primary font-bold">{teacher?.name || "Teacher"}</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-semibold text-primary uppercase tracking-wider">
              {teacher?.assignedClass} Analyst
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Session</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/attendance" className="btn-primary flex items-center gap-2 group">
            <UserCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
            Mark Attendance
          </Link>
          <Link href="/homework" className="px-5 py-2.5 bg-card/80 backdrop-blur-md border border-border text-foreground rounded-xl hover:bg-white/5 flex items-center gap-2 font-medium transition-all active:scale-95 shadow-sm">
            <Plus className="w-4 h-4 text-primary" />
            Assign Homework
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          icon={Users} 
          color="primary" 
        />
        <MetricCard 
          title="Today's Attendance" 
          value={`${stats.attendancePercent}%`} 
          icon={UserCheck} 
          color="success" 
        />
        <MetricCard 
          title="Avg Performance" 
          value={loadingRankings ? "..." : (rankings.reduce((acc, r) => acc + r.totalScore, 0) / (rankings.length || 1)).toFixed(1)} 
          icon={TrendingUp} 
          color="warning" 
        />
        <MetricCard 
          title="Top Score" 
          value={loadingRankings ? "..." : (rankings[0]?.totalScore || 0).toString()} 
          icon={Award} 
          color="danger" 
        />
      </div>

      <ClassPerformanceLeaderboard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers Ranking */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 text-amber-500" />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground tracking-tight">
              <Star className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Spotlight: Top 3
            </h2>
          </div>
          <div className="space-y-5">
            {!loadingRankings && rankings.length > 0 ? rankings.slice(0, 3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : 
                    index === 1 ? "bg-slate-300 text-slate-700" : 
                    "bg-orange-300 text-orange-800"
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground tracking-tight">{student.name}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary tracking-tight">{student.totalScore}/50</p>
                  <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Total Pts</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                {loadingRankings ? "Analyzing performance..." : "No rankings available yet."}
              </div>
            )}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="glass-card p-8 border-danger/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
            <AlertTriangle className="w-24 h-24 text-danger" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground tracking-tight">
              <AlertTriangle className="w-5 h-5 text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              Attention Required 
            </h2>
            <span className="bg-danger/10 text-danger text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border border-danger/20 shadow-sm">
              Below 25 Pts
            </span>
          </div>
          <div className="space-y-4">
            {!loadingRankings && rankings.filter(r => r.totalScore < 25).length > 0 ? 
              rankings.filter(r => r.totalScore < 25).slice(0, 5).map((student) => {
                const actualStudent = students.find(s => s.id === student.id);
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-danger/5 border border-danger/10 hover:border-danger/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center font-bold text-danger text-sm">
                        {(student?.name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground tracking-tight">{student.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">RN: {student.rollNumber} • {student.totalScore}/50</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(`https://wa.me/${actualStudent?.parentWhatsApp}`, '_blank')}
                      className="px-3.5 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-[9px] font-semibold uppercase tracking-wider rounded-lg transition-all"
                    >
                      Alert Parent
                    </button>
                  </div>
                );
              }) : (
              <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                {loadingRankings ? "Screening for issues..." : "Excellent! All students meeting targets."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
