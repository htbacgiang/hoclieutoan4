'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  Award,
  MessageSquare,
  Search,
  Bell,
  Menu,
  X,
  Compass,
  FolderLock,
  ChevronDown,
  LogOut,
  UserCheck,
  LayoutDashboard,
} from 'lucide-react';

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  className?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<{
    lessons: { _id: string; title: string; slug: string }[];
    exercises: { _id: string; title: string; lessonId?: { slug: string }; categoryId?: { slug: string } }[];
    resources: { _id: string; title: string; type: string }[];
    total: number;
  } | null>(null);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showLiveDropdown, setShowLiveDropdown] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch auth user on mount & on pathname changes
  useEffect(() => {
    setIsLoadingUser(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, [pathname]);

  // Live search debounce effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setLiveResults(null);
      setShowLiveDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingLive(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=4`)
        .then((res) => res.json())
        .then((data) => {
          setLiveResults(data);
          setShowLiveDropdown(true);
        })
        .catch(() => setLiveResults(null))
        .finally(() => setIsSearchingLive(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowLiveDropdown(false);
  }, [pathname]);

  // Prevent background body scroll when mobile menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLiveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowLiveDropdown(false);
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_err) { }
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Quản trị viên';
      case 'ADMIN':
        return 'Quản trị viên';
      case 'TEACHER':
        return 'Giáo viên';
      case 'PARENT':
        return 'Phụ huynh';
      default:
        return 'Học sinh';
    }
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/', icon: BookOpen },
    { name: 'Khám phá', href: '/kham-pha', icon: Compass },
    { name: 'Luyện tập', href: '/luyen-tap', icon: Sparkles },
    { name: 'Hỏi đáp', href: '/hoi-dap', icon: MessageSquare },
    { name: 'Chinh phục', href: '/chinh-phuc', icon: Award },
    { name: 'Kho học liệu', href: '/hoc-lieu', icon: FolderLock },
  ];

  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  const defaultAvatar = currentUser?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&bold=true`
    : 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80';

  const userAvatar = currentUser?.avatar && currentUser.avatar.trim() !== '' ? currentUser.avatar : defaultAvatar;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs transition-all">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 relative group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Toán 4 Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-contain shrink-0"
              />
              <span className="absolute -top-1 -right-1 text-yellow-300 text-[10px] sm:text-xs font-bold">★</span>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-tight leading-tight">Thư viện học liệu số</div>
              <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight leading-none">
                Toán 4
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar & User */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Form with Live Suggestions */}
            <div className="relative w-48 xl:w-64" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Tìm bài học, bài tập..."
                  value={searchQuery}
                  onFocus={() => {
                    if (liveResults && liveResults.total > 0) setShowLiveDropdown(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowLiveDropdown(false);
                    }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Popup Dropdown */}
              {showLiveDropdown && (
                <div className="absolute left-0 right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                    <span>Gợi ý tìm kiếm</span>
                    {isSearchingLive && <span className="animate-pulse text-blue-600">Đang tìm...</span>}
                  </div>

                  {!liveResults || liveResults.total === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Không có kết quả nào trùng khớp.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 py-1">
                      {/* Lessons */}
                      {liveResults.lessons && liveResults.lessons.length > 0 && (
                        <div>
                          <div className="px-4 py-1 text-[10px] font-extrabold text-blue-600 uppercase flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Bài giảng
                          </div>
                          {liveResults.lessons.map((item) => (
                            <Link
                              key={item._id}
                              href={`/kham-pha?slug=${item.slug}`}
                              onClick={() => setShowLiveDropdown(false)}
                              className="block px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 truncate"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Exercises */}
                      {liveResults.exercises && liveResults.exercises.length > 0 && (
                        <div>
                          <div className="px-4 py-1 text-[10px] font-extrabold text-emerald-600 uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Bài tập
                          </div>
                          {liveResults.exercises.map((item) => (
                            <Link
                              key={item._id}
                              href={`/luyen-tap?slug=${item.lessonId?.slug || item.categoryId?.slug || item._id}`}
                              onClick={() => setShowLiveDropdown(false)}
                              className="block px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 truncate"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* View All Button */}
                      <div className="pt-2 border-t border-slate-100 px-3">
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-extrabold transition text-center"
                        >
                          Xem tất cả kết quả cho &quot;{searchQuery}&quot; ➔
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* User Auth state */}
            {isLoadingUser ? (
              <div className="w-28 h-9 bg-slate-100 animate-pulse rounded-full" />
            ) : currentUser ? (
              /* Logged In User Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-slate-100/80 transition-colors border border-slate-100 hover:border-slate-200 shrink-0"
                >
                  <img
                    src={userAvatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <div className="text-left shrink-0">
                    <div className="text-[10px] text-slate-400 font-semibold leading-tight">Xin chào,</div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 whitespace-nowrap">
                      <span>{currentUser.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                      <img
                        src={userAvatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        {currentUser.email && (
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">
                          {getRoleLabel(currentUser.role)}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/tai-khoan"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-slate-500" />
                        <span>Trang cá nhân</span>
                      </Link>

                      {['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          <span>Trang Quản trị (CMS)</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Auth Buttons */
              <div className="flex items-center gap-2">
                <Link
                  href="/dang-nhap"
                  className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 hover:border-blue-300"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 rounded-xl transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Mở menu"
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer (From Left, 80% screen width, Full Screen Height with Slide In/Out Animation) */}
      <div
        className={`lg:hidden fixed inset-0 z-[9999] w-screen h-screen h-dvh transition-all duration-300 ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0 delay-200'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 w-screen h-screen h-dvh bg-slate-900/60 backdrop-blur-sm z-[9999] transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer Panel (80% width, max 360px, Full Screen Height) */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-xs h-screen h-dvh bg-white shadow-2xl flex flex-col justify-between z-[10000] transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <img src="/logo.png" alt="Toán 4" className="w-9 h-9 rounded-xl object-contain" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 leading-tight">Thư viện học liệu</div>
                  <div className="text-lg font-black text-blue-600 leading-none">Toán 4</div>
                </div>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Navigation Links */}
            <div className="p-4 flex-1 space-y-4 overflow-y-auto">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Tìm bài học, chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all border border-slate-200/60"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </form>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Auth / User Panel */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {currentUser ? (
                <div className="space-y-3 bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={userAvatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </p>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/tai-khoan"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl border border-blue-200"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Cá nhân</span>
                    </Link>

                    {['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role) && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/dang-nhap"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-xl shadow-2xs hover:bg-blue-50 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
    </header>
  );
}

