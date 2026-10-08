import { Sparkles, MessageCircleQuestion } from 'lucide-react';

interface AiSuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export default function AiSuggestedQuestions({
  onSelectQuestion,
}: AiSuggestedQuestionsProps) {
  const suggestions = [
    {
      title: 'Phân số là gì?',
      desc: 'Tìm hiểu khái niệm tử số và mẫu số cơ bản.',
      tag: 'Khái niệm',
    },
    {
      title: 'Tại sao 1/2 bằng 2/4?',
      desc: 'Hình dung phân số bằng nhau qua bánh tròn.',
      tag: 'Phân số',
    },
    {
      title: 'Giúp em hiểu bài này.',
      desc: 'Mình hướng dẫn lý thuyết từng bước.',
      tag: 'Bài học',
    },
    {
      title: 'Cho em một ví dụ dễ hiểu.',
      desc: 'Minh họa bằng đồ vật thực tế sinh động.',
      tag: 'Ví dụ',
    },
    {
      title: 'Em đang làm bài này nhưng chưa biết bắt đầu từ đâu.',
      desc: 'Hướng dẫn cách suy luận giải bài tập.',
      tag: 'Giải bài',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 space-y-6 text-center">
      {/* Robot & Welcome Header */}
      <div className="space-y-2 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#1261B5] to-[#2F80ED] text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
          <MessageCircleQuestion className="w-9 h-9 text-white animate-bounce" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#123B72]">
          Em muốn hỏi điều gì?
        </h2>
        <p className="text-xs sm:text-sm font-medium text-[#6680A3] leading-relaxed">
          Mình sẽ giúp em tìm hiểu bài học theo từng bước. Hãy chọn gợi ý bên dưới hoặc nhập câu hỏi nhé!
        </p>
      </div>

      {/* Suggested Cards Grid */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(item.title)}
            className="group p-4 rounded-2xl bg-white hover:bg-[#E7F3FF]/60 border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2 cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F5FAFF] group-hover:bg-[#E7F3FF] text-[#1261B5]">
                {item.tag}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#123B72] group-hover:text-[#1261B5]">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#6680A3] line-clamp-1 mt-0.5">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
