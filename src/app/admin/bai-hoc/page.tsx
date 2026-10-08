'use client';

import { useState, useEffect } from 'react';

// Modular Subcomponents
import LessonHeader from '@/components/admin/bai-hoc/LessonHeader';
import LessonFilterBar from '@/components/admin/bai-hoc/LessonFilterBar';
import LessonTable from '@/components/admin/bai-hoc/LessonTable';
import LessonFormModal from '@/components/admin/bai-hoc/LessonFormModal';
import LessonRejectModal from '@/components/admin/bai-hoc/LessonRejectModal';
import LessonFullscreenPptModal from '@/components/admin/bai-hoc/LessonFullscreenPptModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

import {
  LessonAdminItem,
  UserTeacherItem,
  ResourceMin,
  CategoryOption,
  LessonFormData,
} from '@/components/admin/bai-hoc/types';

export default function AdminBaiHocPage() {
  const [lessons, setLessons] = useState<LessonAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Teacher & Resource state
  const [teachers, setTeachers] = useState<UserTeacherItem[]>([]);
  const [availableResources, setAvailableResources] = useState<ResourceMin[]>([]);
  const [attachedResources, setAttachedResources] = useState<ResourceMin[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // PowerPoint Slide Presentation States
  const [contentViewMode, setContentViewMode] = useState<'PPT_EMBED' | 'PPT_SLIDER' | 'RAW'>('PPT_EMBED');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreenPPT, setIsFullscreenPPT] = useState<boolean>(false);

  const initialFormData: LessonFormData = {
    title: '',
    description: '',
    content: '',
    categoryId: '',
    authorId: '',
    duration: 15,
    status: 'PUBLISHED',
    objectives: '',
    thumbnail: '',
  };

  const [formData, setFormData] = useState<LessonFormData>(initialFormData);

  // Reject Dialog state
  const [rejectingLessonId, setRejectingLessonId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Parse content string into array of PowerPoint slides
  const getSlidesFromContent = (content: string): string[] => {
    if (!content || !content.trim()) {
      return [];
    }
    if (content.includes('---')) {
      const parts = content.split(/\n\s*---\s*\n/);
      const filtered = parts.map((p) => p.trim()).filter(Boolean);
      return filtered.length > 0 ? filtered : [content];
    }
    const headingSplit = content.split(/(?=\n(?:\#\#|\#)\s)/);
    if (headingSplit.length > 1) {
      return headingSplit.map((p) => p.trim()).filter(Boolean);
    }
    return [content];
  };

  const slides = getSlidesFromContent(formData.content);

  const handleSlideTextChange = (newText: string) => {
    const newSlides = slides.length > 0 ? [...slides] : [''];
    newSlides[currentSlideIndex] = newText;
    const joinedContent = newSlides.join('\n\n---\n\n');
    setFormData((prev) => ({ ...prev, content: joinedContent }));
  };

  const handleAddSlide = () => {
    const newSlideNum = slides.length + 1;
    const newSlideText = `## Slide ${newSlideNum}: Tiêu đề nội dung`;
    const newSlides = [...slides, newSlideText];
    const joinedContent = newSlides.join('\n\n---\n\n');
    setFormData((prev) => ({ ...prev, content: joinedContent }));
    setCurrentSlideIndex(newSlides.length - 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      setFormData((prev) => ({ ...prev, content: '' }));
      setCurrentSlideIndex(0);
      return;
    }
    const newSlides = slides.filter((_, idx) => idx !== currentSlideIndex);
    const joinedContent = newSlides.join('\n\n---\n\n');
    setFormData((prev) => ({ ...prev, content: joinedContent }));
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleInsertSlideTemplate = (type: 'EXAMPLE' | 'NOTE') => {
    const currentText = slides[currentSlideIndex] || '';
    let addition = '';
    if (type === 'EXAMPLE') {
      addition = `\n\n**Ví dụ:** [Nhập ví dụ minh họa tại đây]`;
    } else {
      addition = `\n\n> **Ghi nhớ:** [Nhập ghi nhớ trọng tâm tại đây]`;
    }
    handleSlideTextChange(currentText + addition);
  };

  // Keyboard Navigation for Fullscreen PPT Presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreenPPT) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        setIsFullscreenPPT(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPPT, currentSlideIndex, slides.length]);

  const renderSlideContent = (text: string) => {
    if (!text || !text.trim()) {
      return <div className="text-slate-400 italic text-sm">Slide chưa có nội dung. Hãy nhập văn bản bên dưới...</div>;
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-2.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 1 or 2
          if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
            const title = trimmed.replace(/^#+\s*/, '');
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-extrabold text-blue-400 tracking-tight leading-snug flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0 inline-block"></span>
                {title}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 text-slate-100 text-sm sm:text-base font-medium pl-2">
                <span className="text-blue-400 font-bold mt-1 text-xs">▸</span>
                <span>{bulletText}</span>
              </div>
            );
          }

          // Note / Callout box starting with >
          if (trimmed.startsWith('>')) {
            const noteText = trimmed.replace(/^>\s*/, '');
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-400 text-amber-200 text-xs sm:text-sm font-semibold my-2">
                {noteText}
              </div>
            );
          }

          // Example box starting with Ví dụ:
          if (trimmed.toLowerCase().startsWith('ví dụ:') || trimmed.toLowerCase().startsWith('**ví dụ:')) {
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-blue-500/10 border-l-4 border-blue-400 text-blue-200 text-xs sm:text-sm font-semibold my-2">
                {trimmed}
              </div>
            );
          }

          // Default line
          return (
            <p key={idx} className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const allUsers: UserTeacherItem[] = data.users || [];
      const teacherUsers = allUsers.filter(
        (u) => u.role === 'TEACHER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
      );
      setTeachers(teacherUsers.length > 0 ? teacherUsers : allUsers);
    } catch (err) {
      console.error('Lỗi tải danh sách giáo viên từ API users:', err);
    }
  };

  const loadAvailableResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setAvailableResources(data.resources || []);
    } catch (err) {
      console.error('Lỗi tải danh sách học liệu:', err);
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons?status=${selectedStatus}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadTeachers();
    loadAvailableResources();
  }, []);

  useEffect(() => {
    loadLessons();
  }, [selectedStatus, search]);

  const handleOpenAddModal = () => {
    setEditingLessonId(null);
    setFormData({
      ...initialFormData,
      categoryId: categories.length > 0 ? categories[0]._id : '',
      authorId: teachers.length > 0 ? teachers[0]._id : '',
    });
    setAttachedResources([]);
    setSelectedResourceIds([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lesson: LessonAdminItem) => {
    setEditingLessonId(lesson._id);
    const existingResources = lesson.resources || [];
    setAttachedResources(existingResources);
    const existingResourceIds = existingResources.map((r) => r._id!).filter(Boolean);
    setSelectedResourceIds(existingResourceIds);

    const catId = typeof lesson.categoryId === 'string'
      ? lesson.categoryId
      : (lesson.categoryId?._id || (categories.length > 0 ? categories[0]._id : ''));

    const authId = typeof lesson.authorId === 'string'
      ? lesson.authorId
      : (lesson.authorId?._id || (teachers.length > 0 ? teachers[0]._id : ''));

    setFormData({
      title: lesson.title || '',
      description: lesson.description || '',
      content: (lesson as any).content || '',
      categoryId: catId,
      authorId: authId,
      duration: lesson.duration || 15,
      status: lesson.status || 'PUBLISHED',
      objectives: Array.isArray((lesson as any).objectives) ? (lesson as any).objectives.join('\n') : '',
      thumbnail: lesson.thumbnail || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim() || !formData.categoryId) {
      setErrorMsg('Vui lòng nhập đầy đủ các trường bắt buộc (Tiêu đề, Mạch kiến thức, Mô tả, Nội dung).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      ...formData,
      objectives: formData.objectives ? formData.objectives.split('\n').filter((item) => item.trim()) : [],
      resourceIds: selectedResourceIds,
    };

    try {
      let res;
      if (editingLessonId) {
        res = await fetch(`/api/lessons/${editingLessonId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi lưu bài học');
      }

      setIsModalOpen(false);
      setFormData(initialFormData);
      setSelectedResourceIds([]);
      setEditingLessonId(null);
      loadLessons();
      loadAvailableResources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, reason = '') => {
    try {
      await fetch(`/api/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectReason: reason }),
      });
      loadLessons();
      setRejectingLessonId(null);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
      loadLessons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = (id: string) => {
    const lesson = lessons.find((l) => l._id === id);
    setDeleteTarget({ id, title: lesson ? lesson.title : 'Bài học này' });
  };

  const confirmDeleteLesson = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/lessons/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadLessons();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      !search.trim() ||
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      (lesson.description && lesson.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || lesson.status === selectedStatus;

    const catId = lesson.categoryId?._id || (lesson.categoryId as any);
    const matchesCategory =
      selectedCategory === 'ALL' || catId === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const groupedLessons = filteredLessons.reduce((acc, lesson) => {
    const catName = lesson.categoryId?.name || 'CHỦ ĐỀ KHÁC';
    if (!acc[catName]) {
      acc[catName] = [];
    }
    acc[catName].push(lesson);
    return acc;
  }, {} as Record<string, LessonAdminItem[]>);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <LessonHeader onOpenAddModal={handleOpenAddModal} />

      {/* 2. Filter & Search Section */}
      <LessonFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={lessons.length}
      />

      {/* 3. Grouped Table & Grid Section */}
      <LessonTable
        groupedLessons={groupedLessons}
        loading={loading}
        viewMode={viewMode}
        onOpenEditModal={handleOpenEditModal}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChange}
        onOpenRejectModal={setRejectingLessonId}
      />

      {/* 4. Add / Edit Lesson Form Modal */}
      <LessonFormModal
        isModalOpen={isModalOpen}
        editingLessonId={editingLessonId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        teachers={teachers}
        attachedResources={attachedResources}
        setAttachedResources={setAttachedResources}
        selectedResourceIds={selectedResourceIds}
        setSelectedResourceIds={setSelectedResourceIds}
        contentViewMode={contentViewMode}
        setContentViewMode={setContentViewMode}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        submitting={submitting}
        errorMsg={errorMsg}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitLesson}
        onAddSlide={handleAddSlide}
        onDeleteSlide={handleDeleteSlide}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        onSlideTextChange={handleSlideTextChange}
        onInsertSlideTemplate={handleInsertSlideTemplate}
        onOpenFullscreenPpt={() => setIsFullscreenPPT(true)}
        renderSlideContent={renderSlideContent}
      />

      {/* 5. Reject Reason Dialog Modal */}
      <LessonRejectModal
        rejectingLessonId={rejectingLessonId}
        rejectReason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => setRejectingLessonId(null)}
        onConfirmReject={(id, reason) => handleStatusChange(id, 'DRAFT', reason)}
      />

      {/* 6. Fullscreen PowerPoint Presentation View Modal */}
      <LessonFullscreenPptModal
        isFullscreenPPT={isFullscreenPPT}
        title={formData.title}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onClose={() => setIsFullscreenPPT(false)}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        renderSlideContent={renderSlideContent}
      />

      {/* 7. Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteLesson}
        title="Xác nhận xóa bài học"
        itemName={deleteTarget?.title}
        description="Bạn có chắc chắn muốn xóa bài học này khỏi hệ thống? Tất cả nội dung slide và liên kết bài học sẽ bị xóa."
        isLoading={deleting}
      />
    </div>
  );
}
