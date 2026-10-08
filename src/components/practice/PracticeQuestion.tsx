'use client';

import { useState, useEffect } from 'react';
import { QuestionData } from '@/types/practice';
import { Briefcase } from 'lucide-react';

interface PracticeQuestionProps {
  questionData: QuestionData;
  topicName?: string;
  levelTitle?: string;
  onQuestionCompleted?: (isCorrect: boolean) => void;
  onNextQuestion?: () => void;
}

export default function PracticeQuestion({
  questionData,
  topicName = 'Phân số',
  levelTitle = 'Cơ bản',
  onQuestionCompleted,
  onNextQuestion,
}: PracticeQuestionProps) {
  const [studentName, setStudentName] = useState<string>('Bảo Nam (Lớp 4A)');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.name) {
          setStudentName(data.user.name);
        }
      })
      .catch(() => { });
  }, []);

  const getWordwallEmbedUrl = (text: string) => {
    const cleanText = (text || '').trim();
    if (!cleanText) return 'https://wordwall.net/embed/play/119357/920/967';

    // 1. If iframe src or href attribute is present, preserve exact URL
    const srcMatch = cleanText.match(/src=["']([^"']+)["']/i);
    const hrefMatch = cleanText.match(/href=["']([^"']+)["']/i);

    if (
      srcMatch &&
      srcMatch[1] &&
      srcMatch[1].includes('wordwall.net') &&
      !srcMatch[1].includes('screens.cdn.wordwall')
    ) {
      return srcMatch[1];
    }

    if (hrefMatch && hrefMatch[1] && hrefMatch[1].includes('wordwall.net')) {
      return hrefMatch[1];
    }

    if (/^https?:\/\//i.test(cleanText)) {
      return cleanText;
    }

    // 2. Fallback for raw numbers or partial paths
    const wordwallPattern = /https?:\/\/wordwall\.net\/(?:[^\s"'>]*?\/)?([0-9][0-9\/\-]*[0-9]|[0-9]+)/i;
    const match = cleanText.match(wordwallPattern);

    if (match && match[1]) {
      const idPath = match[1].replace(/[^0-9\/]/g, '').replace(/\/$/, '');
      return `https://wordwall.net/embed/play/${idPath}`;
    }

    const numMatch = cleanText.match(/([0-9]{5,12})/);
    if (numMatch) {
      return `https://wordwall.net/embed/play/${numMatch[1]}`;
    }

    return 'https://wordwall.net/embed/play/119357/920/967';
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100/60 shadow-xs space-y-4">
      {/* Exercise Card Header */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#123B72] tracking-tight mt-0.5">
              {questionData.lessonTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Embedded Wordwall Game Display Container */}
      <div className="space-y-3.5 my-2">
        {/* Game iframe */}
        <div className="relative rounded-2xl overflow-hidden aspect-video w-full border-4 border-slate-900 shadow-2xl bg-slate-950 min-h-[460px] sm:min-h-[540px]">
          <iframe
            src={getWordwallEmbedUrl(questionData.questionText)}
            className="w-full h-full border-0 min-h-[460px] sm:min-h-[540px]"
            allowFullScreen
            title={questionData.lessonTitle}
          />
        </div>

        {/* Action Controls */}
        {onNextQuestion && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={onNextQuestion}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-98"
            >
              <span>Bài tập tiếp theo ➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
