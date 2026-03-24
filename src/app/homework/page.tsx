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
    <div className="space-y-6">
      <PageHeader 
        title="Homework Tracker"
        description={`Assign and monitor daily home assignments for ${teacher?.assignedClass}.`}
        actions={
          <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-sm font-medium px-4 cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-[#2dd4bf]" />
              Assign New Task
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Subject</label>
                <select 
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-[#2dd4bf]/20 outline-none transition-all"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Details (Urdu or English)</label>
                <textarea 
                  className="w-full p-3 h-32 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-[#2dd4bf]/20 outline-none transition-all resize-none placeholder:text-slate-600"
                  placeholder="Enter homework details..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <button className="w-full p-3 rounded-xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-bold opacity-50 cursor-not-allowed">
                <ImageIcon className="w-4 h-4" />
                Upload Image (SOON)
              </button>
              <div className="pt-2">
                <button 
                  onClick={sendHomeworkToAll}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2dd4bf] hover:bg-[#26bba7] text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(45,212,191,0.4)] active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send to Parents
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2 text-white">
                <Book className="w-5 h-5 text-[#2dd4bf]" />
                {subject} Status
              </h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{date}</p>
            </div>
            
            <div className="divide-y divide-border">
              {students.length === 0 ? (
                <div className="p-20 text-center text-muted-foreground">
                  No students found in this class.
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between hover:bg-accent/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {student.rollNumber}
                      </div>
                      <p className="font-bold text-sm">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStatusForStudent(student.id, "Done")}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                          homeworkStatusMap[student.id] === "Done"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700"
                        )}
                      >
                        Done
                      </button>
                      <button
                        onClick={() => setStatusForStudent(student.id, "Not Done")}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                          homeworkStatusMap[student.id] === "Not Done"
                            ? "bg-slate-700 text-slate-300 border-slate-600"
                            : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700"
                        )}
                      >
                        Not Done
                      </button>
                      <button 
                        onClick={() => sendPendingAlert(student)}
                        className="ml-2 p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/10 text-right">
              <button 
                className="btn-primary inline-flex items-center gap-2 outline-none transition-all active:scale-95"
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
