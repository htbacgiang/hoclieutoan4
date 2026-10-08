import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bài học Toán 4 – Học Toán lớp 4 theo GDPT 2018',
  description: 'Khám phá các bài học Toán lớp 4 theo chương trình GDPT 2018. Học kiến thức qua bài giảng, hình ảnh trực quan và học liệu số dễ hiểu.',
  openGraph: {
    title: 'Bài học Toán 4 – Học Toán lớp 4 theo GDPT 2018',
    description: 'Khám phá các bài học Toán lớp 4 theo chương trình GDPT 2018. Học kiến thức qua bài giảng, hình ảnh trực quan và học liệu số dễ hiểu.',
  },
};

export default function BaiHocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
