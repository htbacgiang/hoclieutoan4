'use client';

interface LessonHeaderProps {
  title?: string;
  description?: string;
}

export default function LessonHeader({
  title = 'Phân số là gì?',
  description = 'Hãy cùng khám phá phân số qua những hình ảnh quen thuộc trong cuộc sống.',
}: LessonHeaderProps) {
  return (
    <div className="space-y-2 mb-4 sm:mb-6">
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0D4285] tracking-tight leading-tight">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-[#6680A3] font-medium max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
