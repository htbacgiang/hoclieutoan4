import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');

    const filter: Record<string, unknown> = { status: 'ACTIVE' };

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) filter.categoryId = cat._id;
    }

    const quizzes = await Quiz.find(filter)
      .populate('categoryId', 'name slug color icon')
      .populate({
        path: 'questions',
        select: '-correctAnswer -explanation', // Hide correct answers for quizzes listing
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ quizzes });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy bài kiểm tra', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền tạo bài kiểm tra' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { title, description, questions, duration, totalScore, categoryId } = body;

    if (!title || !questions || !categoryId) {
      return NextResponse.json({ message: 'Vui lòng điền tiêu đề, danh sách câu hỏi và chuyên mục' }, { status: 400 });
    }

    const newQuiz = await Quiz.create({
      title,
      description: description || '',
      questions,
      duration: duration || 15,
      totalScore: totalScore || 10,
      categoryId,
      status: 'ACTIVE',
    });

    return NextResponse.json({ message: 'Tạo bài kiểm tra thành công', quiz: newQuiz }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tạo bài kiểm tra', error: msg }, { status: 500 });
  }
}
