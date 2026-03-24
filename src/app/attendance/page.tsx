"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Save, 
  MessageSquare, 
  UserCheck, 
  UserX, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot,
  where
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";

export default function AttendancePage() {
  const { teacher, loading: authLoading } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Students for the teacher's assigned class
  useEffect(() => {
    if (authLoading || !teacher?.assignedClass) return;

    const q = query(
      collection(db, "students"), 
      where("emisCode", "==", teacher.emisCode),
      where("teacherId", "==", teacher.teacherId),
      orderBy("rollNumber", "asc")
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setIsLoading(false);
    });
    return () => unsub();
  }, [teacher, authLoading]);

  // 2. Fetch History for selected date & class
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!date || !teacher?.assignedClass) return;
      setIsLoading(true);
      
      try {
        const attendanceId = `${teacher.teacherId}_${date}`;
        const attRef = doc(db, "attendance", attendanceId);
        const attSnap = await getDoc(attRef);
        
        if (attSnap.exists()) {
          const history = attSnap.data().records || {};
          const newAttendance: Record<string, string> = {};
          Object.entries(history).forEach(([studentId, data]: [string, any]) => {
            newAttendance[studentId] = data.status;
          });
          setAttendance(newAttendance);
        } else {
          setAttendance({});
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && teacher?.assignedClass) {
      fetchAttendanceHistory();
    }
  }, [date, teacher, authLoading]);

  const handleToggle = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const newAttendance: Record<string, string> = {};
    students.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = async () => {
    if (!date || !teacher?.assignedClass) return;
    setIsSaving(true);
    
    try {
      const records: Record<string, any> = {};
      students.forEach(s => {
        records[s.id] = {
          studentName: s.name,
          rollNumber: s.rollNumber,
          status: attendance[s.id] || "Absent",
          timestamp: new Date().toISOString()
        };
      });

      const attendanceId = `${teacher.teacherId}_${date}`;
      await setDoc(doc(db, "attendance", attendanceId), {
        attendanceId,
        teacherId: teacher.teacherId,
        emisCode: teacher.emisCode, // Added EMIS Code
        class: teacher.assignedClass,
        date,
        records,
        updatedAt: new Date().toISOString(),
        totalStudents: students.length,
        presentCount: Object.values(attendance).filter(s => s === "Present").length,
        absentCount: students.length - Object.values(attendance).filter(s => s === "Present").length
      }, { merge: true });

      alert("Attendance saved successfully! ✅");
    } catch (error: any) {
      console.error("Save Error:", error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const sendWhatsApp = (student: any) => {
    const parentName = student.parentName || "والد صاحب";
    const studentName = student.name;
    const message = `السلام علیکم ${parentName} صاحب،\n\nآپ کے بچے/بچی *${studentName}* آج سکول میں غیر حاضر (Absent) ہیں۔ 🚫\n\nبرائے مہربانی اس کی وجہ سے آگاہ کریں۔\n\nشکریہ! 🎓`;
    window.open(`https://wa.me/${student.parentWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6">
      <PageHeader 
        title="Attendance Analytics"
        description={`${teacher?.assignedClass} • ${new Date(date).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
            <CalendarIcon className="ml-3 w-5 h-5 neon-teal" />
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-sm font-black uppercase tracking-widest text-white pr-4 cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        }
      />

      <div className="flex flex-wrap gap-4 items-center">
        <button 
          onClick={() => markAll("Present")}
          className="px-6 py-3 rounded-2xl bg-[#2dd4bf]/10 text-[#2dd4bf] text-[10px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/20 transition-all border border-[#2dd4bf]/20 flex items-center gap-3 shadow-[0_0_15px_rgba(45,212,191,0.1)]"
        >
          <UserCheck className="w-4 h-4" />
          Protocol: Bulk Present
        </button>
        <button 
          onClick={() => markAll("Absent")}
          className="px-6 py-3 rounded-2xl bg-[#fb7185]/10 text-[#fb7185] text-[10px] font-black uppercase tracking-widest hover:bg-[#fb7185]/20 transition-all border border-[#fb7185]/20 flex items-center gap-3 shadow-[0_0_15px_rgba(251,113,133,0.1)]"
        >
          <UserX className="w-4 h-4" />
          Protocol: Bulk Absent
        </button>
      </div>

      <div className="glass-card overflow-hidden shadow-2xl min-h-[500px] border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent" />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-6">
            <Loader2 className="w-12 h-12 animate-spin neon-teal" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">Synchronizing Sheet...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-6">
            <AlertCircle className="w-16 h-16 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs">No personnel detected in <span className="neon-teal">{teacher?.assignedClass}</span>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* ── Desktop ghost-table ───────────────────────────── */}
            <table className="hidden md:table w-full text-left ghost-table">
              <thead>
                <tr>
                  <th className="px-8 py-6">Personnel ID</th>
                  <th className="px-8 py-6">Subject Name</th>
                  <th className="px-8 py-6 text-center">Status Control</th>
                  <th className="px-8 py-6 text-right">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 text-sm font-black text-slate-500 italic tracking-tighter">#{student.rollNumber}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-white text-base tracking-tight italic uppercase">{student.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3 bg-white/[0.02] p-1.5 rounded-2xl w-fit mx-auto border border-white/5">
                        <button
                          onClick={() => handleToggle(student.id, "Present")}
                          className={cn(
                            "px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            attendance[student.id] === "Present" 
                              ? "bg-[#2dd4bf]/20 text-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.3)] border border-[#2dd4bf]/30 scale-105" 
                              : "text-slate-500 hover:text-white"
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Present
                        </button>
                        <button
                          onClick={() => handleToggle(student.id, "Absent")}
                          className={cn(
                            "px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            attendance[student.id] === "Absent" 
                              ? "bg-[#fb7185]/20 text-[#fb7185] shadow-[0_0_15px_rgba(251,113,133,0.3)] border border-[#fb7185]/30 scale-105" 
                              : "text-slate-500 hover:text-white"
                          )}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Mark Absent
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {attendance[student.id] === "Absent" && (
                          <button 
                            onClick={() => sendWhatsApp(student)}
                            className="px-5 py-2.5 bg-[#2dd4bf]/10 text-[#2dd4bf] rounded-xl hover:bg-[#2dd4bf]/20 transition-all border border-[#2dd4bf]/20 shadow-lg flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                            title="Signal Absence to Proxy"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Alert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Mobile Cards (using the updated AttendanceCard) ────── */}
            <div className="md:hidden space-y-4 p-6">
              {students.map((student) => (
                <AttendanceCard
                  key={student.id}
                  student={student}
                  status={attendance[student.id] || ""}
                  onToggle={handleToggle}
                  onWhatsApp={sendWhatsApp}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-8 pb-12">
        <button 
          onClick={handleSaveAttendance}
          disabled={isSaving || students.length === 0}
          className={cn(
            "btn-primary flex items-center gap-4 px-12 py-5 text-xl tracking-tighter shadow-[0_20px_50px_rgba(45,212,191,0.3)] transition-all",
            (isSaving || students.length === 0) ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-2 active:scale-95"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <Save className="w-7 h-7" />
          )}
          <span className="font-black italic uppercase italic">Commit Attendance</span>
        </button>
      </div>
    </div>
  );
}
