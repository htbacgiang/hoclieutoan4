'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, FileText, Download, ExternalLink, FileCode, CheckCircle2, Upload, X, Filter, Image as ImageIcon } from 'lucide-react';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface CategoryOption {
  _id: string;
  name: string;
}

export type ExamType = 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'HOMEWORK' | 'PRACTICE';

interface TestResourceItem {
  _id: string;
  title: string;
  description: string;
  type: 'PDF' | 'WORD';
  examType?: ExamType;
  fileSize?: string;
  thumbnail?: string;
  url: string;
  categoryId?: { _id: string; name: string };
  createdAt: string;
}

export default function AdminBaiKiemTraPage() {
  const [resources, setResources] = useState<TestResourceItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('ALL');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PDF' | 'WORD'>('PDF');
  const [examType, setExamType] = useState<ExamType>('MID_TERM_1');
  const [categoryId, setCategoryId] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [thumbnail, setThumbnail] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRes, catRes] = await Promise.all([
        fetch('/api/resources?type=PDF,WORD'),
        fetch('/api/categories'),
      ]);
      const resData = await resRes.json();
      const catData = await catRes.json();

      setResources(resData.resources || []);
      setCategories(catData.categories || []);
      if (catData.categories && catData.categories.length > 0) {
        setCategoryId(catData.categories[0]._id);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setType('PDF');
    setExamType('MID_TERM_1');
    setFileSize('1.5 MB');
    setThumbnail('');
    setUrl('');
    setFormError('');
    if (categories.length > 0) setCategoryId(categories[0]._id);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TestResourceItem) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description || '');
    setType(item.type === 'WORD' ? 'WORD' : 'PDF');
    setExamType((item.examType as ExamType) || 'MID_TERM_1');
    setFileSize(item.fileSize || '1.5 MB');
    setThumbnail(item.thumbnail || '');
    setUrl(item.url);
    setCategoryId(item.categoryId?._id || (categories[0]?._id || ''));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isWord = fileName.endsWith('.doc') || fileName.endsWith('.docx');

    if (!isPdf && !isWord) {
      alert('Chỉ chấp nhận tệp định dạng PDF (.pdf) hoặc Word (.doc, .docx)!');
      return;
    }

    if (isWord) setType('WORD');
    if (isPdf) setType('PDF');

    // Auto set fileSize
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'raw');
      formData.append('folder', 'toan4/tests');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media?.secureUrl) {
        setUrl(data.media.secureUrl);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        alert(data.message || 'Lỗi tải tệp lên');
      }
    } catch (err) {
      console.error(err);
      alert('Tải tệp lên thất bại. Bạn có thể tự nhập đường dẫn tệp URL bên dưới.');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'image');
      formData.append('folder', 'toan4/thumbnails');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.media?.secureUrl) {
        setThumbnail(data.media.secureUrl);
      } else {
        alert(data.message || 'Lỗi tải ảnh thumbnail lên');
      }
    } catch (err) {
      console.error(err);
      alert('Tải ảnh thất bại. Bạn có thể tự dán link ảnh vào ô nhập.');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !categoryId) {
      setFormError('Vui lòng nhập đầy đủ tiêu đề, chọn chuyên mục và đường dẫn tệp.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        examType,
        fileSize,
        thumbnail: thumbnail.trim(),
        url: url.trim(),
        categoryId,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/resources/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        loadData();
      } else {
        setFormError(data.message || 'Lỗi lưu bài kiểm tra.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTest = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        loadData();
      } else {
        alert('Lỗi khi xóa tài liệu.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Filter logic
  const filteredResources = resources.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchExamType = examTypeFilter === 'ALL' || item.examType === examTypeFilter;
    const matchFileType = fileTypeFilter === 'ALL' || item.type === fileTypeFilter;

    return matchSearch && matchExamType && matchFileType;
  });

  const getExamBadgeAdmin = (type?: string) => {
    switch (type) {
      case 'MID_TERM_1':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">Giữa Học Kỳ 1</span>;
      case 'FINAL_TERM_1':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Cuối Học Kỳ 1</span>;
      case 'MID_TERM_2':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">Giữa Học Kỳ 2</span>;
      case 'FINAL_TERM_2':
        return <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">Cuối Học Kỳ 2</span>;
      case 'HOMEWORK':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Bài Tập Về Nhà</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Luyện Tập</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            📝 Quản Lý Đề Thi & Bài Tập Về Nhà
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng tải và quản lý đề kiểm tra <strong className="text-purple-600 font-bold">Giữa HK 1, Cuối HK 1, Giữa HK 2, Cuối HK 2</strong> & Bài tập về nhà dạng <strong className="text-red-600 font-bold">PDF</strong> và <strong className="text-blue-600 font-bold">WORD (.docx)</strong>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Bài Tập / Đề Thi
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm đề thi, bài tập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Exam Type Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setExamTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả đề
            </button>
            <button
              onClick={() => setExamTypeFilter('MID_TERM_1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'MID_TERM_1' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giữa HK 1
            </button>
            <button
              onClick={() => setExamTypeFilter('FINAL_TERM_1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'FINAL_TERM_1' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuối HK 1
            </button>
            <button
              onClick={() => setExamTypeFilter('MID_TERM_2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'MID_TERM_2' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giữa HK 2
            </button>
            <button
              onClick={() => setExamTypeFilter('FINAL_TERM_2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'FINAL_TERM_2' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuối HK 2
            </button>
            <button
              onClick={() => setExamTypeFilter('HOMEWORK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                examTypeFilter === 'HOMEWORK' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BTVN
            </button>
          </div>

          {/* Format Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Định dạng Word & PDF</option>
            <option value="PDF">Chỉ PDF (.pdf)</option>
            <option value="WORD">Chỉ WORD (.docx)</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs font-medium text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4">Tên bài kiểm tra / Bài tập</th>
              <th className="p-4">Phân loại kỳ thi</th>
              <th className="p-4">Định dạng</th>
              <th className="p-4">Mạch kiến thức</th>
              <th className="p-4">Tệp đính kèm</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Đang tải danh sách bài kiểm tra...</td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Chưa có bài kiểm tra hoặc bài tập nào phù hợp.</td>
              </tr>
            ) : (
              filteredResources.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {getExamBadgeAdmin(item.examType)}
                  </td>
                  <td className="p-4">
                    {item.type === 'WORD' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        📄 WORD (.docx)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                        📕 PDF (.pdf)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-700 font-semibold">{item.categoryId?.name || '---'}</td>
                  <td className="p-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Xem / Tải về
                    </a>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa bài"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: item._id, title: item.title })}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa bài"
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

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingId ? 'Chỉnh Sửa Bài Kiểm Tra / Bài Tập' : 'Thêm Bài Tập hoặc Đề Kiểm Tra Mới'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tải lên tệp Word (.docx) hoặc PDF (.pdf) kèm ảnh Thumbnail minh họa.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề đề thi / bài tập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đề thi Giữa Học Kỳ 1 Môn Toán 4 - Đề Số 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Phân loại & Định dạng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ thi / Bài tập</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="MID_TERM_1">📝 Kiểm Tra Giữa Học Kỳ 1</option>
                    <option value="FINAL_TERM_1">🏆 Kiểm Tra Cuối Học Kỳ 1</option>
                    <option value="MID_TERM_2">📝 Kiểm Tra Giữa Học Kỳ 2</option>
                    <option value="FINAL_TERM_2">🏆 Kiểm Tra Cuối Học Kỳ 2</option>
                    <option value="HOMEWORK">🏠 Bài Tập Về Nhà</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Định dạng tệp</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'PDF' | 'WORD')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="PDF">📕 Tệp PDF (.pdf)</option>
                    <option value="WORD">📄 Tệp Word (.docx / .doc)</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ảnh bìa minh họa (Thumbnail)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-200 transition-all">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    {uploadingThumb ? 'Đang tải ảnh...' : 'Chọn ảnh bìa'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={uploadingThumb}
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh thumbnail..."
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Chuyên mục & Dung lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề kiến thức</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dung lượng hiển thị</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 1.5 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload tệp & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tải tệp Word hoặc PDF từ máy tính <span className="text-red-500">*</span>
                </label>
                
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-200 transition-all">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    {uploading ? 'Đang tải tệp lên Cloudinary...' : 'Chọn tệp (.docx, .pdf)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 mt-2">Hoặc dán trực tiếp link URL của tệp:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/de-thi-giua-ky-toan-4.pdf"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả / Hướng dẫn làm bài</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú hướng dẫn cho học sinh, thời gian làm bài khuyến nghị..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading || uploadingThumb}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập Nhật Bài' : 'Lưu & Phát Hành'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTest}
        title="Xóa đề kiểm tra / bài tập"
        itemName={deleteTarget?.title}
        description="Bạn có chắc chắn muốn xóa đề kiểm tra / tài liệu bài tập này khỏi hệ thống?"
        isLoading={deleting}
      />
    </div>
  );
}
