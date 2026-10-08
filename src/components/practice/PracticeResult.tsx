'use client';

import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface PracticeResultProps {
  isCorrect: boolean;
  explanation: string;
  onNext: () => void;
  onRetry: () => void;
}

export default function PracticeResult({
  isCorrect,
  explanation,
  onNext,
  onRetry,
}: PracticeResultProps) {
  return (
    <div
      className={`mt-8 p-6 rounded-3xl border transition-all duration-300 ${
        isCorrect
          ? 'bg-[#E8FAF2] border-[#20C98B]/50 text-slate-900'
          : 'bg-[#FFF0F4] border-[#FF7D9A]/50 text-slate-900'
      }`}
    >
      <div className="flex items-start gap-4">
        {isCorrect ? (
          <div className="w-12 h-12 rounded-2xl bg-[#20C98B] text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-[#FF7D9A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <XCircle className="w-7 h-7" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4
              className={`text-lg font-black ${
                isCorrect ? 'text-[#0F766E]' : 'text-[#E11D48]'
              }`}
            >
              {isCorrect ? 'Chính xác! (+10 điểm)' : 'Chưa chính xác!'}
            </h4>
          </div>

          <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-black/5">
            {explanation}
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            {isCorrect ? (
              <button
                type="button"
                onClick={onNext}
                className="px-6 py-2.5 rounded-full bg-[#20C98B] hover:bg-[#16a36f] text-white font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="px-6 py-2.5 rounded-full bg-[#FF7D9A] hover:bg-[#e65a79] text-white font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
