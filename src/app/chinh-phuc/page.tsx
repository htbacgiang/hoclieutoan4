'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  Sparkles,
  X,
  Calendar,
  HardDrive,
  Award,
  Zap,
  ArrowRight,
  FileCode,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  ExternalLink,
  Folder
} from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/driveHelper';

export type ExamType = 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'MID_TERM' | 'FINAL_TERM' | 'HOMEWORK' | 'PRACTICE';

interface TestResource {
  _id: string;
  title: string;
  description: string;
  type: 'PDF' | 'WORD';
  examType?: ExamType;
  fileSize?: string;
  thumbnail?: string;
  url: string;
  categoryId?: { name: string; color?: string; slug?: string };
  createdAt?: string;
}

// Fallback educational thumbnails if resource doesn't have a thumbnail image
const DEFAULT_THUMBNAILS = {
  MID_TERM_1: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
  FINAL_TERM_1: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
  MID_TERM_2: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
  FINAL_TERM_2: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  HOMEWORK: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
};

export default function ChinhPhucPage() {
  const [resources, setResources] = useState<TestResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'HOMEWORK'>('ALL');
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'PDF' | 'WORD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<TestResource | null>(null);
  const [isModalFullscreen, setIsModalFullscreen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchTestResources() {
      try {
        const res = await fetch('/api/resources?type=PDF,WORD');
        const data = await res.json();

        const fetchedList: TestResource[] = data.resources || [];
        const validFetched = fetchedList.filter(item => item.type === 'PDF' || item.type === 'WORD');
        setResources(validFetched);
      } catch (err) {
        console.error('Error fetching test resources:', err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTestResources();
  }, []);

  // Filter items logic
  const filteredList = resources.filter((item) => {
    // Only allow Word and PDF
    if (item.type !== 'PDF' && item.type !== 'WORD') return false;

    // Exam Type Tab Filter
    if (activeTab !== 'ALL') {
      if (item.examType) {
        if (item.examType === activeTab) {
          // exact match
        } else if (activeTab === 'MID_TERM_1' && item.examType === 'MID_TERM') {
          if (item.title.includes('2') || item.title.includes('kỳ 2')) return false;
        } else if (activeTab === 'FINAL_TERM_1' && item.examType === 'FINAL_TERM') {
          if (item.title.includes('2') || item.title.includes('kỳ 2')) return false;
        } else if (activeTab === 'MID_TERM_2' && item.examType === 'MID_TERM') {
          if (!item.title.includes('2') && !item.title.includes('kỳ 2')) return false;
        } else if (activeTab === 'FINAL_TERM_2' && item.examType === 'FINAL_TERM') {
          if (!item.title.includes('2') && !item.title.includes('kỳ 2')) return false;
        } else {
          return false;
        }
      } else {
        const titleLower = item.title.toLowerCase();
        if (activeTab === 'MID_TERM_1' && (!titleLower.includes('giữa') || !titleLower.includes('1'))) return false;
        if (activeTab === 'FINAL_TERM_1' && (!titleLower.includes('cuối') || !titleLower.includes('1'))) return false;
        if (activeTab === 'MID_TERM_2' && (!titleLower.includes('giữa') || !titleLower.includes('2'))) return false;
        if (activeTab === 'FINAL_TERM_2' && (!titleLower.includes('cuối') || !titleLower.includes('2'))) return false;
        if (activeTab === 'HOMEWORK' && (!titleLower.includes('bài tập') && !titleLower.includes('về nhà'))) return false;
      }
    }

    // Format Filter
    if (formatFilter !== 'ALL' && item.type !== formatFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const catMatch = item.categoryId?.name?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }

    return true;
  });

  const getExamBadge = (examType?: string) => {
    switch (examType) {
      case 'MID_TERM_1':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            📝 Giữa Học Kỳ 1
          </span>
        );
      case 'FINAL_TERM_1':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            🏆 Cuối Học Kỳ 1
          </span>
        );
      case 'MID_TERM_2':
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            📝 Giữa Học Kỳ 2
          </span>
        );
      case 'FINAL_TERM_2':
        return (
          <span className="px-2.5 py-1 rounded-full bg-teal-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            🏆 Cuối Học Kỳ 2
          </span>
        );
      case 'HOMEWORK':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            🏠 Bài Tập Về Nhà
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs">
            🎯 Luyện Tập
          </span>
        );
    }
  };

  const getThumbnailUrl = (item: TestResource) => {
    if (item.thumbnail && item.thumbnail.trim()) return item.thumbnail;
    if (item.examType && DEFAULT_THUMBNAILS[item.examType as keyof typeof DEFAULT_THUMBNAILS]) {
      return DEFAULT_THUMBNAILS[item.examType as keyof typeof DEFAULT_THUMBNAILS];
    }
    return DEFAULT_THUMBNAILS.DEFAULT;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Main Filter Section */}
      <div className="space-y-6">

        {/* Navigation Tabs for all 4 terms + Homework */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'ALL'
              ? 'bg-white text-indigo-700 shadow-md shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Tất Cả
          </button>

          <button
            onClick={() => setActiveTab('MID_TERM_1')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'MID_TERM_1'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            📝 Giữa Học Kỳ 1
          </button>

          <button
            onClick={() => setActiveTab('FINAL_TERM_1')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'FINAL_TERM_1'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🏆 Cuối Học Kỳ 1
          </button>

          <button
            onClick={() => setActiveTab('MID_TERM_2')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'MID_TERM_2'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            📝 Giữa Học Kỳ 2
          </button>

          <button
            onClick={() => setActiveTab('FINAL_TERM_2')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'FINAL_TERM_2'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🏆 Cuối Học Kỳ 2
          </button>

          <button
            onClick={() => setActiveTab('HOMEWORK')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${activeTab === 'HOMEWORK'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🏠 Bài Tập Về Nhà
          </button>
        </div>

        {/* Search & Format Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm đề thi, bài tập theo tên hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Format Selector Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Dạng tệp:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFormatFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${formatFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFormatFilter('WORD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${formatFilter === 'WORD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                📄 Word (.docx)
              </button>
              <button
                onClick={() => setFormatFilter('PDF')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${formatFilter === 'PDF' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                📕 PDF (.pdf)
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Document Grid List with Thumbnails */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Danh Sách Đề Thi & Bài Tập ({filteredList.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-slate-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Chưa có bài tập hoặc đề thi nào</h3>
              <p className="text-xs text-slate-500">Hãy cập nhật đề thi và bài tập từ trang Admin (/admin/bai-kiem-tra).</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => {
              const isWord = item.type === 'WORD';
              const thumbUrl = getThumbnailUrl(item);

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl relative group ${isWord ? 'border-blue-100 hover:border-blue-300' : 'border-red-100 hover:border-red-300'
                    }`}
                >

                  {/* Thumbnail Image Container */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      {getExamBadge(item.examType)}

                      {/* File Format Badge */}
                      {isWord ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-extrabold backdrop-blur-md shadow-xs">
                          📄 WORD (.docx)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold backdrop-blur-md shadow-xs">
                          📕 PDF (.pdf)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description || 'Tài liệu học tập & đề kiểm tra ôn luyện toán lớp 4.'}
                      </p>
                    </div>

                    {/* Details Footer */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700">
                          📌 {item.categoryId?.name || 'Mạch Kiến Thức'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <HardDrive className="w-3.5 h-3.5" /> {item.fileSize || '1.5 MB'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem trước
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className={`w-full py-2.5 px-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all text-white ${isWord
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                            : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                            }`}
                        >
                          <Download className="w-3.5 h-3.5" /> Tải về
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal - Full File Viewer */}
      {previewItem && (() => {
        const urlInfo = resolveDocumentUrl(previewItem.url);

        return (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all ${isModalFullscreen ? 'p-0' : 'p-2 sm:p-4'
              }`}
          >
            <div
              className={`bg-white shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${isModalFullscreen
                ? 'w-full h-full rounded-none p-3 sm:p-4 border-0'
                : 'w-full h-[95vh] container rounded-2xl p-4 sm:p-6 border border-slate-200'
                }`}
            >

              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {getExamBadge(previewItem.examType)}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${previewItem.type === 'WORD' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                      {previewItem.type === 'WORD' ? 'Tệp Word (.docx)' : 'Tệp PDF (.pdf)'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                    {previewItem.title}
                  </h3>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={urlInfo.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    title="Mở trong cửa sổ trình duyệt mới"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở cửa sổ mới</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={isModalFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                  >
                    {isModalFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewItem(null);
                      setIsModalFullscreen(false);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Full Document / Folder Viewer */}
              <div className="flex-1 my-3 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-inner flex flex-col min-h-0">
                {urlInfo.type === 'GOOGLE_DRIVE_FOLDER' ? (
                  <div className="w-full h-full bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
                      <Folder className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-lg font-extrabold text-white">Thư Mục Google Drive</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Đây là đường dẫn Thư mục Google Drive (chứa nhiều tệp tài liệu). Theo quy định bảo mật của Google, Thư mục không thể xem trực tiếp bên trong ô xem trước.
                      </p>
                    </div>

                    <a
                      href={urlInfo.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Mở Thư Mục Google Drive Trong Tab Mới</span>
                    </a>
                  </div>
                ) : urlInfo.type === 'GOOGLE_DRIVE_FILE' ? (
                  <iframe
                    src={urlInfo.embedUrl}
                    className="w-full h-full border-0 bg-slate-900"
                    title={previewItem.title}
                  />
                ) : previewItem.type === 'PDF' ? (
                  urlInfo.embedUrl.startsWith('/') || urlInfo.embedUrl.includes(window.location.host) ? (
                    <iframe
                      src={`${urlInfo.embedUrl}#toolbar=1&navpanes=1&view=FitH`}
                      className="w-full h-full border-0 bg-slate-800"
                      title={previewItem.title}
                    />
                  ) : (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(urlInfo.embedUrl)}&embedded=true`}
                      className="w-full h-full border-0 bg-white"
                      title={previewItem.title}
                    />
                  )
                ) : (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(urlInfo.embedUrl)}&embedded=true`}
                    className="w-full h-full border-0 bg-white"
                    title={previewItem.title}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 shrink-0">
                <p className="text-xs text-slate-500 truncate max-w-xl">
                  {previewItem.description || 'Xem trước trực tuyến toàn bộ tài liệu học tập & đề thi.'}
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewItem(null);
                      setIsModalFullscreen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Đóng
                  </button>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${previewItem.type === 'WORD'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                      }`}
                  >
                    <Download className="w-4 h-4" /> Tải về máy
                  </a>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
