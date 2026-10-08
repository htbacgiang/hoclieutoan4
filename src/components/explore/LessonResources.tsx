'use client';

import {
  FileText,
  Presentation,
  Brain,
  Image as ImageIcon,
  Download,
  FolderDown,
} from 'lucide-react';

export interface ResourceItem {
  id: string;
  title: string;
  type?: string;
  badgeText?: string;
  badgeColor?: string;
  url?: string;
}

interface LessonResourcesProps {
  resources?: ResourceItem[];
  onDownload?: (title: string) => void;
}

export default function LessonResources({
  resources = [],
  onDownload,
}: LessonResourcesProps) {
  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'POWERPOINT':
      case 'presentation':
        return <Presentation className="w-5 h-5 text-red-500" />;
      case 'PDF':
      case 'exercise':
      case 'file-text':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MIND_MAP':
      case 'brain':
        return <Brain className="w-5 h-5 text-amber-500" />;
      case 'IMAGE':
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleItemClick = (title: string) => {
    if (onDownload) {
      onDownload(title);
    }
  };

  if (resources.length === 0) {
    return (
      <div className="bg-[#FFF8D9] rounded-2xl p-5 border border-amber-200/70 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5 text-[#B45309] font-black text-lg tracking-tight">
          <FolderDown className="w-5 h-5 text-[#D97706]" />
          <h3>Tài liệu đi kèm</h3>
        </div>
        <p className="text-xs text-amber-800 font-medium">Chưa có tài liệu đính kèm cho bài học này.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8D9] rounded-2xl p-5 border border-amber-200/70 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-[#B45309] font-black text-lg tracking-tight">
        <FolderDown className="w-5 h-5 text-[#D97706]" />
        <h3>Tài liệu đi kèm</h3>
      </div>

      {/* Resource Items */}
      <div className="space-y-2.5">
        {resources.map((res) => (
          <button
            key={res.id}
            onClick={() => handleItemClick(res.title)}
            className="w-full bg-white rounded-xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs hover:shadow-md border border-amber-100/80 transition-all duration-200 group text-left overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-amber-50 transition-colors shrink-0">
                {getResourceIcon(res.type)}
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-700 group-hover:text-[#0D4285] transition-colors truncate" title={res.title}>
                {res.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

