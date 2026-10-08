'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Search, Trash2, X, Check, Mail, Lock, User, AlertCircle } from 'lucide-react';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface TeacherItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt?: string;
}

export default function AdminGiaoVienPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEACHER',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=TEACHER_ADMIN&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setTeachers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim() || '123456',
          role: formData.role,
          avatar: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Đã tạo tài khoản giáo viên "${formData.name}" thành công!`);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'TEACHER' });
        loadTeachers();
      } else {
        setFormError(data.message || 'Không thể tạo giáo viên. Vui lòng thử lại.');
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Đã xóa tài khoản giáo viên "${name}".`);
        setTeachers((prev) => prev.filter((t) => t._id !== id));
        setDeleteTarget(null);
      } else {
        alert('Không thể xóa tài khoản này.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi xóa.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl font-extrabold text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Quản Lý Giáo Viên</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tạo tài khoản, phân quyền giáo viên tạo bài học, bài tập và theo dõi học sinh
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setFormData({ name: '', email: '', password: '', role: 'TEACHER' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Giáo Viên Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm giáo viên theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-4">Giáo viên</th>
                <th className="p-4">Email liên hệ</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Đang tải danh sách giáo viên...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    {search ? 'Không tìm thấy giáo viên phù hợp.' : 'Chưa có giáo viên nào. Bấm nút "+ Thêm Giáo Viên Mới" để tạo.'}
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                      <img
                        src={t.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover border border-blue-100"
                      />
                      <div>
                        <div className="text-sm text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">ID: {t._id.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">{t.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                        t.role === 'ADMIN' || t.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        {t.role === 'TEACHER' ? 'Giáo viên Toán 4' : t.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t.status || 'Hoạt động'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: t._id, name: t.name })}
                        disabled={deletingId === t._id}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        title="Xóa tài khoản giáo viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Thêm Giáo Viên Mới</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Tạo tài khoản giáo viên giảng dạy Toán 4</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 font-bold text-slate-800">
                  Họ và tên giáo viên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="giaovien@school.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800">
                  Mật khẩu khởi tạo <span className="text-slate-400 font-normal">(Mặc định: 123456)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="123456"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800">Vai trò phân quyền</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                >
                  <option value="TEACHER">Giáo viên (Tạo bài học, bài tập & quản lý lớp)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Giáo Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTeacher}
        title="Xóa tài khoản giáo viên"
        itemName={deleteTarget?.name}
        description="Bạn có chắc chắn muốn xóa tài khoản giáo viên này? Giáo viên này sẽ không thể truy cập hệ thống quản trị nữa."
        isLoading={!!deletingId}
      />
    </div>
  );
}
