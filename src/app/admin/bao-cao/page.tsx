'use client';

import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';

export default function AdminBaoCaoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Báo Cáo & Thống Kê Chi Tiết</h1>
          <p className="text-xs text-slate-500">Phân tích tần suất học tập, hiệu quả giảng dạy và biểu đồ tăng trưởng học sinh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Tỷ lệ làm bài đúng trung bình</div>
          <div className="text-3xl font-extrabold text-green-600">84.2%</div>
          <p className="text-xs text-slate-400">+5.4% so với tháng trước</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng số lượt tải học liệu PDF/PPT</div>
          <div className="text-3xl font-extrabold text-blue-600">1,420 lượt</div>
          <p className="text-xs text-slate-400">Giáo viên & Phụ huynh tin dùng</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Lượt tương tác Robot AI</div>
          <div className="text-3xl font-extrabold text-purple-600">3,850 câu hỏi</div>
          <p className="text-xs text-slate-400">Được giải đáp 24/7 thành công</p>
        </div>
      </div>
    </div>
  );
}
