'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Presentation,
  Maximize2,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/driveHelper';

interface LessonDocumentViewerProps {
  title?: string;
  content?: string;
  description?: string;
  pptUrl?: string;
  docUrl?: string;
  totalPageCount?: number;
}

export default function LessonDocumentViewer({
  title = 'Phân số là gì?',
  content = '',
  description = '',
  pptUrl,
  docUrl,
  totalPageCount,
}: LessonDocumentViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);

  // Helper to split markdown content into slides if content exists
  const getSlides = (text: string): string[] => {
    if (!text || !text.trim()) {
      return [];
    }

    // Split by 3 or more hyphens (---, -------, -------------------, etc.)
    if (/^\s*-{3,}\s*$/m.test(text) || text.includes('---')) {
      const parts = text.split(/\n\s*-{3,}\s*\n/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts;
    }

    const headingSplit = text.split(/(?=\n(?:\#\#|\#)\s)/);
    if (headingSplit.length > 1) {
      return headingSplit.map((s) => s.trim()).filter(Boolean);
    }

    return [text];
  };

  const isContentEmbedUrl = Boolean(content && (content.trim().startsWith('http') || content.trim().startsWith('<iframe')));
  const slides = getSlides(content);
  const totalSlides = totalPageCount
    ? totalPageCount
    : isContentEmbedUrl
      ? 50
      : slides.length;

  const getEmbedIframeSrc = (rawContent: string, slideIdx?: number) => {
    if (!rawContent) return '';
    let trimmed = rawContent.trim();
    if (trimmed.includes('<iframe')) {
      const extracted = trimmed.match(/src=["']([^"']+)["']/i)?.[1];
      if (extracted) trimmed = extracted;
    }

    // Google Slides / Google Docs Presentation URL
    if (trimmed.includes('docs.google.com/presentation')) {
      const presIdMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (presIdMatch && presIdMatch[1]) {
        const presId = presIdMatch[1];
        let url = `https://docs.google.com/presentation/d/${presId}/embed?start=false&loop=false&delayms=3000`;
        if (typeof slideIdx === 'number' && slideIdx >= 0) {
          url += `#slide=id.p${slideIdx + 1}`;
        }
        return url;
      }

      let embedUrl = trimmed;
      if (!embedUrl.includes('/embed')) {
        embedUrl = embedUrl.replace(/\/(edit|pub|view|present|mobilebasic).*$/, '/embed');
      }
      if (!embedUrl.includes('start=')) {
        embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'start=false&loop=false&delayms=3000';
      }
      if (typeof slideIdx === 'number' && slideIdx >= 0) {
        embedUrl = embedUrl.replace(/#slide=.*$/, '').replace(/&slide=.*$/, '') + `#slide=id.p${slideIdx + 1}`;
      }
      return embedUrl;
    }

    // Microsoft Office Online Web Viewer for PPTX / PPT files & Google Drive Links
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      const resolved = resolveDocumentUrl(trimmed);
      return resolved.embedUrl;
    }

    if (trimmed.match(/\.(pptx|ppt)$/i) || (trimmed.startsWith('http') && !trimmed.includes('officeapps.live.com'))) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmed)}`;
    }

    return trimmed;
  };

  const [embedSrc, setEmbedSrc] = useState<string>(() =>
    isContentEmbedUrl ? getEmbedIframeSrc(content) : ''
  );

  useEffect(() => {
    if (isContentEmbedUrl) {
      setEmbedSrc(getEmbedIframeSrc(content));
    }
  }, [content, isContentEmbedUrl]);

  // Split slide text into sub-content blocks for step-by-step reveals
  const getSlideBlocks = (slideText: string) => {
    if (!slideText) return [];
    const rawLines = slideText.split('\n');
    const blocks: { type: 'heading' | 'bullet' | 'quote' | 'example' | 'text'; content: string }[] = [];

    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        blocks.push({ type: 'heading', content: trimmed });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ type: 'bullet', content: trimmed });
      } else if (trimmed.startsWith('>')) {
        blocks.push({ type: 'quote', content: trimmed });
      } else if (trimmed.toLowerCase().startsWith('ví dụ:') || trimmed.toLowerCase().startsWith('**ví dụ:')) {
        blocks.push({ type: 'example', content: trimmed });
      } else {
        blocks.push({ type: 'text', content: trimmed });
      }
    });

    return blocks;
  };

  const currentSlideBlocks = getSlideBlocks(slides[currentSlideIndex] || '');
  const maxSubStepIndex = isContentEmbedUrl ? 0 : Math.max(0, currentSlideBlocks.length - 1);
  const hasRemainingSubSteps = !isContentEmbedUrl && subStepIndex < maxSubStepIndex;

  const sendIframeMessage = (action: 'next' | 'previous') => {
    const targetIframes = [iframeRef.current, fullscreenIframeRef.current].filter(Boolean);
    targetIframes.forEach((iframe) => {
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ message: action }), '*');
          iframe.contentWindow.postMessage(action, '*');
          iframe.contentWindow.postMessage(JSON.stringify({ action: action }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ type: action === 'next' ? 'NEXT' : 'PREV' }), '*');
        } catch (e) {
          // ignore potential cross-origin restriction
        }
        try {
          iframe.focus();
        } catch (e) { }
      }
    });
  };

  const handleNextStep = () => {
    if (isContentEmbedUrl) {
      sendIframeMessage('next');
      if (currentSlideIndex < totalSlides - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
    } else {
      if (subStepIndex < maxSubStepIndex) {
        setSubStepIndex((prev) => prev + 1);
      } else if (currentSlideIndex < totalSlides - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
        setSubStepIndex(0);
      }
    }
  };

  const handlePrevStep = () => {
    if (isContentEmbedUrl) {
      sendIframeMessage('previous');
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex((prev) => prev - 1);
      }
    } else {
      if (subStepIndex > 0) {
        setSubStepIndex((prev) => prev - 1);
      } else if (currentSlideIndex > 0) {
        const prevIndex = currentSlideIndex - 1;
        const prevBlocks = getSlideBlocks(slides[prevIndex] || '');
        const prevMaxStep = Math.max(0, prevBlocks.length - 1);
        setCurrentSlideIndex(prevIndex);
        setSubStepIndex(prevMaxStep);
      }
    }
  };

  const handleSelectSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setSubStepIndex(0);
    if (isContentEmbedUrl) {
      setEmbedSrc(getEmbedIframeSrc(content, index));
    }
  };

  // Mute / Unmute audio & video elements
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((el) => {
      (el as HTMLMediaElement).muted = isMuted;
    });
  }, [isMuted, currentSlideIndex, subStepIndex]);

  // Keyboard controls (Arrow keys, Space, PageUp/PageDown, Home/End, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleSelectSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastIdx = totalSlides - 1;
        handleSelectSlide(lastIdx);
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, totalSlides, currentSlideIndex, subStepIndex, slides, isContentEmbedUrl, content]);

  const renderSlideContent = (slideText: string, isDark = false, isPreview = false, activeSubStep?: number) => {
    if (!slideText) return null;
    const blocks = getSlideBlocks(slideText);
    if (blocks.length === 0) return null;

    // Show blocks up to activeSubStep for active slide (or all blocks for previews)
    const visibleCount = isPreview || activeSubStep === undefined
      ? blocks.length
      : Math.min(activeSubStep + 1, blocks.length);

    return (
      <div className={`font-sans ${isPreview ? 'space-y-1.5 text-[11px]' : 'space-y-3.5'}`}>
        {blocks.map((block, idx) => {
          const isVisible = idx < visibleCount;
          const isJustRevealed = idx === activeSubStep && !isPreview;

          if (!isVisible) return null;
          const trimmed = block.content;

          if (block.type === 'heading') {
            return (
              <h3
                key={idx}
                className={`font-extrabold tracking-tight leading-snug flex items-center gap-2 transition-all duration-300 ${isJustRevealed ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''
                  } ${isPreview ? 'text-xs line-clamp-1' : 'text-xl sm:text-2xl'} ${isDark ? 'text-blue-400' : 'text-blue-700'
                  }`}
              >
                <span className={`rounded-full shrink-0 inline-block ${isPreview ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            );
          }

          if (block.type === 'bullet') {
            return (
              <div
                key={idx}
                className={`flex items-start gap-2 font-medium transition-all duration-300 rounded-xl ${isJustRevealed ? 'animate-in fade-in slide-in-from-left-3 duration-300 bg-blue-50/80 dark:bg-blue-900/30 p-2 border-l-3 border-blue-500' : 'pl-2'
                  } ${isPreview ? 'text-[10px] line-clamp-1' : 'text-sm sm:text-base'} ${isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}
              >
                <span className={`font-bold ${isPreview ? 'text-[9px]' : 'mt-1 text-xs'} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>▸</span>
                <span>{trimmed.replace(/^[-*]\s*/, '')}</span>
                {isJustRevealed && !isPreview && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white animate-pulse shrink-0">Mới</span>
                )}
              </div>
            );
          }

          if (block.type === 'quote') {
            return (
              <div
                key={idx}
                className={`rounded-2xl border-l-4 font-semibold my-2 transition-all duration-300 ${isJustRevealed ? 'animate-in fade-in zoom-in-95 duration-300 ring-2 ring-amber-400/40' : ''
                  } ${isPreview ? 'p-1.5 text-[10px] line-clamp-2' : 'p-3.5 text-xs sm:text-sm'} ${isDark ? 'bg-amber-500/10 border-amber-400 text-amber-200' : 'bg-amber-50 border-amber-500 text-amber-900'
                  }`}
              >
                {trimmed.replace(/^>\s*/, '')}
              </div>
            );
          }

          if (block.type === 'example') {
            return (
              <div
                key={idx}
                className={`rounded-2xl border-l-4 font-semibold my-2 transition-all duration-300 ${isJustRevealed ? 'animate-in fade-in slide-in-from-bottom-3 duration-300' : ''
                  } ${isPreview ? 'p-1.5 text-[10px] line-clamp-2' : 'p-3.5 text-xs sm:text-sm'} ${isDark ? 'bg-blue-500/10 border-blue-400 text-blue-200' : 'bg-blue-50 border-blue-500 text-blue-900'
                  }`}
              >
                {trimmed}
              </div>
            );
          }

          return (
            <p
              key={idx}
              className={`leading-relaxed font-normal transition-all duration-300 ${isJustRevealed ? 'animate-in fade-in duration-300' : ''
                } ${isPreview ? 'text-[10px] line-clamp-2' : 'text-xs sm:text-sm'} ${isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-none sm:rounded-3xl border-y sm:border border-slate-200/80 shadow-none sm:shadow-sm overflow-hidden space-y-0">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2.5 hidden sm:flex py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Presentation className="w-4 h-4 text-blue-600" /> SLIDE BÀI GIẢNG
          </span>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Action Controls: Slide Selector, Audio Toggle, Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer"
            title="Xem toàn màn hình"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Toàn màn hình</span>
          </button>
        </div>
      </div>

      {/* Presentation Stage Container (Expanded Full Width Stage) */}
      <div className="bg-slate-50/50">
        <div className="w-full mx-auto">
          {/* Main Active Slide Card */}
          <div className="w-full">
            {isContentEmbedUrl ? (
              <div className="relative rounded-t-none rounded-b-2xl sm:rounded-b-3xl border-2 border-slate-200 aspect-video w-full shadow-md bg-slate-900 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={embedSrc}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={title}
                />
              </div>
            ) : (
              <div className="relative rounded-t-none rounded-b-2xl sm:rounded-b-3xl overflow-hidden border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white via-slate-50 to-blue-50/30 p-6 sm:p-8 aspect-video flex flex-col justify-between text-slate-900 ring-2 ring-blue-500/10">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs sm:text-sm font-extrabold text-blue-900 tracking-tight truncate max-w-xs sm:max-w-md">
                      {title}
                    </span>
                  </div>

                  {/* Step Progress Badge */}
                  <div className="flex items-center gap-2">
                    {!isContentEmbedUrl && maxSubStepIndex > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Nội dung {subStepIndex + 1}/{maxSubStepIndex + 1}
                      </span>
                    )}
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                      Slide {totalSlides > 0 ? currentSlideIndex + 1 : 0} / {totalSlides}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 py-4 flex flex-col justify-center text-slate-800">
                  {renderSlideContent(slides[currentSlideIndex] || '', false, false, subStepIndex)}
                </div>

                {/* Card Footer */}
                <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Học liệu số Toán 4 • Bộ Giáo Dục & Đào Tạo</span>
                  <span>Trang {totalSlides > 0 ? currentSlideIndex + 1 : 0} / {totalSlides}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Presentation Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
          {/* Top Control Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-3 hidden sm:flex py-1 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shrink-0">
                <Presentation className="w-4 h-4" /> TRÌNH CHIẾU BÀI HỌC
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-200 truncate max-w-sm sm:max-w-md">{title}</h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Thoát chế độ toàn màn hình (Phím ESC)"
              >
                <X className="w-4 h-4" /> <span className="hidden sm:inline">Thoát (ESC)</span>
              </button>
            </div>
          </div>

          {/* Center Presentation Stage in Fullscreen */}
          <div className="relative my-auto w-full max-w-7xl mx-auto h-[85vh]">
            {/* Embedded Iframe URL Mode in Fullscreen */}
            {isContentEmbedUrl ? (
              <div className="w-full h-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                <iframe
                  ref={fullscreenIframeRef}
                  src={embedSrc}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={title}
                />
              </div>
            ) : (
              /* Markdown Presentation Screen in Fullscreen */
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border-4 border-slate-700/80 shadow-2xl p-6 sm:p-12 flex flex-col justify-between text-white overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> HOCCLIEUTOAN4 • POWERPOINT SLIDE
                  </span>

                  <div className="flex items-center gap-2">
                    {!isContentEmbedUrl && maxSubStepIndex > 0 && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Nội dung {subStepIndex + 1}/{maxSubStepIndex + 1}
                      </span>
                    )}
                    <span className="text-xs font-black px-3 py-1 bg-blue-600/30 border border-blue-400/40 rounded-full text-blue-200">
                      Trang {totalSlides > 0 ? currentSlideIndex + 1 : 0} / {totalSlides}
                    </span>
                  </div>
                </div>

                <div className="flex-1 py-4 flex flex-col justify-center max-w-4xl mx-auto w-full">
                  {renderSlideContent(slides[currentSlideIndex] || '', true, false, subStepIndex)}
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-md">{title}</span>
                  <span className="hidden sm:inline font-medium text-slate-300">
                    Bấm <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300">➡</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300">Space</kbd> để chạy hết từng nội dung trong slide trước khi chuyển trang
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

