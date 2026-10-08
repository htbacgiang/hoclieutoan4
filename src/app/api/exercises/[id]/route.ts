import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Exercise from '@/models/Exercise';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getSession();
    const isAdminOrTeacher = session && canManageContent(session.role);

    const exercise = await Exercise.findById(params.id)
      .populate('categoryId', 'name slug color icon')
      .populate('lessonId', 'title slug');

    if (!exercise) {
      return NextResponse.json({ message: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    if (!isAdminOrTeacher) {
      const sanitized = exercise.toObject() as unknown as Record<string, unknown>;
      delete sanitized.correctAnswer;
      delete sanitized.explanation;
      return NextResponse.json({ exercise: sanitized });
    }

    return NextResponse.json({ exercise });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy bài tập', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  // Student answer submission evaluation for a single exercise
  const params = await props.params;
  try {
    await connectToDatabase();
    const { answer } = await req.json();

    const exercise = await Exercise.findById(params.id);
    if (!exercise) {
      return NextResponse.json({ message: 'Không tìm thấy bài tập' }, { status: 404 });
    }

    const isCorrect = String(exercise.correctAnswer) === String(answer);

    return NextResponse.json({
      isCorrect,
      explanation: exercise.explanation,
      correctAnswer: exercise.correctAnswer,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi chấm bài tập', error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền sửa bài tập' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const updated = await Exercise.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ message: 'Cập nhật bài tập thành công', exercise: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật bài tập', error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa bài tập' }, { status: 403 });
    }

    await connectToDatabase();
    await Exercise.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Xóa bài tập thành công' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi xóa bài tập', error: msg }, { status: 500 });
  }
}
