import { NextResponse } from 'next/server';
import { seedCurriculumSkeleton } from '@/lib/curriculumSeed';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const overwrite = searchParams.get('overwrite') === 'true';
    const result = await seedCurriculumSkeleton(overwrite);
    return NextResponse.json({
      success: true,
      message: 'Đã lưu thành công Khung sườn 6 Chủ đề và 32 Bài học vào Database!',
      ...result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
