'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PracticeBreadcrumb from '@/components/practice/PracticeBreadcrumb';
import PracticeSidebar from '@/components/practice/PracticeSidebar';
import PracticeQuestion from '@/components/practice/PracticeQuestion';
import ToastNotification from '@/components/explore/ToastNotification';
import { QuestionData } from '@/types/practice';

export interface ApiExercise {
  _id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  content?: string;
  lessonId?: { _id: string; title: string; slug: string };
  categoryId?: { name: string; slug: string };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function LuyenTapContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('slug') || searchParams.get('lesson') || searchParams.get('exercise');

  const [activeTopicSlug, setActiveTopicSlug] = useState<string>('chu-de-1-on-tap-va-bo-sung');
  const [exercises, setExercises] = useState<ApiExercise[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchExercisesForCategory = useCallback(async (catSlug: string, targetId?: string | null) => {
    try {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      const allExercises: ApiExercise[] = data.exercises || [];

      // Filter exercises by category
      let list = allExercises.filter(
        (e) => e.categoryId?.slug === catSlug || e.categoryId?.name === catSlug
      );

      if (list.length === 0) {
        list = allExercises;
      }

      setExercises(list);
      if (targetId) {
        const foundIdx = list.findIndex((e) => e._id === targetId);
        setQuestionIndex(foundIdx !== -1 ? foundIdx : 0);
      } else {
        setQuestionIndex(0);
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setExercises([]);
    }
  }, []);

  // Initial load: handle urlParam mapping to exact lesson or exercise
  useEffect(() => {
    async function initFromUrl() {
      try {
        const res = await fetch('/api/exercises');
        const data = await res.json();
        const allExercises: ApiExercise[] = data.exercises || [];

        if (urlParam && allExercises.length > 0) {
          const targetSlug = urlParam.trim().toLowerCase();

          // 1. Match by exact lessonId.slug or exercise _id
          let matched = allExercises.find(
            (e) =>
              (e.lessonId?.slug && e.lessonId.slug.toLowerCase() === targetSlug) ||
              e._id === urlParam
          );

          // 2. Match by exercise title slug or content
          if (!matched) {
            matched = allExercises.find((e) => {
              const exTitleSlug = slugify(e.title || '');
              return (
                exTitleSlug === targetSlug ||
                exTitleSlug.includes(targetSlug) ||
                targetSlug.includes(exTitleSlug)
              );
            });
          }

          // 3. Match by category slug fallback
          if (!matched) {
            matched = allExercises.find((e) => e.categoryId?.slug === targetSlug);
          }

          if (matched) {
            const catSlug = matched.categoryId?.slug || 'chu-de-1-on-tap-va-bo-sung';
            setActiveTopicSlug(catSlug);
            setTargetExerciseId(matched._id);
            await fetchExercisesForCategory(catSlug, matched._id);
            setIsInitialized(true);
            return;
          }
        }

        await fetchExercisesForCategory('chu-de-1-on-tap-va-bo-sung');
      } catch (err) {
        console.error('Error initializing LuyenTapPage from URL:', err);
        fetchExercisesForCategory('chu-de-1-on-tap-va-bo-sung');
      } finally {
        setIsInitialized(true);
      }
    }

    if (!isInitialized) {
      initFromUrl();
    }
  }, [urlParam, isInitialized, fetchExercisesForCategory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const activeExerciseList = exercises;
  const currentExercise = activeExerciseList[questionIndex] || activeExerciseList[0] || null;

  const handleSelectTopic = (slug: string, exerciseId?: string) => {
    setTargetExerciseId(exerciseId || null);
    if (slug !== activeTopicSlug) {
      setActiveTopicSlug(slug);
      fetchExercisesForCategory(slug, exerciseId);
    } else if (exerciseId) {
      const idx = exercises.findIndex((e) => e._id === exerciseId);
      if (idx !== -1) {
        setQuestionIndex(idx);
      }
    }
  };

  const handleQuestionCompleted = (isCorrect: boolean) => {
    showToast(isCorrect ? 'Xuất sắc! Em đã hoàn thành bài tập.' : 'Hãy thử lại câu khác nhé!');
  };

  const handleNextQuestion = () => {
    if (questionIndex < activeExerciseList.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setQuestionIndex(0);
    }
  };

  const formattedQuestion: QuestionData = currentExercise
    ? {
      id: questionIndex + 1,
      lessonTitle: currentExercise.title || 'Luyện tập Toán 4',
      questionText:
        currentExercise.question ||
        currentExercise.content ||
        '<a target="_blank" href="https://wordwall.net/vi/resource/119358254/so-s%C3%A1nh-c%C3%A1c-s%E1%BB%91-trong-ph%E1%BA%A1m-vi-100?ref=embed-image"><img src="https://screens.cdn.wordwall.net/200/8c23325df506410f8d9b59b657556104_1" width="200" height="150" style="border:1px solid grey;display:block" /><span>So sánh các số trong phạm vi 100</span></a>',
      options:
        currentExercise.options &&
          currentExercise.options.length > 0 &&
          !currentExercise.question?.toLowerCase().includes('wordwall')
          ? currentExercise.options.map((optText, idx) => ({
            id: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
            label: ['A', 'B', 'C', 'D'][idx] || 'A',
            type: 'text',
            textValue: optText,
            isCorrect: idx === currentExercise.correctAnswer,
          }))
          : [],
      explanation: currentExercise.explanation || 'Bài tập luyện tập tương tác Toán 4',
    }
    : {
      id: 1,
      lessonTitle: 'So sánh các số trong phạm vi 100',
      questionText:
        '<a target="_blank" href="https://wordwall.net/vi/resource/119358254/so-s%C3%A1nh-c%C3%A1c-s%E1%BB%91-trong-ph%E1%BA%A1m-vi-100?ref=embed-image"><img src="https://screens.cdn.wordwall.net/200/8c23325df506410f8d9b59b657556104_1" width="200" height="150" style="border:1px solid grey;display:block" /><span>So sánh các số trong phạm vi 100</span></a>',
      options: [],
      explanation: 'Trò chơi tương tác so sánh hai số trong phạm vi 100 trên Wordwall.net',
    };

  return (
    <div className="bg-[#F5FAFF] pb-16">
      {/* 1. Breadcrumb Row */}
      <PracticeBreadcrumb
        topicName={
          currentExercise?.categoryId?.name
            ? currentExercise.categoryId.name.toUpperCase().startsWith('CHỦ ĐỀ')
              ? currentExercise.categoryId.name.toUpperCase()
              : `CHỦ ĐỀ 1. ${currentExercise.categoryId.name.toUpperCase()}`
            : 'CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG'
        }
        title={currentExercise?.title || 'Luyện tập Toán 4'}
      />

      {/* 2. Main Container (Collapsible Sidebar Layout) */}
      <div className="max-w-8xl mx-auto px-0 sm:px-6 lg:px-8 pt-1">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 items-stretch lg:items-start">

          {/* LEFT SIDEBAR (Collapses Horizontally & Sticky) */}
          <div
            className={`w-full ${isSidebarOpen ? 'lg:w-[280px] xl:w-[310px]' : 'lg:w-[64px]'
              } shrink-0 transition-all duration-300 ease-in-out lg:sticky lg:top-[128px] lg:self-start`}
          >
            <PracticeSidebar
              activeTopicId={activeTopicSlug}
              activeExerciseId={currentExercise?._id}
              onSelectTopic={handleSelectTopic}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

          {/* CENTER CONTENT */}
          <main className="w-full flex-1 min-w-0 space-y-3.5 sm:space-y-6 transition-all duration-300 ease-in-out">
            <PracticeQuestion
              key={`q-${activeTopicSlug}-${questionIndex}`}
              questionData={formattedQuestion}
              topicName={
                currentExercise?.categoryId?.name
                  ? currentExercise.categoryId.name.toUpperCase().startsWith('CHỦ ĐỀ')
                    ? currentExercise.categoryId.name.toUpperCase()
                    : `CHỦ ĐỀ 1. ${currentExercise.categoryId.name.toUpperCase()}`
                  : 'CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG'
              }
              onQuestionCompleted={handleQuestionCompleted}
              onNextQuestion={handleNextQuestion}
            />
          </main>

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

export default function LuyenTapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Đang tải bài tập luyện tập...</div>}>
      <LuyenTapContent />
    </Suspense>
  );
}
