"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  FileSpreadsheet, 
  Award, 
  Settings,
  LogOut,
  ChevronRight,
  Download,
  WifiOff
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: ClipboardCheck, label: "Attendance", href: "/attendance" },
  { icon: BookOpen, label: "Homework", href: "/homework" },
  { icon: FileSpreadsheet, label: "Tests", href: "/tests" },
  { icon: Award, label: "Final Results", href: "/results" },
  { icon: ClipboardCheck, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const { isOnline } = useNetworkStatus();

  return (
    <>
      <div className="hidden md:flex w-64 h-screen bg-[#0f172a] border-r border-white/5 flex-col fixed left-0 top-0 z-50 transition-all duration-300 print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        <div className="p-8 pb-12">
          <h1 className="text-2xl font-black italic tracking-tighter text-white group cursor-default">
            GPS <span className="neon-teal">KUNDA</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">System Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2dd4bf] rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                )}
                <div className="flex items-center gap-4">
                  <item.icon className={cn("w-5 h-5 transition-all", isActive ? "neon-teal" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
          {!isOnline && (
            <div className="flex items-center gap-3 bg-[#fb7185]/10 border border-[#fb7185]/20 text-[#fb7185] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
              <WifiOff className="w-4 h-4" />
              <span>Offline Protocol</span>
            </div>
          )}

          <button 
            onClick={() => {
              signOut(auth);
              window.location.href = "/login";
            }}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-slate-500 hover:text-[#fb7185] hover:bg-[#fb7185]/5 transition-all font-bold text-xs uppercase tracking-widest group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>

      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}
