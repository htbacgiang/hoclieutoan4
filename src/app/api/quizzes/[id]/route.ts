import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getSession();
    const isAdminOrTeacher = session && canManageContent(session.role);

    const quiz = await Quiz.findById(params.id)
      .populate('categoryId', 'name slug color icon')
      .populate({
        path: 'questions',
        select: isAdminOrTeacher ? '' : '-correctAnswer -explanation',
      });

    if (!quiz) {
      return NextResponse.json({ message: 'Không tìm thấy bài kiểm tra' }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy thông tin bài kiểm tra', error: msg }, { status: 500 });
  }
}
