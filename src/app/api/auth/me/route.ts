import { NextResponse } from 'next/server';
import { getSession, signToken, setSessionCookie } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { uploadAvatar } from '@/lib/cloudinary';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await User.findById(session.id).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ user: null, error: msg });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { name, avatar, className } = await req.json();

    await connectToDatabase();
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    if (name && name.trim() !== '') user.name = name.trim();
    if (avatar !== undefined) {
      if (typeof avatar === 'string' && avatar.startsWith('data:image/')) {
        const uploaded = await uploadAvatar(avatar);
        user.avatar = uploaded.secureUrl;
      } else {
        user.avatar = avatar;
      }
    }
    if (className !== undefined) user.className = className;

    await user.save();

    // Re-sign token with updated info
    const newToken = await signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      className: user.className,
    });
    await setSessionCookie(newToken);

    const updatedUser = user.toObject() as unknown as Record<string, unknown>;
    delete updatedUser.passwordHash;

    return NextResponse.json({ message: 'Cập nhật hồ sơ thành công', user: updatedUser });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật thông tin', error: msg }, { status: 500 });
  }
}
