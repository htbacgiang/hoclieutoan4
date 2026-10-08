import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (session?.id) {
      query.userId = session.id;
    }

    const conversations = await ChatConversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Get Conversations Error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Không thể tải danh sách lịch sử hỏi đáp.',
        },
      },
      { status: 500 }
    );
  }
}
