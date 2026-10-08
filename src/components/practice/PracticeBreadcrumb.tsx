'use client';

import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface PracticeBreadcrumbProps {
  topicName?: string;
  title?: string;
}

export default function PracticeBreadcrumb({
  title,
}: PracticeBreadcrumbProps) {
  const hasTitle = Boolean(title && title.trim() && title !== 'Luyện tập');

  return (
    <nav className="w-full py-2.5 px-3 sm:py-3 sm:px-6 bg-[#F5FAFF] border-b border-blue-100/80 sticky top-[80px] z-30 shadow-2xs">
      <div className="max-w-8xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#4A72A8] flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-1.5 hover:text-[#0D4285] transition-colors text-[#1677D2]"
        >
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1677D2]" />
          <span>Trang chủ</span>
        </Link>

        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8CB1E0] shrink-0" />

        {hasTitle ? (
          <>
            <Link
              href="/luyen-tap"
              className="hover:text-[#0D4285] transition-colors text-[#4A72A8]"
            >
              Luyện tập
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8CB1E0] shrink-0" />
            <span
              className="font-extrabold text-[#0D4285] tracking-tight truncate max-w-[200px] sm:max-w-lg"
              title={title}
            >
              {title}
            </span>
          </>
        ) : (
          <span className="font-extrabold text-[#0D4285] tracking-tight">
            Luyện tập
          </span>
        )}
      </div>
    </nav>
  );
}


