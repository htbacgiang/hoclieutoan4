'use client';

interface PracticeSubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export default function PracticeSubmitButton({
  onSubmit,
  disabled = false,
}: PracticeSubmitButtonProps) {
  return (
    <div className="flex justify-center mt-8">
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="w-full max-w-[340px] h-[56px] rounded-full bg-[#2F80ED] hover:bg-[#1E6FD9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-lg shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
      >
        Nộp bài
      </button>
    </div>
  );
}
