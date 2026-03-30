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
        emisCode: teacher.emisCode, // Added EMIS Code for dashboard filtering
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
      <div className="bg-glow-purple fixed inset-0 z-[-1] pointer-events-none" />

      <div className="relative z-10 space-y-10 px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
        <PageHeader 
          title="Academic Tests"
          description={`Enter marks for ${teacher?.assignedClass} monthly tests or internal assessments.`}
          actions={
            <button 
              onClick={handleSaveMarks}
              disabled={isSaving || students.length === 0}
              className="btn-premium flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} /> : <Save className="w-4 h-4" />}
              <span>Save All Marks</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
          {/* Assessment Settings Cluster */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 md:p-8 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <ClipboardList className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-6">Assessment Context</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Protocol Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <option className="bg-card">Monthly Test</option>
                    <option className="bg-card">Final Exam</option>
                    <option className="bg-card">Class Quiz</option>
                  </select>
                </div>

                {testType === 'Final Exam' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Deployment Year</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y} className="bg-card">{y}</option>)}
                    </select>
                  </div>
                )}

                {testType === 'Monthly Test' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Month</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {MONTHS.map(m => <option key={m} value={m} className="bg-card">{m.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Year</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {YEARS.map(y => <option key={y} value={y} className="bg-card">{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {(testType !== 'Monthly Test' && testType !== 'Final Exam') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Vector Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Subject Vector</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-foreground text-sm font-semibold tracking-wide outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s} className="bg-card">{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-[10px] font-bold text-primary flex items-center gap-2 mb-6 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                Performance Index
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Average Velocity</span>
                  <span className="text-foreground text-base tracking-tight">{avgMarks}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Peak Performance</span>
                  <span className="text-foreground text-base tracking-tight">{highMark}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Low Vector</span>
                  <span className="text-foreground text-base tracking-tight">{lowMark}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Score Entry: <span className="text-primary">{selectedSubject}</span>
                </h2>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{students.length} Students</p>
                </div>
              </div>
              
              <div className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <div className="p-24 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-70">No Students Found</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-muted-foreground text-xs group-hover:text-primary transition-colors">
                          #{student.rollNumber}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground tracking-tight text-sm">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{teacher?.assignedClass}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Max</p>
                          <p className="text-xs font-bold text-foreground">100</p>
                        </div>

                        <div className="relative group/input">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            className={cn(
                              "w-20 px-3 py-2 rounded-xl border text-center font-bold text-sm transition-all outline-none bg-white/5",
                              (marks[student.id] || 0) >= 33 
                                ? "border-white/10 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50" 
                                : "border-danger/30 bg-danger/5 text-danger focus:ring-2 focus:ring-danger/20"
                            )}
                            value={marks[student.id] || 0}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          />
                        </div>

                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs shadow-sm border transition-all",
                          (marks[student.id] || 0) >= 80 ? 'bg-success/10 text-success border-success/20 shadow-[0_0_8px_rgba(34,197,94,0.1)]' : 
                          (marks[student.id] || 0) >= 60 ? 'bg-white/5 text-foreground border-white/10' : 
                          (marks[student.id] || 0) >= 33 ? 'bg-amber-400/10 text-amber-500 border-amber-400/20' : 
                          'bg-danger/10 text-danger border-danger/20'
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
