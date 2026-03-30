"use client";

import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Shield, BookOpen, Clock, Loader2, Palette, Sun, Moon, TreePine, Stars } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { teacher, loading } = useAuth();
  const { theme, setTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative min-h-[80vh]">
      <div className="bg-glow-blue fixed inset-0 z-[-1] pointer-events-none opacity-40" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Teacher Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and view your assigned details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center border-white/5">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-5 border border-primary/20 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{teacher?.name}</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{teacher?.role}</p>
          </div>

          <div className="glass-card p-6 border-warning/20 bg-warning/[0.02]">
            <h3 className="text-xs font-bold text-warning flex items-center gap-2 mb-2 uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              Security Tip
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Never share your password with anyone. Your data is isolated and secure.</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 border-white/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 tracking-tight text-foreground">
              <Shield className="w-5 h-5 text-primary" />
              Account Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Email Address</p>
                  <p className="font-semibold text-sm text-foreground">{teacher?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Assigned Class</p>
                  <p className="font-bold text-sm text-primary">{teacher?.assignedClass}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Account Created</p>
                  <p className="font-semibold text-sm text-foreground">{teacher?.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Configuration */}
          <div className="glass-card p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Palette className="w-24 h-24" />
            </div>
            
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 tracking-tight text-foreground">
              <Palette className="w-5 h-5 text-primary" />
              Application Theme
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
                  theme === 'light' ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-orange-500 shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Classic Light</span>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
                  theme === 'dark' ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shadow-sm">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Premium Dark</span>
              </button>

              <button 
                onClick={() => setTheme('emerald')}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
                  theme === 'emerald' ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400 shadow-sm">
                  <TreePine className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Govt Emerald</span>
              </button>

              <button 
                onClick={() => setTheme('midnight')}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
                  theme === 'midnight' ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#020617] border border-indigo-900 flex items-center justify-center text-indigo-400 shadow-sm">
                  <Stars className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Midnight City</span>
              </button>
            </div>
            
            <p className="mt-8 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-center">
              Themes apply globally across all modules
            </p>
          </div>


          <div className="glass-card p-6 border-danger/20 bg-danger/[0.02] opacity-60 cursor-not-allowed">
            <h3 className="text-xs font-bold text-danger flex items-center gap-2 mb-2 uppercase tracking-widest">
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Deleting your account is permanent and cannot be undone.</p>
            <button disabled className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger font-semibold text-[10px] uppercase tracking-widest">
              Request Deactivation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
