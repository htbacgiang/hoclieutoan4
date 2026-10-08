import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bài tập Toán 4 – Bài tập Toán lớp 4 có đáp án',
  description: 'Tổng hợp bài tập Toán 4 theo chương trình GDPT 2018, giúp học sinh luyện tập số và phép tính, hình học, đo lường, thống kê và giải toán.',
  openGraph: {
    title: 'Bài tập Toán 4 – Bài tập Toán lớp 4 có đáp án',
    description: 'Tổng hợp bài tập Toán 4 theo chương trình GDPT 2018, giúp học sinh luyện tập số và phép tính, hình học, đo lường, thống kê và giải toán.',
    images: [
      {
        url: '/images/bai-tap-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Bài tập Toán 4 – Tổng hợp bài tập có đáp án',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bài tập Toán 4 – Bài tập Toán lớp 4 có đáp án',
    description: 'Tổng hợp bài tập Toán 4 theo chương trình GDPT 2018, giúp học sinh luyện tập số và phép tính, hình học, đo lường, thống kê và giải toán.',
    images: ['/images/bai-tap-toan-4.png'],
  },
};

export default function BaiTapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
