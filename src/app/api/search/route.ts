import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Exercise from '@/models/Exercise';
import Resource from '@/models/Resource';
import Category from '@/models/Category';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 12;

    if (!q.trim()) {
      return NextResponse.json({
        query: '',
        total: 0,
        lessons: [],
        exercises: [],
        resources: [],
        categories: [],
      });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const [lessons, exercises, resources, categories] = await Promise.all([
      Lesson.find({
        status: 'PUBLISHED',
        $or: [{ title: regex }, { description: regex }, { content: regex }],
      })
        .populate('categoryId', 'name slug color icon')
        .limit(limit),
      Exercise.find({
        status: 'ACTIVE',
        $or: [{ title: regex }, { question: regex }, { content: regex }],
      })
        .populate('categoryId', 'name slug color icon')
        .populate('lessonId', 'title slug')
        .select('-correctAnswer -explanation')
        .limit(limit),
      Resource.find({
        status: 'ACTIVE',
        $or: [{ title: regex }, { description: regex }],
      })
        .populate('categoryId', 'name slug color icon')
        .limit(limit),
      Category.find({
        status: 'ACTIVE',
        $or: [{ name: regex }, { description: regex }],
      }).limit(limit),
    ]);

    const total = lessons.length + exercises.length + resources.length + categories.length;

    return NextResponse.json({
      query: q,
      total,
      lessons,
      exercises,
      resources,
      categories,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi tìm kiếm', error: msg }, { status: 500 });
  }
}
