export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      <p className="text-xs font-bold text-slate-500 animate-pulse">Đang tải học liệu số Toán 4...</p>
    </div>
  );
}
