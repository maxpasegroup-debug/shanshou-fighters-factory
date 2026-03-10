"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/helpers";

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/dashboard/training", label: "Training" },
  { href: "/journey", label: "Journey" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 p-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-2 py-2 text-center text-xs text-zinc-400 transition",
              pathname === tab.href && "warrior-gradient text-white",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
