import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Category from '@/models/Category';
import Resource from '@/models/Resource';
import { getSession, canManageContent } from '@/lib/auth';
import { getDocumentContentForLesson } from '@/lib/documentReader';
import { seedCurriculumSkeleton } from '@/lib/curriculumSeed';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const count = await Lesson.countDocuments();
    if (count === 0) {
      await seedCurriculumSkeleton();
    }

    const { searchParams } = new URL(req.url);

    const categorySlug = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status') || 'PUBLISHED';
    const query = searchParams.get('q');

    const filter: Record<string, unknown> = {};

    if (status !== 'ALL') {
      filter.status = status;
    }

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) {
        filter.categoryId = cat._id;
      }
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const lessons = await Lesson.find(filter)
      .populate('categoryId', 'name slug color icon order')
      .populate('authorId', 'name avatar email role')
      .sort({ createdAt: 1 })
      .lean();

    const lessonIds = lessons.map((l) => l._id);
    const resources = await Resource.find({ lessonId: { $in: lessonIds }, status: 'ACTIVE' })
      .select('title type url lessonId')
      .lean();

    const lessonResourceMap: Record<string, typeof resources> = {};
    resources.forEach((r) => {
      const lid = r.lessonId?.toString();
      if (lid) {
        if (!lessonResourceMap[lid]) lessonResourceMap[lid] = [];
        lessonResourceMap[lid].push(r);
      }
    });

    const lessonsWithResources = lessons.map((l) => {
      let content = l.content;
      if (!content || !content.trim()) {
        const docResult = getDocumentContentForLesson(l.title, l.slug);
        if (docResult && docResult.content) {
          content = docResult.content;
        }
      }
      return {
        ...l,
        content,
        resources: lessonResourceMap[l._id.toString()] || [],
      };
    });

    return NextResponse.json({ lessons: lessonsWithResources });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách bài học', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền tạo bài học' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      slug,
      description,
      content,
      objectives,
      categoryId,
      authorId,
      thumbnail,
      video,
      duration,
      difficulty,
      status = 'PUBLISHED',
      resourceIds,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !description || !content || !categoryId) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newLesson = await Lesson.create({
      title,
      slug: generatedSlug,
      description,
      content,
      objectives: objectives || [],
      categoryId,
      thumbnail: thumbnail || '',
      video: video || '',
      duration: duration || 15,
      difficulty: difficulty || 'Trung bình',
      status: session.role === 'TEACHER' ? 'PENDING_REVIEW' : status,
      authorId: authorId || session.id,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || description,
    });

    if (Array.isArray(resourceIds) && resourceIds.length > 0) {
      await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: { lessonId: newLesson._id } }
      );
    }

    return NextResponse.json({ message: 'Tạo bài học mới thành công', lesson: newLesson }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tạo bài học', error: msg }, { status: 500 });
  }
}
