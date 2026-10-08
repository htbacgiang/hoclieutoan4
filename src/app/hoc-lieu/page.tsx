'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderLock, FileText, Download, QrCode, Search, ExternalLink, Gamepad2, PlayCircle, Eye } from 'lucide-react';

interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnail?: string;
  categoryId?: { name: string; slug: string; color: string };
  lessonId?: { title: string; slug: string };
}

export default function HocLieuPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-cyan-200">
          <FolderLock className="w-4 h-4" /> Kho Học Liệu Số Môn Toán 4
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Tài Liệu, Slide Bài Giảng & Phiếu Bài Tập
        </h1>
        <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
          Tải về miễn phí bản in PDF, bài giảng PowerPoint và sơ đồ tư duy chất lượng cao dành cho giáo viên, học sinh và phụ huynh.
        </p>

        {/* Search & Type filter */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              placeholder="Tìm tên học liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <option value="ALL">Tất cả loại học liệu</option>
              <option value="PDF">Phiếu bài tập (PDF)</option>
              <option value="POWERPOINT">Bài giảng Slide (PPT)</option>
              <option value="MIND_MAP">Sơ đồ tư duy</option>
              <option value="GAME">Trò chơi học tập</option>
              <option value="VIDEO">Video hướng dẫn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Chưa tìm thấy học liệu nào phù hợp</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-edtech shadow-edtech-hover p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    {res.type}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                    {res.type === 'GAME' ? (
                      <Gamepad2 className="w-4 h-4 text-purple-600" />
                    ) : res.type === 'VIDEO' ? (
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveQrUrl(res.url)}
                  className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Tạo mã QR"
                >
                  <QrCode className="w-4 h-4" /> QR
                </button>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Xem / Tải về
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Mã QR Truy Cập Học Liệu</h3>
            <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeQrUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-slate-500">Quét bằng camera để mở trực tiếp tài liệu này trên di động</p>
            <button
              onClick={() => setActiveQrUrl(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
