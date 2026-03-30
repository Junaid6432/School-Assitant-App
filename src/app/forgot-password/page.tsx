"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { 
  Mail, 
  KeyRound, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (err: any) {
      console.error("Reset Error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Yeh email database mein nahi hai. Check karein.");
      } else {
        setError("Reset link bnejne mein masla hua. Dobara koshish karein.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative overflow-hidden flex justify-center py-20 min-h-screen bg-[#0f172a]">
      {/* Background Neon Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />

      <div className="w-full max-w-[400px] relative z-10 px-6">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-5 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-black">Login</span>
          </Link>
          
          <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-2xl">
            <KeyRound className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Reset Security</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest mt-1.5 text-[10px]">Recovery Protocol</p>
        </div>

        <div className="glass-card p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {isSent ? (
            <div className="text-center space-y-5 py-2 animate-in fade-in zoom-in duration-500">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-accent/30">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Email Bhej Di Gye Hai!</h2>
                <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
                  Reset link <span className="text-white font-bold">{email}</span> par bhej diya gaya hai.
                </p>
              </div>
              <div className="pt-4">
                <Link 
                  href="/login" 
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                  Confirm & Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" strokeWidth={3} />
                  {error}
                </div>
              )}

              <form onSubmit={handleResetRequest} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-all" />
                    <input
                      required
                      type="email"
                      placeholder="ENTER REGISTERED EMAIL"
                      className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-white/10 bg-[#0f172a]/50 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-black uppercase tracking-widest text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn-primary w-full py-5 mt-4 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] group active:scale-[0.98] shadow-2xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" strokeWidth={3} />
                  ) : (
                    <>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Found your key?{" "}
              <Link href="/login" className="text-primary hover:underline ml-1">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 text-center pb-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-700">
            System Identity: GPS KUNDA v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
