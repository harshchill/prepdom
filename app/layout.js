import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import Providers from "./components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prepdom",
  description: "Prepdom learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 pt-24">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
