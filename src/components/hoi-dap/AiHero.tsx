import { Bot, Sparkles, GraduationCap } from 'lucide-react';

export default function AiHero() {
  return (
    <div className="bg-gradient-to-r from-[#1261B5] via-[#2F80ED] to-[#1261B5] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm relative overflow-hidden flex items-center justify-between border border-blue-400/30">
      {/* Subtle Background Pattern */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />
      <div className="absolute left-1/3 -bottom-6 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="z-10 flex items-center gap-3">
        {/* Compact Robot Icon */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner relative">
          <img src="/images/hero-parts/robot.png" alt="AI Robot" className="w-7 h-7 object-contain" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Trợ lý học tập AI</span>
              <GraduationCap className="w-4 h-4 text-amber-300 inline-block" />
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200 backdrop-blur-xs">
              <Sparkles className="w-3 h-3" /> Hỏi đáp 24/7
            </span>
          </div>
          <p className="text-blue-100 text-[11px] sm:text-xs font-medium line-clamp-1">
            Hỏi đáp bài tập & giải thích kiến thức từng bước cho học sinh lớp 4
          </p>
        </div>
      </div>
    </div>
  );
}
