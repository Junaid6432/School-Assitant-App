"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  MoreHorizontal,
  BookOpen,
  ClipboardList,
  FileBarChart,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users,           label: "Students",  href: "/students"  },
  { icon: CalendarCheck,   label: "Attendance", href: "/attendance" },
  { icon: Award,           label: "Results",   href: "/results"   },
];

const moreItems = [
  { icon: BookOpen,      label: "Homework",     href: "/homework", color: "#8b5cf6" },
  { icon: ClipboardList, label: "Tests",        href: "/tests",    color: "#6366f1" },
  { icon: FileBarChart,  label: "Reports",      href: "/reports",  color: "#0ea5e9" },
  { icon: Settings,      label: "Settings",     href: "/settings", color: "#10b981" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isMoreActive = ["/homework", "/tests", "/reports", "/settings"].some(
    (p) => pathname.startsWith(p)
  );

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300 print:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        className={cn(
          "md:hidden fixed left-0 right-0 bottom-[80px] z-50 print:hidden",
          "transition-transform duration-300 ease-out",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div
          className="mx-4 mb-4 rounded-3xl overflow-hidden glass-panel"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 -20px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Drawer handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Extended Protocols
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="px-3 pb-6 space-y-2">
            {moreItems.map(({ icon: Icon, label, href, color }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-150 relative overflow-hidden group",
                    isActive ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2dd4bf] rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />}
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" style={{ color: isActive ? "#2dd4bf" : "#94a3b8" }} strokeWidth={2.5} />
                  </span>
                  <span className={cn("flex-1 font-bold text-xs uppercase tracking-widest", isActive ? "text-[#2dd4bf]" : "text-slate-400 group-hover:text-white")}>
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </Link>
              );
            })}

            <div className="h-px bg-white/5 mx-4 my-4" />

            <button
              onClick={async () => {
                await signOut(auth);
                window.location.href = "/login";
              }}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl w-full transition-all duration-150 hover:bg-[#fb7185]/5 group"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#fb7185]/10 flex-shrink-0 border border-[#fb7185]/20">
                <LogOut className="w-5 h-5 text-[#fb7185]" strokeWidth={2.5} />
              </span>
              <span className="flex-1 font-bold text-xs uppercase tracking-widest text-[#fb7185] text-left">
                Terminate
              </span>
              <ChevronRight className="w-4 h-4 text-[#fb7185]/30" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Nav Bar ──────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-6 left-6 right-6 z-50 print:hidden"
      >
        <div className="glass-panel h-[72px] flex items-center justify-around px-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition-all duration-150 relative select-none"
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                  isActive ? "bg-[#2dd4bf]/10 shadow-[0_0_15px_rgba(45,212,191,0.1)]" : "hover:bg-white/5"
                )}>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#2dd4bf] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                  )}
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? "#2dd4bf" : "#64748b" }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-[0.15em]", isActive ? "text-[#2dd4bf]" : "text-slate-500")}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition-all duration-150 relative select-none"
          >
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
              isMoreActive || drawerOpen ? "bg-[#2dd4bf]/10" : "hover:bg-white/5"
            )}>
              {drawerOpen ? (
                <X className="w-5 h-5 text-[#2dd4bf]" strokeWidth={2.5} />
              ) : (
                <MoreHorizontal
                  className="w-5 h-5"
                  style={{ color: isMoreActive ? "#2dd4bf" : "#64748b" }}
                  strokeWidth={2.5}
                />
              )}
            </div>
            <span className={cn("text-[8px] font-black uppercase tracking-[0.15em]", isMoreActive || drawerOpen ? "text-[#2dd4bf]" : "text-slate-500")}>
              Protocol
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
