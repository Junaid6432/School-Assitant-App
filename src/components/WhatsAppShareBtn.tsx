"use client";

import { useState, useRef } from "react";
import { MessageCircle, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { cn, getAcademicSession, getShortAcademicSession } from "@/lib/utils";
import { SUBJECTS } from "@/types";

interface WhatsAppShareBtnProps {
  student: any;
  teacher: any;
  examData: any;
}

export default function WhatsAppShareBtn({ student, teacher, examData }: WhatsAppShareBtnProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dmcRef = useRef<HTMLDivElement>(null);
  const academicSession = getAcademicSession();
  const shortSession = getShortAcademicSession();


  const getGrade = (score: number) => {
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 33) return "D";
    return "F";
  };

  const marksArray = examData?.marks || {};
  const totalObtained = examData?.totalObtained || 0;
  const percentage = examData?.percentage || 0;
  const maxGrandTotal = SUBJECTS.length * 100;

  const handleShare = async () => {
    if (!dmcRef.current) return;
    
    setIsGenerating(true);
    try {
      // 1. Generate Image
      const dataUrl = await toPng(dmcRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // 2. Convert to Blob for Clipboard
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // 3. Copy to Clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        const phone = student?.parentWhatsApp || student?.father_mobile || "";
        const isPending = !examData || Object.keys(examData).length === 0;
        const waMessageTemplate = isPending 
          ? `Assalam-o-Alaikum! ${student.name} walad ${student.fatherName || student.parentName} ka result (DMC) abhi process mein hai. Jald hi aap se share kiya jayega.`
          : `Assalam-o-Alaikum! ${student.name} walad ${student.fatherName || student.parentName} ka salana result (DMC).

Total Marks: ${maxGrandTotal}
Obtained Marks: ${Math.floor(totalObtained)}
Grade: ${getGrade(percentage)}`;

        const message = encodeURIComponent(waMessageTemplate);
        
        setTimeout(() => {
          window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
          setIsGenerating(false);
          setTimeout(() => setIsCopied(false), 2000);
        }, 1000);
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (err) {
      console.error("Failed to generate/copy DMC:", err);
      setIsGenerating(false);
      alert("Failed to copy DMC image. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={cn(
          "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl",
          isCopied 
            ? "bg-[#2dd4bf] text-[#0f172a] shadow-[0_0_20px_#2dd4bf]" 
            : "bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20 hover:bg-[#2dd4bf]/20",
          isGenerating && "opacity-50 cursor-not-allowed scale-95"
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
        ) : isCopied ? (
          <Check className="w-4 h-4" strokeWidth={3} />
        ) : (
          <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
        )}
        {isGenerating ? "Processing Protocol..." : isCopied ? "Transmission Ready" : "Dispatch via WhatsApp"}
      </button>

      {/* Hidden DMC for Image Generation */}
      <div className="fixed -left-[5000px] top-0 pointer-events-none">
        <div 
          ref={dmcRef}
          className="w-[210mm] h-[296mm] bg-white p-10 flex flex-col justify-between font-serif relative border-[12px] border-double border-slate-200"
          style={{ boxSizing: "border-box" }}
        >
          {/* Executive Top Border Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1e3a8a]" />

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] opacity-[0.2]">
            <img src="/logo.png" className="w-full grayscale" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-full h-1 bg-[#1e3a8a] mb-6" />
              <h1 className="text-4xl font-black tracking-tighter text-[#1e3a8a] uppercase leading-none">
                Govt Primary School No.4 Kunda
              </h1>
              <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                DETAILED MARKS CERTIFICATE ◆ SESSION {academicSession}
              </p>
            </div>

            {/* Profile */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Student Legal Name</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{student?.name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Father/Guardian Name</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{student?.fatherName || student?.parentName}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Enrolment Roll No.</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">#{student?.rollNo || student?.rollNumber}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Academic Grade/Level</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{teacher?.assignedClass}</p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-grow py-4">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e3a8a] text-white text-[10px] font-black uppercase tracking-widest">
                      <th className="py-4 px-8 border-r border-white/10 uppercase">Course Title</th>
                      <th className="py-4 px-8 text-center border-r border-white/10">TOTAL</th>
                      <th className="py-4 px-8 text-center border-r border-white/10">OBTAINED</th>
                      <th className="py-4 px-8 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-black text-slate-700">
                    {SUBJECTS.map((subject, idx) => {
                      const score = marksArray[subject] || 0;
                      const grade = getGrade(score);
                      return (
                        <tr key={subject} className={cn(
                          "border-b border-slate-100",
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        )}>
                          <td className="py-2.5 px-8 border-r border-slate-100 font-black text-slate-900 uppercase">{subject}</td>
                          <td className="py-2.5 px-8 text-center border-r border-slate-100 text-slate-950 font-black text-sm">100</td>
                          <td className="py-2.5 px-8 text-center border-r border-slate-100 text-[#1e3a8a] text-sm font-black">{Math.floor(score)}</td>
                          <td className="py-2.5 px-8 text-center">
                            <span className={cn(
                              "text-base font-black",
                              grade.startsWith("A") ? "text-emerald-700" :
                              grade === "B" ? "text-blue-700" :
                              grade === "C" ? "text-orange-700" :
                              "text-rose-700"
                            )}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-900 bg-slate-50">
                    <tr className="text-sm font-black text-slate-900">
                      <td className="py-4 px-8 uppercase">Grand Total</td>
                      <td className="py-4 px-8 text-center border-r border-slate-200">{maxGrandTotal}</td>
                      <td className="py-4 px-8 text-center border-r border-slate-200 text-[#1e3a8a]">{Math.floor(totalObtained)}</td>
                      <td className="py-4 px-8 text-center italic opacity-40">PASS/FAIL</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col justify-between">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[8px] font-black uppercase opacity-40 mb-1">Total Assessment</p>
                      <p className="text-3xl font-black">{Math.floor(totalObtained)} <span className="text-xs opacity-20">/ {maxGrandTotal}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase opacity-40 mb-1">Percentage</p>
                      <p className="text-3xl font-black">{percentage}%</p>
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-white/5 rounded-full mb-4" />
                  <div className="flex justify-between items-center text-white/40">
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Academic Status Verified</span>
                    <span className="text-[7px] font-black uppercase tracking-widest">DMC Validated</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="p-4 bg-white border rounded-3xl flex items-center gap-4">
                    <Check className={cn(
                      "w-10 h-10 p-2 rounded-full",
                      percentage >= 33 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )} />
                    <h2 className={cn(
                      "text-3xl font-black tracking-tighter uppercase",
                      percentage >= 33 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {percentage >= 33 ? "PROMOTED" : "FAILED"}
                    </h2>
                  </div>
                  
                  <div className="flex justify-between items-end pt-4">
                    <div className="opacity-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300" />
                    </div>
                    <div className="flex flex-col items-center flex-grow pl-4">
                      <div className="w-full h-[1px] bg-slate-900/20 mb-1" />
                      <p className="text-[10px] font-black text-slate-900 uppercase">Head Teacher</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
                  Computer Generated Record ◆ Govt Primary School No.4 Kunda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
