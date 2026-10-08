'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import AiModeSelector from './AiModeSelector';
import { ChatMode } from '@/lib/openai';

interface AiChatInputProps {
  onSendMessage: (message: string, mode: ChatMode, image?: string) => void;
  disabled?: boolean;
  initialValue?: string;
  initialImage?: string | null;
}

export default function AiChatInput({
  onSendMessage,
  disabled = false,
  initialValue = '',
  initialImage = null,
}: AiChatInputProps) {
  const [text, setText] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [mode, setMode] = useState<ChatMode>('ask');
  const [attachedImage, setAttachedImage] = useState<string | null>(initialImage || null);
  const [prevInitialImage, setPrevInitialImage] = useState(initialImage);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setText(initialValue);
  }

  if (initialImage !== prevInitialImage) {
    setPrevInitialImage(initialImage);
    if (initialImage) {
      setAttachedImage(initialImage);
      setToastNotice('📸 Đã tự động chụp ảnh màn hình bài tập và dán vào đây!');
      setTimeout(() => setToastNotice(null), 3500);
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Listen for Clipboard Paste (Ctrl+V) for instant image attaching
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setAttachedImage(reader.result);
              showNotice('📸 Đã dán ảnh từ khay nhớ tạm (Ctrl+V)!');
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('Vui lòng chọn file hình ảnh (PNG, JPG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage(reader.result);
        showNotice('📷 Đã đính kèm ảnh bài tập thành công!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if ((!cleanText && !attachedImage) || disabled) return;

    onSendMessage(
      cleanText || 'Nhờ thầy cô đọc và hướng dẫn bài toán trong hình ảnh này với ạ!',
      mode,
      attachedImage || undefined
    );
    setText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  return (
    <div className="bg-white border-t border-slate-200/80 p-3 sm:p-4 space-y-2 rounded-b-3xl relative">
      {/* Notice popup */}
      {toastNotice && (
        <div className="absolute -top-10 left-4 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-fade-in z-20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Mode selector bar & hint */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <AiModeSelector currentMode={mode} onChangeMode={setMode} />
        <span className="text-[11px] font-semibold text-[#6680A3] hidden sm:inline-block">
          Dán ảnh <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Ctrl+V</kbd> hoặc tải ảnh lên
        </span>
      </div>

      {/* Image Preview Bar (if attached) */}
      {attachedImage && (
        <div className="flex items-center gap-3 p-2 bg-blue-50/80 border border-blue-200 rounded-2xl animate-fade-in">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-blue-300 shrink-0 bg-slate-900 shadow-xs">
            <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-[#123B72] truncate flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Hình ảnh bài tập đã đính kèm</span>
            </p>
            <p className="text-[10px] text-blue-600 font-medium">
              AI Vision sẽ đọc và phân tích chữ/số trong ảnh
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-colors shrink-0"
            title="Xóa ảnh đính kèm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input Form Row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 bg-[#F5FAFF] rounded-2xl border border-slate-200 focus-within:border-[#2F80ED] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2 flex items-end gap-2">
          {/* Attach file / Upload Image button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#6680A3] hover:text-[#1261B5] hover:bg-white rounded-xl transition-colors shrink-0 flex items-center gap-1"
            title="Tải hoặc đính kèm ảnh bài tập"
            aria-label="Tải ảnh lên"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={attachedImage ? "Nhập thêm yêu cầu về ảnh (hoặc bấm Gửi ngay)..." : "Nhập câu hỏi hoặc Dán (Ctrl+V) ảnh bài tập vào đây..."}
            className="flex-1 bg-transparent border-0 text-sm font-medium text-[#123B72] placeholder:text-[#6680A3] focus:outline-none resize-none py-1.5 max-h-40"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !attachedImage) || disabled}
          className="py-3 px-5 bg-[#1261B5] hover:bg-[#2F80ED] disabled:opacity-40 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 shrink-0 h-[46px] active:scale-98 cursor-pointer"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
