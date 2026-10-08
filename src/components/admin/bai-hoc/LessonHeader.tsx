'use client';

import { Plus, BookOpen } from 'lucide-react';

interface LessonHeaderProps {
  onOpenAddModal: () => void;
}

export default function LessonHeader({ onOpenAddModal }: LessonHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          Quản Lý Bài Học
        </h1>
        <p className="text-xs text-slate-500">
          Tạo mới, phê duyệt (Teacher → Admin), quản lý nội dung bài giảng & tài liệu đi kèm
        </p>
      </div>
      <button
        onClick={onOpenAddModal}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition shrink-0"
      >
        <Plus className="w-4 h-4" /> Tạo Bài Học Mới
      </button>
    </div>
  );
}

