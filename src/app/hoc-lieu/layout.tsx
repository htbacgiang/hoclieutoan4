import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Học liệu Toán 4 – Kho tài liệu học Toán lớp 4',
  description: 'Kho học liệu Toán 4 gồm bài giảng, hình ảnh, video, bài tập và tài liệu hỗ trợ học tập theo chương trình Giáo dục phổ thông 2018.',
  openGraph: {
    title: 'Học liệu Toán 4 – Kho tài liệu học Toán lớp 4',
    description: 'Kho học liệu Toán 4 gồm bài giảng, hình ảnh, video, bài tập và tài liệu hỗ trợ học tập theo chương trình Giáo dục phổ thông 2018.',
    images: [
      {
        url: '/images/kho-hoc-lieu-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Kho học liệu Toán 4 – Tài liệu học tập',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Học liệu Toán 4 – Kho tài liệu học Toán lớp 4',
    description: 'Kho học liệu Toán 4 gồm bài giảng, hình ảnh, video, bài tập và tài liệu hỗ trợ học tập theo chương trình Giáo dục phổ thông 2018.',
    images: ['/images/kho-hoc-lieu-toan-4.png'],
  },
};

export default function HocLieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
