'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, GraduationCap, Plus, X, Check, Mail, Lock, User, AlertCircle, Award, Sparkles } from 'lucide-react';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  className?: string;
  points: number;
  xp: number;
  avatar?: string;
  status: string;
  createdAt?: string;
}

export default function AdminHocSinhPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    className: 'Lớp 4A',
    password: '',
    points: 0,
    xp: 0,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=STUDENT&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setStudents(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
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
          className: formData.className.trim() || 'Lớp 4A',
          role: 'STUDENT',
          points: Number(formData.points) || 0,
          xp: Number(formData.xp) || 0,
          avatar: `https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Đã thêm học sinh "${formData.name}" thành công!`);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', className: 'Lớp 4A', password: '', points: 0, xp: 0 });
        loadStudents();
      } else {
        setFormError(data.message || 'Không thể tạo học sinh. Vui lòng thử lại.');
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteStudent = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Đã xóa tài khoản học sinh "${name}".`);
        setStudents((prev) => prev.filter((s) => s._id !== id));
        setDeleteTarget(null);
      } else {
        alert('Không thể xóa tài khoản học sinh này.');
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
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <span>Quản Lý Học Sinh</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Danh sách học sinh, điểm thưởng, XP, tiến độ bài học và theo dõi chi tiết học tập
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setFormData({ name: '', email: '', className: 'Lớp 4A', password: '', points: 0, xp: 0 });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Học Sinh Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, email hoặc tên lớp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-4">Học sinh</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Email</th>
                <th className="p-4">Điểm Thưởng</th>
                <th className="p-4">Điểm XP</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Đang tải danh sách học sinh...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    {search ? 'Không tìm thấy học sinh phù hợp.' : 'Chưa có học sinh nào. Bấm nút "+ Thêm Học Sinh Mới" để tạo.'}
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80'}
                        alt={st.name}
                        className="w-9 h-9 rounded-full object-cover border border-blue-100"
                      />
                      <div>
                        <div className="text-sm text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">ID: {st._id.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-blue-600">{st.className || 'Lớp 4A'}</td>
                    <td className="p-4 text-slate-500 font-medium">{st.email}</td>
                    <td className="p-4 font-extrabold text-amber-600">{st.points || 0} pts</td>
                    <td className="p-4 font-extrabold text-cyan-600">{st.xp || 0} XP</td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: st._id, name: st.name })}
                        disabled={deletingId === st._id}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        title="Xóa học sinh"
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

      {/* Modal: Create Student */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Thêm Học Sinh Mới</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Tạo tài khoản học sinh tham gia học môn Toán 4</p>
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
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 font-bold text-slate-800">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Trần Bảo Nam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-800">Lớp học</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="Lớp 4A">Lớp 4A</option>
                    <option value="Lớp 4B">Lớp 4B</option>
                    <option value="Lớp 4C">Lớp 4C</option>
                    <option value="Lớp 4D">Lớp 4D</option>
                    <option value="Lớp 4E">Lớp 4E</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-800">Mật khẩu</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  />
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
                    placeholder="hocsinh@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-800">Điểm thưởng tích lũy</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-800">Điểm XP ban đầu</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full object-cover border border-blue-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email} • {selectedStudent.className || 'Lớp 4A'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>Điểm thưởng tích lũy:</span>
                <strong className="text-amber-600 font-black">{selectedStudent.points || 0} điểm</strong>
              </div>
              <div className="flex justify-between">
                <span>Kinh nghiệm XP:</span>
                <strong className="text-cyan-600 font-black">{selectedStudent.xp || 0} XP</strong>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái tài khoản:</span>
                <strong className="text-emerald-600 font-black">{selectedStudent.status || 'Hoạt động'}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteStudent}
        title="Xóa tài khoản học sinh"
        itemName={deleteTarget?.name}
        description="Bạn có chắc chắn muốn xóa tài khoản học sinh này? Toàn bộ dữ liệu điểm và lịch sử học sẽ bị xóa."
        isLoading={!!deletingId}
      />
    </div>
  );
}
