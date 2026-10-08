import { Bot } from 'lucide-react';

export default function AiTypingIndicator() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1261B5] to-[#2F80ED] text-white flex items-center justify-center shadow-xs shrink-0">
        <Bot className="w-5 h-5 animate-pulse" />
      </div>

      <div className="px-4 py-3 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#1261B5] flex items-center gap-2 rounded-tl-none">
        <span>Trợ lý đang suy nghĩ</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1261B5] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1261B5] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1261B5] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
