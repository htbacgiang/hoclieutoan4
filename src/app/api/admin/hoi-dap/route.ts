import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';

function formatRelativeTime(dateInput: Date | string | undefined): string {
  if (!dateInput) return 'Vừa xong';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInMs = Math.max(0, now.getTime() - date.getTime());
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  if (diffInMins < 1) return 'Vừa xong';
  if (diffInMins < 60) return `${diffInMins} phút trước`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // Ensure models are registered
    if (!User) console.log('User model loaded');

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || 'all';
    const conversationIdParam = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    // If specific conversationId requested (full detail mode)
    if (conversationIdParam) {
      const conversation = await ChatConversation.findById(conversationIdParam)
        .populate('userId', 'name email avatar role className')
        .lean();

      if (!conversation) {
        return NextResponse.json({ success: false, message: 'Không tìm thấy cuộc trò chuyện' }, { status: 404 });
      }

      const messages = await ChatMessage.find({ conversationId: conversationIdParam })
        .sort({ createdAt: 1 })
        .lean();

      return NextResponse.json({
        success: true,
        conversation,
        messages,
      });
    }

    // 1. Calculate Aggregate Statistics
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalConversations = await ChatConversation.countDocuments();
    const totalQuestions = await ChatMessage.countDocuments({ role: 'user' });
    const todayQuestionsCount = await ChatMessage.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfDay },
    });

    const uniqueUsersArray = await ChatConversation.distinct('userId', { userId: { $ne: null } });
    const uniqueUsersCount = uniqueUsersArray.length;

    // 2. Build Query Filters for User Messages
    const userQuery: any = { role: 'user' };

    if (mode && mode !== 'all') {
      userQuery.mode = mode;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      // Find matching user IDs
      const matchingUsers = await User.find({ name: searchRegex }).select('_id').lean();
      const userIds = matchingUsers.map((u) => u._id);

      // Find matching conversation IDs by title, context, or user
      const matchingConversations = await ChatConversation.find({
        $or: [
          { title: searchRegex },
          { 'context.topic': searchRegex },
          { 'context.lesson': searchRegex },
          { userId: { $in: userIds } },
        ],
      }).select('_id').lean();
      const convIds = matchingConversations.map((c) => c._id);

      userQuery.$or = [
        { content: searchRegex },
        { conversationId: { $in: convIds } },
      ];
    }

    // 3. Count total matching items & Fetch User Messages
    const totalItems = await ChatMessage.countDocuments(userQuery);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const userMessages = await ChatMessage.find(userQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 4. Enrich User Messages with Conversation, User info, and Assistant Answer
    const logs = await Promise.all(
      userMessages.map(async (uMsg: any) => {
        const conversation = await ChatConversation.findById(uMsg.conversationId)
          .populate('userId', 'name email avatar className role')
          .lean();

        // Find assistant message corresponding to this question or conversation
        const assistantMsg = await ChatMessage.findOne({
          conversationId: uMsg.conversationId,
          role: 'assistant',
          createdAt: { $gte: uMsg.createdAt },
        })
          .sort({ createdAt: 1 })
          .lean();

        const userData = conversation?.userId as any;

        return {
          id: uMsg._id.toString(),
          conversationId: uMsg.conversationId.toString(),
          user: {
            id: userData?._id ? userData._id.toString() : null,
            name: userData?.name || 'Khách truy cập',
            email: userData?.email || '',
            className: userData?.className ? `Lớp ${userData.className}` : 'Học viên Vô danh',
            avatar: userData?.avatar || '',
            role: userData?.role || 'GUEST',
          },
          question: uMsg.content,
          imageUrl: uMsg.imageUrl || null,
          mode: uMsg.mode || 'ask',
          answer: assistantMsg ? assistantMsg.content : 'Trợ lý AI đang phản hồi...',
          suggestedFollowUps: assistantMsg?.suggestedFollowUps || [],
          context: conversation?.context || null,
          conversationTitle: conversation?.title || 'Cuộc trò chuyện AI',
          createdAt: uMsg.createdAt,
          timeAgo: formatRelativeTime(uMsg.createdAt),
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalConversations,
        totalQuestions,
        todayQuestionsCount,
        uniqueUsersCount,
      },
      logs,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching admin hoi-dap logs:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy dữ liệu hỏi đáp admin', error: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      await ChatMessage.deleteMany({ conversationId });
      await ChatConversation.findByIdAndDelete(conversationId);
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ cuộc trò chuyện' });
    }

    if (id) {
      const msg = await ChatMessage.findById(id);
      if (msg) {
        await ChatMessage.findByIdAndDelete(id);
        // Also check if conversation has no remaining messages
        const remainingCount = await ChatMessage.countDocuments({ conversationId: msg.conversationId });
        if (remainingCount === 0) {
          await ChatConversation.findByIdAndDelete(msg.conversationId);
        }
      }
      return NextResponse.json({ success: true, message: 'Đã xóa nhật ký câu hỏi' });
    }

    return NextResponse.json({ success: false, message: 'Thiếu tham số id hoặc conversationId' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error deleting admin hoi-dap log:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi xóa nhật ký', error: msg }, { status: 500 });
  }
}
