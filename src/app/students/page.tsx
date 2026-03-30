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
      where("emisCode", "==", teacher.emisCode),
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
      if (!teacher?.teacherId || !teacher?.emisCode) {
        throw new Error("Teacher credentials not fully loaded. Please refresh.");
      }

      if (editingStudentId) {
        // Update existing student
        const studentRef = doc(db, "students", editingStudentId);
        await updateDoc(studentRef, {
          ...formData,
          teacherId: teacher.teacherId,
          emisCode: teacher.emisCode,
          updatedAt: Timestamp.now()
        });
        alert("Student updated successfully! ✅");
      } else {
        // Add new student
        await addDoc(collection(db, "students"), {
          ...formData,
          teacherId: teacher.teacherId,
          emisCode: teacher.emisCode,
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
    <div className="space-y-6 relative min-h-screen">
      <div className="bg-glow-blue fixed inset-0 z-[-1] pointer-events-none" />
      <PageHeader 
        title="STUDENT REGISTRATION"
        description="Manage and organize your class student records."
        actions={
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <BulkImportBtn 
                teacherId={teacher?.teacherId || ""}
                emisCode={teacher?.emisCode || ""}
                assignedClass={teacher?.assignedClass || ""}
                onImportSuccess={() => {}}
              />
              <button 
                onClick={openAddModal}
                className="btn-premium flex items-center gap-2 h-10 px-6 text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>ADD STUDENT</span>
              </button>
            </div>
            <SampleTemplateLink assignedClass={teacher?.assignedClass || ""} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="glass-card overflow-visible group relative">
            <div className="p-6">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground tracking-tight leading-tight">{student.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                    className={cn(
                      "p-2 hover:bg-white/5 rounded-xl transition-all",
                      activeMenuId === student.id ? "text-primary bg-white/5" : "text-muted-foreground hover:text-foreground"
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
                      <div className="absolute right-0 mt-2 w-48 bg-card backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => {
                            openEditModal(student);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-left border-b border-white/5"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                        <button 
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteModalOpen(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wide text-danger hover:bg-danger/10 transition-all text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Student
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Guardian</span>
                  <span className="text-foreground truncate max-w-[120px]">{student.parentName}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Class</span>
                  <span className="text-primary font-bold">{student.class}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => openEditModal(student)}
                  className="flex-1 px-4 py-2.5 btn-outline text-xs flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  className="flex-1 px-4 py-2.5 bg-success/10 border border-success/20 text-success rounded-xl hover:bg-success/20 transition-all text-xs font-semibold flex items-center justify-center gap-2"
                  onClick={() => window.open(`https://wa.me/${student.parentWhatsApp}`, '_blank')}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  {editingStudentId ? <Edit2 className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                </div>
                {editingStudentId ? "Update Student" : "Add Student"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-semibold text-sm"
                    placeholder="e.g. Ahmed Ali"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest ml-1">Roll Number</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-semibold text-sm"
                      placeholder="101"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest ml-1">Class</label>
                    <select 
                      className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-[#0f172a] text-foreground appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-semibold text-sm cursor-pointer"
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
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest ml-1">Parent/Guardian</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-semibold text-sm"
                    placeholder="Guardian Name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest ml-1">WhatsApp Number</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-semibold text-sm"
                    placeholder="923000000000"
                    value={formData.parentWhatsApp}
                    onChange={(e) => setFormData({...formData, parentWhatsApp: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl text-muted-foreground font-semibold text-xs hover:bg-white/5 transition-all outline-none btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    "flex-[2] btn-premium flex items-center justify-center gap-2 py-3.5 text-xs font-semibold",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                  ) : (
                    <SaveIcon className="w-4 h-4" strokeWidth={2.5} />
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border-danger/20 relative overflow-hidden text-center p-10">
            <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <AlertTriangle className="w-8 h-8 text-danger animate-pulse" strokeWidth={2.5} />
            </div>
            
            <h2 className="text-lg font-bold text-foreground tracking-tight">Delete Student?</h2>
            <p className="text-danger text-sm font-semibold mt-2">
              {studentToDelete.name}
            </p>
            <p className="text-muted-foreground text-xs mt-3 leading-relaxed px-4">
              This action cannot be undone. All data will be permanently removed.
            </p>

            <div className="mt-8 flex flex-col gap-3 px-2">
              <button 
                onClick={handleDeleteStudent}
                disabled={isSaving}
                className="w-full py-3.5 bg-danger text-white rounded-xl font-semibold text-xs hover:bg-danger/90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg border border-danger/50 shadow-danger/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isSaving ? "Deleting..." : "Confirm Delete"}
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-3.5 bg-white/5 border border-white/10 text-muted-foreground rounded-xl font-semibold text-xs hover:bg-white/10 hover:text-foreground transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
