import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chinh phục Toán 4 – Kiểm tra và đánh giá kiến thức',
  description: 'Thử sức với các bài kiểm tra, trò chơi và thử thách Toán 4. Củng cố kiến thức, tự đánh giá kết quả và nâng cao kỹ năng giải Toán lớp 4.',
  openGraph: {
    title: 'Chinh phục Toán 4 – Kiểm tra và đánh giá kiến thức',
    description: 'Thử sức với các bài kiểm tra, trò chơi và thử thách Toán 4. Củng cố kiến thức, tự đánh giá kết quả và nâng cao kỹ năng giải Toán lớp 4.',
    images: [
      {
        url: '/images/chinh-phuc-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Chinh phục Toán 4 – Thử thách và Đánh giá',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chinh phục Toán 4 – Kiểm tra và đánh giá kiến thức',
    description: 'Thử sức với các bài kiểm tra, trò chơi và thử thách Toán 4. Củng cố kiến thức, tự đánh giá kết quả và nâng cao kỹ năng giải Toán lớp 4.',
    images: ['/images/chinh-phuc-toan-4.png'],
  },
};

export default function ChinhPhucLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
