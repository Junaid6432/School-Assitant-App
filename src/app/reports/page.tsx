"use client";

import { useState, useEffect } from "react";
import { FileText, Search, User, Award, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import WhatsAppShareBtn from "@/components/WhatsAppShareBtn";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ReportsPage() {
  const { teacher, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [finalExamsData, setFinalExamsData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Students and Results
  useEffect(() => {
    if (authLoading || !teacher?.teacherId) return;

    // Students Listener
    const studentsQuery = query(
      collection(db, "students"),
      where("teacherId", "==", teacher.teacherId)
    );
    
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    // Results Listener
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
      setIsLoading(false);
    });

    return () => {
      unsubStudents();
      unsubExams();
    };
  }, [teacher, authLoading]);

  const mergedStudents = students.map(student => {
    // Composite ID derived from teacherId and studentId as per Chunk 3
    const compositeId = `${teacher?.teacherId}_${student.id}`;
    const exam = finalExamsData[compositeId];
    return {
      ...student,
      score: exam ? exam.percentage : null, // Use null for pending
    };
  });

  const filteredStudents = mergedStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.includes(searchTerm)
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading report cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6">
      <PageHeader 
        title="Record Protocols"
        description={`Analyzing academic performance for ${teacher?.assignedClass}.`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-32 text-center">
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">No records detected in search space.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPending = student.score === null;
            const isElite = student.score >= 80;
            const isStandard = student.score >= 33;
            const statusColor = isPending ? "#64748b" : isElite ? "#2dd4bf" : isStandard ? "#fde047" : "#fb7185";

            return (
              <div key={student.id} className="glass-card group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden border-white/5 flex flex-col h-full">
                <div 
                  className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: statusColor }}
                />
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 transition-colors group-hover:border-[#2dd4bf]/20 group-hover:text-[#2dd4bf] group-hover:bg-[#2dd4bf]/5">
                        <User className="w-7 h-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-white tracking-tighter italic uppercase truncate max-w-[140px]">{student.name}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">ID: {student.rollNumber}</p>
                      </div>
                    </div>
                    {isElite && (
                      <div className="bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 p-2 rounded-xl text-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                        <Award className="w-5 h-5 font-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between mb-10 mt-auto">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Performance Quotient</p>
                      {isPending ? (
                        <span className="text-sm font-black text-slate-500 italic uppercase">Records Pending</span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-black italic tracking-tighter" style={{ color: statusColor }}>
                            {student.score}
                          </span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Security Status</p>
                      <p className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: statusColor }}>
                        {isPending ? "STANDBY" : student.score >= 33 ? "SECURE" : "FAILED"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link 
                      href={`/reports/dmc?id=${student.id}`}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/30 hover:text-[#2dd4bf] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg group/btn"
                    >
                      <FileText className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      Initialize DMC
                    </Link>
                    
                    {student.parentWhatsApp && (
                      <div className="pt-1">
                        <WhatsAppShareBtn 
                          student={student} 
                          teacher={teacher} 
                          examData={finalExamsData[`${teacher?.teacherId}_${student.id}`] || {}} 
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {!isPending && (
                  <div className="h-1.5 w-full bg-white/5 mt-auto relative overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      style={{ 
                        width: `${student.score}%`,
                        backgroundColor: statusColor,
                        boxShadow: `0 0 15px ${statusColor}`
                      }} 
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
