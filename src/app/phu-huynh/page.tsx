'use client';

import { useState } from 'react';
import { UserCheck, Clock, Award, BookOpen, QrCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function PhuHuynhPage() {
  const [studentProgress] = useState({
    studentName: 'Bảo Nam',
    className: 'Lớp 4A',
    totalCompleted: 6,
    points: 120,
    xp: 450,
    strongTopics: ['Phân số là gì?', 'Góc nhọn góc tù', 'Biểu đồ cột'],
    weakTopics: ['Quy đồng mẫu số', 'Đổi đơn vị m² sang dm²'],
    lessons: [
      { title: 'Phân số là gì?', completed: true, date: '25/09/2026' },
      { title: 'Phân số bằng nhau', completed: true, date: '24/09/2026' },
      { title: 'Tìm số trung bình cộng', completed: true, date: '22/09/2026' },
      { title: 'Góc nhọn, góc tù, góc bẹt', completed: true, date: '20/09/2026' },
    ],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-cyan-200">
            <UserCheck className="w-3.5 h-3.5" /> Dành Cho Phụ Huynh Theo Dõi Con Học
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Tiến Độ Học Tập Của Con: <span className="text-cyan-300">{studentProgress.studentName}</span> ({studentProgress.className})
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Cập nhật kết quả làm bài, thời gian luyện tập và khuyến nghị từ giáo viên theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-3 border-r border-white/20">
            <div className="text-2xl font-extrabold text-yellow-300">{studentProgress.points}</div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Điểm thưởng</div>
          </div>
          <div className="text-center px-3">
            <div className="text-2xl font-extrabold text-cyan-300">{studentProgress.xp}</div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Kinh nghiệm XP</div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{studentProgress.totalCompleted} bài</div>
          <div className="text-xs text-slate-500 font-semibold">Bài học đã hoàn thành</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">4.5 Giờ</div>
          <div className="text-xs text-slate-500 font-semibold">Thời gian học tuần này</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">8.8 / 10</div>
          <div className="text-xs text-slate-500 font-semibold">Điểm trung bình bài tập</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">3 Huy hiệu</div>
          <div className="text-xs text-slate-500 font-semibold">Danh hiệu đã đạt được</div>
        </div>

      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Strong & Weak Topics */}
        <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Phân Tích Năng Lực Học Tập</h2>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-green-600 uppercase flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4" /> Chủ đề con nắm rất vững (Độ chính xác &gt; 85%)
              </div>
              <div className="flex flex-wrap gap-2">
                {studentProgress.strongTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-green-50 text-green-800 text-xs font-bold border border-green-200/60">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4" /> Chủ đề con cần rèn luyện thêm
              </div>
              <div className="flex flex-wrap gap-2">
                {studentProgress.weakTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">
                    ⚠️ {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Recommendations */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Cô giáo"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">Cô Giáo Minh Anh (Chủ nhiệm Lớp 4A)</div>
              <div className="text-xs text-blue-600 font-semibold">Lời nhắn dành cho Phụ huynh</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-2 border border-blue-100">
            <p>
              &quot;Chào anh Hoàng! Tuần này em Bảo Nam học bài rất tích cực, đặc biệt là dạng toán nhận biết phân số và làm quen biểu đồ cột. Dạng toán quy đồng mẫu số em làm còn hơi vội dẫn đến nhầm lẫn tử số, gia đình có thể dùng tính năng quét mã QR dưới đây cho con ôn luyện thêm 15 phút tại nhà nhé!&quot;
            </p>
          </div>
        </div>

      </div>

      {/* QR Homeschooling for Parents */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
            <QrCode className="w-4 h-4" /> Quét mã QR ôn tập cùng con
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">Mã QR bài học được giáo viên khuyến nghị</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Mở camera điện thoại quét mã bên cạnh để đưa con thẳng đến phần luyện tập Quy đồng mẫu số phân số.
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-md text-center shrink-0">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent('https://hoclieutoan4.vn/bai-hoc/quy-dong-mau-so-cac-phan-so')}`}
            alt="QR Code bài học"
            className="w-28 h-28 mx-auto"
          />
        </div>
      </div>

    </div>
  );
}
