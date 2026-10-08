import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Resource from '@/models/Resource';
import Exercise from '@/models/Exercise';
import LessonDetailClient from './LessonDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getLessonData(slug: string) {
  try {
    await connectToDatabase();
    const lesson = await Lesson.findOne({ slug })
      .populate('categoryId', 'name slug color icon')
      .populate('authorId', 'name avatar');

    if (!lesson) return null;

    const resources = await Resource.find({ lessonId: lesson._id, status: 'ACTIVE' });
    const exercises = await Exercise.find({ lessonId: lesson._id, status: 'ACTIVE' }).select('-correctAnswer -explanation');

    return {
      lesson: JSON.parse(JSON.stringify(lesson)),
      resources: JSON.parse(JSON.stringify(resources)),
      exercises: JSON.parse(JSON.stringify(exercises)),
    };
  } catch (err) {
    console.error('Error fetching lesson:', err);
    return null;
  }
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const data = await getLessonData(params.slug);
  if (!data) return { title: 'Bài học không tồn tại' };

  return {
    title: `${data.lesson.title} - Toán 4`,
    description: data.lesson.description,
  };
}

export default async function LessonDetailPage(props: PageProps) {
  const params = await props.params;
  const data = await getLessonData(params.slug);

  if (!data) {
    notFound();
  }

  return <LessonDetailClient lesson={data.lesson} resources={data.resources} exercises={data.exercises} />;
}
