import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import { getSession } from '@/lib/auth';
import { generateGeminiResponse, ChatMode, LessonContext, getFirstName } from '@/lib/gemini';
import { getDocumentContentForLesson } from '@/lib/documentReader';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const body = await req.json();
    const { conversationId, message, context, mode = 'ask', image, isRegenerate } = body;

    // Server-side input validation (either message or image or isRegenerate must be provided)
    if ((!message || typeof message !== 'string' || !message.trim()) && !image && !isRegenerate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Vui lòng nhập câu hỏi hoặc đính kèm hình ảnh.',
          },
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message && typeof message === 'string' ? message.trim() : 'Đọc và phân tích bài toán trong hình ảnh';
    if (trimmedMessage.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MESSAGE_TOO_LONG',
            message: 'Câu hỏi quá dài (tối đa 4000 ký tự).',
          },
        },
        { status: 400 }
      );
    }

    let activeConversation = null;

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      try {
        activeConversation = await ChatConversation.findById(conversationId);
      } catch (e) {
        console.warn('⚠️ Invalid or missing conversation ID:', conversationId);
        activeConversation = null;
      }
    }

    if (activeConversation && session?.id && activeConversation.userId) {
      if (activeConversation.userId.toString() !== session.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Bạn không có quyền truy cập cuộc trò chuyện này.',
            },
          },
          { status: 403 }
        );
      }
    }

    // If conversation doesn't exist, create new one
    if (!activeConversation) {
      const generatedTitle = (image ? '📷 [Ảnh] ' : '') + trimmedMessage.slice(0, 45) + (trimmedMessage.length > 45 ? '...' : '');
      activeConversation = await ChatConversation.create({
        userId: session?.id ? session.id : undefined,
        title: generatedTitle,
        context: context as LessonContext,
      });
    }

    const convId = activeConversation._id;

    let userMessageDoc = null;

    if (isRegenerate) {
      // If regenerating, check if last user message exists or find it
      const lastUserMsg = await ChatMessage.findOne({ conversationId: convId, role: 'user' }).sort({ createdAt: -1 });
      userMessageDoc = lastUserMsg;

      // Delete previous assistant response for this conversation if present at the end
      const lastAssistantMsg = await ChatMessage.findOne({ conversationId: convId, role: 'assistant' }).sort({ createdAt: -1 });
      if (lastAssistantMsg && lastUserMsg && lastAssistantMsg.createdAt > lastUserMsg.createdAt) {
        await ChatMessage.findByIdAndDelete(lastAssistantMsg._id);
      }
    }

    // If not regenerating or no user message doc exists, create user message doc
    if (!userMessageDoc) {
      userMessageDoc = await ChatMessage.create({
        conversationId: convId,
        role: 'user',
        content: trimmedMessage,
        imageUrl: image || undefined,
        mode: mode as ChatMode,
      });
    }

    // Fetch previous messages for context window (last 15 messages)
    const historyDocs = await ChatMessage.find({ conversationId: convId })
      .sort({ createdAt: 1 })
      .limit(15);

    const historyMessages = historyDocs.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      imageUrl: m.imageUrl,
    }));

    // Auto load document text from /public/tai-lieu/ if matching lesson context exists
    const rawContext = (activeConversation.context || context) as LessonContext | undefined;
    let mergedContext: LessonContext | undefined = rawContext ? { ...rawContext } : undefined;

    if (mergedContext && (mergedContext.lesson || mergedContext.slug || mergedContext.topic)) {
      const docResult = getDocumentContentForLesson(
        mergedContext.lesson,
        mergedContext.slug,
        mergedContext.documentFileName,
        { truncateForAi: true }
      );
      if (docResult) {
        mergedContext.documentFileName = docResult.fileName;
        mergedContext.documentContent = docResult.content;
      }
    }

    // Call Google Gemini API server-side
    const aiResult = await generateGeminiResponse({
      messages: historyMessages,
      context: mergedContext,
      mode: mode as ChatMode,
      image: image || undefined,
      userName: session?.name ? getFirstName(session.name) : undefined,
    });

    // Save AI assistant response to DB
    const assistantMsgDoc = await ChatMessage.create({
      conversationId: convId,
      role: 'assistant',
      content: aiResult.content,
      mode: mode as ChatMode,
      suggestedFollowUps: aiResult.suggestedFollowUps,
    });

    // Update conversation updatedAt timestamp
    activeConversation.updatedAt = new Date();
    await activeConversation.save();

    return NextResponse.json({
      success: true,
      conversationId: convId.toString(),
      message: {
        id: assistantMsgDoc._id.toString(),
        role: 'assistant',
        content: assistantMsgDoc.content,
        mode: assistantMsgDoc.mode,
        suggestedFollowUps: assistantMsgDoc.suggestedFollowUps || [],
        createdAt: assistantMsgDoc.createdAt,
      },
      userMessage: {
        id: userMessageDoc._id.toString(),
        role: 'user',
        content: userMessageDoc.content,
        imageUrl: userMessageDoc.imageUrl,
        mode: userMessageDoc.mode,
        createdAt: userMessageDoc.createdAt,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Hoi Dap API Error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_ERROR',
          message: 'Trợ lý AI đang bận một chút. Em thử lại sau nhé.',
        },
      },
      { status: 500 }
    );
  }
}
