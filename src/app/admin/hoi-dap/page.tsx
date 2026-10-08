'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Users,
  HelpCircle,
  Lightbulb,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuestionLog {
  id: string;
  conversationId: string;
  user: {
    id?: string | null;
    name: string;
    email?: string;
    className?: string;
    avatar?: string;
    role?: string;
  };
  question: string;
  imageUrl?: string | null;
  mode: 'ask' | 'hint' | 'explain';
  answer: string;
  suggestedFollowUps?: string[];
  context?: {
    grade?: number;
    subject?: string;
    topic?: string;
    lesson?: string;
    level?: string;
  } | null;
  conversationTitle?: string;
  createdAt: string;
  timeAgo: string;
}

interface StatsData {
  totalConversations: number;
  totalQuestions: number;
  todayQuestionsCount: number;
  uniqueUsersCount: number;
}

interface FullConversationDetail {
  conversation: any;
  messages: Array<{
    _id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    imageUrl?: string;
    mode?: string;
    suggestedFollowUps?: string[];
    createdAt: string;
  }>;
}

export default function AdminHoiDapPage() {
  const [logs, setLogs] = useState<QuestionLog[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalConversations: 0,
    totalQuestions: 0,
    todayQuestionsCount: 0,
    uniqueUsersCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Expanded logs state for truncating long AI answers
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpandAnswer = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  // Full conversation detail modal state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<FullConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchLogs = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          search,
          mode: modeFilter,
        });

        const res = await fetch(`/api/admin/hoi-dap?${query.toString()}`);
        if (!res.ok) throw new Error('Không thể lấy dữ liệu hỏi đáp');
        const data = await res.json();

        if (data.success) {
          setLogs(data.logs || []);
          setStats(
            data.stats || {
              totalConversations: 0,
              totalQuestions: 0,
              todayQuestionsCount: 0,
              uniqueUsersCount: 0,
            }
          );
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
            setTotalItems(data.pagination.totalItems || 0);
          }
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu:', err);
        showNotification('Không thể tải nhật ký câu hỏi thực tế', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, modeFilter]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Search Input with Debounce or Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Open Full Conversation Detail Modal
  const openConversationDetail = async (convId: string) => {
    setSelectedConversationId(convId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/hoi-dap?conversationId=${convId}`);
      if (!res.ok) throw new Error('Lỗi lấy chi tiết cuộc trò chuyện');
      const data = await res.json();
      if (data.success) {
        setConversationDetail(data);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Không thể xem chi tiết cuộc hội thoại này', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Delete log item
  const handleDeleteLog = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/hoi-dap?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Đã xóa câu hỏi khỏi hệ thống');
        setDeleteConfirmId(null);
        fetchLogs(true);
      } else {
        throw new Error(data.message || 'Xóa thất bại');
      }
    } catch (err: any) {
      showNotification(err.message || 'Không thể xóa câu hỏi', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Delete whole conversation
  const handleDeleteConversation = async (convId: string) => {
    setDeletingId(convId);
    try {
      const res = await fetch(`/api/admin/hoi-dap?conversationId=${convId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Đã xóa toàn bộ cuộc trò chuyện');
        setSelectedConversationId(null);
        setConversationDetail(null);
        fetchLogs(true);
      } else {
        throw new Error(data.message || 'Xóa thất bại');
      }
    } catch (err: any) {
      showNotification(err.message || 'Không thể xóa hội thoại', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'hint':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Lightbulb className="w-3 h-3 text-amber-600" /> Gợi ý từng bước
          </span>
        );
      case 'explain':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <BookOpen className="w-3 h-3 text-purple-600" /> Giải thích chi tiết
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <HelpCircle className="w-3 h-3 text-blue-600" /> Hỏi đáp trực tiếp
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-blue-600" /> Lịch Sử Hỏi Đáp AI Robot
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát toàn bộ các câu hỏi thực tế của học sinh đã tương tác với Robot AI và câu trả lời trực tuyến từ MongoDB
          </p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          {refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Tổng Câu Hỏi Thực Tế</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalQuestions}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Câu Hỏi Trong Ngày</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{stats.todayQuestionsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Cuộc Trò Chuyện AI</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalConversations}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Tài Khoản Tương Tác</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.uniqueUsersCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm câu hỏi, câu trả lời hoặc tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mode filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => {
                setModeFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                modeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({stats.totalQuestions})
            </button>
            <button
              onClick={() => {
                setModeFilter('ask');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                modeFilter === 'ask'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hỏi đáp
            </button>
            <button
              onClick={() => {
                setModeFilter('hint');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                modeFilter === 'hint'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gợi ý
            </button>
            <button
              onClick={() => {
                setModeFilter('explain');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                modeFilter === 'explain'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giải thích
            </button>
          </div>
        </div>
      </div>

      {/* Logs List Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs min-h-[350px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" /> Nhật Ký Câu Hỏi Thực Tế ({totalItems})
          </h2>
          <span className="text-xs text-slate-400 font-medium">Cập nhật thời gian thực</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Đang truy xuất câu hỏi thực tế từ MongoDB...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">Chưa tìm thấy dữ liệu câu hỏi</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || modeFilter !== 'all'
                ? 'Không có kết quả nào phù hợp với bộ lọc hiện tại. Thử xóa từ khóa tìm kiếm.'
                : 'Khi học sinh đặt câu hỏi ở trang /hoi-dap, dữ liệu thực tế sẽ tự động lưu vào cơ sở dữ liệu và hiển thị ngay tại đây.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const isExpanded = Boolean(expandedLogs[log.id]);
              const isLongAnswer = Boolean(log.answer && log.answer.length > 200);
              const displayedAnswer =
                isLongAnswer && !isExpanded ? log.answer.slice(0, 200).trim() + '...' : log.answer;

              return (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 space-y-3 transition-all group"
                >
                  {/* Top User Header & Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-blue-100 shadow-xs flex items-center justify-center">
                        {log.user.avatar ? (
                          <img
                            src={log.user.avatar}
                            alt={log.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {log.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{log.user.name}</span>
                        <span className="text-slate-400 font-medium ml-2">({log.user.className})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getModeBadge(log.mode)}

                      {log.context?.lesson && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                          <Tag className="w-3 h-3 text-slate-500" /> {log.context.lesson}
                        </span>
                      )}

                      <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {log.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* User Question */}
                  <div className="space-y-1.5">
                    <div className="text-slate-900 font-bold text-sm flex items-start gap-2">
                      <span className="shrink-0 text-base">❓</span>
                      <div className="whitespace-pre-wrap">{log.question}</div>
                    </div>

                    {log.imageUrl && (
                      <div className="mt-2 inline-flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <a
                          href={log.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                        >
                          Xem hình ảnh đính kèm
                        </a>
                      </div>
                    )}
                  </div>

                  {/* AI Assistant Answer */}
                  <div className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-600 flex items-center gap-1.5 text-xs">
                        <Bot className="w-4 h-4" /> Trợ lý AI Robot phản hồi:
                      </div>
                      {isLongAnswer && (
                        <button
                          type="button"
                          onClick={() => toggleExpandAnswer(log.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Thu gọn</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Xem đầy đủ</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800">{displayedAnswer}</div>

                    {log.suggestedFollowUps && log.suggestedFollowUps.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Gợi ý nối tiếp:</span>
                        {log.suggestedFollowUps.map((fu, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100"
                          >
                            💬 {fu}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => openConversationDetail(log.conversationId)}
                    className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem toàn bộ hội thoại cuộc trò chuyện này
                  </button>

                  <div className="flex items-center gap-2">
                    {deleteConfirmId === log.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in duration-200">
                        <span className="text-rose-600 font-bold text-xs">Xác nhận xóa?</span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          disabled={deletingId === log.id}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          Xóa ngay
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-medium transition-colors"
                        title="Xóa nhật ký này"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-medium">
              Trang <span className="font-bold text-slate-900">{page}</span> / {totalPages} (Tổng{' '}
              <span className="font-bold text-slate-900">{totalItems}</span> câu hỏi)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trang trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                Trang sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View Full Conversation History */}
      {selectedConversationId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  {conversationDetail?.conversation?.title || 'Chi tiết cuộc trò chuyện'}
                </h3>
                {conversationDetail?.conversation?.userId?.name && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center">
                      {conversationDetail.conversation.userId.avatar ? (
                        <img
                          src={conversationDetail.conversation.userId.avatar}
                          alt={conversationDetail.conversation.userId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-blue-700">
                          {conversationDetail.conversation.userId.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Học sinh: <span className="font-bold text-slate-800">{conversationDetail.conversation.userId.name}</span>{' '}
                      ({conversationDetail.conversation.userId.className ? `Lớp ${conversationDetail.conversation.userId.className}` : 'Học viên'})
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedConversationId(null);
                  setConversationDetail(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Chat Messages */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/30">
              {loadingDetail ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Đang tải lịch sử chi tiết...</p>
                </div>
              ) : conversationDetail?.messages?.length ? (
                conversationDetail.messages.map((m) => (
                  <div
                    key={m._id}
                    className={`flex flex-col space-y-1 ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="text-[11px] text-slate-400 font-medium px-1">
                      {m.role === 'user' ? '❓ Học sinh' : '🤖 Trợ lý AI Robot'} •{' '}
                      {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      {m.imageUrl && (
                        <div className="mt-2">
                          <a href={m.imageUrl} target="_blank" rel="noreferrer">
                            <img
                              src={m.imageUrl}
                              alt="Ảnh đính kèm"
                              className="max-w-xs rounded-lg border border-white/20"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">Không có tin nhắn nào trong hội thoại này.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <button
                onClick={() => handleDeleteConversation(selectedConversationId)}
                disabled={deletingId === selectedConversationId}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa toàn bộ cuộc trò chuyện
              </button>

              <button
                onClick={() => {
                  setSelectedConversationId(null);
                  setConversationDetail(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
