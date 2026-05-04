"use client";
import dynamic from "next/dynamic";

const GlobeMapDynamic = dynamic(() => import("@/components/GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-violet-400 font-mono tracking-widest text-sm animate-pulse">
      INITIALIZING GEOPOLITICAL TOPOLOGY…
    </div>
  ),
});

export default function GlobePage() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      {/* Colorful ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-violet-600/10 blur-[140px] rounded-full animate-float-y" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-fuchsia-600/8 blur-[120px] rounded-full animate-float-x" />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-teal-600/8 blur-[100px] rounded-full" />
      </div>
      <GlobeMapDynamic />
    </main>
  );
}
