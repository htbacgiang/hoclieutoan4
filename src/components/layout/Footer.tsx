'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Heart,
  Sparkles,
  Compass,
  Award,
  FolderLock,
  MessageSquare,
  UserCheck,
  Search,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on AI Chat page and Admin dashboard
  if (pathname === '/hoi-dap' || pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">

          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="Toán 4 Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 tracking-tight">Thư viện học liệu số</div>
                <div className="text-2xl font-black text-white tracking-tight leading-none flex items-center gap-1.5">
                  Toán 4 <span className="text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">GDPT 2018</span>
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Hệ thống thư viện học liệu số hóa môn Toán lớp 4 hiện đại, hỗ trợ học sinh khám phá tri thức, luyện tập thông minh với Trợ lý Robot AI và giúp Phụ huynh đồng hành cùng con mọi lúc, mọi nơi.
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-center gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Chương trình Giáo dục phổ thông 2018 - Môn Toán Lớp 4</span>
              </div>
              <div className="flex items-center gap-4 text-xs pt-1">
                <a href="tel:1900TOAN4" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-400" /> Hotline: 1900-TOAN4
                </a>
                <a href="mailto:hotro@hoclieutoan4.vn" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4 text-amber-400" /> hotro@hoclieutoan4.vn
                </a>
              </div>
            </div>
          </div>

          {/* Strand Links */}
          <div className="space-y-4">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Mạch kiến thức
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/kham-pha" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  Số và phép tính
                </Link>
              </li>
              <li>
                <Link href="/kham-pha" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Hình học và đo lường
                </Link>
              </li>
              <li>
                <Link href="/kham-pha" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                  Thống kê và xác suất
                </Link>
              </li>
              <li>
                <Link href="/luyen-tap" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Một số yếu tố giải toán
                </Link>
              </li>
              <li>
                <Link href="/luyen-tap" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                  Bài tập tự luyện chọn lọc
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Navigation */}
          <div className="space-y-4">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" /> Chức năng chính
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/kham-pha" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  Góc Khám phá bài học
                </Link>
              </li>
              <li>
                <Link href="/luyen-tap" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  Góc Luyện tập thông minh
                </Link>
              </li>
              <li>
                <Link href="/chinh-phuc" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  Góc Chinh phục & Đánh giá
                </Link>
              </li>
              <li>
                <Link href="/hoc-lieu" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <FolderLock className="w-3.5 h-3.5 text-slate-500" />
                  Kho học liệu số
                </Link>
              </li>
              <li>
                <Link href="/phu-huynh" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  Dành cho Phụ huynh
                </Link>
              </li>
              <li>
                <Link href="/tim-kiem" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  Tra cứu & Tìm kiếm
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile App & QR Code section */}
          <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 text-center space-y-3 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-yellow-400 uppercase tracking-wider">
              <QrCode className="w-4 h-4" /> Quét Mã QR Học Bài
            </div>
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg ring-4 ring-blue-500/10">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://hoclieutoan4.vn')}`}
                alt="QR Code Học liệu Toán 4"
                className="w-24 h-24"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Quét QR bằng camera điện thoại để truy cập nhanh bài học trên thiết bị di động
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>© 2026 Thư viện Học liệu Số Toán 4. Xây dựng theo chuẩn Chương trình GDPT 2018.</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>dành cho học sinh & Phụ huynh Lớp 4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

