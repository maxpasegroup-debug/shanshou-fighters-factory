"use client";

import { useState } from "react";

export default function SearchBar() {
  const [value, setValue] = useState("");

  return (
    <div className="glass-card flex items-center gap-2 px-3 py-2">
      <span className="text-zinc-500">⌕</span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search programs, trainers, techniques..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}
