'use client';

import { useState } from 'react';
import { Heart, Check } from 'lucide-react';

interface LessonFeedbackProps {
  onFeedback?: (status: 'understood' | 'not_understood') => void;
}

export default function LessonFeedback({ onFeedback }: LessonFeedbackProps) {
  const [feedback, setFeedback] = useState<'understood' | 'not_understood' | null>(null);

  const handleSelect = (status: 'understood' | 'not_understood') => {
    setFeedback(status);
    if (onFeedback) {
      onFeedback(status);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#E8FAF1] via-[#F2FBF6] to-[#FFF8D9] rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Question Text */}
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <span className="text-base sm:text-lg font-black text-[#1E7252] tracking-tight">
          Em đã hiểu bài chưa?
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
        {/* Button: Đã hiểu */}
        <button
          onClick={() => handleSelect('understood')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-200 shadow-sm ${feedback === 'understood'
              ? 'bg-[#1DB978] text-white ring-4 ring-emerald-300/40 scale-105'
              : 'bg-[#20B67A] hover:bg-[#1ca26c] text-white active:scale-98'
            }`}
        >
          {feedback === 'understood' ? (
            <Check className="w-4 h-4 text-white stroke-[3]" />
          ) : (
            <Heart className="w-4 h-4 fill-white text-white" />
          )}
          <span>Đã hiểu</span>
        </button>

        {/* Button: Chưa hiểu */}
        <button
          onClick={() => handleSelect('not_understood')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-200 shadow-xs ${feedback === 'not_understood'
              ? 'bg-[#FF6B81] text-white ring-4 ring-pink-300/40 scale-105'
              : 'bg-[#FFF0F3] hover:bg-[#FFE0E6] text-[#FF6B81] border border-pink-200/50 active:scale-98'
            }`}
        >
          <Heart className="w-4 h-4 fill-[#FF6B81] text-[#FF6B81]" />
          <span>Chưa hiểu</span>
        </button>
      </div>
    </div>
  );
}
