'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AiBreadcrumb from '@/components/hoi-dap/AiBreadcrumb';
import AiHero from '@/components/hoi-dap/AiHero';
import AiSidebar, { ConversationItem } from '@/components/hoi-dap/AiSidebar';
import AiContextCard from '@/components/hoi-dap/AiContextCard';
import AiChatMessage, { ChatMessageData } from '@/components/hoi-dap/AiChatMessage';
import AiTypingIndicator from '@/components/hoi-dap/AiTypingIndicator';
import AiChatInput from '@/components/hoi-dap/AiChatInput';
import { getFirstName } from '@/lib/gemini';
import { ChatMode, LessonContext } from '@/lib/openai';
import { Clock, PanelLeftClose, PanelLeftOpen, BookOpen, MessageCircleQuestion, X } from 'lucide-react';

function HoiDapContent() {
  const searchParams = useSearchParams();

  // Extract lesson context from URL query params
  const context: LessonContext = {
    subject: searchParams.get('subject') || undefined,
    grade: searchParams.get('grade') ? Number(searchParams.get('grade')) : undefined,
    topic: searchParams.get('topic') || undefined,
    lesson: searchParams.get('lesson') || undefined,
    level: searchParams.get('level') || undefined,
  };

  const initialPrompt =
    searchParams.get('prompt') ||
    searchParams.get('q') ||
    searchParams.get('question') ||
    '';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(true);
  const [pendingInput, setPendingInput] = useState<string>(initialPrompt);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Read pending captured screenshot from practice page and attach to input
  useEffect(() => {
    const screenshot = sessionStorage.getItem('ai_pending_screenshot');
    if (screenshot) {
      setPendingImage(screenshot);
      sessionStorage.removeItem('ai_pending_screenshot');
    }
  }, []);

  // Sync prompt query parameter to pendingInput if updated
  useEffect(() => {
    const q =
      searchParams.get('prompt') ||
      searchParams.get('q') ||
      searchParams.get('question') ||
      '';
    setPendingInput(q);
  }, [searchParams]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch current user session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => { });
  }, []);

  // Fetch conversation history
  const loadConversations = async () => {
    setFetchingHistory(true);
    try {
      const res = await fetch('/api/hoi-dap/conversations');
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Select a past conversation
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setMobileHistoryOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/hoi-dap/conversations/${id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        const formatted: ChatMessageData[] = data.messages.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          mode: m.mode,
          suggestedFollowUps: m.suggestedFollowUps,
          createdAt: m.createdAt,
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error('Error loading conversation detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setPendingInput('');
    setMobileHistoryOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/hoi-dap/conversations/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (activeConversationId === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Send message
  const handleSendMessage = async (text: string, mode: ChatMode = 'ask', image?: string) => {
    if ((!text.trim() && !image) || loading) return;

    const tempUserMsgId = 'user_' + Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessageData = {
      id: tempUserMsgId,
      role: 'user',
      content: text,
      imageUrl: image,
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/hoi-dap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId || undefined,
          message: text,
          context,
          mode,
          image,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.conversationId) {
          setActiveConversationId(data.conversationId);
          // Refresh conversation list title
          loadConversations();
        }

        const aiMsg: ChatMessageData = {
          id: data.message?.id || 'ai_' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: data.message?.content || 'Xin lỗi, trợ lý AI đang bận một chút, em hãy thử đặt lại câu hỏi nhé!',
          mode: data.message?.mode || mode,
          suggestedFollowUps: data.message?.suggestedFollowUps || [],
          createdAt: data.message?.createdAt,
          isNew: true,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessageData = {
          id: 'err_' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: data.error?.message || 'Trợ lý AI đang bận một chút. Em thử lại sau nhé.',
          isNew: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('API Send Error:', err);
      const errorMsg: ChatMessageData = {
        id: 'err_' + Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: 'Trợ lý AI đang bận một chút. Em thử lại sau nhé.',
        isNew: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-64px)] sm:h-[calc(100vh-80px)] bg-[#F5FAFF] text-[#123B72] flex flex-col overflow-hidden">
      {/* Dynamic Breadcrumb */}
      <AiBreadcrumb context={context} />

      {/* Main Container */}
      <div className="max-w-8xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Mobile Header Bar & Action Buttons */}
        <div className="lg:hidden flex items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-blue-100 shadow-2xs shrink-0 mb-1.5">
          <button
            onClick={() => setMobileHistoryOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#1261B5] px-3 py-1.5 rounded-xl bg-[#E7F3FF] active:scale-95 transition-all"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span>Lịch sử ({conversations.length})</span>
          </button>

          {context.lesson && (
            <span className="text-[11px] font-bold text-[#1261B5] bg-[#F5FAFF] border border-blue-100 px-2.5 py-1 rounded-xl truncate max-w-[130px] sm:max-w-[200px]">
              📚 {context.lesson}
            </span>
          )}

          <button
            onClick={handleNewChat}
            className="text-xs font-bold text-slate-700 hover:text-[#1261B5] px-3 py-1.5 rounded-xl bg-slate-100 transition-colors"
          >
            + Câu hỏi mới
          </button>
        </div>

        {/* Mobile Slide-Over Drawer for History */}
        {mobileHistoryOpen && (
          <div className="lg:hidden fixed inset-0 z-[999] flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileHistoryOpen(false)}
            />
            {/* Slide-in Panel */}
            <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
                <span className="font-extrabold text-sm text-[#123B72]">Lịch sử hỏi đáp</span>
                <button
                  onClick={() => setMobileHistoryOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                <AiSidebar
                  conversations={conversations}
                  activeId={activeConversationId}
                  onSelectConversation={(id) => {
                    handleSelectConversation(id);
                    setMobileHistoryOpen(false);
                  }}
                  onNewChat={() => {
                    handleNewChat();
                    setMobileHistoryOpen(false);
                  }}
                  onDeleteConversation={handleDeleteConversation}
                  isLoading={fetchingHistory}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0 overflow-hidden">

          {/* LEFT SIDEBAR (Desktop 3 cols: ~260px, Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-3 h-full min-h-0 overflow-hidden">
            <AiSidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
              isLoading={fetchingHistory}
            />
          </div>

          {/* CENTER CHAT AREA (Desktop 6 cols: flex-1) */}
          <main className="lg:col-span-6 flex flex-col h-full min-h-0 space-y-2 sm:space-y-3 overflow-hidden">
            {/* Hero Header */}
            <div className="shrink-0">
              <AiHero />
            </div>

            {/* Chat Messages / Empty State Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-blue-100 shadow-lg sm:shadow-xl overflow-hidden flex flex-col flex-1 min-h-0">

              {/* Message scroll container - ONLY THIS SCROLLS */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2 min-h-0 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-6 px-4 text-center space-y-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-tr from-[#1261B5] to-[#2F80ED] text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <MessageCircleQuestion className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-[#123B72]">
                      Em muốn hỏi điều gì?
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-[#6680A3] max-w-md leading-relaxed">
                      {currentUser?.name ? `Chào ${getFirstName(currentUser.name)} nhé! ` : 'Chào bạn nhỏ nhé! '}
                      Mình sẵn sàng giải đáp thắc mắc và hướng dẫn bài tập cho em. Hãy nhập câu hỏi ở bên dưới nhé!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <AiChatMessage
                      key={msg.id}
                      message={msg}
                      userName={currentUser?.name || 'Học sinh'}
                      userAvatar={currentUser?.avatar}
                      onSelectFollowUp={(q) => handleSendMessage(q)}
                    />
                  ))
                )}

                {loading && <AiTypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="shrink-0 border-t border-slate-100 bg-white">
                <AiChatInput
                  onSendMessage={handleSendMessage}
                  disabled={loading}
                  initialValue={pendingInput}
                  initialImage={pendingImage}
                />
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR CONTEXT (Desktop 3 cols: ~280px, Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-3 h-full min-h-0 overflow-y-auto">
            <AiContextCard context={context} />
          </aside>

        </div>

      </div>
    </div>
  );
}

export default function HoiDapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center p-8 text-center text-xs font-extrabold text-[#1261B5]">
        Đang tải Trợ lý AI...
      </div>
    }>
      <HoiDapContent />
    </Suspense>
  );
}
