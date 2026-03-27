import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Roboto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ShellWrapper } from "@/components/layout/ShellWrapper";

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
});


const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "GPS No.4 Kunda | Advanced Analytics",
  description: "Teacher Assistant for Primary School Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GPS Kunda",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning translate="no">
      <body className={`${jakarta.variable} ${inter.variable} ${robotoSerif.variable} font-sans antialiased bg-[#0f172a]`} suppressHydrationWarning>
        <AuthProvider>
          <ShellWrapper>
            {children}
          </ShellWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
