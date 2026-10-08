'use client';

import { Edit, Trash2, CheckCircle, FileText, Folder, Loader2 } from 'lucide-react';
import { LessonAdminItem } from './types';

interface LessonTableProps {
  groupedLessons: Record<string, LessonAdminItem[]>;
  loading: boolean;
  viewMode: 'grid' | 'list';
  onOpenEditModal: (lesson: LessonAdminItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onOpenRejectModal: (id: string) => void;
}

export default function LessonTable({
  groupedLessons,
  loading,
  viewMode,
  onOpenEditModal,
  onDelete,
  onStatusChange,
  onOpenRejectModal,
}: LessonTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Đang tải danh sách bài học...
      </div>
    );
  }

  const categoryEntries = Object.entries(groupedLessons);

  if (categoryEntries.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
        Chưa tìm thấy bài học nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categoryEntries.map(([catName, lessons]) => (
        <div key={catName} className="space-y-4">
          {/* Category Topic Header */}
          <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">{catName}</h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Danh sách bài học thuộc chủ đề
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-xs">
              {lessons.length} bài học
            </span>
          </div>

          {/* Grid View Mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {item.thumbnail && (
                    <div className="w-full h-36 bg-slate-100 overflow-hidden relative border-b border-slate-100 shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="space-y-3 p-5 flex-1">
                    {/* Category & Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase truncate max-w-[170px]">
                        {item.categoryId?.name || 'Bài học'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Lesson Title */}
                    <h3 className="font-extrabold text-slate-900 text-base line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Objectives */}
                    {item.objectives && item.objectives.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Em sẽ học được gì:
                        </span>
                        <ul className="space-y-1">
                          {item.objectives.slice(0, 2).map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] font-medium text-slate-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{obj.replace(/^[-*•\d+\.]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Attached Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.resources.map((res) => (
                          <a
                            key={res._id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                            title={res.title}
                          >
                            <FileText className="w-3 h-3 text-indigo-500" />
                            <span className="max-w-[90px] truncate">{res.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Teacher & Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        {(item.authorId?.name || 'G')[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.authorId?.name || 'Giáo viên'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => onStatusChange(item._id, 'PUBLISHED')}
                            className="px-2 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition"
                            title="Duyệt xuất bản"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => onOpenRejectModal(item._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition"
                            title="Từ chối"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onOpenEditModal(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 bg-white border border-slate-200 rounded-lg transition"
                        title="Chỉnh sửa bài học"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="p-1.5 text-red-500 hover:bg-red-100 bg-white border border-slate-200 rounded-lg transition"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View Mode (Detailed Table per Topic) */
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-4">Tên bài học</th>
                      <th className="p-4 max-w-xs">Em sẽ học được gì?</th>
                      <th className="p-4">Tài liệu đi kèm</th>
                      <th className="p-4">Giáo viên phụ trách</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                              />
                            )}
                            <span className="line-clamp-2">{item.title}</span>
                          </div>
                        </td>
                        
                        <td className="p-4 max-w-xs">
                          {item.objectives && item.objectives.length > 0 ? (
                            <ul className="space-y-1">
                              {item.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-[11px] font-medium text-slate-700">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{obj.replace(/^[-*•\d+\.]\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa cập nhật</span>
                          )}
                        </td>

                        <td className="p-4">
                          {item.resources && item.resources.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.resources.map((res) => (
                                <a
                                  key={res._id}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                                  title={res.title}
                                >
                                  <FileText className="w-3 h-3 text-indigo-500" />
                                  <span className="max-w-[90px] truncate">{res.title}</span>
                                  <span className="px-1 bg-indigo-200 text-indigo-800 text-[8px] rounded uppercase font-black">
                                    {res.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa gắn tài liệu</span>
                          )}
                        </td>

                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {(item.authorId?.name || 'G')[0]}
                            </div>
                            <span>{item.authorId?.name || 'Giáo viên'}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              item.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'PENDING_REVIEW'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {item.status === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => onStatusChange(item._id, 'PUBLISHED')}
                                className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700 transition"
                                title="Duyệt xuất bản"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => onOpenRejectModal(item._id)}
                                className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition"
                                title="Từ chối"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa bài học"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Xóa bài học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

