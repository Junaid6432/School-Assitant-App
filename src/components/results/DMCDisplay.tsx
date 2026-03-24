"use client";

import { useEffect, useState } from "react";
import { cn, getAcademicSession, getShortAcademicSession } from "@/lib/utils";
import { SUBJECTS } from "@/types";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type DMCStyle = "govt" | "executive" | "classic" | "minimal" | "compact";

interface DMCDisplayProps {
  student: any;
  teacher: any;
  style: DMCStyle;
  fontFamily?: string;
  language?: string;
  isPrintPreview?: boolean;
}

export function DMCDisplay({ student, teacher, style, fontFamily, language = "English", isPrintPreview = false }: DMCDisplayProps) {
  const [academicSession, setAcademicSession] = useState("");
  const [shortSession, setShortSession] = useState("");

  useEffect(() => {
    setAcademicSession(getAcademicSession());
    setShortSession(getShortAcademicSession());
  }, []);

  // Combine standard font with Urdu Nastaleeq if language is Urdu
  const effectiveFont = language === "Urdu" 
    ? `'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', ${fontFamily || 'serif'}` 
    : fontFamily;

  // Map simplified style names to formal template names used in Single View logic
  const templateMap: Record<DMCStyle, string> = {
    govt: "GOVT OFFICIAL GREEN",
    executive: "Executive Premium",
    classic: "BOARD CLASSIC",
    minimal: "Clean Minimal",
    compact: "SYSTEM COMPACT",
  };

  const template = templateMap[style];

  // Logic Sync: 33 marks rule
  const marks = student.marks || {};
  const isPassAll = SUBJECTS.every(sub => (marks[sub] || 0) >= 33);
  
  const percentage = parseFloat(String(student.percentage)) || 0;
  const totalObtained = student.totalMarks || 0;
  const maxGrandTotal = SUBJECTS.length * 100;

  const getGrade = (score: number) => {
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    if (score >= 33) return "E";
    return "F";
  };

  const currentGrade = getGrade(percentage);

  return (
    <div 
      id="dmc-main-container"
      suppressHydrationWarning
      className={cn(
        "dmc-card mx-auto relative overflow-hidden break-inside-avoid transition-all duration-700",
        "w-[210mm] h-[296mm] max-h-[296mm] min-w-[210mm]", // Strict A4 Height Lock
        "print:w-[210mm] print:h-[296mm] print:m-0 print:shadow-none print:scale-100 print:bg-white print:text-black",
        !isPrintPreview ? "shadow-[0_0_100px_rgba(0,0,0,0.5)] my-8 glass-panel border-white/5 bg-[#0f172a]/80 text-white" : "bg-white text-black shadow-none",
        style === "executive" && !isPrintPreview ? "border-[12px] border-double border-white/5" : style === "executive" ? "border-[12px] border-double border-black" : "",
        style === "classic" && "border-[2px] border-slate-950 p-1 bg-[#fffdfa]",
        style === "minimal" && "p-4",
        style === "govt" && "border-t-[16px] border-emerald-900",
        style === "compact" && "border-[1px] border-slate-200 grayscale",
        "relative overflow-hidden" // Added overflow: hidden and position: relative for watermark fix
      )}
      style={{ fontFamily: effectiveFont || "inherit" }}
    >
      <div className={cn(
        "h-full relative flex flex-col p-10 print:p-8 justify-between",
        style === "classic" && "border-[1px] border-slate-900 p-12",
        style === "executive" && !isPrintPreview ? "bg-transparent" : "bg-white",
        style === "govt" && "bg-emerald-50/10"
      )}>
        {/* MEGA-WATERMARK (GPS Kunda Logo) */}
        <div 
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            width: '115%',
            opacity: 0.04,
            zIndex: -1,
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            pointerEvents: 'none'
          }}
        >
          <img 
            src="/logo.png" 
            alt="GPS Kunda Logo" 
            className="w-full h-auto"
          />
        </div>

        {/* Template-Driven Header */}
        <div className="relative z-10">
          {style === "executive" && (
            <div className="text-center mb-6">
              <div className={cn("w-full h-1 mb-6", !isPrintPreview ? "bg-[#2dd4bf]/50 shadow-[0_0_15px_#2dd4bf]" : "bg-[#1e3a8a]")} />
              <h1 className={cn(
                "text-[24px] font-black tracking-tighter uppercase leading-none italic whitespace-nowrap",
                !isPrintPreview ? "text-white" : "text-[#1e3a8a] print:text-black"
              )}>
                Govt Primary School No.4 Kunda
              </h1>
              <p className={cn(
                "mt-3 text-[10px] font-black uppercase tracking-[0.4em]",
                !isPrintPreview ? "neon-teal" : "text-black print:text-black"
              )} suppressHydrationWarning>
                DETAILED MARKS CERTIFICATE ◆ SESSION {academicSession || "..."}
              </p>
            </div>
          )}
          
          {style === "classic" && (
            <div className="text-center mb-6 border-b-2 border-double border-slate-900 pb-4">
              <h1 className="text-[24px] font-serif font-black tracking-tight text-slate-900 uppercase underline decoration-double underline-offset-8 whitespace-nowrap">
                GP School No.4 Kunda
              </h1>
              <p className="mt-8 text-sm font-serif font-bold italic text-slate-700" suppressHydrationWarning>
                Annual Secondary Examination Transcript – {shortSession ? shortSession.replace(" – ", "/") : "..."}
              </p>
            </div>
          )}

          {style === "govt" && (
            <div className="dmc-header text-center mb-6 bg-emerald-900 py-4 rounded-b-[40px] shadow-lg -mx-10 md:-mx-10 -mt-10 print:-mx-8 print:-mt-8">
              <h1 className="text-[24px] font-black text-white uppercase tracking-widest px-4 whitespace-nowrap">Govt Primary School No.4 Kunda</h1>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-[0.6em] mt-2 italic" suppressHydrationWarning>
                Official Academic Transcript ◆ {academicSession ? academicSession.replace(" – ", "-") : "..."}
              </p>
            </div>
          )}

          {/* Student Profile (Compact 2x2 Grid) */}
          <div className={cn(
            "grid grid-cols-2 gap-x-12 gap-y-3 mb-4 mt-[-10px] relative z-10 break-inside-avoid",
            style === "classic" && "border-2 border-slate-900 p-6 bg-white",
            style === "executive" && !isPrintPreview ? "bg-white/5 p-6 rounded-[2rem] border border-white/10" : "bg-slate-50/50 p-5 rounded-3xl border border-slate-100"
          )}>
            <div className="space-y-0">
              <p className={cn("text-[7px] font-black uppercase tracking-[0.2em] leading-none", !isPrintPreview ? "text-slate-500" : "text-black")}>Student Name</p>
              <p className={cn("text-base font-black uppercase tracking-tight italic truncate leading-none mt-2.5", !isPrintPreview ? "text-white" : "text-black")}>{student?.name || student?.studentName}</p>
            </div>
            <div className="space-y-0">
              <p className={cn("text-[7px] font-black uppercase tracking-[0.2em] leading-none", !isPrintPreview ? "text-slate-500" : "text-black")}>Father/Guardian Name</p>
              <p className={cn("text-base font-black uppercase tracking-tight italic truncate leading-none mt-2.5", !isPrintPreview ? "text-white" : "text-black")}>{student?.parentName || student?.fatherName || "N/A"}</p>
            </div>
            <div className="space-y-0">
              <p className={cn("text-[7px] font-black uppercase tracking-[0.2em] leading-none", !isPrintPreview ? "text-slate-500" : "text-black")}>Enrolment Roll No.</p>
              <p className={cn("text-base font-black tracking-tight leading-none mt-2.5", !isPrintPreview ? "text-[#2dd4bf]" : "text-black")}>#{student?.rollNumber || student?.rollNo}</p>
            </div>
            <div className="space-y-0">
              <p className={cn("text-[7px] font-black uppercase tracking-[0.2em] leading-none", !isPrintPreview ? "text-slate-500" : "text-black")}>Academic Grade/Level</p>
              <p className={cn("text-base font-black uppercase tracking-tight leading-none mt-2.5", !isPrintPreview ? "text-white" : "text-black")}>{teacher?.assignedClass}</p>
            </div>
          </div>
        </div>

        {/* Analyst Transcript Engine : Subject Performance Bars */}
        <div className="flex-grow relative z-10 py-4">
          <div className="space-y-2">
            <div className={cn(
              "grid grid-cols-4 gap-4 px-6 pb-3 border-b text-[10px] font-black uppercase tracking-widest",
              !isPrintPreview ? "border-white/5 text-slate-500" : "border-black text-black"
            )}>
              <div className="italic">Course Title</div>
              <div className="text-center">Total Marks</div>
              <div className="text-center">Obtained Marks</div>
              <div className="text-center">Grade</div>
            </div>
            
            <div className="space-y-3 mt-4">
              {SUBJECTS.map((subject) => {
                const score = marks[subject] || 0;
                const grade = getGrade(score);
                
                return (
                  <div key={subject} className={cn(
                    "grid grid-cols-4 gap-4 items-center px-6 py-1 rounded-xl border transition-all duration-300",
                    !isPrintPreview ? "bg-white/5 border-white/5 shadow-none" : "bg-white border-slate-200 shadow-none"
                  )}>
                    <div className={cn("font-black uppercase tracking-tight text-[10px] italic truncate whitespace-nowrap", !isPrintPreview ? "text-white" : "text-black")}>
                      {subject}
                    </div>
                    
                    <div className={cn("text-center text-sm font-black italic", !isPrintPreview ? "text-slate-500" : "text-black")}>
                      100
                    </div>

                    <div className={cn("text-center text-sm font-black tabular-nums italic", !isPrintPreview ? "text-[#2dd4bf]" : "text-black")}>
                      {Math.floor(score)}
                    </div>

                    <div className="text-center">
                       <span className={cn(
                          "text-sm font-black italic tracking-widest",
                          !isPrintPreview 
                            ? ((grade.startsWith("A") || grade === "B") ? "text-[#2dd4bf]" : grade === "F" ? "text-[#fb7185]" : "text-white")
                            : "text-black"
                       )}>
                         {grade}
                       </span>
                    </div>
                  </div>
                );
              })}

              {/* GRAND TOTAL ROW (PIXEL PERFECT RE-STRUCTURE) */}
              <div className={cn(
                "grid grid-cols-4 gap-4 items-center px-6 py-3 rounded-xl border-2 mt-4 bg-[#F8FAFC]",
                "border-slate-800 text-black"
              )}>
                <div className="font-black uppercase tracking-tighter text-sm italic">
                  GRAND TOTAL
                </div>
                
                <div className="text-center text-lg font-black italic">
                  {maxGrandTotal}
                </div>

                <div className="text-center text-lg font-black tabular-nums italic text-[#064e3b]">
                  {Math.floor(totalObtained)} / {maxGrandTotal}
                </div>

                <div className="text-center">
                   <span className={cn(
                      "text-lg font-black italic tracking-widest",
                      isPassAll ? "text-[#064e3b]" : "text-red-600"
                   )}>
                     {isPassAll ? `PASS / ${currentGrade}` : `FAIL / ${currentGrade}`}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyst Result Dashboard Footer: Circular Progress & Neon Badges */}
        <div className="relative z-10 pt-1 mt-[-40px] space-y-3">
          <div className="grid grid-cols-2 gap-4 items-stretch">
            
            {/* Circular Progress Data Module (Compact) */}
            <div className={cn(
              "p-4 rounded-3xl border relative overflow-hidden",
              !isPrintPreview ? "bg-[#0f172a] border-white/10 shadow-2xl" : "bg-white/60 border-slate-200 shadow-none"
            )}>
               <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 pointer-events-none opacity-20", !isPrintPreview ? "bg-[#2dd4bf] blur-[60px]" : "bg-[#1e3a8a]")} />
               
               <div className="space-y-1 relative z-10">
                 <div className="space-y-0">
                   <p className={cn("text-[7px] font-black uppercase tracking-[0.3em] leading-none mb-1", !isPrintPreview ? "text-slate-500" : "text-black")}>Grand Total</p>
                   <div className="flex items-baseline gap-1">
                     <p className={cn("text-3xl font-black tracking-tighter tabular-nums italic leading-none", !isPrintPreview ? "text-white" : "text-black")}>{Math.floor(totalObtained)}</p>
                     <p className={cn("text-[14px] font-black uppercase tracking-widest leading-none", !isPrintPreview ? "text-slate-500" : "text-black")}>/ {maxGrandTotal}</p>
                   </div>
                 </div>

                 <div className="space-y-0">
                   <p className={cn("text-[7px] font-black uppercase tracking-[0.3em] leading-none mb-1", !isPrintPreview ? "text-slate-500" : "text-black")}>Aggregate Percent</p>
                   <div className="flex items-baseline gap-1">
                     <p className={cn("text-3xl font-black tracking-tighter tabular-nums italic leading-none", !isPrintPreview ? "text-[#2dd4bf]" : "text-black")}>{Math.floor(percentage)}%</p>
                   </div>
                 </div>

                 <p className={cn("text-[7px] font-black uppercase tracking-[0.4em] underline decoration-dotted underline-offset-4 leading-none", 
                   !isPrintPreview ? "text-slate-500" : "text-black")}>
                   Academic Status Verified
                 </p>
               </div>
            </div>

              {/* Neon Glow PASS/FAIL Badge (PROMOTED RESTORATION - Compact) */}
              <div className={cn(
                "flex items-center justify-center gap-4 rounded-3xl border relative overflow-hidden isolate h-full min-h-[100px]",
                isPassAll 
                  ? (!isPrintPreview ? "bg-[#2dd4bf] border-[#2dd4bf] text-[#0f172a] shadow-2xl" : "promoted-badge bg-white border-black text-black shadow-none")
                  : (!isPrintPreview ? "bg-[#fb7185] border-[#fb7185] text-[#0f172a] shadow-2xl" : "bg-white border-black text-black shadow-none")
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                  isPassAll 
                    ? (!isPrintPreview ? "bg-white/20 border-white/40" : "border-black")
                    : "border-black"
                )}>
                  {isPassAll ? <CheckCircle2 className="w-8 h-8" strokeWidth={3} /> : <XCircle className="w-8 h-8" strokeWidth={3} />}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">
                    {isPassAll ? "PROMOTED" : "RETAINED"}
                  </h2>
                  <p className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-60">Status Validation Check</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Signature Lines - Moved to Bottom Corners */}
          <div className="flex justify-between items-end pt-12 pb-4">
             <div className="space-y-4 text-center min-w-[180px]">
                <div className={cn("w-full h-[1px]", !isPrintPreview ? "bg-white/20" : "bg-black")} />
                <div className="space-y-1">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", !isPrintPreview ? "text-white" : "text-black")}>Class Teacher</p>
                  <p className={cn("text-[7px] font-bold uppercase tracking-tighter italic", !isPrintPreview ? "text-slate-500" : "text-black")}>Official Signature & Stamp</p>
                </div>
             </div>
             <div className="space-y-4 text-center min-w-[180px]">
                <div className={cn("w-full h-[1px]", !isPrintPreview ? "bg-white/20" : "bg-black")} />
                <div className="space-y-1">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", !isPrintPreview ? "text-white" : "text-black")}>Head Teacher</p>
                  <p className={cn("text-[7px] font-bold uppercase tracking-tighter italic", !isPrintPreview ? "text-slate-500" : "text-black")}>Seal of Authority</p>
                </div>
             </div>
          </div>

          <div className="pt-2 border-t border-white/5 text-center">
             <p className={cn("text-[8px] font-black uppercase tracking-[0.5em] m-0 p-0", !isPrintPreview ? "text-slate-700" : "text-black")} suppressHydrationWarning>
               Official DMC ID: PROTOCOL-{student?.id ? String(student.id).slice(-8).toUpperCase() : "..."} ◆ GPS Kunda Intelligence Hub
             </p>
          </div>
        </div>
      </div>
  );
}

function InfoItem({ label, value, className, compact }: any) {
  return (
    <div className={cn("space-y-0.5", compact && "space-y-0")}>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight leading-none">{label}</p>
      <p className={cn("font-black text-slate-900 truncate leading-tight", compact ? "text-xs" : "text-sm", className)}>{value}</p>
    </div>
  );
}
