import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Resource from '@/models/Resource';
import Exercise from '@/models/Exercise';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const idOrSlug = params.id;

    let lesson = await Lesson.findOne({ slug: idOrSlug })
      .populate('categoryId', 'name slug color icon')
      .populate('authorId', 'name avatar');

    if (!lesson && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      lesson = await Lesson.findById(idOrSlug)
        .populate('categoryId', 'name slug color icon')
        .populate('authorId', 'name avatar');
    }

    if (!lesson) {
      return NextResponse.json({ message: 'Không tìm thấy bài học' }, { status: 404 });
    }

    const resources = await Resource.find({ lessonId: lesson._id, status: 'ACTIVE' });
    const exercises = await Exercise.find({ lessonId: lesson._id, status: 'ACTIVE' });

    return NextResponse.json({ lesson, resources, exercises });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy chi tiết bài học', error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền chỉnh sửa bài học' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { resourceIds, ...updateData } = body;

    const updated = await Lesson.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ message: 'Không tìm thấy bài học để cập nhật' }, { status: 404 });
    }

    if (Array.isArray(resourceIds)) {
      // Unlink resources that were previously attached to this lesson but now unselected
      await Resource.updateMany(
        { lessonId: params.id, _id: { $nin: resourceIds } },
        { $unset: { lessonId: 1 } }
      );
      // Link newly selected resources to this lesson
      if (resourceIds.length > 0) {
        await Resource.updateMany(
          { _id: { $in: resourceIds } },
          { $set: { lessonId: params.id } }
        );
      }
    }

    return NextResponse.json({ message: 'Cập nhật bài học thành công', lesson: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi cập nhật bài học', error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa bài học' }, { status: 403 });
    }

    await connectToDatabase();
    await Lesson.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Xóa bài học thành công' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi xóa bài học', error: msg }, { status: 500 });
  }
}
