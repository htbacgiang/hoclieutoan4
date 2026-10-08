'use client';

import { UserCheck, CheckCircle2 } from 'lucide-react';

interface LearningObjectivesProps {
  objectives?: string[];
}

export default function LearningObjectives({
  objectives = [
    'Nhận biết phân số',
    'Đọc và viết phân số',
    'Phân số bằng nhau',
    'Ứng dụng trong thực tế',
  ],
}: LearningObjectivesProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-blue-50/80 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2.5 text-[#0D4285] font-black text-lg tracking-tight">
        <UserCheck className="w-5 h-5 text-[#1677D2]" />
        <h3>Em sẽ học được</h3>
      </div>

      {/* Checklist */}
      <ul className="space-y-3 pl-0.5">
        {objectives.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm font-bold text-[#1E3A66]">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
            </div>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
