"use client";

import { useState, useEffect } from "react";
import { Plus, Book, Save, MessageSquare, CheckCircle, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";

export default function HomeworkPage() {
  const { teacher, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [homeworkStatusMap, setHomeworkStatusMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Real Students (Isolated)
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

  // 2. Fetch Existing Homework Status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!teacher?.teacherId || !date || !subject) return;
      
      // Doc ID: ${user.uid}_${subject}_${date}
      const hwId = `${teacher.teacherId}_${subject}_${date}`;
      const docRef = doc(db, "homework", hwId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setHomeworkStatusMap(data.studentStatuses || {});
        setDetails(data.details || "");
      } else {
        setHomeworkStatusMap({});
        setDetails("");
      }
    };
    fetchStatus();
  }, [teacher, date, subject]);

  const setStatusForStudent = (studentId: string, newVal: string) => {
    setHomeworkStatusMap(prev => ({
      ...prev,
      [studentId]: newVal
    }));
  };

  const handleSaveHomework = async () => {
    if (!teacher?.teacherId) return;
    setIsSaving(true);
    
    try {
      // Doc ID format: ${user.uid}_${subject}_${date}
      const hwId = `${teacher.teacherId}_${subject}_${date}`;
      await setDoc(doc(db, "homework", hwId), {
        teacherId: teacher.teacherId,
        emisCode: teacher.emisCode, // Added EMIS Code for dashboard filtering
        subject,
        date,
        details,
        studentStatuses: homeworkStatusMap,
        updatedAt: Timestamp.now()
      });
      alert("Homework saved! ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to save homework.");
    } finally {
      setIsSaving(false);
    }
  };

  const sendHomeworkToAll = () => {
    if (!details) {
      alert("Please enter homework details first!");
      return;
    }
    // Exactly the Urdu format requested
    const message = `السلام علیکم محترم والدین، 🌟\n\nآج کا ہوم ورک:\n• مضمون: *${subject}*\n• تفصیل: ${details}\n\nبراہ کرم بچوں کو ہوم ورک مکمل کروائیں۔ 📚\n\nشکریہ! ✨`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendPendingAlert = (student: any) => {
    const parentName = student.parentName || "والدین";
    const studentName = student.name;
    // Exactly the Urdu format requested
    const message = `السلام علیکم ${parentName} صاحب،\n\nآپ کے بچے/بچی *${studentName}* نے آج *${subject}* کا ہوم ورک مکمل نہیں کیا ہے۔ 🚫\n\nبرائے مہربانی اس پر توجہ دیں تاکہ بچے کی پڑھائی کا حرج نہ ہو۔\n\nشکریہ! 🎓`;
    window.open(`https://wa.me/${student.parentWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading homework tracker...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen">
      <div className="bg-glow-purple fixed inset-0 z-[-1] pointer-events-none" />
      <PageHeader 
        title="Homework Tracker"
        description={`Assign and monitor daily home assignments for ${teacher?.assignedClass}.`}
        actions={
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-2 rounded-2xl shadow-sm backdrop-blur-sm">
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-sm font-semibold px-4 cursor-pointer text-foreground"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-white/5">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground tracking-tight">
              <Plus className="w-5 h-5 text-primary" />
              Assign New Task
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 block">Subject</label>
                <select 
                  className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-sm appearance-none cursor-pointer"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 block">Details (Urdu or English)</label>
                <textarea 
                  className="w-full p-3.5 h-32 rounded-xl border border-white/10 bg-white/[0.02] text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-muted-foreground/50 font-semibold text-sm"
                  placeholder="Enter homework details..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <button className="w-full p-3.5 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold opacity-50 cursor-not-allowed">
                <ImageIcon className="w-4 h-4" />
                Upload Image (SOON)
              </button>
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={sendHomeworkToAll}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-success/20 hover:bg-success/30 border border-success/30 text-success font-semibold rounded-xl transition-all shadow-sm active:scale-95 text-xs tracking-wide"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send to Parents
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card border-white/5 overflow-hidden min-h-[400px]">
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2 text-foreground tracking-tight">
                <Book className="w-5 h-5 text-primary" />
                {subject} Status
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</p>
            </div>
            
            <div className="divide-y divide-white/5">
              {students.length === 0 ? (
                <div className="p-20 text-center text-muted-foreground font-semibold text-sm">
                  No students found in this class.
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        #{student.rollNumber}
                      </div>
                      <p className="font-semibold text-sm text-foreground tracking-tight">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStatusForStudent(student.id, "Done")}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold border transition-all",
                          homeworkStatusMap[student.id] === "Done"
                            ? "bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                            : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                        )}
                      >
                        Done
                      </button>
                      <button
                        onClick={() => setStatusForStudent(student.id, "Not Done")}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold border transition-all",
                          homeworkStatusMap[student.id] === "Not Done"
                            ? "bg-danger/20 text-danger border-danger/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                            : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                        )}
                      >
                        Not Done
                      </button>
                      <button 
                        onClick={() => sendPendingAlert(student)}
                        className="ml-2 p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all border border-[#25D366]/20"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] text-right">
              <button 
                className="btn-premium inline-flex items-center gap-2"
                disabled={isSaving || students.length === 0}
                onClick={handleSaveHomework}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save {subject} Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SUBJECTS = [
  "English",
  "Math",
  "Urdu",
  "Pashto",
  "Islamiyat",
  "Social Study",
  "General Science"
];
