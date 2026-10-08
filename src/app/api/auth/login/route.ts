import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Vui lòng nhập email và mật khẩu' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt' }, { status: 403 });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      className: user.className,
      parentId: user.parentId?.toString(),
    };

    const token = await signToken(payload);
    await setSessionCookie(token);

    return NextResponse.json({
      message: 'Đăng nhập thành công',
      user: payload,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Login error:', msg);
    return NextResponse.json({ message: 'Đã có lỗi xảy ra trên hệ thống', error: msg }, { status: 500 });
  }
}
