import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress from '@/models/Progress';
import User from '@/models/User';
import Achievement from '@/models/Achievement';
import UserAchievement from '@/models/UserAchievement';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    await connectToDatabase();

    const progressList = await Progress.find({ studentId: session.id })
      .populate('lessonId', 'title slug difficulty thumbnail categoryId')
      .sort({ lastAccessedAt: -1 });

    const totalCompleted = progressList.filter((p) => p.completed).length;

    return NextResponse.json({
      progressList,
      totalCompleted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy tiến độ học', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để ghi nhận kết quả' }, { status: 401 });
    }

    await connectToDatabase();
    const {
      lessonId,
      exerciseId,
      exerciseTitle = 'Bài tập Wordwall Toán 4',
      completed = true,
      score = 10,
      maxScore = 10,
      completionTime = '1:22',
      xpEarned = 50,
      progressPercent = 100,
    } = await req.json();

    const queryFilter: Record<string, unknown> = { studentId: session.id };
    if (lessonId) queryFilter.lessonId = lessonId;
    if (exerciseId) queryFilter.exerciseId = exerciseId;
    if (!lessonId && !exerciseId) queryFilter.exerciseTitle = exerciseTitle;

    const calculatedXP = Math.round((score / (maxScore || 10)) * 50) || 10;

    const progress = await Progress.findOneAndUpdate(
      queryFilter,
      {
        studentId: session.id,
        lessonId: lessonId || undefined,
        exerciseId: exerciseId || String(Date.now()),
        exerciseTitle,
        completed,
        score,
        maxScore,
        completionTime,
        xpEarned: calculatedXP,
        progressPercent: Math.round((score / (maxScore || 10)) * 100),
        lastAccessedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Award XP and points for completing exercise/lesson
    if (completed) {
      await User.findByIdAndUpdate(session.id, {
        $inc: { points: 20, xp: xpEarned },
      });

      // Award badge if first completed exercise
      const starBadge = await Achievement.findOne({ slug: 'ngoi-sao-toan-hoc' });
      if (starBadge) {
        const exists = await UserAchievement.findOne({ userId: session.id, achievementId: starBadge._id });
        if (!exists) {
          await UserAchievement.create({ userId: session.id, achievementId: starBadge._id });
        }
      }
    }

    return NextResponse.json({ message: 'Cập nhật tiến độ & hoàn thành bài tập thành công!', progress });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật tiến độ', error: msg }, { status: 500 });
  }
}
