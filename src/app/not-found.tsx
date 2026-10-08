import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-3xl shadow-inner">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Không tìm thấy trang bài học này</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Trang bạn đang truy cập không tồn tại hoặc đã được chuyển sang đường dẫn khác.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Quay về Trang chủ
      </Link>
    </div>
  );
}
