'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  Shapes,
  BarChart3,
  BookOpen,
  ChevronDown,
  Diamond,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export interface PracticeCategoryTopic {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  active: boolean;
  exercises: { id: string; title: string; slug: string }[];
}

interface PracticeSidebarProps {
  activeTopicId: string;
  activeExerciseId?: string;
  onSelectTopic: (slug: string, exerciseId?: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function PracticeSidebar({
  activeTopicId,
  activeExerciseId,
  onSelectTopic,
  isSidebarOpen = true,
  onToggleSidebar,
}: PracticeSidebarProps) {
  const [categories, setCategories] = useState<PracticeCategoryTopic[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, exRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/exercises'),
        ]);

        const catData = await catRes.json();
        const exData = await exRes.json();

        const cats = catData.categories || [];
        const exercises = exData.exercises || [];

        // Group exercises by category or create fallback category topics
        const mapped: PracticeCategoryTopic[] = cats.map((c: { _id: string; slug: string; name: string }, idx: number) => {
          const catExercises = exercises
            .filter((e: { categoryId?: { slug: string; _id: string } }) => e.categoryId?.slug === c.slug || e.categoryId?._id === c._id)
            .map((e: { _id: string; title: string }) => ({
              id: e._id,
              title: e.title,
              slug: c.slug,
            }));

          let formattedName = (c.name || '').trim();
          const upper = formattedName.toUpperCase();
          if (!upper.startsWith('CHỦ ĐỀ')) {
            formattedName = `CHỦ ĐỀ ${idx + 1}. ${upper}`;
          } else {
            formattedName = upper;
          }

          return {
            id: c._id,
            slug: c.slug,
            name: formattedName,
            iconName: idx === 0 ? 'calculator' : idx === 1 ? 'shapes' : 'barchart',
            active: idx === 0, // Mặc định chỉ mở Chủ đề 1 (idx === 0)
            exercises: catExercises,
          };
        });

        if (mapped.length === 0) {
          mapped.push(
            { id: '1', slug: 'so-va-phep-tinh', name: 'CHỦ ĐỀ 1. SỐ VÀ PHÉP TÍNH', iconName: 'calculator', active: true, exercises: [] },
            { id: '2', slug: 'hinh-hoc-va-do-luong', name: 'CHỦ ĐỀ 2. HÌNH HỌC VÀ ĐO LƯỜNG', iconName: 'shapes', active: false, exercises: [] },
            { id: '3', slug: 'thong-ke-va-xac-suat', name: 'CHỦ ĐỀ 3. THỐNG KÊ VÀ XÁC SUẤT', iconName: 'barchart', active: false, exercises: [] }
          );
        }

        setCategories(mapped);
      } catch (err) {
        console.error('Error fetching practice topics:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (activeTopicId) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          active: cat.slug === activeTopicId,
        }))
      );
    }
  }, [activeTopicId]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculator':
        return <Calculator className="w-5 h-5 text-[#1261B5]" />;
      case 'shapes':
        return <Shapes className="w-5 h-5 text-[#1261B5]" />;
      case 'barchart':
        return <BarChart3 className="w-5 h-5 text-[#1261B5]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#1261B5]" />;
    }
  };

  // Chỉ cho phép mở duy nhất 1 chủ đề tại một thời điểm (Accordion)
  const handleCategoryToggle = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          return { ...cat, active: !cat.active };
        }
        return { ...cat, active: false }; // Tự động đóng tất cả các chủ đề khác
      })
    );
  };

  const activeCategory = categories.find((c) => c.slug === activeTopicId) || categories[0];

  return (
    <aside className="w-full lg:sticky lg:top-[128px] mt-5 md:mt-0">
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden mb-3 sm:mb-4 px-3 sm:px-0">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-blue-100 shadow-2xs text-[#0D4285] font-bold text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">{activeCategory?.name || 'CHỦ ĐỀ LUYỆN TẬP'}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#1677D2] shrink-0 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Collapsed Horizontal Mini Bar on Desktop */}
      {!isSidebarOpen && (
        <div className="hidden lg:flex flex-col items-center py-4 px-2 bg-white rounded-2xl border border-blue-50/80 shadow-sm space-y-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition flex items-center justify-center shadow-2xs"
            title="Mở rộng chủ đề luyện tập"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="w-8 h-[1px] bg-slate-100" />
          <div className="flex flex-col gap-2.5 items-center">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onSelectTopic(category.slug);
                  handleCategoryToggle(category.id);
                  if (onToggleSidebar) onToggleSidebar();
                }}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition flex items-center justify-center relative group"
                title={category.name}
              >
                <BookOpen className="w-5 h-5 text-[#1261B5]" />
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-30 shadow-lg">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Sidebar Content */}
      <div
        className={`${isMobileOpen ? 'block' : 'hidden'} ${isSidebarOpen ? 'lg:flex lg:flex-col' : 'lg:hidden'
          } bg-white rounded-2xl p-4 sm:p-5 border border-blue-50/80 shadow-sm overflow-hidden`}
      >
        {/* Desktop Header with Collapse Action (Pinned at top) */}
        {onToggleSidebar && (
          <div className="hidden lg:flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1677D2]" /> CHỦ ĐỀ LUYỆN TẬP
            </span>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="px-2 py-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
              title="Thu gọn danh mục"
            >
              <PanelLeftClose className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Topics List Container (Fixed, No Scroll) */}
        <div className="space-y-3.5">
          {categories.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs sm:text-sm font-medium">
              Chưa có bài tập nào.
            </div>
          ) : (
            categories.map((category) => {
              const isActive = category.slug === activeTopicId;
              const isCategoryActive = category.active;

              return (
                <div key={category.id} className="space-y-2">
                  <button
                    onClick={() => {
                      onSelectTopic(category.slug);
                      handleCategoryToggle(category.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-tight transition-all text-left uppercase ${isActive
                      ? 'bg-[#E1F1FF] text-[#1261B5] font-bold shadow-2xs'
                      : 'text-slate-700 hover:text-[#1261B5] hover:bg-slate-50'
                      }`}
                  >
                    <span className="truncate">{category.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryActive ? 'rotate-180 text-[#1261B5]' : ''
                        }`}
                    />
                  </button>

                  {isCategoryActive && category.exercises.length > 0 && (
                    <div className="pl-1 space-y-1 pt-1">
                      {category.exercises.map((ex) => {
                        const isExActive = activeExerciseId ? ex.id === activeExerciseId : false;
                        return (
                          <button
                            key={ex.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTopic(category.slug, ex.id);
                            }}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isExActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 hover:text-[#1261B5] hover:bg-blue-50/80'
                              }`}
                          >
                            <Diamond
                              className={`w-3 h-3 shrink-0 ${isExActive ? 'text-white fill-white' : 'text-blue-400'
                                }`}
                            />
                            <span className="truncate">{ex.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
