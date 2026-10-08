import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Progress from '@/models/Progress';
import QuizAttempt from '@/models/QuizAttempt';
import UserAchievement from '@/models/UserAchievement';
import { getSession, canAccessAdmin, hashPassword } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(params.id).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Get detailed study progress and quiz attempts for student detail view
    const progressList = await Progress.find({ studentId: user._id }).populate('lessonId', 'title slug difficulty');
    const attempts = await QuizAttempt.find({ studentId: user._id }).populate('quizId', 'title totalScore');
    const achievements = await UserAchievement.find({ userId: user._id }).populate('achievementId');

    return NextResponse.json({
      user,
      progressList,
      attempts,
      achievements,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy thông tin người dùng', error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Allow user to edit their own profile or admin to edit any user
    if (session.id !== params.id && !canAccessAdmin(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền chỉnh sửa' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    if (body.password) {
      body.passwordHash = await hashPassword(body.password);
      delete body.password;
    }

    const updated = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-passwordHash');
    return NextResponse.json({ message: 'Cập nhật thành công', user: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật người dùng', error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canAccessAdmin(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa tài khoản' }, { status: 403 });
    }

    await connectToDatabase();
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Đã xóa người dùng' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi xóa người dùng', error: msg }, { status: 500 });
  }
}
