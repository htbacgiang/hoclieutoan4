'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  PlayCircle,
  FileText,
  CheckCircle2,
  ThumbsUp,
  HelpCircle,
  QrCode,
  Share2,
  Heart,
  Brain,
  Download,
  Presentation,
  ChevronLeft,
  Maximize2,
  X,
  MonitorPlay,
} from 'lucide-react';

interface LessonDetailClientProps {
  lesson: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    objectives: string[];
    video?: string;
    thumbnail?: string;
    difficulty: string;
    duration: number;
    categoryId?: { name: string; slug: string; color: string };
  };
  resources: {
    _id: string;
    title: string;
    type: string;
    url: string;
    description: string;
  }[];
  exercises: {
    _id: string;
    title: string;
    question: string;
    difficulty: string;
  }[];
}

export default function LessonDetailClient({ lesson, resources, exercises }: LessonDetailClientProps) {
  const [understoodStatus, setUnderstoodStatus] = useState<'UNDERSTOOD' | 'NOT_UNDERSTOOD' | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const [isPPTView, setIsPPTView] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const getSlides = (content: string) => {
    if (!content) return [];
    if (content.includes('---')) {
      return content.split(/\n\s*---\s*\n/).map((s) => s.trim()).filter(Boolean);
    }
    const headingSplit = content.split(/(?=\n(?:\#\#|\#)\s)/);
    if (headingSplit.length > 1) {
      return headingSplit.map((s) => s.trim()).filter(Boolean);
    }
    return [content];
  };

  const slides = getSlides(lesson.content || '');

  const handleUnderstand = async (status: 'UNDERSTOOD' | 'NOT_UNDERSTOOD') => {
    setUnderstoodStatus(status);
    setSavingProgress(true);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson._id,
          completed: status === 'UNDERSTOOD',
          progressPercent: status === 'UNDERSTOOD' ? 100 : 50,
        }),
      });
    } catch (err) {
      console.error('Error recording progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <Link href="/kham-pha" className="hover:text-blue-600 transition-colors">Khám phá</Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-blue-600 font-bold truncate max-w-xs">{lesson.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Header Block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                {lesson.categoryId?.name || 'Mạch kiến thức Toán 4'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedShare ? 'Đã chép link!' : 'Chia sẻ'}
                </button>
                <button className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold" title="Yêu thích">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {lesson.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {lesson.description}
            </p>
          </div>

          {/* Video Section */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative aspect-video border border-slate-800">
            {lesson.video ? (
              <video
                controls
                className="w-full h-full object-cover"
                poster={lesson.thumbnail}
              >
                <source src={lesson.video} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
                <PlayCircle className="w-16 h-16 text-blue-500 opacity-80" />
                <p className="text-sm text-slate-300 font-medium">Video minh họa trực quan đang được biên tập</p>
              </div>
            )}
          </div>

          {/* Detailed Content & PowerPoint Slide Deck */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Nội dung bài học
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPPTView(!isPPTView)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${isPPTView
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  <Presentation className="w-4 h-4" />
                  {isPPTView ? 'Chế độ Trình chiếu PPT (Bật)' : 'Xem dạng Slide PowerPoint'}
                </button>
              </div>
            </div>

            {/* Embedded PowerPoint Presentation File Player */}
            {lesson.content && (lesson.content.trim().startsWith('http') || lesson.content.trim().startsWith('<iframe')) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 border border-blue-400/30">
                      <Presentation className="w-3.5 h-3.5" /> PowerPoint Embed
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Bài Giảng Slide Trình Chiếu Nhúng
                    </span>
                  </div>
                  <a
                    href={
                      lesson.content.includes('<iframe')
                        ? (lesson.content.match(/src=["']([^"']+)["']/i)?.[1] || '#')
                        : lesson.content
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    Xem Fullscreen ↗
                  </a>
                </div>

                <div className="relative rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-950 aspect-video w-full">
                  <iframe
                    src={
                      lesson.content.includes('<iframe')
                        ? (lesson.content.match(/src=["']([^"']+)["']/i)?.[1] || lesson.content)
                        : lesson.content.includes('docs.google.com/presentation') && !lesson.content.includes('/embed')
                          ? lesson.content.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')
                          : lesson.content.match(/\.(pptx|ppt)$/i)
                            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(lesson.content)}`
                            : lesson.content
                    }
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="Bài Giảng PowerPoint Nhúng"
                  />
                </div>
              </div>
            ) : isPPTView && slides.length > 0 ? (
              <div className="space-y-4">
                {/* PPT Slide Screen */}
                <div className="rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-10 min-h-[300px] flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Slide Bài Giảng • {lesson.title}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-300 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30">
                      Slide {currentSlideIdx + 1} / {slides.length}
                    </span>
                  </div>

                  <div className="py-6 font-sans space-y-3">
                    {slides[currentSlideIdx]?.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={idx} className="h-1" />;
                      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight leading-snug">
                            {trimmed.replace(/^#+\s*/, '')}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return (
                          <div key={idx} className="flex items-start gap-2.5 text-slate-100 text-base sm:text-lg font-medium pl-2">
                            <span className="text-blue-400 font-bold mt-1 text-sm">▸</span>
                            <span>{trimmed.replace(/^[-*]\s*/, '')}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith('>')) {
                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 text-amber-200 text-sm font-semibold my-3">
                            {trimmed.replace(/^>\s*/, '')}
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-200 text-sm sm:text-base leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Học liệu số Toán 4</span>
                    <span>Trang {currentSlideIdx + 1} / {slides.length}</span>
                  </div>
                </div>

                {/* PPT Navigation Bar */}
                <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl">
                  <button
                    onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentSlideIdx === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Slide Trước
                  </button>

                  <div className="flex items-center gap-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIdx(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentSlideIdx ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        title={`Chuyển tới Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlideIdx >= slides.length - 1}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    Slide Tiếp <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
                {lesson.content.split('\n\n').map((paragraph, index) => (
                  <div key={index} className="whitespace-pre-line">
                    {paragraph}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Understanding Feedback */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-sm space-y-4 text-center sm:text-left sm:flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Em đã hiểu bài học này chưa?</h3>
              <p className="text-xs text-slate-500">Phản hồi giúp Robot AI đề xuất thêm bài tập phù hợp cho em nhé!</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 sm:pt-0">
              <button
                onClick={() => handleUnderstand('UNDERSTOOD')}
                disabled={savingProgress}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${understoodStatus === 'UNDERSTOOD'
                  ? 'bg-green-600 text-white shadow-green-500/20'
                  : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
                  }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Đã hiểu bài ({understoodStatus === 'UNDERSTOOD' ? 'Đã lưu' : '+50 XP'})
              </button>

              <button
                onClick={() => handleUnderstand('NOT_UNDERSTOOD')}
                disabled={savingProgress}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${understoodStatus === 'NOT_UNDERSTOOD'
                  ? 'bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
              >
                <HelpCircle className="w-4 h-4" />
                Chưa hiểu kỹ
              </button>
            </div>
          </div>

          {/* CTA: Start Practice */}
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Sẵn sàng thử sức?</div>
              <div className="text-2xl font-extrabold">Luyện tập bài toán tương tự</div>
            </div>
            <Link
              href={`/luyen-tap?lessonId=${lesson._id}`}
              className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-extrabold rounded-2xl text-sm shadow-lg shadow-black/10 transition-all shrink-0 flex items-center gap-2"
            >
              <Brain className="w-5 h-5 text-blue-600" />
              Luyện tập ngay
            </Link>
          </div>

        </div>

        {/* Right Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Objectives Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Em sẽ học được
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              {lesson.objectives?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Resources */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Tài liệu đi kèm ({resources.length})
            </h3>

            {resources.length === 0 ? (
              <p className="text-xs text-slate-400">Không có tài liệu đi kèm nào.</p>
            ) : (
              <div className="space-y-3">
                {resources.map((res) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {res.type === 'PDF' ? 'PDF' : res.type === 'POWERPOINT' ? 'PPT' : 'FILE'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                        {res.title}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{res.type}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Related Exercises */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-500" />
              Bài tập câu hỏi liên quan ({exercises.length})
            </h3>
            <div className="space-y-2">
              {exercises.slice(0, 4).map((ex, idx) => (
                <div key={ex._id} className="p-3 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{ex.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider">
              <QrCode className="w-4 h-4" /> Quét mã QR bài học
            </div>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://hoclieutoanlop4.com')}`}
                alt="QR Code bài học"
                className="w-28 h-28"
              />
            </div>
            <p className="text-xs text-slate-400">
              Quét mã QR để mở lại bài học này trên điện thoại thông minh tại nhà.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
