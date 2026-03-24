"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Award, 
  Search, 
  Download, 
  Printer, 
  Filter,
  TrendingUp,
  Users,
  CheckCircle2,
  Plus,
  X,
  Save as SaveIcon,
  Eye,
  MessageSquare,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { generateResultMessage } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/useAuth";
import BulkMarksActions from "@/components/results/BulkMarksActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DMCDisplay, DMCStyle } from "@/components/results/DMCDisplay";
import { toast } from "react-hot-toast";
import { ResultCard } from "@/components/results/ResultCard";

export default function ResultsPage() {
  const router = useRouter();
  const { teacher, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDmcModalOpen, setIsDmcModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedDmcStudent, setSelectedDmcStudent] = useState<any>(null);
  const [dmcTemplate, setDmcTemplate] = useState<DMCStyle>("govt");
  const [marks, setMarks] = useState<Record<string, number>>(
    Object.fromEntries(SUBJECTS.map(s => [s, 0]))
  );
  const [students, setStudents] = useState<any[]>([]);
  const [finalExamsData, setFinalExamsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [dateStamp, setDateStamp] = useState("");

  const STYLES_LIST = [
    { name: "GOVT OFFICIAL GREEN", value: "govt" },
    { name: "EXECUTIVE PREMIUM", value: "executive" },
    { name: "BOARD CLASSIC", value: "classic" },
    { name: "CLEAN MINIMAL", value: "minimal" },
    { name: "SYSTEM COMPACT", value: "compact" },
  ];

  // Fetch Students and Results in Real-time
  useEffect(() => {
    if (authLoading || !teacher?.assignedClass) return;

    console.log(`Initializing Real-time Listeners for ${teacher.assignedClass}...`);
    
    // 1. Listen for Students in the teacher's class
    const studentsQuery = query(
      collection(db, "students"),
      where("teacherId", "==", teacher.teacherId)
    );
    
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setStudents(studentsList);
    }, (error) => {
      console.error("CRITICAL: Student fetch failed:", error);
    });

    // 2. Listen for Final Exam Results filtered by class
    const examsQuery = query(
      collection(db, "finalExams"),
      where("teacherId", "==", teacher.teacherId)
    );
    
    const unsubExams = onSnapshot(examsQuery, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setFinalExamsData(data);
      setLoading(false);
    }, (error) => {
      console.error("CRITICAL: Exams fetch failed:", error);
      setLoading(false);
    });

    setDateStamp(new Date().toLocaleDateString('en-GB'));

    return () => {
      unsubStudents();
      unsubExams();
    };
  }, [teacher, authLoading]);

  const mergedResults = students.map(student => {
    const compositeId = `${teacher?.teacherId}_${student.id}`;
    const saved = finalExamsData[compositeId];
    
    if (saved) {
      return {
        ...student,
        totalMarks: saved.totalObtained,
        percentage: saved.percentage,
        grade: saved.percentage >= 80 ? "A+" : saved.percentage >= 70 ? "A" : saved.percentage >= 60 ? "B" : saved.percentage >= 50 ? "C" : saved.percentage >= 33 ? "D" : "F",
        status: saved.percentage >= 50 ? "Pass" : "Fail",
        marks: saved.marks
      };
    }
    return {
      ...student,
      totalMarks: 0,
      percentage: 0,
      grade: "-",
      status: "N/A",
      marks: {}
    };
  });

  const filteredResults = mergedResults.filter(student => 
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.rollNumber?.includes(searchTerm))
  );

  const openEditMarks = (student: any) => {
    setSelectedStudentId(student.id);
    const resultDocId = `${teacher?.teacherId}_${student.id}`;
    const savedMarks = finalExamsData[resultDocId]?.marks || {};
    // Ensure all subjects are initialized
    const studentMarks = Object.fromEntries(SUBJECTS.map(s => [s, savedMarks[s] || 0]));
    setMarks(studentMarks);
    setIsModalOpen(true);
  };

  const handleSaveMarks = async () => {
    if (!selectedStudentId || !teacher?.teacherId) {
      alert("Please select a student and ensure you are logged in.");
      return;
    }

    const totalObtained = Object.values(marks).reduce((acc: number, curr: number) => acc + curr, 0);
    const percentage = parseFloat(((totalObtained / 700) * 100).toFixed(1));
    
    setIsSaving(true);

    try {
      const resultDocId = `${teacher.teacherId}_${selectedStudentId}`;
      const resultRef = doc(db, "finalExams", resultDocId); 
      
      await setDoc(resultRef, {
        teacherId: teacher.teacherId,
        studentId: selectedStudentId,
        marks: marks,
        totalObtained,
        percentage,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsSaving(false);
      setIsModalOpen(false);
      toast.success("Final Marks Saved!");
      
      setSelectedStudentId("");
      setMarks(Object.fromEntries(SUBJECTS.map(s => [s, 0])));
    } catch (error: any) {
      console.error("Firebase Write Error:", error);
      if (error.code === 'unavailable') {
         toast.error("You are offline. Data is cached and will sync when reconnected.", { duration: 6000 });
      } else {
         toast.error(`Error: ${error.message || "Failed to save data"}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || (loading && students.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading results data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4 min-h-screen print:hidden">
        <PageHeader 
          title="Final Results"
          description="Academic Year 2025-26"
          className="mb-4"
          actions={
            <BulkMarksActions 
              teacherId={teacher?.teacherId || ""}
              assignedClass={teacher?.assignedClass || ""}
              students={students}
              onImportSuccess={() => {}}
              onManualEntry={() => setIsModalOpen(true)}
              onViewAll={() => router.push("/results/bulk-preview")}
            />
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            title="Class Average"
            value={mergedResults.length > 0 
              ? `${(mergedResults.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / mergedResults.length).toFixed(1)}%`
              : "0%"}
            icon={TrendingUp}
            color="primary"
          />
          <MetricCard 
            title="Total Students"
            value={students.length}
            icon={Users}
            color="secondary"
          />
          <MetricCard 
            title="Highest Score"
            value={mergedResults.length > 0 
              ? `${Math.max(...mergedResults.map(r => parseFloat(r.percentage) || 0))}%` 
              : "0%"}
            icon={CheckCircle2}
            color="success"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1e293b] p-4 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <Search className="w-16 h-16 text-white" />
          </div>

          <div className="relative w-full md:w-96 z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Identify personnel..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a]/50 text-white focus:ring-2 focus:ring-[#2dd4bf]/20 outline-none transition-all text-sm font-black uppercase tracking-widest px-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto relative z-10">
            <button className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-white">
              <Filter className="w-4 h-4" />
              Filter Protocols
            </button>
            <div className="h-10 w-[1px] bg-white/5 mx-2 hidden md:block" />
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest flex items-center">
              Detected: <span className="text-[#2dd4bf] mx-2 text-sm italic">{filteredResults.length}</span> Personnel
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 relative" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(15px)' }}>
          <div className="overflow-x-auto">
            {/* Table for Desktop */}
            <table className="w-full text-left hidden md:table border-collapse table-fixed">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[10%]">Index</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] w-[35%]">Personnel Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[10%]">Limit</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[10%]">Vector</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[12%]">Velocity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[10%]">Grade</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] text-center w-[13%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredResults.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                    onClick={() => openEditMarks(student)}
                  >
                    <td className="px-6 py-4 text-xs font-black text-[#94a3b8] italic tracking-tighter text-center">#{student.rollNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-black text-white text-sm tracking-tight uppercase italic">{student.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-black text-slate-600">700</td>
                    <td className="px-6 py-4 text-center text-xs font-black text-white">{student.totalMarks}</td>
                    <td className="px-6 py-4 text-center font-black text-[#2dd4bf] text-xs italic">{student.percentage}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-xs font-black italic tracking-widest",
                        student.grade.startsWith('A') ? "neon-teal" : 
                        student.grade === 'F' ? "neon-coral" : "text-blue-400"
                      )}>
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                        student.status === "Pass" ? "bg-[#2dd4bf]/10 text-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.2)] border border-[#2dd4bf]/20" : 
                        student.status === "Fail" ? "bg-[#fb7185]/10 text-[#fb7185] shadow-[0_0_10px_rgba(251,113,133,0.2)] border border-[#fb7185]/20" : 
                        "bg-white/5 text-slate-500 border border-white/10"
                      )}>
                        {student.status === "N/A" ? "Pending" : student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Mobile Cards (new ResultCard component) ── */}
            <div className="md:hidden space-y-3 p-4">
              {filteredResults.map((student) => (
                <ResultCard
                  key={student.id}
                  student={student}
                  onEdit={openEditMarks}
                  onViewDmc={(s) => { setSelectedDmcStudent(s); setIsDmcModalOpen(true); }}
                  onWhatsApp={(s) => {
                    const msg = generateResultMessage(s.parentName || "والد صاحب", s.name, s.totalMarks, parseFloat(s.percentage), s.status);
                    window.open(`https://wa.me/${s.parentWhatsApp}?text=${msg}`, '_blank');
                  }}
                />
              ))}
            </div>
          </div>

          {/* Export to PDF Button Area - Exact Placement at bottom of table */}
          <div className="flex justify-end p-6 border-t border-white/5 bg-white/[0.02]">
            <button 
              onClick={() => window.print()}
              className="btn-primary flex items-center gap-3 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(45,212,191,0.2)]"
            >
              <Download className="w-4 h-4" />
              Engage Print Engine
            </button>
          </div>
        </div>

        {/* Marks Entry Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border-white/10 relative">
              <div className="sticky top-0 bg-[#1e293b]/90 backdrop-blur-md p-8 border-b border-white/5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                    <Award className="w-6 h-6 neon-teal" />
                    Entry Protocol: Marks
                  </h2>
                  <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mt-1">Status: Manual Synchronization</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-white/5 shadow-inner"
                >
                  <X className="w-5 h-5 text-[#94a3b8] hover:text-white" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                      <Users className="w-20 h-20 text-white" />
                   </div>
                  {!selectedStudentId ? (
                    <div className="relative z-10">
                      <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4 block">Identify Target Personnel</label>
                      <select 
                        className="w-full p-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white focus:ring-4 focus:ring-[#2dd4bf]/20 outline-none transition-all font-black uppercase tracking-widest text-xs appearance-none cursor-pointer"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                      >
                        <option value="" className="bg-[#0f172a]">Choose from roster unit...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id} className="bg-[#0f172a]">{s.name} — RL: {s.rollNumber}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">Syncing Data For</p>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1">
                          {students.find(s => s.id === selectedStudentId)?.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest leading-none">Access Code</p>
                        <p className="text-2xl font-black neon-teal uppercase italic tracking-tighter mt-1">
                          #{students.find(s => s.id === selectedStudentId)?.rollNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SUBJECTS.map((subject) => (
                    <div key={subject} className="group">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest group-focus-within:text-[#2dd4bf] transition-colors">{subject}</label>
                        {marks[subject] < 33 && (
                          <span className="text-[10px] font-black text-[#fb7185] uppercase flex items-center gap-1 animate-pulse">
                            <X className="w-3 h-3" /> Critical
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          max="100"
                          min="0"
                          className={cn(
                            "w-full p-4 rounded-2xl border-2 bg-[#0f172a]/30 focus:bg-[#0f172a]/50 text-white focus:ring-4 outline-none transition-all font-black text-xl italic",
                            marks[subject] < 33 ? "border-[#fb7185]/20 focus:border-[#fb7185] focus:ring-[#fb7185]/10" : "border-white/5 focus:border-[#2dd4bf] focus:ring-[#2dd4bf]/10"
                          )}
                          value={marks[subject] || ""}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setMarks(prev => ({ ...prev, [subject]: val }));
                          }}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 shadow-2xl flex items-center justify-between relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2dd4bf]/5 to-transparent opacity-50" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">AGGREGATE VECTOR</p>
                    <h4 className="text-4xl font-black text-white italic tracking-tighter">
                      {Object.values(marks).reduce((acc: number, curr: number) => acc + curr, 0)} <span className="text-xs font-medium text-slate-500 uppercase">/ Total 700</span>
                    </h4>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">GRADE & PROTOCOL</p>
                    <div className="flex items-center justify-end gap-5">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border",
                        Object.values(marks).every(m => m >= 33) ? "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20" : "bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/20"
                      )}>
                        {Object.values(marks).every(m => m >= 33) ? "SECURE" : "FAILED"}
                      </span>
                      <h4 className="text-4xl font-black neon-teal italic tracking-tighter">
                        {(() => {
                          const p = (Object.values(marks).reduce((a, b) => a + b, 0) / 700) * 100;
                          if (p >= 80) return "A+";
                          if (p >= 70) return "A";
                          if (p >= 60) return "B";
                          if (p >= 50) return "C";
                          if (p >= 40) return "D";
                          return "E";
                        })()}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 flex gap-6 bg-white/[0.02]">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 font-black text-[#94a3b8] uppercase tracking-widest hover:bg-white/5 transition-all text-[10px]"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveMarks}
                  disabled={isSaving}
                  className={cn(
                    "flex-[2] btn-primary flex items-center justify-center gap-4 py-4 font-black text-[10px] uppercase tracking-widest transition-all",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} />
                  ) : (
                    <SaveIcon className="w-6 h-6" strokeWidth={3} />
                  )}
                  {isSaving ? "Synchronizing..." : "Commit Vector Data"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DMC Preview Modal */}
        {isDmcModalOpen && selectedDmcStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:block">
            <div className="bg-white w-full max-w-4xl min-h-[80vh] shadow-2xl rounded-[2.5rem] animate-in zoom-in-95 duration-200 flex flex-col print:rounded-none print:shadow-none print:m-0 print:w-full">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between z-10 print:hidden">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Certificate Designer</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Style Engine</p>
                  </div>
                  <div className="h-10 w-[2px] bg-slate-100 mx-2" />
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CHOOSE DESIGN</label>
                    <select 
                      className="p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-black uppercase outline-none focus:border-primary transition-all pr-10"
                      value={dmcTemplate}
                      onChange={(e) => setDmcTemplate(e.target.value as DMCStyle)}
                    >
                      {STYLES_LIST.map(style => (
                        <option key={style.value} value={style.value}>{style.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Print Official DMC
                  </button>
                  <button 
                    onClick={() => setIsDmcModalOpen(false)}
                    className="p-3 hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-50"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-12 overflow-y-auto bg-slate-100 print:bg-white print:p-0 flex justify-center">
                <DMCDisplay 
                  student={selectedDmcStudent}
                  teacher={teacher}
                  style={dmcTemplate}
                  isPrintPreview={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden print:flex flex-col bg-white text-black min-h-screen font-sans p-2 mx-auto w-full relative">
        <style jsx global>{`
          @media print {
            @page {
              size: landscape;
              margin: 5mm;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .print-only-landscape {
              width: 100% !important;
              max-width: none !important;
            }
          }
        `}</style>
        {/* Universal Watermark Logo - 0.05 Opacity */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src="/logo.png" 
            alt="Watermark" 
            className="w-[70%] h-auto max-w-[800px] opacity-[0.05] bg-transparent grayscale"
          />
        </div>

        {/* Header Section */}
        <div className="relative z-10 text-center mb-5 pt-4 px-[0.1in]">
          <div className="flex flex-col items-center justify-center gap-1 mb-4">
            <h1 className="text-6xl font-[900] uppercase tracking-tighter text-black">GPS No.4 Kunda</h1>
          </div>
          <p className="text-xl font-bold text-slate-700 uppercase tracking-[0.3em] mb-4">
            Official Gazette • Final Result Session 2025-26
          </p>
          <div className="h-[2px] bg-black w-full mb-4" />
        </div>
        
        {/* Gazette Table Grid */}
        {/* Gazette Table Grid (Landscape) */}
        <div className="relative z-10 w-full px-[0.4in]">
          <div className="border border-black mx-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b-2 border-slate-950 bg-transparent">
                  <th className="border-r border-slate-300 px-1 py-4 text-[13px] font-black uppercase tracking-wider text-center w-[5%] align-middle text-black">R.No</th>
                  <th className="border-r border-slate-300 px-3 py-4 text-[14px] font-black uppercase tracking-wider text-left align-middle w-[24%] text-black">Name</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[7%] align-middle text-black">English</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[7%] align-middle text-black">Urdu</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[7%] align-middle text-black">Pashto</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[7%] align-middle text-black">Math</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[7%] align-middle text-black">Science</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[8%] align-middle text-black">Islamiyat</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[12px] font-black uppercase tracking-wider text-center w-[8%] align-middle text-black">S.Studies</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[13px] font-black uppercase tracking-wider text-center w-[6%] align-middle text-black">Total</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[13px] font-black uppercase tracking-wider text-center w-[8%] align-middle text-black">Obtained</th>
                  <th className="border-r border-slate-300 px-1 py-4 text-[13px] font-black uppercase tracking-wider text-center w-[10%] align-middle text-black">Percent</th>
                  <th className="px-1 py-4 text-[13px] font-black uppercase tracking-wider text-center w-[10%] align-middle text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((student) => {
                  // Determine if any marks are missing across the 7 subjects
                  const hasMissingMarks = SUBJECTS.some(sub => student.marks?.[sub] === undefined || student.marks?.[sub] === null || student.marks?.[sub] === '');
                  
                  return (
                    <tr key={student.id} className="border-b border-slate-300 last:border-0 h-[47px]">
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-black text-center align-middle whitespace-nowrap">{student.rollNumber}</td>
                      <td className="border-r border-slate-300 px-3 py-2 text-[13px] font-black uppercase text-left align-middle truncate italic">{student.name}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['English'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['Urdu'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['Pashto'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['Math'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['General Science'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['Islamiyat'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-bold text-center align-middle">{hasMissingMarks ? "-" : (student.marks?.['Social Study'] || 0)}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[12px] font-black text-center align-middle bg-slate-50 underline decoration-slate-300 underline-offset-4">700</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[13px] font-black text-center align-middle bg-slate-50 italic">{hasMissingMarks ? "-" : student.totalMarks}</td>
                      <td className="border-r border-slate-300 px-1 py-2 text-[13px] font-black text-center align-middle text-black bg-slate-100 italic">{hasMissingMarks ? "-" : `${student.percentage}%`}</td>
                      <td className="px-1 py-2 text-center align-middle whitespace-nowrap bg-slate-50">
                        {hasMissingMarks ? (
                          <span className="text-[14px] font-black text-slate-400">—</span>
                        ) : student.percentage >= 33 ? (
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest italic decoration-emerald-200 underline underline-offset-2">PASS</span>
                        ) : (
                          <span className="text-[11px] font-black text-rose-800 uppercase tracking-widest italic decoration-rose-200 underline underline-offset-2">FAIL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Footer Boxed Alignment */}
        {/* Signature Footer Boxed Alignment */}
        <div className="relative z-10 mt-auto flex justify-between items-start w-full px-[0.8in] pb-8 pt-10">
          <div className="flex flex-col items-center w-[2.5in]">
            <div className="border-b-2 border-slate-950 mb-4 w-full"></div>
            <p className="text-[13px] font-black uppercase tracking-[0.3em] text-black text-center whitespace-nowrap">Class Teacher Signature</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 italic tracking-widest">Official Protocol Seal</p>
          </div>
          <div className="flex flex-col items-center w-[2.5in]">
            <div className="border-b-2 border-slate-950 mb-4 w-full"></div>
            <p className="text-[13px] font-black uppercase tracking-[0.3em] text-black text-center whitespace-nowrap">Head Teacher Signature</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 italic tracking-widest">Authority Stamp Cluster</p>
          </div>
        </div>
        
        <div className="pb-4 text-center">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-sans">
            Official School Gazette Document • GPS No.4 School Management System • {dateStamp || "•• . •• . ••••"}
          </p>
        </div>
      </div>
    </>
  );
}
