'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  FileText,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Filter,
  PenTool,
  HelpCircle,
  X,
  Compass,
  LayoutGrid,
} from 'lucide-react';

interface LessonItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryId?: { name: string; slug: string; color?: string };
}

interface ExerciseItem {
  _id: string;
  title: string;
  question: string;
  difficulty?: string;
  lessonId?: { title: string; slug: string };
  categoryId?: { name: string; slug: string };
}

interface ResourceItem {
  _id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  categoryId?: { name: string; slug: string };
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface SearchResultsData {
  query: string;
  total: number;
  lessons: LessonItem[];
  exercises: ExerciseItem[];
  resources: ResourceItem[];
  categories: CategoryItem[];
}

const POPULAR_TAGS = [
  'Phân số',
  'Số có 5 chữ số',
  'Hình chữ nhật',
  'Phép nhân',
  'Diện tích',
  'Ôn tập',
  'Góc nhọn góc tù',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'lessons' | 'exercises' | 'resources' | 'categories'>('all');
  const [results, setResults] = useState<SearchResultsData>({
    query: '',
    total: 0,
    lessons: [],
    exercises: [],
    resources: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInputQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    async function executeSearch() {
      if (!initialQuery.trim()) {
        setResults({ query: '', total: 0, lessons: [], exercises: [], resources: [], categories: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(initialQuery.trim())}&limit=24`);
        const data = await res.json();
        setResults({
          query: data.query || initialQuery,
          total: data.total || 0,
          lessons: data.lessons || [],
          exercises: data.exercises || [],
          resources: data.resources || [],
          categories: data.categories || [],
        });
      } catch (err) {
        console.error('Search page error:', err);
      } finally {
        setLoading(false);
      }
    }
    executeSearch();
  }, [initialQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(inputQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setInputQuery(tag);
    router.push(`/tim-kiem?q=${encodeURIComponent(tag)}`);
  };

  const clearQuery = () => {
    setInputQuery('');
  };

  const totalLessons = results.lessons.length;
  const totalExercises = results.exercises.length;
  const totalResources = results.resources.length;
  const totalCategories = results.categories.length;

  return (
    <div className="bg-[#F5FAFF] min-h-screen pb-20">

      {/* 1. Hero Search Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-lg">
        <div className="container mx-auto space-y-6 relative z-10 text-center sm:text-left">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-yellow-300" />
            <span>Tra cứu & Tìm kiếm học liệu số</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {initialQuery.trim() ? (
              <>
                Kết quả cho từ khóa: &quot;<span className="text-yellow-300">{initialQuery}</span>&quot;
              </>
            ) : (
              'Tìm kiếm bài giảng, bài tập & tài liệu Toán 4'
            )}
          </h1>

          {/* Interactive Search Bar on Search Page */}
          <form onSubmit={handleFormSubmit} className="relative max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Nhập tên bài học, dạng bài tập hoặc chủ đề (vd: Phân số, Hình học)..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 text-sm sm:text-base font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 shadow-xl transition-all"
              />
              <Search className="w-5 h-5 text-blue-600 absolute left-4 pointer-events-none" />

              {inputQuery && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute right-24 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-2.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-blue-200 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Từ khóa phổ biến:
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Main Search Results Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Filter Tabs & Summary Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">

          {/* Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tất cả ({results.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'lessons'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Bài giảng ({totalLessons})</span>
            </button>

            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Bài tập ({totalExercises})</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'resources'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Học liệu ({totalResources})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              <span>Chủ đề ({totalCategories})</span>
            </button>
          </div>

          {/* Results Summary */}
          {initialQuery && !loading && (
            <div className="text-xs font-extrabold text-slate-500">
              Tìm thấy <span className="text-blue-600 font-black">{results.total}</span> kết quả phù hợp
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4 animate-pulse">
                <div className="w-20 h-5 bg-slate-200 rounded-lg" />
                <div className="w-3/4 h-6 bg-slate-200 rounded-lg" />
                <div className="w-full h-12 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : results.total === 0 && initialQuery.trim() ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-sm max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Không tìm thấy kết quả phù hợp</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Không tìm thấy nội dung nào chứa từ khóa &quot;<span className="font-bold text-slate-700">{initialQuery}</span>&quot;. Hãy thử kiểm tra chính tả hoặc dùng từ khóa ngắn hơn.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gợi ý từ khóa cho bạn:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold text-slate-700 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results Content Grid */
          <div className="space-y-12">

            {/* 1. LESSONS SECTION */}
            {(activeTab === 'all' || activeTab === 'lessons') && totalLessons > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Bài Giảng & Lý Thuyết ({totalLessons})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.lessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold uppercase">
                            {lesson.categoryId?.name || 'BÀI GIẢNG'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {lesson.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                          {lesson.description || 'Bài giảng tương tác sinh động Toán lớp 4.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/kham-pha?slug=${lesson.slug}`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Học bài giảng</span>
                        </Link>

                        <Link
                          href={`/luyen-tap?slug=${lesson.slug}`}
                          className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs transition flex items-center justify-center gap-1"
                          title="Làm bài tập bài này"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Làm bài tập</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. EXERCISES SECTION */}
            {(activeTab === 'all' || activeTab === 'exercises') && totalExercises > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Bài Tập Luyện Tập ({totalExercises})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.exercises.map((ex) => (
                    <div
                      key={ex._id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase">
                            {ex.categoryId?.name || 'BÀI TẬP'}
                          </span>
                          {ex.difficulty && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {ex.difficulty}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                          {ex.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                          {ex.question?.replace(/<[^>]*>?/gm, '') || 'Bài tập trắc nghiệm / điền số tương tác Toán 4.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <Link
                          href={`/luyen-tap?slug=${ex.lessonId?.slug || ex.categoryId?.slug || ex._id}`}
                          className="w-full text-center py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Luyện tập ngay</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RESOURCES SECTION */}
            {(activeTab === 'all' || activeTab === 'resources') && totalResources > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Tài Liệu & Học Liệu Số ({totalResources})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.resources.map((res) => (
                    <div
                      key={res._id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-extrabold uppercase">
                            {res.type || 'TÀI LIỆU'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                          {res.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                          {res.description || 'Tài liệu học tập số hóa hỗ trợ giảng dạy và luyện tập Toán 4.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <a
                          href={res.url || '/hoc-lieu'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xem tài liệu</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CATEGORIES SECTION */}
            {(activeTab === 'all' || activeTab === 'categories') && totalCategories > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    Chủ Đề Học Tập ({totalCategories})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                          📁
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug uppercase">
                          {cat.name}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                          {cat.description || 'Chủ đề môn Toán lớp 4 theo chương trình chuẩn.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/kham-pha?slug=${cat.slug}`}
                          className="flex-1 text-center py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>Xem chủ đề này</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default function TimKiemPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Đang tải trang tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}
