'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quên Mật Khẩu</h1>
          <p className="text-xs text-slate-500">Khôi phục mật khẩu tài khoản học liệu số</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h3 className="font-bold text-green-900 text-base">Đã gửi hướng dẫn khôi phục</h3>
            <p className="text-xs text-green-800 leading-relaxed">
              Chúng tôi đã gửi email hướng dẫn tạo lại mật khẩu tới <strong>{email}</strong>. Bạn vui lòng kiểm tra hòm thư nhé!
            </p>
            <Link
              href="/dang-nhap"
              className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email của bạn</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/25"
            >
              Gửi yêu cầu khôi phục
            </button>
          </form>
        )}

        <div className="text-center text-xs font-semibold text-slate-500 pt-2">
          <Link href="/dang-nhap" className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
