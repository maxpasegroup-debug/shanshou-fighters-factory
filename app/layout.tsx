import type { Metadata } from "next";
import dynamic from "next/dynamic";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const BottomNavigation = dynamic(() => import("@/components/BottomNavigation"), {
  ssr: false,
});
const FloatingAICoach = dynamic(() => import("@/components/FloatingAICoach"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Sanshou – Global Martial Arts Academy",
  description: "Netflix-style Sanshou training hub for courses and world-class experts.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-6">{children}</main>
          <BottomNavigation />
          <FloatingAICoach />
        </Providers>
      </body>
    </html>
  );
}
