import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import UserAchievement from '@/models/UserAchievement';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();

    const achievements = await Achievement.find({}).sort({ points: 1 });

    let userEarnedIds: string[] = [];

    if (session?.id) {
      const userAchievements = await UserAchievement.find({ userId: session.id });
      userEarnedIds = userAchievements.map((ua) => ua.achievementId.toString());
    }

    const result = achievements.map((ach) => ({
      ...ach.toObject(),
      earned: userEarnedIds.includes(ach._id.toString()),
    }));

    return NextResponse.json({ achievements: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách huy hiệu', error: msg }, { status: 500 });
  }
}
