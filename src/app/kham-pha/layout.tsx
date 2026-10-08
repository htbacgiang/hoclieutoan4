import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bài học Toán 4 – Học Toán lớp 4 theo GDPT 2018',
  description: 'Khám phá các bài học Toán lớp 4 theo chương trình GDPT 2018. Học kiến thức qua bài giảng, hình ảnh trực quan và học liệu số dễ hiểu.',
  openGraph: {
    title: 'Bài học Toán 4 – Học Toán lớp 4 theo GDPT 2018',
    description: 'Khám phá các bài học Toán lớp 4 theo chương trình GDPT 2018. Học kiến thức qua bài giảng, hình ảnh trực quan và học liệu số dễ hiểu.',
    images: [
      {
        url: '/images/bai-hoc-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Bài học Toán 4 – Góc Khám phá',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bài học Toán 4 – Học Toán lớp 4 theo GDPT 2018',
    description: 'Khám phá các bài học Toán lớp 4 theo chương trình GDPT 2018. Học kiến thức qua bài giảng, hình ảnh trực quan và học liệu số dễ hiểu.',
    images: ['/images/bai-hoc-toan-4.png'],
  },
};

export default function KhamPhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
