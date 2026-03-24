"use client";

import { useState, useEffect } from "react";
import { Save, ClipboardList, TrendingUp, Search, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "react-hot-toast";

export default function TestsPage() {
  const { teacher, loading: authLoading } = useAuth();
  const [testType, setTestType] = useState("Monthly Test");
  const [selectedMonth, setSelectedMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [term, setTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

  // Sync term with dynamic inputs
  useEffect(() => {
    let newTerm = "";
    if (testType === "Monthly Test") {
      newTerm = `${selectedMonth} ${selectedYear}`;
    } else if (testType === "Final Exam") {
      newTerm = selectedYear;
    } else {
      newTerm = selectedDate;
    }
    setTerm(newTerm);
  }, [testType, selectedMonth, selectedYear, selectedDate]);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Students
  useEffect(() => {
    if (authLoading || !teacher?.teacherId) return;

    const q = query(
      collection(db, "students"), 
      where("teacherId", "==", teacher.teacherId)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [teacher, authLoading]);

  useEffect(() => {
    const fetchMarks = async () => {
      if (!teacher?.teacherId || !term || !selectedSubject || !testType) return;
      
      const assessmentId = `${teacher.teacherId}_${testType}_${term}_${selectedSubject}`;
      const docRef = doc(db, "assessments", assessmentId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setMarks(data.studentScores || {});
      } else {
        setMarks({});
      }
    };
    fetchMarks();
  }, [teacher, term, selectedSubject, testType]);

  const handleMarkChange = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    if (num <= 100) {
      setMarks(prev => ({ ...prev, [id]: num }));
    }
  };

  const handleSaveMarks = async () => {
    if (!teacher?.teacherId) return;
    setIsSaving(true);
    
    try {
      // Chunk 3 ID Format: ${user.uid}_${assessmentType}_${month}_${subject}
      const assessmentId = `${teacher.teacherId}_${testType}_${term}_${selectedSubject}`;
      await setDoc(doc(db, "assessments", assessmentId), {
        teacherId: teacher.teacherId,
        type: testType,
        month: term,
        subject: selectedSubject,
        studentScores: marks,
        updatedAt: Timestamp.now()
      });
      toast.success("Marks saved successfully!");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'unavailable') {
         toast.error("You are offline. Data is cached and will sync when reconnected.", { duration: 6000 });
      } else {
         toast.error("Failed to save marks to server.", { duration: 5000 });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const avgMarks = Object.values(marks).length > 0 
    ? (Object.values(marks).reduce((a, b) => a + b, 0) / Object.values(marks).length).toFixed(1)
    : "0";
  const highMark = Object.values(marks).length > 0 ? Math.max(...Object.values(marks)) : "0";
  const lowMark = Object.values(marks).length > 0 ? Math.min(...Object.values(marks)) : "0";

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Neon Glows */}
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#2dd4bf]/5 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-[#fb7185]/5 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <PageHeader 
          title="Academic Tests"
          description={`Enter marks for ${teacher?.assignedClass} monthly tests or internal assessments.`}
          actions={
            <button 
              onClick={handleSaveMarks}
              disabled={isSaving || students.length === 0}
              className="btn-primary flex items-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(45,212,191,0.2)]"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} /> : <Save className="w-6 h-6" strokeWidth={3} />}
              <span className="whitespace-nowrap">Save All Marks</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Assessment Settings Cluster */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <ClipboardList className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-6">Assessment Context</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Type</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#2dd4bf]/20 transition-all appearance-none cursor-pointer"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <option className="bg-[#0f172a]">Monthly Test</option>
                    <option className="bg-[#0f172a]">Final Exam</option>
                    <option className="bg-[#0f172a]">Class Quiz</option>
                  </select>
                </div>

                {testType === 'Final Exam' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deployment Year</label>
                    <select 
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#2dd4bf]/20 appearance-none cursor-pointer"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y} className="bg-[#0f172a]">{y}</option>)}
                    </select>
                  </div>
                )}

                {testType === 'Monthly Test' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Month</label>
                      <select 
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#2dd4bf]/20 appearance-none cursor-pointer"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {MONTHS.map(m => <option key={m} value={m} className="bg-[#0f172a]">{m.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Year</label>
                      <select 
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#2dd4bf]/20 appearance-none cursor-pointer"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {YEARS.map(y => <option key={y} value={y} className="bg-[#0f172a]">{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {(testType !== 'Monthly Test' && testType !== 'Final Exam') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vector Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#2dd4bf]/20"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Vector</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-[#2dd4bf]/20 appearance-none cursor-pointer"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-[#2dd4bf]/5 border-[#2dd4bf]/10 shadow-[0_0_20px_rgba(45,212,191,0.05)]">
              <h3 className="text-[10px] font-black text-[#2dd4bf] flex items-center gap-3 mb-6 uppercase tracking-widest">
                <TrendingUp className="w-5 h-5" />
                Performance Index
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Average Velocity</span>
                  <span className="text-white text-lg font-black italic neon-teal">{avgMarks}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Peak Performance</span>
                  <span className="text-white text-lg font-black italic">{highMark}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Low Vector</span>
                  <span className="text-white text-lg font-black italic">{lowMark}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Entry Terminal */}
          <div className="lg:col-span-8">
            <div className="glass-card overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border-white/5 max-w-[850px] mx-auto lg:mx-0">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                  <ClipboardList className="w-5 h-5 neon-teal" />
                  Score Entry: <span className="neon-teal">{selectedSubject}</span>
                </h2>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{students.length} Personnel Detected</p>
                </div>
              </div>
              
              <div className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <div className="p-32 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-50">No Personnel Found in Search Space</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="p-5 flex items-center justify-between hover:bg-white/[0.03] transition-all group border-l-4 border-transparent hover:border-[#2dd4bf]/30">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center font-black text-slate-500 text-sm italic group-hover:text-[#2dd4bf] transition-colors">
                          #{student.rollNumber}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase tracking-tight italic text-base group-hover:translate-x-1 transition-transform">{student.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">{teacher?.assignedClass}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Max</p>
                          <p className="text-xs font-black text-slate-400">100</p>
                        </div>

                        <div className="relative group/input">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            className={cn(
                              "w-24 px-4 py-3.5 rounded-2xl border text-center font-black text-sm transition-all outline-none bg-black/20",
                              (marks[student.id] || 0) >= 33 
                                ? "border-white/10 text-white focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50" 
                                : "border-[#fb7185]/30 bg-[#fb7185]/5 text-[#fb7185] focus:ring-[#fb7185]/20"
                            )}
                            value={marks[student.id] || 0}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          />
                        </div>

                        <div className={cn(
                          "w-14 h-14 flex items-center justify-center rounded-2xl font-black text-sm italic shadow-inner border transition-all",
                          (marks[student.id] || 0) >= 80 ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/30 shadow-[0_0_15px_rgba(45,212,191,0.1)]' : 
                          (marks[student.id] || 0) >= 60 ? 'bg-white/5 text-white border-white/10' : 
                          (marks[student.id] || 0) >= 33 ? 'bg-amber-400/10 text-amber-500 border-amber-400/20' : 
                          'bg-[#fb7185]/20 text-[#fb7185] border-[#fb7185]/30'
                        )}>
                          {(marks[student.id] || 0) >= 80 ? 'A+' : (marks[student.id] || 0) >= 60 ? 'B' : (marks[student.id] || 0) >= 33 ? 'C' : 'F'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];
