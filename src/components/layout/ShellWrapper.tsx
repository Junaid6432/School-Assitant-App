"use client";

import dynamic from "next/dynamic";
import React from "react";

// This wrapper ensures the ClientLayout is only rendered on the client side,
// completely bypassing Server-Side Rendering to avoid hydration mismatches
// caused by browser-injected styles or localized font metrics.
const ClientLayout = dynamic(
  () => import("./ClientLayout").then((mod) => mod.ClientLayout),
  { ssr: false }
);

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
