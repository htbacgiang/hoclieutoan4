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
import { ChatMode, LessonContext } from '@/lib/openai';
import { Clock, PanelLeftClose, PanelLeftOpen, BookOpen, MessageCircleQuestion } from 'lucide-react';

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
          content: data.message?.content || 'Xin lỗi, thầy cô AI đang bận một chút, em hãy thử đặt lại câu hỏi nhé!',
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
          content: data.error?.message || 'Thầy cô AI đang bận một chút. Em thử lại sau nhé.',
          isNew: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('API Send Error:', err);
      const errorMsg: ChatMessageData = {
        id: 'err_' + Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: 'Thầy cô AI đang bận một chút. Em thử lại sau nhé.',
        isNew: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#F5FAFF] text-[#123B72] flex flex-col overflow-hidden">
      {/* Dynamic Breadcrumb */}
      <AiBreadcrumb context={context} />

      {/* Main Container */}
      <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">

        {/* Mobile History Toggle & Header bar */}
        <div className="lg:hidden flex items-center justify-between bg-white p-2.5 rounded-2xl border border-blue-100 shadow-2xs shrink-0">
          <button
            onClick={() => setMobileHistoryOpen(!mobileHistoryOpen)}
            className="flex items-center gap-2 text-xs font-extrabold text-[#1261B5] px-3 py-1.5 rounded-xl bg-[#E7F3FF]"
          >
            {mobileHistoryOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
            <span>Lịch sử hỏi đáp ({conversations.length})</span>
          </button>

          <button
            onClick={handleNewChat}
            className="text-xs font-bold text-slate-600 hover:text-[#1261B5] px-3 py-1.5 rounded-xl bg-slate-100"
          >
            + Câu hỏi mới
          </button>
        </div>

        {/* 3-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0 overflow-hidden">

          {/* LEFT SIDEBAR (Desktop 3 cols: ~260px) */}
          <div
            className={`lg:col-span-3 h-full min-h-0 overflow-hidden ${mobileHistoryOpen ? 'block' : 'hidden lg:block'
              }`}
          >
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
          <main className="lg:col-span-6 flex flex-col h-full min-h-0 space-y-3 overflow-hidden">
            {/* Hero Header */}
            <div className="shrink-0">
              <AiHero />
            </div>

            {/* Chat Messages / Empty State Card */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden flex flex-col flex-1 min-h-0">

              {/* Message scroll container - ONLY THIS SCROLLS */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 min-h-0 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 px-4 text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#1261B5] to-[#2F80ED] text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <MessageCircleQuestion className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[#123B72]">
                      Em muốn hỏi điều gì?
                    </h2>
                    <p className="text-xs font-medium text-[#6680A3] max-w-md leading-relaxed">
                      Thầy cô AI sẵn sàng giải đáp thắc mắc và hướng dẫn bài tập cho em. Hãy nhập câu hỏi ở bên dưới nhé!
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

          {/* RIGHT SIDEBAR CONTEXT (Desktop 3 cols: ~280px) */}
          <aside className="lg:col-span-3 h-full min-h-0 overflow-y-auto">
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
