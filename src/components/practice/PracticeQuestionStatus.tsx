'use client';

import { QuestionStatusItem } from '@/types/practice';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

interface PracticeQuestionStatusProps {
  statusList: QuestionStatusItem[];
  onSelectQuestion?: (id: number) => void;
}

export default function PracticeQuestionStatus({
  statusList,
  onSelectQuestion,
}: PracticeQuestionStatusProps) {
  return (
    <div className="space-y-5">
      {/* Question Number Badges Grid */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {statusList.map((item) => {
          let badgeBg = '';

          if (item.status === 'correct') {
            badgeBg = 'bg-[#20C98B] text-white shadow-2xs font-extrabold';
          } else if (item.status === 'wrong') {
            badgeBg = 'bg-[#EF4444] text-white shadow-2xs font-extrabold';
          } else {
            badgeBg = 'bg-white border-2 border-[#2F80ED] text-[#2F80ED] font-extrabold';
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectQuestion?.(item.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 cursor-pointer hover:scale-105 ${badgeBg}`}
              title={`Câu ${item.numLabel}`}
            >
              {item.numLabel}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#20C98B]" />
          <span>Đúng</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[#EF4444]" />
          <span>Sai</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-[#2F80ED]" />
          <span>Chưa làm</span>
        </div>
      </div>
    </div>
  );
}
