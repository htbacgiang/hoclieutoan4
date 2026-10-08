import OpenAI from 'openai';

export interface LessonContext {
  grade?: number;
  subject?: string;
  topic?: string;
  lesson?: string;
  slug?: string;
  level?: string;
  documentFileName?: string;
  documentContent?: string;
}

export type ChatMode = 'ask' | 'hint' | 'explain';

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new OpenAI({
    apiKey: apiKey.trim(),
  });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-5.6-luna';
}

export function buildSystemPrompt(context?: LessonContext, mode: ChatMode = 'ask'): string {
  let modeInstruction = '';
  
  switch (mode) {
    case 'hint':
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [💡 GỢI Ý]
- TUYỆT ĐỐI KHÔNG ĐƯA NGAY ĐÁP ÁN NẾU HỌC SINH HỎI ĐÁP ÁN BÀI TẬP.
- Hãy đưa ra 1-2 gợi ý ngắn gọn, nhắc lại công thức/khái niệm cốt lõi.
- Đặt câu hỏi mở để học sinh tự suy nghĩ và tự tìm ra kết quả.
- Nếu học sinh đã đưa ra kết quả và hỏi đúng/sai, hãy xác nhận và khen ngợi hoặc chỉ ra chỗ chưa đúng.`;
      break;
    case 'explain':
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [📖 GIẢI THÍCH KHÁI NIỆM]
- Giải thích khái niệm từ gốc rễ bằng hình ảnh minh họa sinh động (chiếc bánh, cái kẹo, quả táo, sơ đồ...).
- Chia thành các bước đơn giản (Bước 1, Bước 2, Kết luận).
- Dùng giọng điệu ấm áp, kiên nhẫn.`;
      break;
    case 'ask':
    default:
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [HỎI BÀI]
- Giải thích chi tiết, rõ ràng từng bước.
- Nếu học sinh hỏi đáp án bài tập, hãy ưu tiên hướng dẫn suy luận trước, sau đó mới nêu kết quả để kiểm tra.`;
      break;
  }

  let contextInstruction = '';
  if (context && (context.topic || context.lesson || context.subject)) {
    contextInstruction = `
BỐI CẢNH BÀI HỌC HỌC SINH ĐANG HỌC:
- Môn học: ${context.subject || 'Toán'}
- Lớp: ${context.grade || 4}
- Chủ đề: ${context.topic || 'Chưa xác định'}
- Bài học: ${context.lesson || 'Chưa xác định'}
- Cấp độ: ${context.level || 'Cơ bản'}

Hãy ưu tiên trả lời bám sát chương trình và trình độ của bài học này!`;
  }

  return `Bạn là Trợ lý học tập AI của nền tảng Góc Học Tập Số (Toán 4).
Bạn hỗ trợ học sinh tiểu học (đặc biệt là học sinh lớp 4) học tập một cách vui vẻ, hiệu quả và tự tin.

NGUYÊN TẮC QUAN TRỌNG:
1. Giải thích hoàn toàn bằng tiếng Việt thân thiện, trong sáng, khích lệ.
2. Ngôn ngữ phù hợp với học sinh lớp 4 (dễ hiểu, không dùng thuật ngữ chuyên ngành trừ khi giải thích rõ).
3. Chia bài toán hoặc khái niệm thành từng bước mạch lạc (dùng các tiêu đề ### Bước 1, ### Bước 2, ### Kết luận).
4. Sử dụng mẹo học tập với ký hiệu 💡 Mẹo (nhưng không lạm dụng quá nhiều emoji).
5. Trình bày phân số và phép tính rõ ràng (dùng dạng a/b hoặc gạch ngang đẹp).
6. Giữ giọng điệu kiên nhẫn, luôn khen ngợi khi học sinh cố gắng.
7. Không đưa nội dung nguy hiểm, sai lệch hoặc không phù hợp với trẻ em.
8. Không bịa đặt thông tin.

${modeInstruction}
${contextInstruction}`;
}

export interface GenerateAIResponseParams {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context?: LessonContext;
  mode?: ChatMode;
}

export interface GenerateAIResponseResult {
  content: string;
  suggestedFollowUps: string[];
}

export async function generateAIResponse({
  messages,
  context,
  mode = 'ask',
}: GenerateAIResponseParams): Promise<GenerateAIResponseResult> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();

  const systemPrompt = buildSystemPrompt(context, mode);

  if (!client) {
    console.warn('⚠️ OPENAI_API_KEY is not set or empty. Falling back to structured response.');
    return getFallbackResponse(messages[messages.length - 1]?.content || '', context, mode);
  }

  try {
    const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Attempt OpenAI Chat Completion API call
    const completion = await client.chat.completions.create({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1200,
    });

    const reply = completion.choices[0]?.message?.content || '';
    if (!reply.trim()) {
      throw new Error('Empty response from OpenAI');
    }

    const followUps = extractFollowUps(reply, context);

    return {
      content: reply,
      suggestedFollowUps: followUps,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ OpenAI API call failed:', errorMsg);
    
    // Return graceful fallback message so user experience is not broken
    return getFallbackResponse(messages[messages.length - 1]?.content || '', context, mode);
  }
}

function extractFollowUps(aiReply: string, context?: LessonContext): string[] {
  const defaults = [
    'Thầy cô có thể cho em ví dụ khác không?',
    'Em chưa hiểu rõ bước này lắm',
    'Cho em một câu hỏi tương tự để em tự thử sức',
  ];

  if (context?.topic?.includes('Phân số')) {
    return [
      'Tại sao 1/2 lại bằng 2/4?',
      'Cách quy đồng mẫu số hai phân số?',
      'Cho em bài tập rút gọn phân số',
    ];
  }

  return defaults;
}

function getFallbackResponse(
  userQuery: string,
  context?: LessonContext,
  mode: ChatMode = 'ask'
): GenerateAIResponseResult {
  const topic = context?.topic || 'Toán học 4';
  const queryLower = userQuery.toLowerCase();
  const isHint = mode === 'hint';
  const isExplain = mode === 'explain';

  let answer = '';

  let followUps = [
    'Cho em một ví dụ dễ hiểu',
    'Giúp em giải thích lại từ đầu',
    'Cho em bài tập thử sức',
  ];

  if (queryLower.includes('phân số')) {
    answer = `🤖 **Trợ lý học tập AI**

Chào em! Rất vui được đồng hành cùng em trong môn **${topic}**!

### Bước 1: Khái niệm phân số
Phân số là sự biểu thị một hoặc nhiều phần bằng nhau của một đơn vị. Phân số gồm:
- **Tử số**: Số viết ở trên gạch ngang (chỉ số phần lấy đi).
- **Mẫu số**: Số viết ở dưới gạch ngang, phải khác 0 (chỉ tổng số phần bằng nhau được chia ra).

### Bước 2: Ví dụ trực quan
Tưởng tượng em có một chiếc bánh pizza chia đều thành **4 phần bằng nhau**. Nếu em ăn **1 phần**, em đã ăn **1/4** chiếc bánh đó!

💡 **Mẹo nhớ:** Tử số ở *Trên*, Mẫu số ở *Dưới* (Mẫu là mẹ nâng đỡ Tử ở trên).`;
    followUps = [
      'Tại sao 1/2 lại bằng 2/4?',
      'Cách cộng hai phân số cùng mẫu số?',
      'Cho em bài tập thử sức nhé',
    ];
  } else if (queryLower.includes('trung bình cộng')) {
    answer = `🤖 **Trợ lý học tập AI**

Để tìm **Số trung bình cộng** của nhiều số, em làm theo 2 bước đơn giản:

### Bước 1: Tính tổng
Cộng tất cả các số lại với nhau.

### Bước 2: Chia cho số các số hạng
Lấy tổng tìm được chia cho số các số hạng đó.

### Ví dụ
Tìm trung bình cộng của 10, 20 và 30:
1. Tổng = 10 + 20 + 30 = 60.
2. Vì có 3 số hạng nên TBC = 60 : 3 = 20.

💡 **Mẹo:** Số trung bình cộng luôn nằm giữa số lớn nhất và số nhỏ nhất!`;
  } else {
    answer = `🤖 **Trợ lý học tập AI**

Cảm ơn em đã gửi câu hỏi về bài **${context?.lesson || topic}**!

Thầy cô AI gợi ý em đọc kỹ câu hỏi và thực hiện theo 3 bước:
1. **Xác định đề bài cho gì** (các số liệu, dữ kiện đã có).
2. **Xác định đề bài hỏi gì** (cần tìm cái gì).
3. **Lựa chọn phép tính phù hợp** và kiểm tra lại kết quả.

Em có thể bấm vào các lựa chọn bên dưới hoặc gửi thêm chi tiết đề bài để thầy cô hướng dẫn từng bước nhé!`;
  }

  let finalContent = answer;
  if (isHint) {
    finalContent += '\n\n💡 *Gợi ý dành cho em: Em hãy tự suy nghĩ bước tiếp theo trước khi xem đáp án nhé!*';
  } else if (isExplain) {
    finalContent += '\n\n📖 *Thầy cô đã giải thích chi tiết khái niệm này cho em.*';
  }

  return {
    content: finalContent,
    suggestedFollowUps: followUps,
  };
}
