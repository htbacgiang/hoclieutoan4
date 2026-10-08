'use client';

import { MessageSquare, Bot, User } from 'lucide-react';

export default function AdminHoiDapPage() {
  const sampleLogs = [
    {
      user: 'Bảo Nam (Học sinh 4A)',
      question: 'Phân số là gì?',
      answer: 'Phân số là sự biểu thị một phần của một đơn vị. Phân số gồm tử số và mẫu số...',
      time: '10 phút trước',
    },
    {
      user: 'Khách',
      question: 'Làm thế nào để tìm số trung bình cộng?',
      answer: 'Muốn tìm số trung bình cộng của nhiều số, ta tính tổng của các số đó...',
      time: '35 phút trước',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lịch Sử Hỏi Đáp AI Robot</h1>
          <p className="text-xs text-slate-500">Giám sát các câu hỏi học sinh đã đặt cho Robot AI và câu trả lời tương ứng</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" /> Nhật Ký Hỏi Đáp Trực Tuyến
        </h2>

        <div className="space-y-4">
          {sampleLogs.map((log, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-600" /> {log.user}</span>
                <span className="text-slate-400 font-medium">{log.time}</span>
              </div>
              <div className="text-slate-900 font-semibold">❓ {log.question}</div>
              <div className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100">🤖 {log.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
