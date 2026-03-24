"use client";

import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Shield, BookOpen, Clock, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { teacher, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view your assigned details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center shadow-xl">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold">{teacher?.name}</h2>
            <p className="text-sm text-muted-foreground font-medium">{teacher?.role}</p>
          </div>

          <div className="glass-card p-6 border-warning/20 bg-warning/5">
            <h3 className="text-sm font-bold text-warning flex items-center gap-2 mb-2 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              Security Tip
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Never share your password with anyone. Your data is isolated and secure.</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Account Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Email Address</p>
                  <p className="font-bold">{teacher?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Assigned Class</p>
                  <p className="font-bold text-primary">{teacher?.assignedClass}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border opacity-60">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Account Created</p>
                  <p className="font-bold">{teacher?.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-danger/20 bg-danger/5 opacity-50 cursor-not-allowed">
            <h3 className="text-sm font-bold text-danger flex items-center gap-2 mb-2 uppercase tracking-wider">
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-4">Deleting your account is permanent and cannot be undone.</p>
            <button disabled className="px-6 py-2.5 rounded-xl border border-danger/30 text-danger font-bold text-xs uppercase hover:bg-danger hover:text-white transition-all">
              Request Deactivation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
