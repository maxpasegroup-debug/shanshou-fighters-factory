"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getCoachReply(input: string) {
  const query = input.toLowerCase();
  if (query.includes("mind") || query.includes("focus") || query.includes("meditation")) {
    return "Recommended path: Mind Track -> Meditation Basics -> Breath Control -> Tactical Focus.";
  }
  if (query.includes("body") || query.includes("strength") || query.includes("kickboxing")) {
    return "Recommended path: Body Track -> Kickboxing Fundamentals -> Explosive Movement -> Sparring Endurance.";
  }
  if (query.includes("emotion") || query.includes("discipline") || query.includes("pressure")) {
    return "Recommended path: Emotion Track -> Emotional Discipline -> Pressure Handling -> Fight Composure.";
  }
  if (query.includes("course")) {
    return "Top picks: Kickboxing Fundamentals, Fight IQ and Tactics, Mental Combat Conditioning.";
  }
  return "Tell me your goal (mind, body, emotion, stamina, focus), and I will build your next training path.";
}

export default function FloatingAICoach() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(
    "Start with Body Track for power and add Mind Track twice a week for decision speed.",
  );

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="warrior-gradient fixed bottom-20 right-4 z-50 rounded-full px-4 py-3 text-sm font-semibold md:bottom-6"
      >
        AI Coach
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="glass-card fixed bottom-36 right-4 z-50 w-[300px] p-4 md:bottom-22"
          >
            <h3 className="font-semibold">Training Assistant</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Ask for course recommendations or a training path.
            </p>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/50 p-3 text-sm text-zinc-200">
              {reply}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="e.g. improve focus"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none"
              />
              <button
                className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold"
                onClick={() => setReply(getCoachReply(prompt))}
              >
                Ask
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
