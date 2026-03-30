"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronLeft,
  Download,
  WifiOff
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useEffect } from "react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [schoolName, setSchoolName] = useState("GPS KUNDA");
  const [schoolShort, setSchoolShort] = useState("GK");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "teachers", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.schoolName) {
              setSchoolName(data.schoolName);
              // Extract initials (e.g., "Grand Public School" -> "GP")
              const initials = data.schoolName
                .toUpperCase()
                .split(" ")
                .filter((word: string) => word.length > 0)
                .map((word: string) => word[0])
                .join("")
                .substring(0, 2);
              setSchoolShort(initials || "GK");
            }
          }
        } catch (error) {
          console.error("Error fetching school name:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div 
        className={cn(
          "hidden md:flex h-screen bg-gradient-to-b from-card/80 to-background/50 backdrop-blur-3xl border-r border-white/5 flex-col fixed left-0 top-0 z-50 transition-all duration-300 print:hidden shadow-2xl",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={cn("p-8 pb-12 transition-all overflow-hidden whitespace-nowrap", isCollapsed ? "px-4" : "")}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary tracking-tighter shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                {schoolShort}
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black tracking-tight text-foreground group cursor-default leading-tight">
                {schoolName.toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 mt-2 ml-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 rounded-sm">System Identity</p>
              </div>
            </>
          )}
        </div>

        <nav className={cn("flex-1 space-y-2 overflow-y-auto px-4", isCollapsed ? "px-2" : "px-6")}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-inner border border-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent",
                    isCollapsed ? "justify-center p-3 rounded-xl mx-auto" : "justify-between px-4 py-3 rounded-xl"
                  )}
                >
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-lg shadow-[0_0_12px_var(--color-primary)]" />
                  )}
                  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : (isCollapsed ? "" : "group-hover:translate-x-1"))} strokeWidth={isActive ? 2.5 : 2} />
                    {!isCollapsed && <span className="font-semibold text-sm tracking-wide whitespace-nowrap">{item.label}</span>}
                  </div>
                  {isActive && !isCollapsed && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 drop-shadow-[0_0_4px_var(--color-primary)]" />}
                </Link>
            );
          })}
        </nav>

        <div className={cn("mt-auto border-t border-white/5 space-y-4", isCollapsed ? "p-4" : "p-6")}>
          {!isOnline && (
            <div className={cn("flex items-center bg-danger/10 border border-danger/20 text-danger rounded-xl text-[10px] font-semibold tracking-widest animate-pulse overflow-hidden", isCollapsed ? "p-3 justify-center" : "px-4 py-3 gap-3 uppercase")}>
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Offline Protocol</span>}
            </div>
          )}

          <button 
            onClick={() => {
              signOut(auth);
              window.location.href = "/login";
            }}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn("flex items-center rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all font-semibold tracking-wide group", isCollapsed ? "p-3 justify-center w-full" : "px-4 py-3 gap-3 w-full text-sm")}
          >
            <LogOut className="w-5 h-5 transition-transform flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </div>

      <div className={cn("hidden md:block flex-shrink-0 transition-all duration-300", isCollapsed ? "w-20" : "w-64")} />
    </>
  );
}
