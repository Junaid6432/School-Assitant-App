"use client";

import { useEffect, useState } from "react";
import { Printer, ChevronLeft, Award, Loader2, AlertCircle, User, Hash, CheckCircle2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SUBJECTS } from "@/types";
import { cn, getAcademicSession, getShortAcademicSession } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DMCDisplay, DMCStyle } from "@/components/results/DMCDisplay";

export default function DMCPage() {
  const searchParams = useSearchParams();
  const { teacher, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [template, setTemplate] = useState("Executive Premium");
  const [fontStyle, setFontStyle] = useState("Serif");
  const [isPrinting, setIsPrinting] = useState(false);
  const [language, setLanguage] = useState("English");

  const studentId = searchParams.get("id") as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !teacher?.teacherId) return;

      try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          setError("Student record not found in database.");
          setLoading(false);
          return;
        }

        const studentData = { id: studentSnap.id, ...studentSnap.data() } as any;
        if (studentData.teacherId !== teacher.teacherId) {
          setError("Access Denied: Record restricted to authorized personnel.");
          setLoading(false);
          return;
        }

        setStudent(studentData);

        const compositeId = `${teacher.teacherId}_${studentId}`;
        const examRef = doc(db, "finalExams", compositeId);
        const examSnap = await getDoc(examRef);
        
        if (examSnap.exists()) {
          setExamData(examSnap.data());
        }
      } catch (err) {
        console.error(err);
        setError("System Error: Failed to synchronize record.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacher, authLoading, studentId]);

  if (!mounted) return null;

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Syncing Official Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <AlertCircle className="w-20 h-20 text-danger opacity-20" />
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">{error}</h2>
        <Link href="/reports" className="btn-primary px-8 py-3 rounded-2xl shadow-lg border-b-4 border-primary-dark">
          Return to Console
        </Link>
      </div>
    );
  }

  const marksArray = examData?.marks || {};
  const totalObtained = examData?.totalObtained || 0;
  const percentage = examData?.percentage || 0;
  const maxGrandTotal = SUBJECTS.length * 100;

  const isPassAll = SUBJECTS.every(sub => (marksArray[sub] || 0) >= 33);

  const getGrade = (score: number) => {
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "E";
  };

  const fontFamilyMapped = [
    { name: "Serif", value: "serif", family: "var(--font-serif), 'Roboto Serif', serif" },
    { name: "Times New Roman", value: "times-new-roman", family: "'Times New Roman', Times, serif" },
    { name: "Georgia", value: "georgia", family: "Georgia, Times, 'Times New Roman', serif" },
    { name: "Open Sans", value: "open-sans", family: "var(--font-open-sans), sans-serif" },
    { name: "Roboto", value: "roboto", family: "var(--font-roboto), sans-serif" },
  ].find(f => f.name === fontStyle)?.family;

  const styleMapped: DMCStyle = 
    template === "GOVT OFFICIAL GREEN" ? "govt" :
    template === "Executive Premium" ? "executive" :
    template === "BOARD CLASSIC" ? "classic" :
    template === "Clean Minimal" ? "minimal" : "compact";

  return (
    <div className="max-w-[210mm] mx-auto space-y-2 pb-20" suppressHydrationWarning>
      {/* Universal Control Engine (Hidden on Print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-6 glass-panel p-8 mb-2 border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <Award className="w-24 h-24 text-white" />
        </div>

        <div className="flex flex-col gap-6 relative z-10 w-full">
          {/* Top Row: Navigation & Title */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <Link href="/reports" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#2dd4bf]/20 transition-all shadow-inner border border-white/5 disabled:opacity-50">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="space-y-1">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Record Analyzer</h3>
                <p className="text-lg font-black text-white leading-none tracking-tight uppercase italic">{student?.name}</p>
              </div>
            </div>
            {/* Empty space or secondary info can go here */}
          </div>

          {/* Bottom Row: Controls (L - C - R) */}
          <div className="flex items-center justify-between w-full gap-4 pt-4 border-t border-white/5">
            {/* Theme (Left) */}
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md h-[52px] flex-1 max-w-[240px]">
              <span className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest whitespace-nowrap">Theme</span>
              <select 
                className="px-4 py-2 rounded-xl border-none bg-white text-[#1E293B] !important text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 transition-all appearance-none cursor-pointer h-full w-full"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option className="bg-white text-[#1E293B]">Executive Premium</option>
                <option className="bg-white text-[#1E293B]">BOARD CLASSIC</option>
                <option className="bg-white text-[#1E293B]">Clean Minimal</option>
                <option className="bg-white text-[#1E293B]">GOVT OFFICIAL GREEN</option>
                <option className="bg-white text-[#1E293B]">SYSTEM COMPACT</option>
              </select>
            </div>

            {/* Font (Center) */}
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md h-[52px] flex-1 max-w-[200px]">
              <span className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest whitespace-nowrap">Font</span>
              <select 
                className="px-4 py-2 rounded-xl border-none bg-white text-[#1E293B] !important text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 transition-all appearance-none cursor-pointer h-full w-full"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
              >
                <option className="bg-white text-[#1E293B]">Serif</option>
                <option className="bg-white text-[#1E293B]">Open Sans</option>
                <option className="bg-white text-[#1E293B]">Roboto</option>
                <option className="bg-white text-[#1E293B]">Times New Roman</option>
              </select>
            </div>

            {/* Print (Right) */}
            <button 
              onClick={() => window.print()}
              className="btn-primary flex items-center justify-center gap-3 px-8 h-[52px] text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(45,212,191,0.2)] whitespace-nowrap flex-1 max-w-[240px]"
            >
              <Printer className="w-4 h-4" />
              Engage Print Engine
            </button>
          </div>
        </div>
      </div>

      {/* RE-ENGINEERED DMC ENGINE: SINGLE-PAGE A4 LOCK */}
      <DMCDisplay 
        student={{
          ...student,
          marks: marksArray,
          totalMarks: totalObtained,
          percentage: percentage
        }}
        teacher={teacher}
        style={styleMapped}
        fontFamily={fontFamilyMapped}
        language={language}
        isPrintPreview={isPrinting}
      />

      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100%;
            overflow: hidden !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide UI Chrome */
          .print\:hidden {
            display: none !important;
          }

          /* Force Pure Black Text and White Background for the Card */
          #dmc-main-container {
            background: white !important;
            color: black !important;
            border-color: black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
          }

          #dmc-main-container *, 
          #dmc-main-container div, 
          #dmc-main-container p, 
          #dmc-main-container span, 
          #dmc-main-container h1, 
          #dmc-main-container h2, 
          #dmc-main-container h3 {
            color: black !important;
            background-color: transparent !important;
            background-image: none !important;
            border-color: rgba(0,0,0,0.1) !important;
            text-shadow: none !important;
          }

          /* Watermark Opacity Tuning (10%) */
          #dmc-main-container img[alt="GPS Kunda Logo"] {
            opacity: 0.10 !important;
            filter: grayscale(100%) !important;
          }

          /* Table Border Logic (0.5pt Solid Black) */
          #dmc-main-container .border,
          #dmc-main-container .border-white\/5,
          #dmc-main-container .border-white\/10 {
            border: 0.5pt solid black !important;
          }

          /* Force Promoted Badge to be visible but clean */
          .promoted-badge {
            background: white !important;
            border: 1pt solid black !important;
            color: black !important;
          }

          /* Signatures Bottom Fix */
          .mt-auto {
            margin-top: auto !important;
          }
          
          /* Prevent any overflow issues */
          * {
            overflow: visible !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
