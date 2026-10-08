'use client';

interface PracticeProgressProps {
  completedCount?: number;
  totalCount?: number;
}

export default function PracticeProgress({
  completedCount = 3,
  totalCount = 10,
}: PracticeProgressProps) {
  const percentage = Math.round((completedCount / totalCount) * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center my-4">
      {/* Circular Progress SVG Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
          {/* Background Ring Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#E7F3FF"
            strokeWidth="14"
          />
          {/* Active Progress Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#20C98B"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-black text-[#123B72] tracking-tight leading-none">
            {completedCount}/{totalCount}
          </div>
          <div className="text-xs font-bold text-slate-400 mt-1">câu</div>
        </div>
      </div>
    </div>
  );
}
