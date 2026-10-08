import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import { getSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    await connectToDatabase();

    const conversation = await ChatConversation.findById(id).lean();
    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cuộc trò chuyện không tồn tại.',
          },
        },
        { status: 404 }
      );
    }

    if (session?.id && conversation.userId) {
      if (conversation.userId.toString() !== session.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Bạn không có quyền xem cuộc trò chuyện này.',
            },
          },
          { status: 403 }
        );
      }
    }

    const messages = await ChatMessage.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      conversation,
      messages,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Get Conversation Detail Error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Không thể tải cuộc trò chuyện.',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    await connectToDatabase();

    const conversation = await ChatConversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cuộc trò chuyện không tồn tại.',
          },
        },
        { status: 404 }
      );
    }

    if (session?.id && conversation.userId) {
      if (conversation.userId.toString() !== session.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Bạn không có quyền xóa cuộc trò chuyện này.',
            },
          },
          { status: 403 }
        );
      }
    }

    // Delete conversation and its messages
    await ChatMessage.deleteMany({ conversationId: id });
    await ChatConversation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa cuộc trò chuyện thành công.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Delete Conversation Error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Không thể xóa cuộc trò chuyện.',
        },
      },
      { status: 500 }
    );
  }
}
