'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Diamond,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export interface SidebarCategoryGroup {
  id: string;
  title: string;
  items: { id: string; title: string; slug: string }[];
}

export interface SidebarCategory {
  id: string;
  title: string;
  iconName: string;
  active: boolean;
  groups: SidebarCategoryGroup[];
}

interface ExploreSidebarProps {
  onSelectTopic?: (slug: string) => void;
  activeSlug?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function ExploreSidebar({
  onSelectTopic,
  activeSlug = 'phan-so-la-gi',
  isSidebarOpen = true,
  onToggleSidebar,
}: ExploreSidebarProps) {
  const [categories, setCategories] = useState<SidebarCategory[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(activeSlug);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function loadCategoriesAndLessons() {
      try {
        const [catRes, lesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/lessons?status=PUBLISHED'),
        ]);

        const catData = await catRes.json();
        const lesData = await lesRes.json();

        const cats = catData.categories || [];
        const lessons = lesData.lessons || [];

        const sidebarList: SidebarCategory[] = cats.map((c: any, idx: number) => {
          const catLessons = lessons
            .filter((l: any) => {
              const lCatId = l.categoryId?._id ? String(l.categoryId._id) : String(l.categoryId || '');
              const cId = String(c._id || '');
              const lCatSlug = l.categoryId?.slug;
              return (lCatSlug && lCatSlug === c.slug) || (lCatId && lCatId === cId);
            })
            .map((l: any) => ({
              id: l._id,
              title: l.title,
              slug: l.slug,
            }));

          const hasActiveLesson = catLessons.some((item: any) => item.slug === activeSlug || item.slug === selectedSlug);

          return {
            id: c._id,
            title: c.name,
            iconName: c.icon || 'book',
            active: hasActiveLesson,
            groups: [
              {
                id: `group-${c._id}`,
                title: 'Danh sách bài học',
                items: catLessons,
              },
            ],
          };
        });

        // Ensure at most 1 category is active by default
        const activeIdx = sidebarList.findIndex((cat) => cat.active);
        sidebarList.forEach((cat, idx) => {
          cat.active = activeIdx >= 0 ? idx === activeIdx : idx === 0;
        });

        setCategories(sidebarList);
      } catch (err) {
        console.error('Error fetching sidebar categories:', err);
      }
    }
    loadCategoriesAndLessons();
  }, [activeSlug, selectedSlug]);

  useEffect(() => {
    if (activeSlug && activeSlug !== selectedSlug) {
      setSelectedSlug(activeSlug);
    }
    if (activeSlug) {
      setCategories((prev) => {
        const catWithActiveLesson = prev.find((cat) =>
          cat.groups?.some((g) => g.items?.some((item) => item.slug === activeSlug))
        );
        if (!catWithActiveLesson) return prev;
        return prev.map((cat) => ({
          ...cat,
          active: cat.id === catWithActiveLesson.id,
        }));
      });
    }
  }, [activeSlug]);

  const handleCategoryToggle = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        active: cat.id === catId ? !cat.active : false,
      }))
    );
  };

  const handleItemClick = (slug: string) => {
    setSelectedSlug(slug);
    if (onSelectTopic) onSelectTopic(slug);
  };

  const activeCategory = categories.find((cat) => cat.active) || categories[0];

  return (
    <aside className="w-full">
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden mb-2 sm:mb-4 px-3 sm:px-0">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-blue-100 shadow-2xs text-[#0D4285] font-bold text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate uppercase font-extrabold text-[#0D4285]">
              CHỦ ĐỀ: {activeCategory?.title?.toUpperCase() || 'DANH MỤC BÀI HỌC'}
            </span>
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
            title="Mở rộng danh mục bài học"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="w-8 h-[1px] bg-slate-100" />
          <div className="flex flex-col gap-2.5 items-center">
            {categories.map((category, idx) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  handleCategoryToggle(category.id);
                  if (onToggleSidebar) onToggleSidebar();
                }}
                className={`w-9 h-9 rounded-xl font-black text-xs transition flex items-center justify-center relative group ${
                  category.active
                    ? 'bg-[#1261B5] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title={category.title.toUpperCase()}
              >
                <span>CĐ{idx + 1}</span>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-30 shadow-lg uppercase">
                  {category.title.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Sidebar Content */}
      <div
        className={`${isMobileOpen ? 'block' : 'hidden'
          } ${isSidebarOpen ? 'lg:block' : 'lg:hidden'} bg-white rounded-2xl p-4 sm:p-5 border border-blue-50/80 shadow-sm space-y-4`}
      >
        {/* Desktop Header with Collapse Action */}
        {onToggleSidebar && (
          <div className="hidden lg:flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              DANH MỤC BÀI HỌC
            </span>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="px-2 py-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
              title="Thu gọn danh mục để mở rộng khung xem tài liệu"
            >
              <PanelLeftClose className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        )}
        {categories.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs sm:text-sm font-medium">
            Chưa có bài học nào trong hệ thống.
          </div>
        ) : (
          categories.map((category) => {
          const isCategoryActive = category.active;

          return (
            <div key={category.id} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryToggle(category.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[#0D4285] font-extrabold text-sm sm:text-[15px] tracking-tight hover:text-[#1677D2] transition-colors text-left uppercase"
              >
                <span>{category.title.toUpperCase()}</span>
                {category.groups && category.groups.length > 0 && (
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isCategoryActive ? 'rotate-180 text-[#1261B5]' : ''
                      }`}
                  />
                )}
              </button>

              {/* Sub-groups inside active category */}
              {isCategoryActive && category.groups && category.groups.length > 0 && (
                <div className="pl-1 space-y-2">
                  {category.groups.map((group) => (
                    <div key={group.id} className="space-y-1">
                      {/* Items list */}
                      <div className="pl-2 pt-1 space-y-1">
                        {group.items.map((item) => {
                          const isActive = item.slug === selectedSlug || item.slug === activeSlug;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item.slug)}
                              className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isActive
                                  ? 'bg-[#E1F1FF] text-[#1261B5] font-bold shadow-2xs'
                                  : 'text-slate-600 hover:text-[#1261B5] hover:bg-slate-50'
                                }`}
                            >
                              <Diamond
                                className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#1261B5] fill-[#1261B5]' : 'text-slate-300'
                                  }`}
                              />
                              <span className="truncate">{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </aside>
  );
}
