'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import ExploreBreadcrumb from '@/components/explore/ExploreBreadcrumb';
import ExploreSidebar from '@/components/explore/ExploreSidebar';
import LessonHeader from '@/components/explore/LessonHeader';
import LessonDocumentViewer from '@/components/explore/LessonDocumentViewer';
import LessonFeedback from '@/components/explore/LessonFeedback';
import LessonActions from '@/components/explore/LessonActions';
import LearningObjectives from '@/components/explore/LearningObjectives';
import LessonResources from '@/components/explore/LessonResources';
import ToastNotification from '@/components/explore/ToastNotification';

interface ApiLesson {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  objectives?: string[];
  thumbnail?: string;
  video?: string;
  duration?: number;
  categoryId?: { name: string; slug: string };
}

function KhamPhaContent() {
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get('slug') || searchParams.get('lesson');

  const [currentSlug, setCurrentSlug] = useState(urlSlug || 'bai-1-on-tap-cac-so-den-100-000');
  const [lesson, setLesson] = useState<ApiLesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync initial completion status from API
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/progress');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const map: Record<string, boolean> = {};
            data.forEach((p: { lessonId?: { slug?: string }; completed?: boolean }) => {
              if (p.lessonId?.slug && p.completed) {
                map[p.lessonId.slug] = true;
              }
            });
            setCompletedMap((prev) => ({ ...prev, ...map }));
          }
        }
      } catch (_e) {
        // ignore fallback
      }
    }
    loadProgress();
  }, []);

  useEffect(() => {
    // If no URL slug provided, fetch user's saved active lesson position
    if (!urlSlug) {
      async function initActiveLesson() {
        try {
          const localSlug = typeof window !== 'undefined' ? localStorage.getItem('toan4_last_active_lesson_slug') : null;
          const res = await fetch('/api/progress/active-lesson');
          const data = await res.json();
          if (data.lastLessonSlug) {
            setCurrentSlug(data.lastLessonSlug);
            if (typeof window !== 'undefined') {
              const newUrl = `${window.location.pathname}?slug=${data.lastLessonSlug}`;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
          } else if (localSlug) {
            setCurrentSlug(localSlug);
            if (typeof window !== 'undefined') {
              const newUrl = `${window.location.pathname}?slug=${localSlug}`;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
          }
        } catch (_err) {
          // ignore
        }
      }
      initActiveLesson();
    } else if (urlSlug !== currentSlug) {
      setCurrentSlug(urlSlug);
    }
  }, [urlSlug]);

  const fetchLesson = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/lessons?status=PUBLISHED`);
      const data = await res.json();
      const lessons: ApiLesson[] = data.lessons || [];
      const found = lessons.find((l) => l.slug === slug) || lessons[0] || null;
      if (found) {
        setLesson(found);

        // Update URL query parameter without page reload if it doesn't match
        if (typeof window !== 'undefined') {
          localStorage.setItem('toan4_last_active_lesson_slug', found.slug);
          const currentUrlSlug = new URLSearchParams(window.location.search).get('slug');
          if (currentUrlSlug !== found.slug) {
            const newUrl = `${window.location.pathname}?slug=${found.slug}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          }
        }

        fetch('/api/progress/active-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: found.slug, lessonId: found._id }),
        }).catch(() => { });
      } else {
        setLesson(null);
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
    }
  }, []);

  useEffect(() => {
    fetchLesson(currentSlug);
  }, [currentSlug, fetchLesson]);

  const isCurrentFavorite = !!favoritesMap[currentSlug];
  const isCurrentCompleted = !!completedMap[currentSlug];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleSelectTopic = (slug: string) => {
    setCurrentSlug(slug);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?slug=${slug}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleToggleComplete = async () => {
    const nowCompleted = !isCurrentCompleted;
    setCompletedMap((prev) => ({
      ...prev,
      [currentSlug]: nowCompleted,
    }));

    if (nowCompleted) {
      showToast(`🎉 Em đã hoàn thành bài học "${lesson?.title || ''}"! (+50 XP)`);
    } else {
      showToast(`Đã hủy xác nhận hoàn thành bài học.`);
    }

    try {
      if (lesson) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson._id,
            exerciseTitle: lesson.title,
            completed: nowCompleted,
            score: 10,
            xpEarned: nowCompleted ? 50 : 0,
            progressPercent: nowCompleted ? 100 : 0,
          }),
        });
      }
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
    }
    showToast(`Đã sao chép liên kết bài học "${lesson?.title || ''}".`);
  };

  const handleDownload = (resourceTitle: string) => {
    showToast(`Đã chọn tài liệu "${resourceTitle}".`);
  };

  const handleFeedback = (status: 'understood' | 'not_understood') => {
    if (status === 'understood') {
      showToast(`Cảm ơn em! Thầy cô rất vui vì em đã hiểu bài "${lesson?.title || ''}".`);
    } else {
      showToast(`Cảm ơn em! Thầy cô đã ghi nhận để hỗ trợ em tốt hơn.`);
    }
  };

  const handleFavorite = (isFav: boolean) => {
    setFavoritesMap((prev) => ({
      ...prev,
      [currentSlug]: isFav,
    }));

    if (isFav) {
      showToast(`Đã thêm bài "${lesson?.title || ''}" vào danh sách yêu thích.`);
    } else {
      showToast(`Đã bỏ bài "${lesson?.title || ''}" khỏi danh sách yêu thích.`);
    }
  };

  const currentLessonData = {
    subject: 'Môn Toán 4',
    category: lesson?.categoryId?.name || 'Chủ đề 1. ÔN TẬP VÀ BỔ SUNG',
    title: lesson?.title || 'Đang tải bài học...',
    description: lesson?.description || '',
    videoUrl: lesson?.video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: lesson?.duration ? `${lesson.duration}:00` : '15:00',
    objectives: lesson?.objectives && lesson.objectives.length > 0
      ? lesson.objectives
      : ['Nhận biết được kiến thức trọng tâm của bài học', 'Đọc và viết được các phép tính đơn giản'],
    resources: [
      {
        id: 'r1',
        title: `Tài liệu bài giảng ${lesson?.title || ''}`,
        type: 'POWERPOINT' as const,
        badgeText: 'SLIDE PPT',
        badgeColor: 'bg-amber-100 text-amber-800',
        url: '#',
      },
      {
        id: 'r2',
        title: 'Phiếu bài tập luyện tập (PDF)',
        type: 'PDF' as const,
        badgeText: 'BÀI TẬP PDF',
        badgeColor: 'bg-blue-100 text-blue-800',
        url: '#',
      },
    ],
  };

  return (
    <div className=" bg-[#F5FAFF] pb-16">
      {/* 1. Breadcrumb Row */}
      <ExploreBreadcrumb
        category={currentLessonData.category}
        title={currentLessonData.title}
      />

      {/* 2. Main Container (Horizontal Collapsible Layout on Desktop) */}
      <div className="max-w-8xl mx-auto px-0 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 items-stretch lg:items-start">

          {/* LEFT SIDEBAR (Collapses Horizontally) */}
          <div
            className={`w-full ${isSidebarOpen ? 'lg:w-[280px] xl:w-[310px]' : 'lg:w-[64px]'
              } shrink-0 transition-all duration-300 ease-in-out`}
          >
            <ExploreSidebar
              activeSlug={currentSlug}
              onSelectTopic={handleSelectTopic}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

          {/* CENTER CONTENT (Expands Horizontally to Fill Freed Space) */}
          <main className="w-full flex-1 min-w-0 space-y-3.5 sm:space-y-6 transition-all duration-300 ease-in-out">
            {/* PowerPoint Slide & Word Document Viewer */}
            <LessonDocumentViewer
              key={`doc-${currentSlug}`}
              title={currentLessonData.title}
              description={currentLessonData.description}
              content={lesson?.content}
            />

          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full lg:w-[280px] xl:w-[310px] shrink-0 space-y-4 sm:space-y-5 px-3 sm:px-0">
            {/* Actions: Yêu thích, Chia sẻ & Hoàn thành bài */}
            <LessonActions
              key={`actions-${currentSlug}-${isCurrentFavorite}-${isCurrentCompleted}`}
              initialFavorite={isCurrentFavorite}
              isCompleted={isCurrentCompleted}
              onToggleComplete={handleToggleComplete}
              subject={currentLessonData.subject}
              category={currentLessonData.category}
              title={currentLessonData.title}
              slug={currentSlug}
              onShare={handleShare}
              onToggleFavorite={handleFavorite}
            />

            {/* Card: Em sẽ học được */}
            <LearningObjectives
              key={`objectives-${currentSlug}`}
              objectives={currentLessonData.objectives}
            />

            {/* Card: Tài liệu đi kèm */}
            <LessonResources
              key={`resources-${currentSlug}`}
              resources={currentLessonData.resources}
              onDownload={handleDownload}
            />
          </aside>

        </div>
      </div>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default function KhamPhaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Đang tải trang khám phá bài học...</div>}>
      <KhamPhaContent />
    </Suspense>
  );
}

