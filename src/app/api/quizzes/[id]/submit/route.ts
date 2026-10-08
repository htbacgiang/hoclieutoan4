import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import Exercise from '@/models/Exercise';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import UserAchievement from '@/models/UserAchievement';
import Achievement from '@/models/Achievement';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    await connectToDatabase();

    const { userAnswers, duration = 0 } = await req.json();
    // userAnswers: { [questionId: string]: string | number }

    const quiz = await Quiz.findById(params.id).populate('questions');
    if (!quiz) {
      return NextResponse.json({ message: 'Không tìm thấy bài kiểm tra' }, { status: 404 });
    }

    let correctCount = 0;
    let wrongCount = 0;
    const evaluatedAnswers: { questionId: string; studentAnswer: string | number; isCorrect: boolean; correctAnswer: unknown; explanation: string }[] = [];

    const questionsList = quiz.questions as unknown as (typeof Exercise.prototype)[];

    for (const q of questionsList) {
      const studentAns = userAnswers[q._id.toString()];
      const isCorrect = studentAns !== undefined && String(studentAns) === String(q.correctAnswer);

      if (isCorrect) correctCount++;
      else wrongCount++;

      evaluatedAnswers.push({
        questionId: q._id.toString(),
        studentAnswer: studentAns,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }

    const totalQ = questionsList.length || 1;
    const rawScore = (correctCount / totalQ) * quiz.totalScore;
    const score = Math.round(rawScore * 10) / 10;

    let attempt = null;
    let earnedBadges: string[] = [];

    if (session?.id) {
      attempt = await QuizAttempt.create({
        quizId: quiz._id,
        studentId: session.id,
        answers: evaluatedAnswers.map(a => ({
          questionId: a.questionId,
          studentAnswer: a.studentAnswer,
          isCorrect: a.isCorrect,
        })),
        score,
        correctCount,
        wrongCount,
        duration,
      });

      // Update student XP and points
      const gainedXP = correctCount * 10 + Math.round(score * 5);
      const gainedPoints = Math.round(score * 2);

      const user = await User.findByIdAndUpdate(
        session.id,
        { $inc: { points: gainedPoints, xp: gainedXP } },
        { new: true }
      );

      // Check badge eligibility
      if (score >= 9) {
        const starBadge = await Achievement.findOne({ slug: 'dung-si-phan-so' });
        if (starBadge) {
          const exists = await UserAchievement.findOne({ userId: session.id, achievementId: starBadge._id });
          if (!exists) {
            await UserAchievement.create({ userId: session.id, achievementId: starBadge._id });
            earnedBadges.push(starBadge.name);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Nộp bài kiểm tra thành công!',
      score,
      totalScore: quiz.totalScore,
      correctCount,
      wrongCount,
      totalQuestions: totalQ,
      evaluatedAnswers,
      earnedBadges,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi chấm bài kiểm tra', error: msg }, { status: 500 });
  }
}
