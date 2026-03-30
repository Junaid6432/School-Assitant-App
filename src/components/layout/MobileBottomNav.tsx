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
    (p) => pathname && pathname.startsWith(p)
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
            background: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "0 -20px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Drawer handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              More Options
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="px-3 pb-6 space-y-2">
            {moreItems.map(({ icon: Icon, label, href, color }) => {
              const isActive = pathname && pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-150 relative overflow-hidden group",
                    isActive ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />}
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" style={{ color: isActive ? "var(--color-primary)" : "#94a3b8" }} strokeWidth={2.5} />
                  </span>
                  <span className={cn("flex-1 font-semibold text-sm tracking-wide", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </Link>
              );
            })}

            <div className="h-px bg-white/5 mx-4 my-4" />

            <button
              onClick={async () => {
                await signOut(auth);
                window.location.href = "/login";
              }}
              className="flex items-center gap-4 px-4 py-4 rounded-xl w-full transition-all duration-150 hover:bg-danger/5 group"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-danger/10 flex-shrink-0 border border-danger/20">
                <LogOut className="w-5 h-5 text-danger" strokeWidth={2.5} />
              </span>
              <span className="flex-1 font-semibold text-sm tracking-wide text-danger text-left">
                Sign Out
              </span>
              <ChevronRight className="w-4 h-4 text-danger/30" />
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
            const isActive = pathname === href || (pathname && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition-all duration-150 relative select-none"
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                  isActive ? "bg-primary/10 shadow-[0_0_15px_var(--color-primary)]" : "hover:bg-white/5"
                )}>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full shadow-[0_0_10px_var(--color-primary)]" />
                  )}
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? "var(--color-primary)" : "var(--muted)" }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn("text-[8px] font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
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
              isMoreActive || drawerOpen ? "bg-primary/10" : "hover:bg-white/5"
            )}>
              {drawerOpen ? (
                <X className="w-5 h-5 text-primary" strokeWidth={2.5} />
              ) : (
                <MoreHorizontal
                  className="w-5 h-5"
                  style={{ color: isMoreActive ? "var(--color-primary)" : "var(--muted)" }}
                  strokeWidth={2.5}
                />
              )}
            </div>
            <span className={cn("text-[8px] font-bold uppercase tracking-wider", isMoreActive || drawerOpen ? "text-primary" : "text-muted-foreground")}>
              Menu
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
