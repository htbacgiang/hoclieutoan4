'use client';

import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface ExploreBreadcrumbProps {
  subject?: string;
  category?: string;
  title?: string;
}

export default function ExploreBreadcrumb({
  title,
}: ExploreBreadcrumbProps) {
  return (
    <nav className="w-full py-1.5 px-3 sm:py-3 sm:px-6 bg-[#F5FAFF] border-b border-blue-50/60">
      <div className="max-w-8xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#4A72A8] flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-1.5 hover:text-[#0D4285] transition-colors text-[#1677D2]"
        >
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1677D2]" />
          <span>Trang chủ</span>
        </Link>

        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8CB1E0] shrink-0" />

        {title && title !== 'Khám phá' ? (
          <>
            <Link
              href="/kham-pha"
              className="hover:text-[#0D4285] transition-colors text-[#4A72A8]"
            >
              Khám phá
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8CB1E0] shrink-0" />
            <span className="font-extrabold text-[#0D4285] tracking-tight truncate max-w-[140px] sm:max-w-md">
              {title}
            </span>
          </>
        ) : (
          <span className="font-extrabold text-[#0D4285] tracking-tight">
            Khám phá
          </span>
        )}
      </div>
    </nav>
  );
}
