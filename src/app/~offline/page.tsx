"use client";

import { WifiOff, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function OfflineFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-2xl text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-50">
          <WifiOff className="w-10 h-10 text-rose-500" />
        </div>
        
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2 uppercase">You're Offline</h1>
        <p className="text-slate-500 font-medium mb-8">
          It looks like your device has lost connection. Checking the local database for cached records...
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link 
            href="/dashboard"
            className="block w-full py-4 text-slate-600 font-bold hover:text-primary hover:bg-slate-100 rounded-2xl transition-colors"
          >
            View Cached Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
