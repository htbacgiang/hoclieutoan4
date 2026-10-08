import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import { generateGeminiResponse } from '@/lib/gemini';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const { prompt, conversationId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: 'Vui lòng nhập câu hỏi' }, { status: 400 });
    }

    let convId = conversationId;
    if (!convId) {
      const conv = await ChatConversation.create({
        userId: session?.id ? session.id : undefined,
        title: prompt.substring(0, 30) + '...',
      });
      convId = conv._id.toString();
    }

    // Save user message
    await ChatMessage.create({
      conversationId: convId,
      role: 'user',
      content: prompt,
    });

    // Call Gemini API
    const response = await generateGeminiResponse({
      messages: [{ role: 'user', content: prompt }],
    });

    // Save AI assistant response
    const assistantMsg = await ChatMessage.create({
      conversationId: convId,
      role: 'assistant',
      content: response.content,
      suggestedFollowUps: response.suggestedFollowUps || [],
    });


    return NextResponse.json({
      conversationId: convId,
      message: assistantMsg,
      suggestedFollowUps: response.suggestedFollowUps || [],
      relatedTopics: [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Chatbot error:', msg);
    return NextResponse.json({ message: 'Lỗi Robot Toán học', error: msg }, { status: 500 });
  }
}
