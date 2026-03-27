"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { App } from "@capacitor/app";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) {
        router.push("/login");
      } else if (user && isAuthPage) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, isAuthPage, router]);

  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add("printing-mode");
    };
    const handleAfterPrint = () => {
      document.body.classList.remove("printing-mode");
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  // Universal Back Button Handler for Android
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const backListener = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack || pathname === '/dashboard' || pathname === '/login') {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [pathname]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-10 h-10 animate-spin neon-teal" />
      </div>
    );
  }

  // Prevent flash of unauthorized content
  if (!user && !isAuthPage) return null;
  if (user && isAuthPage) return null;

  if (isAuthPage) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-[#0f172a]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex print:block" suppressHydrationWarning>
      {/* Sidebar: hidden on mobile, fixed on desktop */}
      {mounted && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      )}
      <Sidebar />
      {/* Main content: full-width on mobile, offset by sidebar width on desktop */}
      <main className="flex-1 min-h-screen w-full px-6 py-10 md:px-12 md:py-16 pb-32 md:pb-16 transition-all duration-300 print:m-0 print:p-0 print:overflow-visible print:h-auto overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
      {/* Bottom nav: visible on mobile only */}
      <MobileBottomNav />
    </div>
  );
}
