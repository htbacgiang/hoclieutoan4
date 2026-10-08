import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Exercise from '@/models/Exercise';
import Category from '@/models/Category';
import { getSession, canManageContent } from '@/lib/auth';
import { seedCurriculumSkeleton } from '@/lib/curriculumSeed';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const count = await Exercise.countDocuments();
    if (count === 0) {
      await seedCurriculumSkeleton();
    }

    const session = await getSession();
    const isAdminOrTeacher = session && canManageContent(session.role);

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const lessonId = searchParams.get('lessonId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 200;

    const filter: Record<string, unknown> = { status: 'ACTIVE' };

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) filter.categoryId = cat._id;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (lessonId) {
      filter.lessonId = lessonId;
    }

    const queryExec = Exercise.find(filter)
      .populate('categoryId', 'name slug color icon order')
      .populate('lessonId', 'title slug')
      .limit(limit)
      .sort({ createdAt: 1 });

    if (!isAdminOrTeacher) {
      // Hide correct answer and explanation for non-admin/teacher
      queryExec.select('-correctAnswer -explanation');
    }

    const exercises = await queryExec.exec();

    return NextResponse.json({ exercises });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách bài tập', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền tạo bài tập' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      question,
      type = 'MULTIPLE_CHOICE',
      content,
      image,
      options,
      correctAnswer,
      explanation,
      difficulty = 'Cơ bản',
      lessonId,
      categoryId,
    } = body;

    if (!title || !question || !categoryId) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin bài tập' }, { status: 400 });
    }

    const newExercise = await Exercise.create({
      title,
      question,
      type: type || 'MATCHING',
      content: content || '',
      image: image || '',
      options: options || [],
      correctAnswer: correctAnswer !== undefined ? correctAnswer : 0,
      explanation: explanation || '',
      difficulty,
      lessonId: lessonId || undefined,
      categoryId,
      status: 'ACTIVE',
    });

    return NextResponse.json({ message: 'Tạo bài tập thành công', exercise: newExercise }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tạo bài tập', error: msg }, { status: 500 });
  }
}
