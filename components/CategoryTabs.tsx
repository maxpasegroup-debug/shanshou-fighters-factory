"use client";

import { useState } from "react";
import { cn } from "@/utils/helpers";

const categories = ["All", "Kickboxing", "MMA", "Muay Thai", "Mental Training"];

export default function CategoryTabs() {
  const [active, setActive] = useState("All");

  return (
    <div className="flex gap-2 overflow-auto pb-1">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActive(category)}
          className={cn(
            "rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300",
            active === category && "warrior-gradient border-transparent text-white",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
