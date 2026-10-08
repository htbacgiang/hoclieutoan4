import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hỏi đáp Toán 4 – Trợ lý AI hỗ trợ học Toán lớp 4',
  description: 'Đặt câu hỏi và tìm hiểu cách giải bài Toán 4 cùng trợ lý AI. Hỗ trợ học sinh hiểu bài, kiểm tra cách làm và luyện tập Toán lớp 4 hiệu quả.',
  openGraph: {
    title: 'Hỏi đáp Toán 4 – Trợ lý AI hỗ trợ học Toán lớp 4',
    description: 'Đặt câu hỏi và tìm hiểu cách giải bài Toán 4 cùng trợ lý AI. Hỗ trợ học sinh hiểu bài, kiểm tra cách làm và luyện tập Toán lớp 4 hiệu quả.',
    images: [
      {
        url: '/images/hoi-dap-toan-4.png',
        width: 1200,
        height: 630,
        alt: 'Hỏi đáp Toán 4 – Trợ lý AI hỗ trợ học Toán',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hỏi đáp Toán 4 – Trợ lý AI hỗ trợ học Toán lớp 4',
    description: 'Đặt câu hỏi và tìm hiểu cách giải bài Toán 4 cùng trợ lý AI. Hỗ trợ học sinh hiểu bài, kiểm tra cách làm và luyện tập Toán lớp 4 hiệu quả.',
    images: ['/images/hoi-dap-toan-4.png'],
  },
};

export default function HoiDapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
