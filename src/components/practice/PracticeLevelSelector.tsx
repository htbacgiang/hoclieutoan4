'use client';

import { LEVELS, LevelItem } from '@/types/practice';
import { Flag, Trophy, Mountain } from 'lucide-react';

interface PracticeLevelSelectorProps {
  activeLevelId: string;
  onSelectLevel: (id: string) => void;
}

export default function PracticeLevelSelector({
  activeLevelId,
  onSelectLevel,
}: PracticeLevelSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
      {LEVELS.map((level: LevelItem) => {
        const isActive = level.id === activeLevelId;

        // Visual Theme Configurations matching reference
        let cardStyle = '';
        let iconBg = '';
        let iconColor = '';
        let IconComponent = Mountain;

        if (level.colorTheme === 'green') {
          IconComponent = Mountain;
          if (isActive) {
            cardStyle = 'bg-[#E8FAF2] border-2 border-[#20C98B] shadow-xs';
            iconBg = 'bg-[#20C98B]/20';
            iconColor = 'text-[#0F766E]';
          } else {
            cardStyle = 'bg-white border border-slate-200 hover:border-emerald-300';
            iconBg = 'bg-emerald-50';
            iconColor = 'text-emerald-500';
          }
        } else if (level.colorTheme === 'amber') {
          IconComponent = Trophy;
          if (isActive) {
            cardStyle = 'bg-[#FFF3DC] border-2 border-[#FFB547] shadow-xs';
            iconBg = 'bg-[#FFB547]/30';
            iconColor = 'text-[#D97706]';
          } else {
            cardStyle = 'bg-white border border-slate-200 hover:border-amber-300';
            iconBg = 'bg-amber-50';
            iconColor = 'text-amber-500';
          }
        } else if (level.colorTheme === 'pink') {
          IconComponent = Flag;
          if (isActive) {
            cardStyle = 'bg-[#FFF0F4] border-2 border-[#FF7D9A] shadow-xs';
            iconBg = 'bg-[#FF7D9A]/30';
            iconColor = 'text-[#E11D48]';
          } else {
            cardStyle = 'bg-white border border-slate-200 hover:border-rose-300';
            iconBg = 'bg-rose-50';
            iconColor = 'text-rose-500';
          }
        }

        return (
          <button
            key={level.id}
            onClick={() => onSelectLevel(level.id)}
            className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer ${cardStyle}`}
          >
            {/* Left Icon Container */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 leading-tight">{level.title}</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{level.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
