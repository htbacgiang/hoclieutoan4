import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSession, canAccessAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin CMS | Thư viện Học liệu số Toán 4',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !canAccessAdmin(session.role)) {
    redirect('/dang-nhap');
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600">Hệ thống Quản trị EdTech đang hoạt động</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">{session.name}</div>
              <div className="text-[10px] text-blue-600 font-semibold uppercase">{session.role}</div>
            </div>
            <img
              src={session.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={session.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
