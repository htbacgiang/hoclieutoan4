'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-extrabold text-2xl">
        !
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900">Đã xảy ra sự cố ngoài ý muốn</h2>
      <p className="text-xs text-slate-500 max-w-md">
        {error.message || 'Vui lòng thử lại hoặc tải lại trang.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
      >
        Thử lại trang
      </button>
    </div>
  );
}
