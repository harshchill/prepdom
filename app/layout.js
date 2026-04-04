import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import Providers from "./components/providers";
import { authOptions } from "@/lib/auth/options";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

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

export default async function RootLayout({ children }) {
  let liveCoins = 0;

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectToDatabase();
      const user = await User.findOne({ email: session.user.email }).select("coins");
      liveCoins = user?.coins ?? 0;
    }
  } catch (error) {
    console.error("Failed to load live navbar coins:", error);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Navbar coins={liveCoins} />
          </Suspense>
          <main className="flex-1 pt-24">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
