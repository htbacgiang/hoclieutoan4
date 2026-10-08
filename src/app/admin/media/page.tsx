'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Copy, Trash2, Folder, Check } from 'lucide-react';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface MediaItem {
  _id: string;
  filename: string;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  bytes: number;
  folder: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<{ publicId: string; id: string; filename: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const folders = [
    'ALL',
    'toan4/lessons',
    'toan4/resources',
    'toan4/thumbnails',
    'toan4/exercises',
    'toan4/videos',
    'toan4/avatars',
  ];

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMediaList(data.media || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', selectedFolder !== 'ALL' ? selectedFolder : 'toan4/resources');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        loadMedia();
      }
    } catch (err) {
      console.error('Media upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDeleteMedia = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: deleteTarget.publicId, id: deleteTarget.id }),
      });
      setDeleteTarget(null);
      loadMedia();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredMedia = selectedFolder === 'ALL' ? mediaList : mediaList.filter((m) => m.folder === selectedFolder);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Media Library (Cloudinary Manager)</h1>
          <p className="text-xs text-slate-500">Quản lý hình ảnh, video, tài liệu PDF, phân folder Cloudinary hệ thống</p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Đang tải lên Cloudinary...' : 'Tải media mới lên'}</span>
          <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Folder Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Folder className="w-4 h-4" /> Cloudinary Folders:
        </span>
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFolder === f
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'ALL' ? 'Tất cả tệp' : f.replace('toan4/', '')}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-400 space-y-2">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Chưa có tệp media nào trong thư mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2 p-2 group relative"
            >
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                <img src={m.secureUrl} alt={m.filename} className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 truncate px-1">{m.filename}</div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 px-1">
                <button
                  onClick={() => handleCopy(m.secureUrl, m._id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-semibold flex items-center gap-1"
                  title="Sao chép URL"
                >
                  {copiedId === m._id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setDeleteTarget({ publicId: m.publicId, id: m._id, filename: m.filename })}
                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition"
                  title="Xóa media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteMedia}
        title="Xóa tệp media Cloudinary"
        itemName={deleteTarget?.filename}
        description="Bạn có chắc chắn muốn xóa tệp truyền thông này? Tệp sẽ bị xoá khỏi Cloudinary và cơ sở dữ liệu."
        isLoading={deleting}
      />
    </div>
  );
}
