'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Check, Lightbulb } from 'lucide-react';
import { ChatMode } from '@/lib/openai';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  mode?: ChatMode;
  suggestedFollowUps?: string[];
  createdAt?: string | Date;
  isNew?: boolean;
}

interface AiChatMessageProps {
  message: ChatMessageData;
  userName?: string;
  userAvatar?: string;
  onSelectFollowUp?: (followUp: string) => void;
}

function formatMathContent(content: string): string {
  if (!content) return '';
  return content
    // Replace LaTeX fraction \frac{a}{b} with a/b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    // Replace \times with ×
    .replace(/\\times/g, '×')
    // Replace \div with :
    .replace(/\\div/g, ':')
    // Replace \cdot with ·
    .replace(/\\cdot/g, '·')
    // Remove block math delimiters $$...$$ -> ...
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, '\n$$1\n')
    // Remove inline math delimiters $...$ -> ...
    .replace(/\$([^$]+)\$/g, '$1')
    // Remove residual escape backslashes
    .replace(/\\([_{}])/g, '$1');
}

export default function AiChatMessage({
  message,
  userName = 'Học sinh',
  userAvatar,
  onSelectFollowUp,
}: AiChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const processedContent = isUser ? message.content : formatMathContent(message.content);

  const [displayedText, setDisplayedText] = useState<string>(() => {
    if (!isUser && message.isNew) {
      return '';
    }
    return processedContent;
  });
  const [isTyping, setIsTyping] = useState<boolean>(() => {
    return !isUser && Boolean(message.isNew);
  });

  useEffect(() => {
    if (isUser || !message.isNew) {
      setDisplayedText(processedContent);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let index = 0;
    const fullText = processedContent;
    const step = Math.max(2, Math.floor(fullText.length / 80));

    const timer = setInterval(() => {
      index += step;
      if (index >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(fullText.slice(0, index));
      }
    }, 15);

    return () => clearInterval(timer);
  }, [processedContent, isUser, message.isNew]);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 w-full my-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm border ${
          isUser
            ? 'bg-[#1261B5] border-blue-400'
            : 'bg-gradient-to-tr from-[#1261B5] via-[#2F80ED] to-cyan-500 border-cyan-300'
        }`}
      >
        {isUser ? (
          userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content Bubble */}
      <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
        {/* Name Header */}
        <div
          className={`text-[11px] font-bold text-[#6680A3] flex items-center gap-1.5 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{isUser ? userName : '🤖 Trợ lý học tập'}</span>
          {message.mode && !isUser && (
            <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-[10px] text-[#1261B5] font-extrabold uppercase">
              {message.mode === 'hint'
                ? 'Gợi ý'
                : message.mode === 'explain'
                ? 'Giải thích'
                : 'Hỏi bài'}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`p-4 rounded-3xl text-sm leading-relaxed shadow-2xs border ${
            isUser
              ? 'bg-[#E7F3FF] text-[#123B72] border-blue-200/80 rounded-tr-none font-medium'
              : 'bg-white text-[#123B72] border-slate-200/90 rounded-tl-none font-normal'
          }`}
        >
          {isUser ? (
            <div className="space-y-2">
              {message.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-blue-300/80 bg-slate-950 max-w-xs shadow-xs">
                  <img
                    src={message.imageUrl}
                    alt="Ảnh bài tập"
                    className="w-full max-h-60 object-contain"
                  />
                </div>
              )}
              {processedContent && <div className="whitespace-pre-wrap">{processedContent}</div>}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-[#123B72] prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-sm font-black text-[#1261B5] mt-3 mb-1 border-b border-blue-100 pb-1 flex items-center gap-1">
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-extrabold text-[#1261B5]">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-[#F5FAFF] px-1.5 py-0.5 rounded-md text-xs font-mono text-[#1261B5] border border-blue-100">
                      {children}
                    </code>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-2">
                      {children}
                    </ol>
                  ),
                }}
              >
                {displayedText}
              </ReactMarkdown>

              {isTyping && (
                <span className="inline-block w-2 h-4 bg-[#1261B5] animate-pulse ml-1 align-middle rounded-xs" />
              )}
            </div>
          )}
        </div>

        {/* Action bar for AI responses */}
        {!isUser && !isTyping && (
          <div className="flex items-center justify-between pt-1 px-1 text-xs transition-opacity duration-300">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFeedback('up')}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Hữu ích"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFeedback('down')}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'down'
                    ? 'bg-red-50 text-red-500'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Chưa hữu ích"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {feedback && (
                <span className="text-[10px] text-emerald-600 font-bold ml-1 animate-fade-in">
                  Cảm ơn phản hồi của em!
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#6680A3] hover:text-[#1261B5] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Suggested Follow-ups */}
        {!isUser &&
          !isTyping &&
          message.suggestedFollowUps &&
          message.suggestedFollowUps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 animate-fade-in">
              <span className="text-[10px] font-bold text-[#6680A3] flex items-center gap-1 w-full mb-0.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Gợi ý câu hỏi tiếp theo:
              </span>
              {message.suggestedFollowUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFollowUp && onSelectFollowUp(chip)}
                  className="px-3 py-1.5 rounded-xl bg-[#E7F3FF] hover:bg-blue-100 text-[#1261B5] text-xs font-bold border border-blue-200/60 transition-all text-left active:scale-98"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
