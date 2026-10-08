import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSession, canAccessAdmin, hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessAdmin(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền truy cập danh sách người dùng' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const role = searchParams.get('role');
    const query = searchParams.get('q');

    const filter: Record<string, unknown> = {};
    if (role && role !== 'ALL') {
      if (role === 'TEACHER_ADMIN') {
        filter.role = { $in: ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] };
      } else {
        filter.role = role;
      }
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { className: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách người dùng', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessAdmin(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền tạo người dùng' }, { status: 403 });
    }

    await connectToDatabase();
    const { name, email, password = '123456', role = 'STUDENT', className, avatar } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Vui lòng điền họ tên và email' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      className,
      avatar: avatar || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
    });

    const sanitized = newUser.toObject() as unknown as Record<string, unknown>;
    delete sanitized.passwordHash;

    return NextResponse.json({ message: 'Tạo người dùng thành công', user: sanitized }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tạo người dùng', error: msg }, { status: 500 });
  }
}
