import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken, setSessionCookie, UserRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, role = 'STUDENT', className = 'Lớp 4A' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Mật khẩu phải có tối thiểu 6 ký tự' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: 'Email này đã được sử dụng' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const validRoles: UserRole[] = ['STUDENT', 'PARENT', 'TEACHER'];
    const userRole = validRoles.includes(role) ? role : 'STUDENT';

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      className: userRole === 'STUDENT' ? className : undefined,
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    });

    const payload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      className: newUser.className,
    };

    const token = await signToken(payload);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: 'Đăng ký tài khoản thành công',
        user: payload,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Register error:', msg);
    return NextResponse.json({ message: 'Đã có lỗi xảy ra trên hệ thống', error: msg }, { status: 500 });
  }
}
