'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Clock, AlertCircle, X } from 'lucide-react';

export interface ConversationItem {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

interface AiSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading?: boolean;
}

export default function AiSidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading = false,
}: AiSidebarProps) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Group conversations by date
  const groupConversations = (items: ConversationItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: ConversationItem[];
      yesterday: ConversationItem[];
      older: ConversationItem[];
    } = {
      today: [],
      yesterday: [],
      older: [],
    };

    items.forEach((item) => {
      const d = new Date(item.updatedAt || item.createdAt);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        groups.today.push(item);
      } else if (d.getTime() === yesterday.getTime()) {
        groups.yesterday.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return groups;
  };

  const groups = groupConversations(conversations);

  const confirmDelete = () => {
    if (deleteCandidateId) {
      onDeleteConversation(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  return (
    <aside className="bg-white rounded-3xl p-5 border border-blue-100/60 shadow-xs flex flex-col h-full space-y-4">
      {/* Sidebar Header & New Chat Button */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-[#123B72] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2F80ED]" /> Lịch sử hỏi đáp
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#1261B5]">
            {conversations.length}
          </span>
        </h2>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs text-white bg-[#1261B5] hover:bg-[#2F80ED] active:scale-98 transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Câu hỏi mới</span>
        </button>
      </div>

      {/* Conversation List Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6680A3] space-y-1">
            <p className="font-semibold">Chưa có lịch sử câu hỏi nào.</p>
            <p className="text-[11px] text-slate-400">Hãy đặt câu hỏi đầu tiên nhé!</p>
          </div>
        ) : (
          <>
            {/* Today Group */}
            {groups.today.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Hôm nay
                </div>
                {groups.today.map((item) => renderItem(item))}
              </div>
            )}

            {/* Yesterday Group */}
            {groups.yesterday.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2">
                  Hôm qua
                </div>
                {groups.yesterday.map((item) => renderItem(item))}
              </div>
            )}

            {/* Older Group */}
            {groups.older.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2">
                  Trước đó
                </div>
                {groups.older.map((item) => renderItem(item))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-blue-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#123B72]">
                Xóa cuộc trò chuyện?
              </h3>
              <p className="text-xs text-[#6680A3]">
                Em có chắc muốn xóa cuộc trò chuyện này không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  function renderItem(item: ConversationItem) {
    const isActive = activeId === item._id;
    return (
      <div
        key={item._id}
        onClick={() => onSelectConversation(item._id)}
        className={`group relative flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 border ${
          isActive
            ? 'bg-[#E7F3FF] text-[#1261B5] border-blue-200 shadow-2xs font-extrabold'
            : 'text-[#123B72] hover:bg-slate-50 border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-6">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? 'text-[#1261B5]' : 'text-slate-400 group-hover:text-[#2F80ED]'
            }`}
          />
          <span className="truncate">{item.title}</span>
        </div>

        {/* Delete Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteCandidateId(item._id);
          }}
          title="Xóa cuộc trò chuyện"
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all absolute right-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
}
