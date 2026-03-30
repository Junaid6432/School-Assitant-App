"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Search, 
  Printer, 
  ChevronDown, 
  Settings2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Type,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

import { DMCDisplay, DMCStyle } from "@/components/results/DMCDisplay";

const FONTS = [
  { name: "Serif (Official)", value: "serif", family: "var(--font-serif), 'Roboto Serif', serif" },
  { name: "Times New Roman", value: "times-new-roman", family: "'Times New Roman', Times, serif" },
  { name: "Georgia", value: "georgia", family: "Georgia, Times, 'Times New Roman', serif" },
  { name: "Open Sans", value: "open-sans", family: "var(--font-open-sans), sans-serif" },
  { name: "Roboto", value: "roboto", family: "var(--font-roboto), sans-serif" },
];

const STYLES = [
  { name: "GOVT OFFICIAL GREEN", value: "govt" },
  { name: "EXECUTIVE PREMIUM", value: "executive" },
  { name: "BOARD CLASSIC", value: "classic" },
  { name: "CLEAN MINIMAL", value: "minimal" },
  { name: "SYSTEM COMPACT", value: "compact" },
];

export default function BulkPreviewPage() {
  const router = useRouter();
  const { teacher, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [finalExamsData, setFinalExamsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Students");
  const [selectedStyle, setSelectedStyle] = useState<DMCStyle>("govt");
  const [selectedFont, setSelectedFont] = useState("serif");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading || !teacher?.assignedClass) return;

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
    });

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
    });

    return () => {
      unsubStudents();
      unsubExams();
    };
  }, [teacher, authLoading]);

  const mergedResults = students.map(student => {
    const compositeId = `${teacher?.teacherId}_${student.id}`;
    const saved = finalExamsData[compositeId];
    
    if (saved) {
      const marks = saved.marks || {};
      const subjectMarks = Object.values(marks) as number[];
      // Must have 7 subjects and all marks must be >= 33
      const isPassAll = SUBJECTS.length > 0 && 
                         SUBJECTS.every(sub => (marks[sub] || 0) >= 33);

      const percentage = saved.percentage || 0;
      const calculatedGrade = percentage >= 80 ? "A+" : 
                             percentage >= 70 ? "A" : 
                             percentage >= 60 ? "B" : 
                             percentage >= 50 ? "C" : 
                             percentage >= 40 ? "D" : "E";

      return {
        ...student,
        totalMarks: saved.totalObtained,
        percentage: percentage,
        grade: calculatedGrade,
        status: isPassAll ? "Pass" : "Fail",
        marks: marks
      };
    }
    return {
      ...student,
      totalMarks: 0,
      percentage: 0,
      grade: "E",
      status: "Fail", // Default to fail if no marks
      marks: {}
    };
  });

  const filteredResults = mergedResults.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.rollNumber?.includes(searchTerm);
    const matchesStatus = statusFilter === "All Students" || 
                         (statusFilter === "Pass Only" && student.status === "Pass") ||
                         (statusFilter === "Fail/Pending" && student.status === "Fail");
    return matchesSearch && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  const currentFontFamily = FONTS.find(f => f.value === selectedFont)?.family || "serif";

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Preparing DMCs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky Control Bar */}
      <div className="sticky top-0 z-[100] bg-slate-100/80 backdrop-blur-md px-2 md:px-8 py-3 md:py-6 print:hidden">
        <div className="max-w-[1200px] mx-auto bg-white p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-xl border border-slate-200/50 flex flex-col gap-4 md:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-6">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-inner"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="space-y-1">
                <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Bulk Preview</h3>
                <p className="text-base md:text-xl font-black text-slate-900 leading-none truncate max-w-[120px] md:max-w-none">{teacher?.assignedClass}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Template Style */}
              <div className="flex items-center gap-2 bg-slate-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-100">
                <span className="hidden sm:inline text-[10px] font-black text-slate-700 uppercase px-3">Style</span>
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as DMCStyle)}
                  className="p-2 md:p-2.5 rounded-lg md:rounded-xl border-2 border-slate-200 bg-white text-slate-950 text-[10px] md:text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all min-w-[120px] md:min-w-[160px]"
                >
                  {STYLES.map(s => (
                    <option key={s.value} value={s.value} className="bg-[#1e293b] text-white">{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Font Style */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-700 uppercase px-3">Font</span>
                <select 
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-950 text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all min-w-[120px]"
                >
                  {FONTS.map(f => (
                    <option key={f.value} value={f.value} className="bg-[#1e293b] text-white">{f.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 md:gap-3 bg-slate-900 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.2)] active:scale-95 border-b-2 md:border-b-4 border-slate-950"
              >
                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">PRINT DMCs</span>
                <span className="xs:hidden">PRINT</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 md:pt-4 border-t border-slate-50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800" />
              <input 
                type="text" 
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 md:py-2.5 rounded-xl border-2 border-slate-600 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[11px] md:text-xs font-bold placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center gap-2 bg-slate-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {filteredResults.length} Records
                </span>
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
              >
                <option>All Students</option>
                <option>Pass Only</option>
                <option>Fail/Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-blue-50 text-blue-700 px-4 py-2 text-[10px] font-bold text-center border-b border-blue-100 flex items-center justify-center gap-2">
        <HelpCircle className="w-3 h-3" />
        PINCH TO ZOOM FOR BETTER MOBILE VIEW
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 md:p-8 lg:p-12 print:p-0 flex justify-center preview-container overflow-hidden md:overflow-visible">
        <div className="w-full max-w-[900px] flex flex-col items-center space-y-12 md:space-y-12 print:space-y-0 print:max-w-none print:w-full print:block bulk-print-wrapper">
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center shadow-sm w-full">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">No Students Found</h2>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredResults.map((student) => (
              <div key={student.id} className="dmc-responsive-container w-full flex justify-center">
                <DMCDisplay 
                  student={student} 
                  teacher={teacher} 
                  style={selectedStyle} 
                  fontFamily={currentFontFamily}
                  isPrintPreview={true}
                />
              </div>
            ))
          )}
        </div>
      </div>
      <style jsx global>{`
        @media screen and (max-width: 850px) {
          .dmc-responsive-container {
            width: 100vw;
            padding: 0 10px;
            overflow: visible;
          }
          
          /* Scaler Logic for Mobile */
          .dmc-card {
            transform: scale(calc(100vw / 230mm));
            transform-origin: top center;
            margin-bottom: calc(-297mm * (1 - (100vw / 230mm))) !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
            border-radius: 8px !important;
          }

          /* Adjust preview-container to allow scaled content overflow */
          .preview-container {
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100% !important;
          }
        }

        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }
          /* Show only the print wrapper and its children */
          .bulk-print-wrapper, .bulk-print-wrapper * {
            visibility: visible !important;
          }
          .bulk-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            visibility: visible !important;
          }
          .dmc-card {
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            height: 297mm !important;
            width: 210mm !important;
            min-width: 210mm !important;
            transform: scale(1) !important;
            transform-origin: top left !important;
            overflow: hidden !important;
            position: relative !important;
            visibility: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          /* Ensure html/body don't scroll or add extra space */
          html, body {
            height: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
