'use client';

import { useState } from 'react';
import { Settings, Save, Database, Shield, Bot, Check } from 'lucide-react';

export default function AdminCaiDatPage() {
  const [aiProvider, setAiProvider] = useState('mock');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Cài Đặt Hệ Thống</h1>
          <p className="text-xs text-slate-500">Cấu hình kết nối Database, Cloudinary và AI Provider</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
        
        {saved && (
          <div className="p-3.5 rounded-2xl bg-green-50 text-green-700 text-xs font-bold flex items-center gap-2 border border-green-200">
            <Check className="w-4 h-4" /> Đã lưu cấu hình hệ thống thành công!
          </div>
        )}

        {/* AI Configuration */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bot className="w-5 h-5 text-blue-600" /> AI Provider Architecture
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Lựa chọn Provider Trợ lý Robot AI</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="mock">Mock AI Provider (Sẵn sàng không cần API Key external)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
            </select>
          </div>
        </div>

        {/* Database Status */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Database className="w-5 h-5 text-emerald-600" /> Database Status
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <strong className="text-slate-900">MongoDB / Mongoose ODM</strong>
            </div>
            <div className="flex justify-between">
              <span>Fallback Engine:</span>
              <strong className="text-green-600">MongoMemoryServer (In-Memory Ready)</strong>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Save className="w-4 h-4" /> Lưu cấu hình
        </button>

      </form>
    </div>
  );
}
