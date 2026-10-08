'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderLock,
  BookOpen,
  Brain,
  Award,
  Users,
  GraduationCap,
  MessageSquare,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Học liệu số', href: '/admin/hoc-lieu', icon: FolderLock },
    { name: 'Bài học', href: '/admin/bai-hoc', icon: BookOpen },
    { name: 'Bài tập', href: '/admin/bai-tap', icon: Brain },
    { name: 'Bài kiểm tra', href: '/admin/bai-kiem-tra', icon: ShieldCheck },
    { name: 'Học sinh', href: '/admin/hoc-sinh', icon: GraduationCap },
    { name: 'Giáo viên', href: '/admin/giao-vien', icon: Users },
    { name: 'Thành tích & Huy hiệu', href: '/admin/thanh-tich', icon: Award },
    { name: 'Hỏi đáp AI Log', href: '/admin/hoi-dap', icon: MessageSquare },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Báo cáo thống kê', href: '/admin/bao-cao', icon: BarChart3 },
    { name: 'Cài đặt hệ thống', href: '/admin/cai-dat', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Upper Section: Brand + Nav Items */}
      <div className="flex-1 overflow-hidden p-4 space-y-5">
        {/* Brand Header */}
        <div
          className={`flex border-b border-slate-800 pb-4 ${
            isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between'
          }`}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/logo.png"
                alt="Toán 4 Logo"
                className="w-9 h-9 rounded-xl object-contain shrink-0"
              />
              <div className="overflow-hidden whitespace-nowrap">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">ADMIN CMS</div>
                <div className="text-sm font-extrabold text-white truncate">Toán 4 Manager</div>
              </div>
            </div>
          ) : (
            <img
              src="/logo.png"
              alt="Toán 4 Logo"
              className="w-9 h-9 rounded-xl object-contain shrink-0"
            />
          )}

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                  isCollapsed ? 'justify-center px-0' : 'px-3.5'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Link */}
      <div className="shrink-0 p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          title={isCollapsed ? 'Xem Trang chủ Frontend' : undefined}
          className={`w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center transition-colors relative group ${
            isCollapsed ? 'justify-center px-0' : 'justify-center px-3 gap-2'
          }`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Trang chủ Frontend</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700">
              Xem Trang chủ Frontend
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

