'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  Camera,
  Edit3,
  X,
  UploadCloud,
  Users,
  FileText,
  PlusCircle,
  MessageSquare,
  GraduationCap,
  ShieldCheck,
  Check,
  BookOpen,
  Award,
} from 'lucide-react';

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN';
  className?: string;
  points?: number;
  xp?: number;
  avatar?: string;
}

interface ProgressRecord {
  _id: string;
  exerciseTitle?: string;
  completed: boolean;
  score: number;
  maxScore: number;
  completionTime?: string;
  xpEarned: number;
  progressPercent: number;
  lastAccessedAt: string;
  lessonId?: {
    _id: string;
    title: string;
    slug: string;
    difficulty?: string;
  };
}

interface ConversationRecord {
  _id: string;
  title: string;
  context?: {
    lesson?: string;
    topic?: string;
    subject?: string;
  };
  updatedAt: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export default function AccountProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Real Progress & History State
  const [progressList, setProgressList] = useState<ProgressRecord[]>([]);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState<number>(12);
  const [userConversations, setUserConversations] = useState<ConversationRecord[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchLearningData();
  }, []);

  async function fetchLearningData() {
    try {
      setIsLoadingStats(true);
      const [progRes, lesRes, convRes] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/lessons?status=PUBLISHED'),
        fetch('/api/hoi-dap/conversations'),
      ]);

      const progData = await progRes.json();
      const lesData = await lesRes.json();
      const convData = await convRes.json();

      if (progData.progressList) {
        setProgressList(progData.progressList);
        setTotalCompleted(progData.totalCompleted || 0);
      }
      if (lesData.lessons && lesData.lessons.length > 0) {
        setTotalLessons(lesData.lessons.length);
      }
      if (convData.conversations) {
        setUserConversations(convData.conversations);
      }
    } catch (err) {
      console.error('Error fetching student learning history:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }

  async function fetchUserData() {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setEditName(data.user.name || '');
        setEditClassName(data.user.className || 'Lớp 4A');
        setEditAvatar(data.user.avatar || PRESET_AVATARS[0]);
      } else {
        // Mock fallback if not logged in
        const mock: UserProfile = {
          name: 'Nguyễn Văn Bảo',
          email: 'student@example.com',
          role: 'STUDENT',
          className: 'Lớp 4A',
          points: 120,
          xp: 450,
          avatar: PRESET_AVATARS[0],
        };
        setUser(mock);
        setEditName(mock.name);
        setEditClassName(mock.className || 'Lớp 4A');
        setEditAvatar(mock.avatar || PRESET_AVATARS[0]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Gần đây';
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Gần đây';
    }
  };

  // Handle local file preview (Cloudinary ready)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview reader
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
          setMessage({
            type: 'success',
            text: 'Đã chọn ảnh từ máy tính! (Sẵn sàng tải lên Cloudinary)',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const finalAvatar = customUrl.trim() !== '' ? customUrl.trim() : editAvatar;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          className: editClassName,
          avatar: finalAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');

      setUser(data.user);
      setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện và hồ sơ thành công!' });
      setTimeout(() => {
        setIsEditOpen(false);
        setMessage(null);
        window.location.reload(); // Refresh to update Header
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-bold text-sm">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isStudent = user?.role === 'STUDENT' || (!isTeacher && !isAdmin);

  const getRoleBadge = () => {
    if (isAdmin) {
      return {
        label: 'Quản Trị Viên CMS',
        icon: ShieldCheck,
        bg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
        gradient: 'from-slate-900 via-indigo-950 to-blue-900',
      };
    }
    if (isTeacher) {
      return {
        label: 'Giáo Viên Môn Toán',
        icon: GraduationCap,
        bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
        gradient: 'from-emerald-700 via-teal-800 to-cyan-900',
      };
    }
    return {
      label: 'Góc Học Sinh',
      icon: Sparkles,
      bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    };
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;
  const realProgressPercent = Math.min(100, Math.round((totalCompleted / (totalLessons || 12)) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner Hồ Sơ */}
      <div className={`bg-gradient-to-r ${roleInfo.gradient} text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">

          {/* Avatar with edit overlay */}
          <div className="relative group">
            <img
              src={user?.avatar || PRESET_AVATARS[0]}
              alt={user?.name || 'User Avatar'}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
            />
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] gap-1"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5" />
              <span>Đổi Avatar</span>
            </button>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleInfo.bg}`}>
              <RoleIcon className="w-3.5 h-3.5" /> {roleInfo.label}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>{user?.name}</span>
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Chỉnh sửa thông tin"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm font-medium">
              {user?.email} • {isStudent ? (user?.className || 'Lớp 4A') : isTeacher ? 'Tổ Toán Tiểu Học' : 'Hệ Thống Toán 4'}
            </p>
          </div>
        </div>

        {/* Action Button & Quick Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">


          <button
            onClick={() => setIsEditOpen(true)}
            className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Cập nhật Avatar & Hồ sơ</span>
          </button>
        </div>
      </div>

      {/* VAI TRÒ GIÁO VIÊN (TEACHER DASHBOARD) */}
      {isTeacher && (
        <div className="space-y-8">
          {/* Quick Metrics for Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Lớp Phụ Trách</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">2 Lớp (4A, 4B)</div>
              <p className="text-xs text-slate-400 font-medium">Tổng số: 72 học sinh</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Học Liệu Đã Đăng</span>
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">18 Bài học</div>
              <p className="text-xs text-slate-400 font-medium">3 mạch kiến thức chuẩn 2018</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Bài Tập Đã Tạo</span>
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">45 Bộ đề</div>
              <p className="text-xs text-slate-400 font-medium">Tự động chấm điểm</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Hỏi Đáp Đã Trợ Giúp</span>
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">32 Giải đáp</div>
              <p className="text-xs text-slate-400 font-medium">Tương tác sôi nổi cùng học sinh</p>
            </div>
          </div>

          {/* Teacher Action Center */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Bảng Điều Khiển & Công Cụ Giảng Dạy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/hoc-lieu"
                className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">Kho Học Liệu Số</h3>
                    <p className="text-xs text-slate-500">Xem và đóng góp tài liệu môn Toán 4</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-2">
                  <span>Mở Kho Học Liệu</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                href="/luyen-tap"
                className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">Ngân Hàng Bài Tập</h3>
                    <p className="text-xs text-slate-500">Tạo mới câu hỏi & quản lý ngân hàng bài tập</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
                  <span>Vào Luyện Tập</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                href="/hoi-dap"
                className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">Diễn Đàn Hỏi Đáp</h3>
                    <p className="text-xs text-slate-500">Giải đáp thắc mắc và hướng dẫn học sinh</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2">
                  <span>Đến Diễn Đàn</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VAI TRÒ HỌC SINH (STUDENT DASHBOARD WITH REAL HISTORY & QUESTIONS) */}
      {isStudent && (
        <div className="space-y-8">
          {/* Real Progress Bar & Stats */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Tiến Trình Chinh Phục Môn Toán 4</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isLoadingStats ? (
                    'Đang tính toán tiến trình học tập thực tế...'
                  ) : (
                    `Em đã hoàn thành ${totalCompleted} / ${totalLessons} nội dung bài học & luyện tập thực tế`
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-blue-600">{realProgressPercent}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full shadow-md transition-all duration-500"
                style={{ width: `${realProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Real Learning History & AI Questions (2 Balanced Equal Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* COLUMN 1: Lịch Sử Học & Luyện Tập Thực Tế */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Lịch Sử Học & Luyện Tập Gần Đây
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {progressList.length} hoạt động
                </span>
              </div>

              {isLoadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : progressList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                    📚
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">Em chưa có lịch sử học tập trên hệ thống.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Hãy bắt đầu khám phá bài giảng hoặc làm bài tập ngay để tích lũy điểm thưởng nhé!</p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Link
                      href="/kham-pha"
                      className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
                    >
                      Khám phá bài học
                    </Link>
                    <Link
                      href="/luyen-tap"
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
                    >
                      Làm bài tập
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {progressList.map((item) => {
                    const itemTitle = item.lessonId?.title || item.exerciseTitle || 'Bài tập Toán 4';
                    const itemSlug = item.lessonId?.slug;
                    const dateStr = formatDate(item.lastAccessedAt);

                    return (
                      <div
                        key={item._id}
                        className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 truncate">
                              {itemTitle}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-emerald-600 font-bold">
                                {item.completed ? 'Đã hoàn thành' : 'Đang làm'}
                              </span>
                              <span>•</span>
                              <span>Điểm: {item.score}/{item.maxScore || 10}</span>
                              <span>•</span>
                              <span className="text-amber-600 font-bold">XP +{item.xpEarned || 50}</span>
                              <span>•</span>
                              <span className="text-slate-400">{dateStr}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                          {itemSlug ? (
                            <Link
                              href={`/kham-pha?slug=${itemSlug}`}
                              className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition shadow-2xs"
                            >
                              Xem bài giảng
                            </Link>
                          ) : null}
                          <Link
                            href={`/luyen-tap${itemSlug ? `?slug=${itemSlug}` : ''}`}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs"
                          >
                            Luyện tập lại
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: Những Câu Hỏi Học Sinh Đã Gửi Cho Thầy Cô AI */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Lịch Sử Hỏi Đáp & Trợ Lý AI
                </h2>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {userConversations.length} câu đã hỏi
                </span>
              </div>

              {isLoadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : userConversations.length === 0 ? (
                <div className="p-8 text-center bg-indigo-50/40 rounded-2xl border border-dashed border-indigo-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
                    🤖
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">Em chưa gửi câu hỏi nào cho Thầy Cô AI.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Khi gặp bài toán khó, em có thể hỏi Trợ lý AI để nhận hướng dẫn giải từng bước chi tiết!</p>
                  <div className="pt-2">
                    <Link
                      href="/hoi-dap"
                      className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-md"
                    >
                      🤖 Hỏi Trợ Lý AI Ngay
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userConversations.map((conv) => {
                    const topicLabel = conv.context?.lesson || conv.context?.topic || 'Hỏi đáp bài tập Toán 4';
                    const dateStr = formatDate(conv.updatedAt);

                    return (
                      <div
                        key={conv._id}
                        className="p-4 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            🤖
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 truncate">
                              {conv.title}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-indigo-600 font-bold">{topicLabel}</span>
                              <span>•</span>
                              <span className="text-slate-400">{dateStr}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pt-1 sm:pt-0">
                          <Link
                            href={`/hoi-dap?conversationId=${conv._id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-2xs"
                          >
                            <span>Xem lời giải & Hỏi tiếp</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VAI TRÒ ADMIN (ADMIN DASHBOARD) */}
      {isAdmin && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-center">
          <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Tài Khoản Quản Trị Viên (Admin)</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bạn đang đăng nhập với quyền Admin. Bạn có toàn quyền quản lý bài học, học sinh, giáo viên và cài đặt hệ thống.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-all"
          >
            <span>Mở Trang Quản Trị CMS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* MODAL CẬP NHẬT HỒ SƠ & THAY ĐỔI AVATAR */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Cập Nhật Avatar & Hồ Sơ
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              {message && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                  {message.text}
                </div>
              )}

              {/* Current Avatar Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img
                    src={customUrl.trim() !== '' ? customUrl : editAvatar}
                    alt="Preview Avatar"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/30 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Xem trước Ảnh Đại Diện</span>
              </div>

              {/* Select Preset Avatars */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chọn Avatar Sẵn Có</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditAvatar(url);
                        setCustomUrl('');
                      }}
                      className={`relative rounded-full overflow-hidden border-2 transition-all aspect-square ${editAvatar === url && customUrl === ''
                        ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                        : 'border-transparent hover:border-slate-300'
                        }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload from Local Computer (Cloudinary Ready) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hoặc Tải Ảnh Từ Máy Tính</label>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer transition-colors text-xs font-bold text-slate-600">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Chọn tệp ảnh từ thiết bị </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or enter Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hoặc Dán Đường Dẫn URL Ảnh</label>
                <input
                  type="url"
                  placeholder="https://example.com/my-avatar.png"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class Name (for student) */}
              {isStudent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lớp học</label>
                  <input
                    type="text"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
