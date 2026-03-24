"use client";

import { useState, useEffect } from "react";
import { 
  UserPlus, 
  Users,
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  X, 
  Save as SaveIcon,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import BulkImportBtn, { SampleTemplateLink } from "@/components/students/BulkImportBtn";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "react-hot-toast";


export default function StudentsPage() {
  const { teacher, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    class: "",
    parentName: "",
    parentWhatsApp: ""
  });

  // Set initial class when teacher data loaded
  useEffect(() => {
    if (teacher?.assignedClass) {
      setFormData(prev => ({ ...prev, class: teacher.assignedClass }));
    }
  }, [teacher]);

  // Real-time listener for students
  useEffect(() => {
    if (authLoading || !teacher?.assignedClass) return;

    const q = query(
      collection(db, "students"), 
      where("teacherId", "==", teacher.teacherId),
      orderBy("rollNumber", "asc")
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsList);
    }, (error) => {
      console.error("Firestore Listener Error:", error);
    });

    return () => unsub();
  }, [teacher, authLoading, refreshKey]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber) {
      alert("Please fill in basic details!");
      return;
    }

    setIsSaving(true);
    try {
      if (editingStudentId) {
        // Update existing student
        const studentRef = doc(db, "students", editingStudentId);
        await updateDoc(studentRef, {
          ...formData,
          teacherId: teacher?.teacherId,
          updatedAt: Timestamp.now()
        });
        alert("Student updated successfully! ✅");
      } else {
        // Add new student
        await addDoc(collection(db, "students"), {
          ...formData,
          teacherId: teacher?.teacherId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        toast.success("Student Added Successfully! ✅");
      }

      setFormData({
        name: "",
        rollNumber: "",
        class: teacher?.assignedClass || "",
        parentName: "",
        parentWhatsApp: ""
      });
      setEditingStudentId(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast.error(`Error: ${error.message || "Failed to save student"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "students", studentToDelete.id));
      toast.success(`${studentToDelete.name} Deleted Successfully!`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (student: any) => {
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class || teacher?.assignedClass || "",
      parentName: student.parentName || "",
      parentWhatsApp: student.parentWhatsApp || ""
    });
    setEditingStudentId(student.id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      rollNumber: "",
      class: teacher?.assignedClass || "",
      parentName: "",
      parentWhatsApp: ""
    });
    setEditingStudentId(null);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.rollNumber?.includes(searchTerm)
  );

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="STUDENT REGISTRATION"
        description="Manage and organize your class student records."
        actions={
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <BulkImportBtn 
                teacherId={teacher?.teacherId || ""}
                assignedClass={teacher?.assignedClass || ""}
                onImportSuccess={() => {}}
              />
              <button 
                onClick={openAddModal}
                className="btn-primary flex items-center gap-3 h-11 px-8 shadow-[0_15px_30px_rgba(45,212,191,0.2)] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all outline-none border-none"
              >
                <UserPlus className="w-5 h-5" />
                <span>ADD STUDENT</span>
              </button>
            </div>
            <SampleTemplateLink assignedClass={teacher?.assignedClass || ""} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="glass-card overflow-visible group hover:-translate-y-1 transition-all duration-300 relative border-white/5">
            <div className="p-6">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center font-black text-[#2dd4bf] text-lg shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white tracking-tight leading-tight">{student.name}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-0.5">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                    className={cn(
                      "p-2 hover:bg-white/5 rounded-xl transition-all",
                      activeMenuId === student.id ? "text-[#2dd4bf] bg-white/5" : "text-slate-500"
                    )}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeMenuId === student.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-[60]" 
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => {
                            openEditModal(student);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit Profile
                        </button>
                        <button 
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteModalOpen(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#fb7185] hover:bg-[#fb7185]/10 transition-all text-left border-t border-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Student
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[10px] font-bold bg-[#0f172a]/40 p-3.5 rounded-xl border border-white/5 shadow-inner">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 uppercase tracking-[0.15em] text-[8px]">Guardian Identity</span>
                  <span className="text-white truncate max-w-[120px] italic">{student.parentName}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-slate-500 uppercase tracking-[0.15em] text-[8px]">Current Class</span>
                  <span className="text-[#2dd4bf] font-black">{student.class}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => openEditModal(student)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3 h-3 text-[#2dd4bf]" />
                  Configure
                </button>
                <button 
                  className="flex-1 px-4 py-2.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-xl hover:bg-[#2dd4bf]/20 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.05)]"
                  onClick={() => window.open(`https://wa.me/${student.parentWhatsApp}`, '_blank')}
                >
                  <Phone className="w-3 h-3" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2dd4bf]/50 to-transparent" />
            
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20">
                  {editingStudentId ? <Edit2 className="w-5 h-5 neon-teal" /> : <UserPlus className="w-5 h-5 neon-teal" />}
                </div>
                {editingStudentId ? "Update Student" : "Add Student"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Entity Full Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                    placeholder="E.G. AHMED ALI"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Vector ID (Roll)</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                      placeholder="101"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Classification</label>
                    <select 
                      className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white appearance-none focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs cursor-pointer"
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                    >
                      <option className="bg-[#0f172a]">Class 1</option>
                      <option className="bg-[#0f172a]">Class 2</option>
                      <option className="bg-[#0f172a]">Class 3</option>
                      <option className="bg-[#0f172a]">Class 4</option>
                      <option className="bg-[#0f172a]">Class 5</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Guardian Identity</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                    placeholder="PARENT/GUARDIAN NAME"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Transmission Channel (WhatsApp)</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                    placeholder="923000000000"
                    value={formData.parentWhatsApp}
                    onChange={(e) => setFormData({...formData, parentWhatsApp: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4.5 rounded-2xl border border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:text-white transition-all shadow-xl"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    "flex-[2] btn-primary flex items-center justify-center gap-3 py-4.5 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_20px_40px_rgba(45,212,191,0.2)]",
                    isSaving && "opacity-50 cursor-not-allowed scale-95"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                  ) : (
                    <SaveIcon className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  {isSaving ? "Saving..." : (editingStudentId ? "Update Info" : "Add Student")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm shadow-[0_0_100px_rgba(251,113,133,0.3)] animate-in zoom-in-95 duration-300 border-rose-500/20 relative overflow-hidden text-center p-10">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(251,113,133,0.2)]">
              <AlertTriangle className="w-12 h-12 text-[#fb7185] animate-pulse" strokeWidth={2.5} />
            </div>
            
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">Delete Student?</h2>
            <p className="text-[#fb7185] text-xs font-black uppercase tracking-widest mt-4">
              {studentToDelete.name}
            </p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] mt-3 leading-relaxed px-4">
              This action cannot be undone. All data will be permanently removed.
            </p>

            <div className="mt-10 flex flex-col gap-3 px-2">
              <button 
                onClick={handleDeleteStudent}
                disabled={isSaving}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_15px_30px_rgba(251,113,133,0.2)] flex items-center justify-center gap-3 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isSaving ? "Deleting..." : "DELETE"}
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all underline decoration-slate-800"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
