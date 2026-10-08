'use client';

import { AlertTriangle } from 'lucide-react';
import { useLockBodyScroll } from './useLockBodyScroll';

interface LessonRejectModalProps {
  rejectingLessonId: string | null;
  rejectReason: string;
  onReasonChange: (val: string) => void;
  onClose: () => void;
  onConfirmReject: (id: string, reason: string) => void;
}

export default function LessonRejectModal({
  rejectingLessonId,
  rejectReason,
  onReasonChange,
  onClose,
  onConfirmReject,
}: LessonRejectModalProps) {
  useLockBodyScroll(!!rejectingLessonId);

  if (!rejectingLessonId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" /> Lý do từ chối bài học (Bắt buộc)
        </h3>
        <textarea
          required
          rows={3}
          placeholder="Nhập lý do cụ thể gửi tới giáo viên..."
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirmReject(rejectingLessonId, rejectReason)}
            disabled={!rejectReason.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
