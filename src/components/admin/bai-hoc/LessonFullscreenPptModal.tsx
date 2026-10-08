'use client';

import React from 'react';
import { Presentation, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLockBodyScroll } from './useLockBodyScroll';

interface LessonFullscreenPptModalProps {
  isFullscreenPPT: boolean;
  title: string;
  slides: string[];
  currentSlideIndex: number;
  onClose: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  renderSlideContent: (text: string) => React.ReactNode;
}

export default function LessonFullscreenPptModal({
  isFullscreenPPT,
  title,
  slides,
  currentSlideIndex,
  onClose,
  onPrevSlide,
  onNextSlide,
  renderSlideContent,
}: LessonFullscreenPptModalProps) {
  useLockBodyScroll(isFullscreenPPT);

  if (!isFullscreenPPT) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Presentation className="w-4 h-4" /> TRÌNH CHIẾU POWERPOINT
          </span>
          <h2 className="text-base font-bold text-slate-200 truncate max-w-md">
            {title || 'Bài Học Trình Chiếu'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400">
            Slide <span className="text-white font-extrabold">{currentSlideIndex + 1}</span> / {slides.length}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <X className="w-4 h-4" /> Thoát trình chiếu (ESC)
          </button>
        </div>
      </div>

      {/* Center 16:9 Presentation Canvas */}
      <div className="my-auto max-w-5xl w-full mx-auto aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border-4 border-slate-700 shadow-2xl p-8 sm:p-12 flex flex-col justify-between text-white relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            HOCCLIEUTOAN4 • POWERPOINT SLIDE PRESENTATION
          </span>
          <span className="text-xs font-extrabold text-slate-400">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        <div className="flex-1 py-4 flex flex-col justify-center">
          {renderSlideContent(slides[currentSlideIndex] || '')}
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>{title || 'Bài giảng'}</span>
          <span>Dùng phím mũi tên [ ⬅  |  ➡ ] hoặc dấu Cách để chuyển Slide</span>
        </div>
      </div>

      {/* Bottom Fullscreen Controls */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onPrevSlide}
          disabled={currentSlideIndex === 0}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Slide Trước
        </button>
        <span className="text-xs font-extrabold text-slate-300">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        <button
          onClick={onNextSlide}
          disabled={currentSlideIndex >= slides.length - 1}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
        >
          Slide Tiếp Theo <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
