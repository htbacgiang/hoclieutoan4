'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export interface HomeLessonItem {
  id: string;
  slug: string;
  title: string;
  duration: string;
  thumbnail: string;
  categoryName?: string;
  tags: { label: string; color: string }[];
}

interface FeaturedLessonsProps {
  initialLessons: HomeLessonItem[];
}

export default function FeaturedLessonsSection({ initialLessons }: FeaturedLessonsProps) {
  const [lessons, setLessons] = useState<HomeLessonItem[]>(initialLessons);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const ITEMS_PER_PAGE = 4; // Exactly 4 slides in 1 row

  useEffect(() => {
    async function checkActiveLesson() {
      try {
        const localSlug = typeof window !== 'undefined' ? localStorage.getItem('toan4_last_active_lesson_slug') : null;
        let lastSlug = localSlug;

        const res = await fetch('/api/progress/active-lesson');
        const data = await res.json();
        if (data.lastLessonSlug) {
          lastSlug = data.lastLessonSlug;
        }

        if (lastSlug && initialLessons.length > 0) {
          setActiveSlug(lastSlug);
          const activeIndex = initialLessons.findIndex((l) => l.slug === lastSlug);

          if (activeIndex > 0) {
            // Reorder: active lesson comes first, followed by remaining lessons, wrapping around
            const reordered = [
              ...initialLessons.slice(activeIndex),
              ...initialLessons.slice(0, activeIndex),
            ];
            setLessons(reordered);
          }
        }
      } catch (_err) {
        // Fallback to initial ordered list
      }
    }

    checkActiveLesson();
  }, [initialLessons]);

  const totalPages = Math.max(1, Math.ceil(lessons.length / ITEMS_PER_PAGE));

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const activeLessonItem = lessons.find((l) => l.slug === activeSlug);
  const currentLessons = lessons.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  // Calculate 3 dynamic visible dots
  let visibleDots: number[] = [];
  if (totalPages <= 3) {
    visibleDots = Array.from({ length: totalPages }, (_, i) => i);
  } else {
    if (currentPage === 0) {
      visibleDots = [0, 1, 2];
    } else if (currentPage >= totalPages - 1) {
      visibleDots = [totalPages - 3, totalPages - 2, totalPages - 1];
    } else {
      visibleDots = [currentPage - 1, currentPage, currentPage + 1];
    }
  }

  return (
    <section className="space-y-6">

      {/* Header & Slide Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Bài Học Nổi Bật (Bài 1 - Bài 32)
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Hiển thị dạng Slide 4 bài / hàng – Sắp xếp chuẩn chương trình Toán 4
          </p>
        </div>

        {/* Slider Navigation Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-center">

          {/* Exactly 3 Dots Indicator */}
          <div className="flex items-center gap-1.5 mr-2">
            {visibleDots.map((pageIdx) => (
              <button
                key={pageIdx}
                onClick={() => setCurrentPage(pageIdx)}
                className={`h-2.5 rounded-full transition-all ${currentPage === pageIdx ? 'w-7 bg-blue-600' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                title={`Trang ${pageIdx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevPage}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all shadow-xs active:scale-95"
            title="Trang trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextPage}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all shadow-xs active:scale-95"
            title="Trang tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Active Lesson Notice Banner */}
      {activeLessonItem && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-purple-400/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center text-xl shrink-0">
              🌟
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-yellow-300 uppercase tracking-wider">
                Vị trí bài bạn đang học
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
                {activeLessonItem.title}
              </div>
            </div>
          </div>

          <Link
            href={`/kham-pha?slug=${activeLessonItem.slug}`}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shrink-0 transition-all"
          >
            Học tiếp ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4 Slides 1 Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300">
        {currentLessons.map((item) => {
          const isActive = item.slug === activeSlug;

          return (
            <Link
              key={item.id}
              href={`/kham-pha?slug=${item.slug}`}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between relative ${isActive
                ? 'ring-2 ring-purple-500 border-purple-300 shadow-purple-500/10'
                : 'border-slate-200/80 hover:border-blue-300'
                }`}
            >
              <div>
                {/* Thumbnail Video Overlay */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-md border border-purple-400/40">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Đang học tiếp</span>
                    </div>
                  )}

                </div>

                {/* Title & Badges */}
                <div className="p-4 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-100">
                      {item.categoryName || 'Khám phá'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:underline">
                <span>Vào học ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>

            </Link>
          );
        })}
      </div>

    </section>
  );
}
