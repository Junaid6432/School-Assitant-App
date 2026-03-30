"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn, 
  Mail, 
  Lock, 
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full relative overflow-hidden flex justify-center py-20 min-h-screen bg-[#0f172a]">
      {/* Background Neon Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2dd4bf]/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#fb7185]/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />

      <div className="w-full max-w-[400px] relative z-10 px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 border border-white/10 -rotate-6 shadow-2xl group hover:rotate-0 transition-transform duration-500">
            <LogIn className="w-10 h-10 neon-teal group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Account Login</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest mt-1.5 text-[10px]">Access teacher dashboard</p>
        </div>

        <div className="glass-card p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2dd4bf]/50 to-transparent" />
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-shake shadow-[0_0_20px_rgba(251,113,133,0.1)]">
              <AlertCircle className="w-6 h-6 flex-shrink-0" strokeWidth={3} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:neon-teal transition-all" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-14 pr-12 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50 outline-none transition-all font-black tracking-[0.4em] text-xs"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </>
              )}
            </button>

            <div className="text-center pt-3">
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold text-[#2dd4bf] uppercase tracking-widest hover:underline hover:opacity-80 transition-all focus:outline-none"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              New Personnel?{" "}
              <Link href="/register" className="neon-teal hover:underline ml-1">
                Register Now
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center pb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-700">
            System Identity: GPS KUNDA v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
