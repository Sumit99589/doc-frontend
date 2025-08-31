'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from 'next/navigation';
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Check if current path is an upload page
  const isUploadPage = pathname.startsWith('/upload');
  const isLandingPage = pathname === "/";
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans ${
          isUploadPage ? 'text-gray-900 bg-white' : 'text-white bg-[#111518]'
        }`}
      >
        {isUploadPage || isLandingPage? (
          // Clean layout for upload pages - no sidebar, no navigation
          <main className="min-h-screen">
            {children}
          </main>
        ) : (
          // Normal layout with sidebar for admin pages
          <div className="flex flex-row">
            <Sidebar />
            {children}
          </div>
        )}
      </body>
    </html>
    </ClerkProvider>
  );
}