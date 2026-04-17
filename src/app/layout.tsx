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
          duration={1500}
          toastOptions={{
            style: {
              background: 'rgba(24, 24, 27, 0.8)', // zinc-900 con 80% opacidad
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
              borderRadius: '1.25rem',
              backdropFilter: 'blur(12px)',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600',
              width: 'auto',
              maxWidth: 'fit-content',
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
