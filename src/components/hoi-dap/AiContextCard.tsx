import Link from 'next/link';
import { BookOpen, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';
import { LessonContext } from '@/lib/gemini';

interface AiContextCardProps {
  context?: LessonContext;
}

export default function AiContextCard({ context }: AiContextCardProps) {
  const hasContext = Boolean(context && (context.topic || context.lesson));

  return (
    <div className="bg-white rounded-3xl p-5 border border-blue-100/60 shadow-xs space-y-4">
      <h3 className="text-base font-extrabold text-[#123B72] flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2F80ED]" /> Em đang học
        </span>
        {hasContext && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Bối cảnh bài học" />
        )}
      </h3>

      {hasContext ? (
        <div className="space-y-4">
          <div className="bg-[#F5FAFF] p-4 rounded-2xl border border-blue-100/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#6680A3] font-semibold">Môn học:</span>
              <span className="font-extrabold text-[#123B72]">{context?.subject || 'Toán'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6680A3] font-semibold">Lớp:</span>
              <span className="font-extrabold text-[#123B72]">Lớp {context?.grade || 4}</span>
            </div>
            {context?.topic && (
              <div className="flex items-center justify-between">
                <span className="text-[#6680A3] font-semibold">Chủ đề:</span>
                <span className="font-extrabold text-[#1261B5] text-right truncate max-w-[150px]">
                  {context.topic}
                </span>
              </div>
            )}
            {context?.lesson && (
              <div className="flex items-center justify-between">
                <span className="text-[#6680A3] font-semibold">Bài học:</span>
                <span className="font-extrabold text-[#123B72] text-right truncate max-w-[150px]">
                  {context.lesson}
                </span>
              </div>
            )}
            {context?.level && (
              <div className="flex items-center justify-between">
                <span className="text-[#6680A3] font-semibold">Cấp độ:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#1261B5] font-extrabold text-[10px]">
                  {context.level}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-blue-100/80 text-[11px] text-emerald-700 flex items-center gap-1.5 font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                {context?.documentFileName
                  ? `Tài liệu: ${context.documentFileName}`
                  : 'AI tự động đọc file /public/tai-lieu/'}
              </span>
            </div>
          </div>

          <Link
            href="/luyen-tap"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-extrabold text-xs text-[#1261B5] bg-[#E7F3FF] hover:bg-blue-100 transition-colors border border-blue-200/60"
          >
            <span>Xem bài học</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="py-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5FAFF] text-[#2F80ED] mx-auto flex items-center justify-center border border-blue-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#123B72]">Chưa chọn bài học</p>
            <p className="text-[11px] text-[#6680A3] leading-relaxed">
              Em có thể hỏi câu hỏi chung hoặc chọn bài học ở trang Khám phá & Luyện tập để AI trợ giúp chính xác nhất!
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/kham-pha"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Góc Khám phá</span>
            </Link>
            <Link
              href="/luyen-tap"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Góc Luyện tập</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
