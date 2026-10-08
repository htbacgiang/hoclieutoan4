'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Presentation,
  MonitorPlay,
  Code,
  Plus,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Edit,
  CheckCircle,
  FileText,
  Upload,
  Paperclip,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { CategoryOption, UserTeacherItem, ResourceMin, LessonFormData } from './types';

import { useLockBodyScroll } from './useLockBodyScroll';

interface LessonFormModalProps {
  isModalOpen: boolean;
  editingLessonId: string | null;
  formData: LessonFormData;
  setFormData: React.Dispatch<React.SetStateAction<LessonFormData>>;
  categories: CategoryOption[];
  teachers: UserTeacherItem[];
  attachedResources: ResourceMin[];
  setAttachedResources: React.Dispatch<React.SetStateAction<ResourceMin[]>>;
  selectedResourceIds: string[];
  setSelectedResourceIds: (ids: string[]) => void;
  contentViewMode: 'PPT_EMBED' | 'PPT_SLIDER' | 'RAW';
  setContentViewMode: (mode: 'PPT_EMBED' | 'PPT_SLIDER' | 'RAW') => void;
  slides: string[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
  submitting: boolean;
  errorMsg: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSlideTextChange: (text: string) => void;
  onInsertSlideTemplate: (type: 'EXAMPLE' | 'NOTE') => void;
  onOpenFullscreenPpt: () => void;
  renderSlideContent: (text: string) => React.ReactNode;
}

export default function LessonFormModal({
  isModalOpen,
  editingLessonId,
  formData,
  setFormData,
  categories,
  teachers,
  attachedResources,
  setAttachedResources,
  selectedResourceIds,
  setSelectedResourceIds,
  contentViewMode,
  setContentViewMode,
  slides,
  currentSlideIndex,
  setCurrentSlideIndex,
  submitting,
  errorMsg,
  onClose,
  onSubmit,
  onAddSlide,
  onDeleteSlide,
  onPrevSlide,
  onNextSlide,
  onSlideTextChange,
  onInsertSlideTemplate,
  onOpenFullscreenPpt,
  renderSlideContent,
}: LessonFormModalProps) {
  useLockBodyScroll(isModalOpen);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customType, setCustomType] = useState('PDF');

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'toan4/thumbnails');

      const mediaRes = await fetch('/api/media', {
        method: 'POST',
        body: fd,
      });
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.message || 'Lỗi tải ảnh lên');

      const imageUrl = mediaData.media?.secureUrl || mediaData.secureUrl;
      setFormData((prev) => ({ ...prev, thumbnail: imageUrl }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Lỗi tải ảnh đại diện lên: ' + msg);
    } finally {
      setUploadingThumbnail(false);
      e.target.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'toan4/resources');

      const mediaRes = await fetch('/api/media', {
        method: 'POST',
        body: fd,
      });
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.message || 'Lỗi tải tệp lên');

      const fileUrl = mediaData.media?.secureUrl || mediaData.secureUrl;
      const fileName = file.name;

      let resType = 'PDF';
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext === 'ppt' || ext === 'pptx') resType = 'POWERPOINT';
      else if (ext === 'mp4' || ext === 'webm') resType = 'VIDEO';
      else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext || '')) resType = 'IMAGE';

      const catId = formData.categoryId || (categories.length > 0 ? categories[0]._id : '');
      const resPayload = {
        title: fileName,
        slug: (fileName.replace(/[^a-z0-9]/gi, '-') + '-' + Date.now()).toLowerCase(),
        type: resType,
        url: fileUrl,
        categoryId: catId,
        lessonId: editingLessonId || undefined,
      };

      const resourceRes = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resPayload),
      });
      const resourceData = await resourceRes.json();
      if (!resourceRes.ok) throw new Error(resourceData.message || 'Lỗi lưu học liệu');

      const newRes: ResourceMin = {
        _id: resourceData.resource._id,
        title: resourceData.resource.title,
        type: resourceData.resource.type,
        url: resourceData.resource.url,
      };

      setAttachedResources((prev) => [...prev, newRes]);
      if (newRes._id) {
        setSelectedResourceIds([...selectedResourceIds, newRes._id]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Lỗi tải tệp lên: ' + msg);
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleAddCustomLink = async () => {
    if (!customTitle.trim()) return;
    const urlToUse = customUrl.trim() || '#tep-upload-sau';
    const catId = formData.categoryId || (categories.length > 0 ? categories[0]._id : '');

    try {
      const resPayload = {
        title: customTitle.trim(),
        slug: (customTitle.replace(/[^a-z0-9]/gi, '-') + '-' + Date.now()).toLowerCase(),
        type: customType,
        url: urlToUse,
        categoryId: catId,
        lessonId: editingLessonId || undefined,
      };

      const resourceRes = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resPayload),
      });
      const resourceData = await resourceRes.json();
      if (!resourceRes.ok) throw new Error(resourceData.message || 'Lỗi thêm tài liệu');

      const newRes: ResourceMin = {
        _id: resourceData.resource._id,
        title: resourceData.resource.title,
        type: resourceData.resource.type,
        url: resourceData.resource.url,
      };

      setAttachedResources((prev) => [...prev, newRes]);
      if (newRes._id) {
        setSelectedResourceIds([...selectedResourceIds, newRes._id]);
      }
      setCustomTitle('');
      setCustomUrl('');
      setShowAddLink(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Lỗi thêm tài liệu: ' + msg);
    }
  };

  const handleRemoveAttachedResource = (idxToRemove: number, resId?: string) => {
    setAttachedResources((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    if (resId) {
      setSelectedResourceIds(selectedResourceIds.filter((id) => id !== resId));
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-6xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
        {/* Header (Fixed at top of modal) */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            {editingLessonId ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="shrink-0 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container with Internal Scrollable Body */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden mt-4">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-4 scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lesson Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phép cộng phân số cùng mẫu số"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mạch kiến thức (Danh mục) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Chọn mạch kiến thức --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher / Author Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giáo viên phụ trách (Tác giả) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Chọn giáo viên --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email}) [{t.role}]
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thời lượng (phút)</label>
              <input
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái xuất bản</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLISHED">Đã xuất bản (Published)</option>
                <option value="PENDING_REVIEW">Chờ duyệt (Pending Review)</option>
                <option value="DRAFT">Bản nháp (Draft)</option>
                <option value="ARCHIVED">Lưu trữ (Archived)</option>
              </select>
            </div>

            {/* Thumbnail Image */}
            <div className="sm:col-span-2 space-y-2 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                Ảnh đại diện bài học (Thumbnail)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn link ảnh URL (VD: https://domain.com/image.jpg)..."
                      value={formData.thumbnail || ''}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                    <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-xs">
                      {uploadingThumbnail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingThumbnail}
                        onChange={handleThumbnailUpload}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bạn có thể dán liên kết ảnh trực tiếp hoặc nhấn <span className="font-bold text-purple-700">"Tải ảnh từ máy"</span> để tải tệp ảnh từ máy tính lên.
                  </p>
                </div>

                {/* Live Preview Box */}
                <div className="flex items-center justify-center border border-purple-200 rounded-2xl bg-white p-2 h-24 relative overflow-hidden shadow-xs">
                  {formData.thumbnail ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden group">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg shadow-md transition"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40 text-purple-400" />
                      <span className="text-[10px] font-semibold text-slate-400">Chưa chọn ảnh đại diện</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô tả ngắn <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Mô tả tóm tắt về nội dung chính của bài học..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Detailed Content / PowerPoint Editor */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-blue-600" />
                  Nội dung chi tiết bài giảng (PowerPoint Slide) <span className="text-red-500">*</span>
                </label>

                {/* Mode switcher tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setContentViewMode('PPT_EMBED')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${contentViewMode === 'PPT_EMBED'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Presentation className="w-3.5 h-3.5" /> Nhúng Link PowerPoint
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentViewMode('PPT_SLIDER')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${contentViewMode === 'PPT_SLIDER'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" /> Tạo Slide Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentViewMode('RAW')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${contentViewMode === 'RAW'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Mã Markdown
                  </button>
                </div>
              </div>

              {contentViewMode === 'PPT_EMBED' ? (
                <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MonitorPlay className="w-4 h-4 text-blue-600" />
                        Đường dẫn (URL) hoặc Mã nhúng iframe File PowerPoint:
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        Hỗ trợ Google Slides, Office 365 PPT, Canva, iframe
                      </span>
                    </div>

                    <input
                      type="text"
                      required={contentViewMode === 'PPT_EMBED'}
                      placeholder="Dán đường dẫn Google Slides, file PPTX Office 365, Canva hoặc mã <iframe src='...'> vào đây..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white shadow-xs"
                    />
                  </div>

                  {/* Embedded PowerPoint Live Viewer Canvas */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Khung Xem Trực Tiếp Bài Giảng PowerPoint Nhúng:</span>
                      {formData.content && (
                        <a
                          href={formData.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-[11px] font-bold"
                        >
                          Mở trong thẻ mới ↗
                        </a>
                      )}
                    </div>

                    {formData.content && (formData.content.includes('http') || formData.content.includes('<iframe')) ? (
                      <div className="relative rounded-2xl overflow-hidden border-4 border-slate-800 shadow-xl bg-slate-950 aspect-video w-full flex items-center justify-center">
                        <iframe
                          src={
                            formData.content.includes('<iframe')
                              ? (formData.content.match(/src=["']([^"']+)["']/i)?.[1] || formData.content)
                              : formData.content.includes('docs.google.com/presentation') && !formData.content.includes('/embed')
                                ? formData.content.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')
                                : formData.content.match(/\.(pptx|ppt)$/i)
                                  ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(formData.content)}`
                                  : formData.content
                          }
                          className="w-full h-full border-0"
                          allowFullScreen
                          title="PowerPoint Presentation Embed"
                        />
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center space-y-2">
                        <Presentation className="w-10 h-10 text-blue-500 mx-auto opacity-80" />
                        <div className="text-xs font-bold text-slate-700">Chưa nhúng đường dẫn PowerPoint</div>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          Dán liên kết Google Slides, Office 365 PowerPoint hoặc mã nhúng <code>&lt;iframe&gt;</code> bài giảng vào ô trên để hiển thị slide trực tiếp tại đây.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : contentViewMode === 'PPT_SLIDER' ? (
                <div className="space-y-4">
                  {/* PowerPoint Toolbar & Slide Navigator */}
                  <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 border border-blue-400/30">
                        <Presentation className="w-3.5 h-3.5" /> Slide PPT
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Slide <span className="text-white font-bold">{currentSlideIndex + 1}</span> / {slides.length}
                      </span>
                    </div>

                    {/* Navigation controls */}
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={onPrevSlide}
                        disabled={currentSlideIndex === 0}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Slide trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-200">
                        {currentSlideIndex + 1} / {slides.length}
                      </span>
                      <button
                        type="button"
                        onClick={onNextSlide}
                        disabled={currentSlideIndex >= slides.length - 1}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Slide sau"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Slide action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onAddSlide}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm Slide
                      </button>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={onDeleteSlide}
                          className="px-2 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold flex items-center gap-1 border border-red-500/30"
                          title="Xóa slide hiện tại"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onOpenFullscreenPpt}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        title="Trình chiếu toàn màn hình"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Trình chiếu F5
                      </button>
                    </div>
                  </div>

                  {/* PowerPoint Slide Display Canvas */}
                  <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 min-h-[260px] flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="ml-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {formData.title || 'Bài giảng'} • Slide {currentSlideIndex + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/20">
                        POWERPOINT VIEW
                      </span>
                    </div>

                    <div className="flex-1 py-2 space-y-3 font-sans">
                      {renderSlideContent(slides[currentSlideIndex] || '')}
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Học liệu số Toán 4 • Bộ Giáo Dục & Đào Tạo</span>
                      <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                    </div>
                  </div>

                  {/* Active Slide Text Editor */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                        Nội dung văn bản Slide {currentSlideIndex + 1}:
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onInsertSlideTemplate('EXAMPLE')}
                          className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 rounded-lg text-[10px] font-bold"
                        >
                          + Mẫu Ví Dụ
                        </button>
                        <button
                          type="button"
                          onClick={() => onInsertSlideTemplate('NOTE')}
                          className="px-2 py-1 bg-white hover:bg-amber-50 border border-slate-200 text-amber-700 rounded-lg text-[10px] font-bold"
                        >
                          + Mẫu Ghi Nhớ
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={slides[currentSlideIndex] || ''}
                      onChange={(e) => onSlideTextChange(e.target.value)}
                      placeholder="Nhập tiêu đề (bắt đầu với ##) và nội dung slide hiện tại..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                    />
                  </div>

                  {/* Slide Thumbnail Cards Strip */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Danh sách Slide ({slides.length}) - Nhấp để chuyển slide
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {slides.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`shrink-0 w-28 h-18 p-2 rounded-xl border-2 text-left transition flex flex-col justify-between overflow-hidden ${idx === currentSlideIndex
                            ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="text-[10px] font-extrabold text-blue-600">
                            Slide {idx + 1}
                          </div>
                          <div className="text-[9px] font-medium text-slate-700 line-clamp-2 leading-tight">
                            {s.replace(/^#+\s*/, '') || 'Slide trống'}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={onAddSlide}
                        className="shrink-0 w-28 h-18 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold text-xs flex flex-col items-center justify-center gap-1 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Slide</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Markdown Textarea Mode */
                <div className="space-y-2">
                  <textarea
                    required
                    rows={8}
                    placeholder="Nhập nội dung bài học. Dùng '---' trên 1 dòng riêng để phân tách các Slide PowerPoint..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                  />
                  <p className="text-[11px] text-slate-500 italic">
                    💡 Mẹo: Nhập <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">---</code> giữa các đoạn văn để tự động chia slide PowerPoint!
                  </p>
                </div>
              )}
            </div>

            {/* 1. Em sẽ học được gì? (Objectives list preview & input) */}
            <div className="sm:col-span-2 space-y-2 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Em sẽ học được gì? (Mục tiêu bài học - Nhập mỗi mục 1 dòng)
              </label>
              <textarea
                rows={3}
                placeholder={`- Nhận biết tử số và mẫu số của phân số\n- Biết thực hành đọc và viết phân số đơn giản\n- Áp dụng phân số vào đời sống thực tế`}
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />

              {formData.objectives.trim() && (
                <div className="space-y-1 pt-2 border-t border-emerald-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Xem trước danh sách hiển thị học sinh ({formData.objectives.split('\n').filter((i) => i.trim()).length} mục):
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.objectives
                      .split('\n')
                      .filter((i) => i.trim())
                      .map((obj, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obj.replace(/^[-*•\d+\.]\s*/, '')}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tài liệu đi kèm bài học (File upload & attachment manager) */}
            <div className="sm:col-span-2 space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Tài liệu đi kèm bài học ({attachedResources.length} tệp)
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Các tệp tài liệu (PDF, Slide, Phiếu bài tập...) có thể tải lên trực tiếp bên dưới hoặc đính kèm sau.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
                    {uploadingFile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải tệp lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải tệp từ máy tính</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingFile}
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddLink(!showAddLink)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tải lên sau / Nhập Link</span>
                  </button>
                </div>
              </div>

              {/* Form to add custom link / upload later item */}
              {showAddLink && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Thêm tệp tài liệu (Tải lên sau / Đính kèm link):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Tên tệp (Ví dụ: Phiếu bài tập số 1.pdf)"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Đường dẫn URL tệp (Để trống nếu tải lên sau)"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="p-2 rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="PDF">PDF</option>
                      <option value="POWERPOINT">PowerPoint</option>
                      <option value="EXERCISE">Phiếu Bài Tập</option>
                      <option value="IMAGE">Hình Ảnh / Sơ đồ</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLink(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[11px]"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomLink}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px]"
                    >
                      Xác Nhận Thêm
                    </button>
                  </div>
                </div>
              )}

              {/* Attached Files List */}
              {attachedResources.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs bg-white/80 rounded-xl border border-dashed border-indigo-200 space-y-1">
                  <Paperclip className="w-6 h-6 text-indigo-400 mx-auto opacity-70" />
                  <div className="font-bold text-slate-700">Chưa có tệp tài liệu nào được đính kèm</div>
                  <p className="text-[11px] text-slate-400">
                    Bạn có thể nhấn nút <span className="font-bold text-indigo-600">"Tải tệp từ máy tính"</span> ở trên để đính kèm PDF, Slide, Phiếu bài tập ngay bây giờ hoặc bổ sung tệp sau.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                  {attachedResources.map((res, idx) => (
                    <div
                      key={res._id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-medium shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold truncate text-slate-900">{res.title}</div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-extrabold uppercase">
                              {res.type}
                            </span>
                            {res.url && !res.url.startsWith('#') ? (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                              >
                                Xem tệp <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-amber-600 font-semibold italic">Sẽ upload sau</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedResource(idx, res._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Gỡ bỏ tài liệu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Form Actions (Fixed at bottom of modal) */}
          <div className="shrink-0 flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition"
            >
              {submitting ? 'Đang lưu...' : editingLessonId ? 'Cập Nhật' : 'Tạo Bài Học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
