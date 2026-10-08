'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, PenTool, CheckCircle2 } from 'lucide-react';

interface LessonActionsProps {
  initialFavorite?: boolean;
  isCompleted?: boolean;
  subject?: string;
  category?: string;
  title?: string;
  slug?: string;
  onShare?: () => void;
  onToggleFavorite?: (isFav: boolean) => void;
  onToggleComplete?: () => void;
}

export default function LessonActions({
  initialFavorite = false,
  isCompleted = false,
  subject = 'Toán',
  category = 'Phân số',
  title = 'Nhận biết phân số',
  slug,
  onShare,
  onToggleFavorite,
  onToggleComplete,
}: LessonActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleFavoriteClick = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (onToggleFavorite) onToggleFavorite(nextState);
  };

  const handleShareClick = () => {
    if (onShare) onShare();
  };

  const askAiUrl = `/hoi-dap?subject=${encodeURIComponent(subject)}&grade=4&topic=${encodeURIComponent(category)}&lesson=${encodeURIComponent(title)}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}&prompt=${encodeURIComponent(`Hướng dẫn em học bài "${title}" với ạ!`)}`;
  const practiceUrl = `/luyen-tap${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`;

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full">
      {/* Buttons: Hoàn thành & Làm bài tập (1 dòng trên mobile, full width trên desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3 w-full">
        {/* Button: Hoàn thành bài học */}
        <button
          onClick={onToggleComplete}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-2 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md cursor-pointer active:scale-98 text-center ${isCompleted
            ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400 shadow-emerald-500/10'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
            }`}
        >
          <span>{isCompleted ? '✓ Đã Hoàn Thành' : 'Xác Nhận Hoàn Thành'}</span>
        </button>

        {/* Button: Làm bài tập bài này */}
        <Link
          href={practiceUrl}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-2 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-98 text-center"
        >
          <span>Làm Bài Tập Bài Này</span>
        </Link>
      </div>


      {/* Button: Hỏi về bài này */}
      <a
        href={askAiUrl}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#1261B5] to-[#2F80ED] hover:opacity-95 shadow-md shadow-blue-500/20 transition-all duration-200 active:scale-98"
      >
        <span>Hỏi trợ lý AI về bài này</span>
      </a>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        {/* Button: Yêu thích */}
        <button
          onClick={handleFavoriteClick}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-200 border border-pink-100 shadow-2xs cursor-pointer ${isFavorite
            ? 'bg-[#FF6B81] text-white shadow-md ring-2 ring-pink-300/40'
            : 'bg-[#FFF0F3] hover:bg-[#FFE0E6] text-[#FF6B81]'
            }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white text-white' : 'fill-[#FF6B81] text-[#FF6B81]'
              }`}
          />
          <span>{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
        </button>

        {/* Button: Chia sẻ */}
        <button
          onClick={handleShareClick}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm text-[#1677D2] bg-[#E8F4FF] hover:bg-[#D4E9FF] border border-blue-100 shadow-2xs transition-all duration-200 active:scale-98 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1677D2]" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>

  );
}
