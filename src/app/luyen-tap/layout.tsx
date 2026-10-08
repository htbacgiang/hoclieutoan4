import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luyện tập Toán 4 – Bài tập Toán lớp 4 trực tuyến',
  description: 'Luyện tập Toán lớp 4 qua hệ thống bài tập trực tuyến, câu hỏi tương tác và các dạng bài từ cơ bản đến nâng cao, giúp học sinh củng cố kiến thức.',
  openGraph: {
    title: 'Luyện tập Toán 4 – Bài tập Toán lớp 4 trực tuyến',
    description: 'Luyện tập Toán lớp 4 qua hệ thống bài tập trực tuyến, câu hỏi tương tác và các dạng bài từ cơ bản đến nâng cao, giúp học sinh củng cố kiến thức.',
    images: [
      {
        url: '/images/luyen-tap-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Luyện tập Toán 4 – Bài tập trực tuyến',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luyện tập Toán 4 – Bài tập Toán lớp 4 trực tuyến',
    description: 'Luyện tập Toán lớp 4 qua hệ thống bài tập trực tuyến, câu hỏi tương tác và các dạng bài từ cơ bản đến nâng cao, giúp học sinh củng cố kiến thức.',
    images: ['/images/luyen-tap-toan-4.png'],
  },
};

export default function LuyenTapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
