import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { seedCurriculumSkeleton } from '@/lib/curriculumSeed';

export async function GET() {
  try {
    await connectToDatabase();
    const count = await Category.countDocuments();
    if (count === 0) {
      await seedCurriculumSkeleton();
    }
    const categories = await Category.find({ status: 'ACTIVE' }).sort({ order: 1 });
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh mục', error: msg }, { status: 500 });
  }
}
