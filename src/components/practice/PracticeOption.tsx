'use client';

import { OptionItem } from '@/types/practice';
import FractionCircle from '@/components/math/FractionCircle';
import FractionRectangle from '@/components/math/FractionRectangle';
import FractionTriangle from '@/components/math/FractionTriangle';
import { Check } from 'lucide-react';

interface PracticeOptionProps {
  option: OptionItem;
  isSelected: boolean;
  onToggle: (id: 'A' | 'B' | 'C' | 'D') => void;
  disabled?: boolean;
}

export default function PracticeOption({
  option,
  isSelected,
  onToggle,
  disabled = false,
}: PracticeOptionProps) {
  const renderContent = () => {
    switch (option.type) {
      case 'circle-1-2':
        return <FractionCircle variant="1-2" />;
      case 'circle-1-4':
        return <FractionCircle variant="1-4" />;
      case 'circle-3-4':
        return <FractionCircle variant="3-4" />;
      case 'circle-2-4':
        return <FractionCircle variant="2-4" />;
      case 'circle-1-3':
        return <FractionCircle variant="1-3" />;
      case 'circle-2-3':
        return <FractionCircle variant="2-3" />;
      case 'rect-1-2':
        return <FractionRectangle variant="1-2" />;
      case 'rect-2-3':
        return <FractionRectangle variant="2-3" />;
      case 'rect-3-5':
        return <FractionRectangle variant="3-5" />;
      case 'rect-1-4':
        return <FractionRectangle variant="1-4" />;
      case 'triangle-unequal':
        return <FractionTriangle />;
      default:
        // Text / Number representation
        return (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xl sm:text-2xl font-black text-[#123B72] tracking-tight leading-snug">
              {option.textValue || option.label}
            </span>
            {option.subText && (
              <span className="text-xs font-semibold text-slate-500 mt-1">
                {option.subText}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Option Card Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(option.id)}
        className={`w-full aspect-square max-w-[170px] max-h-[170px] sm:max-w-[190px] sm:max-h-[190px] rounded-3xl p-4 flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-[#F0F7FF] border-2 border-[#2F80ED] shadow-md ring-2 ring-[#2F80ED]/20'
            : 'bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 shadow-2xs'
        }`}
      >
        {/* Selection Check Indicator */}
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#2F80ED] text-white flex items-center justify-center shadow-2xs">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}

        {/* Content (SVG or Text) */}
        <div className="w-full h-full flex items-center justify-center p-1">
          {renderContent()}
        </div>
      </button>

      {/* Option Letter Badge below card */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
          isSelected
            ? 'bg-[#2F80ED] text-white shadow-xs'
            : 'bg-white text-[#123B72] border border-slate-200 shadow-2xs'
        }`}
      >
        {option.id}
      </div>
    </div>
  );
}
