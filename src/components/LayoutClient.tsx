"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <CommandPalette />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{    opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="flex-1 flex flex-col min-h-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
