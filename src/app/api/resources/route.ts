import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Resource from '@/models/Resource';
import Category from '@/models/Category';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const examType = searchParams.get('examType');
    const categorySlug = searchParams.get('category');
    const query = searchParams.get('q');

    const filter: Record<string, unknown> = { status: 'ACTIVE' };

    if (type) {
      if (type.includes(',')) {
        filter.type = { $in: type.split(',') };
      } else {
        filter.type = type;
      }
    }

    if (examType) {
      filter.examType = examType;
    }

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) filter.categoryId = cat._id;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate('categoryId', 'name slug color icon')
      .populate('lessonId', 'title slug')
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ resources });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy học liệu', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền đăng học liệu' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { title, slug, description, type, examType, fileSize, url, cloudinaryPublicId, thumbnail, lessonId, categoryId } = body;

    if (!title || !type || !url || !categoryId) {
      return NextResponse.json({ message: 'Vui lòng điền tiêu đề, loại, đường dẫn và chuyên mục' }, { status: 400 });
    }

    const baseSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const generatedSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newResource = await Resource.create({
      title,
      slug: generatedSlug,
      description: description || '',
      type,
      examType: examType || undefined,
      fileSize: fileSize || '1.5 MB',
      downloadCount: 0,
      url,
      cloudinaryPublicId: cloudinaryPublicId || '',
      thumbnail: thumbnail || '',
      lessonId: lessonId || undefined,
      categoryId,
      authorId: session.id,
      status: 'ACTIVE',
    });

    return NextResponse.json({ message: 'Thêm học liệu thành công', resource: newResource }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tạo học liệu', error: msg }, { status: 500 });
  }
}
