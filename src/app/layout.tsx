import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thư viện Học liệu số Toán 4 | Học toán thông minh cùng AI',
  description: 'Nền tảng học liệu số môn Toán lớp 4 trực quan, sinh động với 3 mạch kiến thức, bài tập tương tác, trợ lý Robot AI và hệ thống vinh danh thành tích.',
  keywords: ['Toán 4', 'Học liệu số', 'Phân số', 'Hình học', 'Thống kê', 'Robot AI', 'Luyện tập Toán 4'],
  openGraph: {
    title: 'Thư viện Học liệu số Toán 4',
    description: 'Học thông minh hơn – Khám phá Toán học dễ dàng hơn',
    url: 'https://hoclieutoan4.vn',
    siteName: 'Học liệu số Toán 4',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#F7FAFF] text-[#173B72]" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
