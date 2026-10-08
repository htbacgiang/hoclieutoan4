import { MessageSquareText, Lightbulb, BookOpen } from 'lucide-react';
import { ChatMode } from '@/lib/openai';

interface AiModeSelectorProps {
  currentMode: ChatMode;
  onChangeMode: (mode: ChatMode) => void;
}

export default function AiModeSelector({
  currentMode,
  onChangeMode,
}: AiModeSelectorProps) {
  const modes: Array<{
    id: ChatMode;
    label: string;
    icon: typeof MessageSquareText;
    activeBg: string;
    activeText: string;
    activeBorder: string;
  }> = [
    {
      id: 'ask',
      label: 'Hỏi bài',
      icon: MessageSquareText,
      activeBg: 'bg-[#1261B5]',
      activeText: 'text-white',
      activeBorder: 'border-[#1261B5]',
    },
    {
      id: 'hint',
      label: '💡 Gợi ý',
      icon: Lightbulb,
      activeBg: 'bg-amber-500',
      activeText: 'text-white',
      activeBorder: 'border-amber-500',
    },
    {
      id: 'explain',
      label: '📖 Giải thích',
      icon: BookOpen,
      activeBg: 'bg-[#20C98B]',
      activeText: 'text-white',
      activeBorder: 'border-[#20C98B]',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChangeMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              isActive
                ? `${m.activeBg} ${m.activeText} shadow-xs scale-102`
                : 'text-[#6680A3] hover:text-[#123B72] hover:bg-white/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
