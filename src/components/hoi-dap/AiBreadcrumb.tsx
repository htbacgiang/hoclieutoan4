import Link from 'next/link';
import { ChevronRight, Home, MessageSquare } from 'lucide-react';
import { LessonContext } from '@/lib/openai';

interface AiBreadcrumbProps {
  context?: LessonContext;
}

export default function AiBreadcrumb({ context }: AiBreadcrumbProps) {
  const hasTopic = Boolean(context?.topic);
  const hasLesson = Boolean(context?.lesson);

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white/90 backdrop-blur-xs border-b border-blue-100/60 shrink-0 z-10"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-[#6680A3]">
          {/* 1. Trang chủ */}
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-[#1261B5] transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Trang chủ</span>
            </Link>
          </li>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

          {/* 2. Hỏi đáp */}
          <li>
            <Link
              href="/hoi-dap"
              className={`flex items-center gap-1 hover:text-[#1261B5] transition-colors ${
                !hasTopic ? 'text-[#1261B5] font-extrabold' : ''
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#1261B5]" />
              <span>Hỏi đáp</span>
            </Link>
          </li>

          {/* Dynamic Context: Topic */}
          {hasTopic && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <li className={!hasLesson ? 'text-[#1261B5] font-extrabold truncate max-w-[150px] sm:max-w-none' : ''}>
                <span>{context?.topic}</span>
              </li>
            </>
          )}

          {/* Dynamic Context: Lesson */}
          {hasLesson && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <li className="text-[#1261B5] font-extrabold truncate max-w-[180px] sm:max-w-none">
                <span>{context?.lesson}</span>
              </li>
            </>
          )}
        </ol>
      </div>
    </nav>
  );
}
