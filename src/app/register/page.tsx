"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  School,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLASSES = ["Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    assignedClass: "Class 1",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Update Firebase Profile Name
      await updateProfile(user, { displayName: formData.name });

      // Create Teacher Document in Firestore
      await setDoc(doc(db, "teachers", user.uid), {
        teacherId: user.uid,
        name: formData.name,
        email: user.email,
        assignedClass: formData.assignedClass,
        role: "Teacher",
        createdAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative overflow-hidden flex justify-center py-20 min-h-screen bg-[#0f172a]">
      {/* Background Neon Glows */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#2dd4bf]/10 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#fb7185]/10 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse" />

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/10 rotate-12 shadow-2xl group hover:rotate-0 transition-transform duration-700">
            <UserPlus className="w-12 h-12 neon-teal group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Protocol: Enrollment</h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] mt-2 text-xs">GPS Kunda Personnel Registry</p>
        </div>

        <div className="glass-card p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2dd4bf]/50 to-transparent" />
          
          {error && (
            <div className="mb-8 p-5 rounded-2xl bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-shake shadow-[0_0_20px_rgba(251,113,133,0.1)]">
              <AlertCircle className="w-6 h-6 flex-shrink-0" strokeWidth={3} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                <input
                  required
                  type="text"
                  placeholder="EX: JOHN DOE"
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Communication Channel (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                <input
                  required
                  type="email"
                  placeholder="ID_PROTOCOL@GPSKUNDA.COM"
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Academic Assignment</label>
              <div className="relative group">
                <School className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                <select
                  required
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white appearance-none focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs cursor-pointer"
                  value={formData.assignedClass}
                  onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c} className="bg-[#0f172a]">{c.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                  <input
                    required
                    type="password"
                    placeholder="••••"
                    className="w-full pl-14 pr-4 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black tracking-widest text-xs"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                  <input
                    required
                    type="password"
                    placeholder="••••"
                    className="w-full pl-14 pr-4 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black tracking-widest text-xs"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="btn-primary w-full py-5 mt-4 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] group active:scale-[0.98] shadow-[0_20px_40px_rgba(45,212,191,0.2)]"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" strokeWidth={3} />
              ) : (
                <>
                  Initialize Personnel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Existing Account?{" "}
              <Link href="/login" className="neon-teal hover:underline ml-2">
                Sign In Protocol
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center pb-20">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700">
            System Identity: GPS KUNDA OPS-2.0
          </p>
        </div>
      </div>
    </div>
  );
}
