'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  FolderLock,
  Brain,
  TrendingUp,
  Activity,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StatsData {
  totalStudents: number;
  totalTeachers: number;
  totalLessons: number;
  totalResources: number;
  totalExercises: number;
  completionRate: string;
}

interface ChartItem {
  name: string;
  count: number;
}

interface PieItem {
  name: string;
  value: number;
}

interface ActivityItem {
  user: string;
  action: string;
  item: string;
  result: string;
  time: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    totalTeachers: 0,
    totalLessons: 0,
    totalResources: 0,
    totalExercises: 0,
    completionRate: '0%',
  });

  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [resourcePieData, setResourcePieData] = useState<PieItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Không thể tải dữ liệu thống kê');
      const data = await res.json();
      setStats(data.stats || {});
      setChartData(data.chartData || []);
      setResourcePieData(data.resourcePieData || []);
      setActivities(data.recentActivities || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const COLORS = ['#1677FF', '#36C98F', '#FF9F43', '#8B6CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tổng Quan Hệ Thống Admin</h1>
          <p className="text-xs text-slate-500 mt-1">Báo cáo dữ liệu thực tế toàn bộ nền tảng học liệu số Toán 4</p>
        </div>
        <button
          onClick={loadDashboardStats}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Học sinh</span>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.totalStudents}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Giáo viên</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.totalTeachers}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Bài học</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.totalLessons}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Học liệu</span>
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.totalResources}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Bài tập</span>
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.totalExercises}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-cyan-600">
            <span className="text-xs font-bold text-slate-500 uppercase">Tỷ lệ xong</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stats.completionRate}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Phân Phối Nội Dung Theo Mạch Kiến Thức</h2>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải biểu đồ...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                Chưa có dữ liệu phân loại
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} tickFormatter={(v) => (v.length > 18 ? `${v.substring(0, 18)}...` : v)} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1677FF" radius={[8, 8, 0, 0]} name="Số bài" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Tỷ Lệ Học Liệu Số Theo Định Dạng</h2>
          <div className="h-64 flex items-center justify-center">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...
              </div>
            ) : resourcePieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                Chưa có dữ liệu học liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={resourcePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {resourcePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Nhật Ký Hoạt Động Hệ Thống Gần Đây
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Người dùng</th>
                <th className="p-3">Hành động</th>
                <th className="p-3">Nội dung</th>
                <th className="p-3">Kết quả / Trạng thái</th>
                <th className="p-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Đang tải nhật ký hoạt động...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Chưa có nhật ký hoạt động nào gần đây.
                  </td>
                </tr>
              ) : (
                activities.map((act, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{act.user}</td>
                    <td className="p-3">{act.action}</td>
                    <td className="p-3">{act.item}</td>
                    <td className="p-3 font-bold text-blue-600">{act.result}</td>
                    <td className="p-3 text-slate-400">{act.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
