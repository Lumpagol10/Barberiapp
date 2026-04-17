import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barberiapp | Franmark Digital",
  description: "La plataforma de gestión para barberías profesionales.",
};

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#18181b', // zinc-900
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              borderRadius: '1.5rem',
              backdropFilter: 'blur(8px)',
            },
            className: 'font-sans'
          }}
          richColors
        />
        {children}
      </body>
    </html>
  );
}
