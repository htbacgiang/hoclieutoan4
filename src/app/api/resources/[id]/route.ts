import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const resource = await Resource.findById(params.id)
      .populate('categoryId', 'name slug color icon')
      .populate('lessonId', 'title slug');

    if (!resource) {
      return NextResponse.json({ message: 'Không tìm thấy học liệu' }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy học liệu', error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền sửa học liệu' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const updated = await Resource.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ message: 'Cập nhật học liệu thành công', resource: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật học liệu', error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa học liệu' }, { status: 403 });
    }

    await connectToDatabase();
    await Resource.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Đã xóa học liệu thành công' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi xóa học liệu', error: msg }, { status: 500 });
  }
}
