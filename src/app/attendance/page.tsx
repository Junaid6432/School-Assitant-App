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
    <div className="space-y-10 py-6 relative">
      <div className="bg-glow-blue fixed inset-0 z-[-1] pointer-events-none" />
      <PageHeader 
        title="Attendance Analytics"
        description={`${teacher?.assignedClass} • ${new Date(date).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-md">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-sm font-semibold tracking-wide text-foreground pr-2 cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        }
      />

      <div className="flex flex-wrap gap-4 items-center">
        <button 
          onClick={() => markAll("Present")}
          className="btn-outline flex items-center gap-2 text-success hover:bg-success/10 hover:border-success/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        >
          <UserCheck className="w-4 h-4" />
          Mark All Present
        </button>
        <button 
          onClick={() => markAll("Absent")}
          className="btn-outline flex items-center gap-2 text-danger hover:bg-danger/10 hover:border-danger/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <UserX className="w-4 h-4" />
          Mark All Absent
        </button>
      </div>

      <div className="glass-card overflow-hidden shadow-xl min-h-[500px] border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="font-semibold uppercase tracking-wider text-xs">Loading roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
            <AlertCircle className="w-12 h-12 opacity-20" />
            <p className="font-semibold uppercase tracking-wider text-xs">No students found in <span className="text-primary">{teacher?.assignedClass}</span>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* ── Desktop ghost-table ───────────────────────────── */}
            <table className="hidden md:table w-full text-left ghost-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="text-sm font-semibold text-muted-foreground w-32">#{student.rollNumber}</td>
                    <td>
                      <p className="font-medium text-foreground text-sm tracking-tight">{student.name}</p>
                    </td>
                    <td className="w-64">
                      <div className="flex items-center justify-center gap-2 bg-white/[0.02] p-1 rounded-xl w-fit mx-auto border border-white/5">
                        <button
                          onClick={() => handleToggle(student.id, "Present")}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold",
                            attendance[student.id] === "Present" 
                              ? "bg-success/20 text-success shadow-[0_0_12px_rgba(34,197,94,0.2)] border border-success/30" 
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Present
                        </button>
                        <button
                          onClick={() => handleToggle(student.id, "Absent")}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold",
                            attendance[student.id] === "Absent" 
                              ? "bg-danger/20 text-danger shadow-[0_0_12px_rgba(239,68,68,0.2)] border border-danger/30" 
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="text-right w-32">
                      <div className="flex items-center justify-end">
                        {attendance[student.id] === "Absent" && (
                          <button 
                            onClick={() => sendWhatsApp(student)}
                            className="px-4 py-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-all border border-danger/20 flex items-center gap-2 text-xs font-medium"
                            title="Message Parent"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
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
            "btn-premium px-8 py-3",
            (isSaving || students.length === 0) ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          <span>Commit Attendance</span>
        </button>
      </div>
    </div>
  );
}
