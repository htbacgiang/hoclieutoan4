import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const nunito = Nunito({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hoclieutoanlop4.com'),
  title: 'Học liệu Toán 4 - Bài học, Bài tập & Luyện tập cùng AI',
  description: 'Thư viện học liệu Toán 4 theo chương trình GDPT 2018. Học bài, xem học liệu, luyện tập, hỏi đáp và chinh phục Toán 4 cùng trợ lý AI.',
  keywords: ['Toán 4', 'Học liệu số', 'Bài học Toán 4', 'Bài tập Toán 4', 'Luyện tập Toán 4', 'Hỏi đáp AI', 'GDPT 2018'],
  openGraph: {
    title: 'Học liệu Toán 4 – Bài học, Bài tập & Luyện tập cùng AI',
    description: 'Thư viện học liệu Toán 4 theo chương trình GDPT 2018. Học bài, xem học liệu, luyện tập, hỏi đáp và chinh phục Toán 4 cùng trợ lý AI.',
    url: 'https://hoclieutoanlop4.com',
    siteName: 'Học liệu số Toán 4',
    images: [
      {
        url: '/images/hoc-toan-lop-4-thong-minh-cung-ai.png',
        width: 1200,
        height: 630,
        alt: 'Học liệu Toán 4 - Học thông minh cùng AI',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Học liệu Toán 4 – Bài học, Bài tập & Luyện tập cùng AI',
    description: 'Thư viện học liệu Toán 4 theo chương trình GDPT 2018. Học bài, xem học liệu, luyện tập, hỏi đáp và chinh phục Toán 4 cùng trợ lý AI.',
    images: ['/images/hoc-toan-lop-4-thong-minh-cung-ai.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`scroll-smooth ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      </head>
      <body className={`${nunito.className} min-h-screen flex flex-col antialiased bg-[#F7FAFF] text-[#173B72]`} suppressHydrationWarning>
        <Header />
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
