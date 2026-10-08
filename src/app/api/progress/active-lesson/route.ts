import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ lastLessonSlug: null });
    }

    await connectToDatabase();
    const user = await User.findById(session.id).select('lastLessonSlug lastLessonId');

    return NextResponse.json({
      lastLessonSlug: user?.lastLessonSlug || null,
      lastLessonId: user?.lastLessonId || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ lastLessonSlug: null, error: msg });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { slug, lessonId } = await req.json();

    if (!slug) {
      return NextResponse.json({ message: 'Thiếu slug bài học' }, { status: 400 });
    }

    if (session) {
      await connectToDatabase();
      
      let targetLessonId = lessonId;
      if (!targetLessonId) {
        const found = await Lesson.findOne({ slug }).select('_id');
        if (found) targetLessonId = found._id;
      }

      // Update User last lesson position
      await User.findByIdAndUpdate(session.id, {
        lastLessonSlug: slug,
        lastLessonId: targetLessonId || undefined,
      });

      // Also touch progress last accessed time
      if (targetLessonId) {
        await Progress.findOneAndUpdate(
          { studentId: session.id, lessonId: targetLessonId },
          {
            studentId: session.id,
            lessonId: targetLessonId,
            lastAccessedAt: new Date(),
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      lastLessonSlug: slug,
      message: 'Đã lưu vị trí bài đang học',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lưu bài đang học', error: msg }, { status: 500 });
  }
}
