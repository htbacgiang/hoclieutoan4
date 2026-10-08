'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, FileText, Download, ExternalLink } from 'lucide-react';

import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface ResourceAdminItem {
  _id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  categoryId?: { name: string };
  createdAt: string;
}

export default function AdminHocLieuPage() {
  const [resources, setResources] = useState<ResourceAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/resources/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadResources();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Học Liệu Số</h1>
          <p className="text-xs text-slate-500">Tải lên Cloudinary, phân loại Slide, PDF, Mindmap và Video bài học</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm học liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs font-medium text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4">Tiêu đề học liệu</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Mạch kiến thức</th>
              <th className="p-4">Đường dẫn / URL</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Đang tải học liệu...</td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Chưa có học liệu nào.</td>
              </tr>
            ) : (
              resources.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">{item.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">{item.categoryId?.name || '---'}</td>
                  <td className="p-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold text-xs"
                    >
                      Xem tệp <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDeleteTarget({ id: item._id, title: item.title })}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                      title="Xóa học liệu"
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

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa học liệu"
        itemName={deleteTarget?.title}
        description="Bạn có chắc chắn muốn xóa tệp học liệu này khỏi hệ thống?"
        isLoading={deleting}
      />
    </div>
  );
}
