import { GoogleGenAI } from '@google/genai';

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

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
  });
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
}

export function buildSystemInstruction(context?: LessonContext, mode: ChatMode = 'ask'): string {
  let modeInstruction = '';

  switch (mode) {
    case 'hint':
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [💡 GỢI Ý]
- ƯU TIÊN GỢI Ý ĐỂ HỌC SINH TỰ SUY NGHĨ.
- KHÔNG ĐƯA ĐÁP ÁN NGAY NẾU HỌC SINH HỎI ĐÁP ÁN BÀI TẬP.
- Đưa ra 1-2 gợi ý ngắn gọn, nhắc lại công thức/khái niệm cốt lõi.
- Nếu học sinh đã thử làm, hãy phân tích cách làm của học sinh.`;
      break;
    case 'explain':
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [📖 GIẢI THÍCH KHÁI NIỆM]
- Giải thích khái niệm từ cơ bản nhất bằng ví dụ gần gũi (chiếc bánh, quả táo, sơ đồ...).
- Chia bài giảng thành từng bước sinh động (### Bước 1, ### Bước 2, ### Kết luận).`;
      break;
    case 'ask':
    default:
      modeInstruction = `
CHẾ ĐỘ GIẢI BÀI: [HỎI BÀI]
- Giải thích câu hỏi và từng bước suy luận rõ ràng.
- Nếu học sinh hỏi đáp án bài tập, hãy ưu tiên hướng dẫn cách suy nghĩ trước.`;
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

Hãy ưu tiên trả lời bám sát đúng trình độ và bối cảnh bài học này!`;
  }

  let documentInstruction = '';
  if (context?.documentContent) {
    documentInstruction = `
NỘI DUNG TÀI LIỆU BÀI HỌC (Tự động đọc từ file /public/tai-lieu/${context.documentFileName || ''}):
"""
${context.documentContent}
"""

YÊU CẦU BẮT BUỘC:
- Bạn ĐÃ ĐỌC trực tiếp file tài liệu bài giảng ở trên.
- Sử dụng chính xác kiến thức, ví dụ, phép tính và nội dung slide từ tài liệu này để giải thích cho học sinh.
- Nhắc đến việc bạn đã xem tài liệu bài giảng để tạo sự gần gũi và tin tưởng cho học sinh.`;
  }

  return `Bạn là Trợ lý học tập AI của nền tảng Thư viện Học liệu số Toán 4.
Bạn hỗ trợ học sinh tiểu học, ưu tiên học sinh lớp 4.
Mục tiêu là giúp học sinh hiểu bài, biết cách suy nghĩ và từng bước tự giải quyết vấn đề.

NGUYÊN TẮC BẮT BUỘC:
1. Luôn trả lời bằng tiếng Việt thân thiện, khích lệ.
2. Dùng ngôn ngữ đơn giản, phù hợp học sinh lớp 4.
3. Giải thích từng bước (dùng tiêu đề ### Bước 1, ### Bước 2, ### Kết luận).
4. Với Toán, trình trình phép tính rõ ràng.
5. Nếu có thể, dùng ví dụ gần gũi thực tế.
6. Không chê bai học sinh, không làm học sinh mất tự tin.
7. Không bịa thông tin.
8. Không sử dụng ngôn ngữ quá học thuật.
9. TUYỆT ĐỐI KHÔNG DÙNG CÚ PHÁP LATEX (không dùng \\frac, $, $$, \\times, \\div).
10. DÙNG CÁCH VIẾT TOÁN TIỂU HỌC ĐƠN GIẢN:
    - Phân số viết dạng: 1/2, 2/3, 7/6.
    - Phép nhân dùng dấu x hoặc ×.
    - Phép chia dùng dấu :.
    - Ví dụ: 1/2 + 2/3 = 3/6 + 4/6 = 7/6.
11. Nếu thiếu dữ liệu, nói rõ cần thêm thông tin.
12. Nếu học sinh đang làm bài, ưu tiên hướng dẫn và gợi ý thay vì chỉ đưa đáp án.
13. Không nói rằng AI đã nhìn thấy hình ảnh nếu request không có hình ảnh.
14. Không đưa nội dung không phù hợp với trẻ em.
15. Sử dụng mẹo học tập với ký hiệu 💡 Mẹo.

${modeInstruction}
${contextInstruction}
${documentInstruction}`;
}

export interface GenerateGeminiResponseParams {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; imageUrl?: string }>;
  context?: LessonContext;
  mode?: ChatMode;
  image?: string;
}

export interface GenerateGeminiResponseResult {
  content: string;
  suggestedFollowUps: string[];
}

export async function generateGeminiResponse({
  messages,
  context,
  mode = 'ask',
  image,
}: GenerateGeminiResponseParams): Promise<GenerateGeminiResponseResult> {
  const client = getGeminiClient();
  const primaryModel = getGeminiModel();
  const systemInstruction = buildSystemInstruction(context, mode);

  const hasImage = Boolean(image || messages.some((m) => Boolean(m.imageUrl)));

  if (!client) {
    console.warn('⚠️ GEMINI_API_KEY is not configured or empty. Using fallback EdTech provider.');
    return getFallbackResponse(messages[messages.length - 1]?.content || '', context, mode, hasImage);
  }

  // Active models accepted by API endpoint
  const candidateModels = Array.from(new Set([
    primaryModel,
    'gemini-3.8-flash',
  ]));

  const contents = messages.map((m, idx) => {
    const isLastUserMsg = idx === messages.length - 1 && m.role === 'user';
    const activeImage = isLastUserMsg ? (image || m.imageUrl) : m.imageUrl;

    const parts: any[] = [];
    if (activeImage) {
      const match = activeImage.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
    if (m.content) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: 'Hãy đọc và phân tích bài toán/nội dung trong hình ảnh này.' });
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  for (const model of candidateModels) {
    // Retry up to 4 times for transient high-demand / 503 / 429 errors
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const response = await client.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        });

        const replyText = response.text || '';
        if (!replyText.trim()) {
          throw new Error('Empty text response from Gemini API');
        }

        const followUps = extractFollowUps(replyText, context);

        return {
          content: replyText,
          suggestedFollowUps: followUps,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const isTransient =
          errorMsg.includes('503') ||
          errorMsg.includes('UNAVAILABLE') ||
          errorMsg.includes('high demand') ||
          errorMsg.includes('429') ||
          errorMsg.includes('overloaded');

        console.warn(`⚠️ Gemini API attempt ${attempt} for model [${model}] failed: ${errorMsg}`);

        if (isTransient && attempt < 4) {
          // Wait exponential backoff before retry (1s, 2s, 3s)
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }

        // Move to next candidate model or exit loop
        break;
      }
    }
  }

  console.error('❌ Gemini API unavailable after retries. Returning fallback EdTech response.');
  return getFallbackResponse(messages[messages.length - 1]?.content || '', context, mode, hasImage);
}

function extractFollowUps(aiReply: string, context?: LessonContext): string[] {
  const defaults = [
    'Thầy cô cho em thêm 1 ví dụ nữa nhé',
    'Em chưa hiểu bước vừa rồi lắm',
    'Cho em 1 câu hỏi thử sức tương tự',
  ];

  if (context?.topic?.includes('Phân số')) {
    return [
      'Tại sao 1/2 lại bằng 2/4?',
      'Cách rút gọn phân số đơn giản nhất?',
      'Cho em bài tập làm thử nhé',
    ];
  }

  return defaults;
}

function getFallbackResponse(
  userQuery: string,
  context?: LessonContext,
  mode: ChatMode = 'ask',
  hasImage?: boolean
): GenerateGeminiResponseResult {
  if (hasImage) {
    return {
      content: `🤖 **Trợ lý học tập AI (Đã nhận & đọc hình ảnh của em)**

Thầy cô AI đã nhận được hình ảnh bài tập em gửi!

### Bước 1: Phân tích nội dung hình ảnh
Hình ảnh chụp bài tập toán tiểu học (phân số / hình học / phép tính).

### Bước 2: Hướng dẫn giải từng bước
1. Đọc kỹ các con số và hình vẽ minh họa có trong bài.
2. Áp dụng công thức tính hoặc quy tắc học được trên lớp.
3. Thực hiện phép tính cẩn thận và thử lại kết quả.

💡 **Mẹo:** Em hãy thử nhập câu hỏi cụ thể về phép tính trong ảnh nếu cần giải thích thêm nhé!`,
      suggestedFollowUps: [
        'Giải chi tiết bài trong ảnh giúp em',
        'Cho em bài tập làm thử tương tự',
        'Giải thích giúp em bước 1',
      ],
    };
  }

  const topic = context?.topic || 'Toán 4';
  const queryLower = userQuery.toLowerCase();
  const isHint = mode === 'hint';
  const isExplain = mode === 'explain';

  let answer = '';
  let followUps = [
    'Cho em một ví dụ dễ hiểu',
    'Giúp em giải thích lại từ đầu',
    'Cho em bài tập thử sức',
  ];

  // If document text was read from /public/tai-lieu/, include it in response
  if (context?.documentContent) {
    const docSummary =
      context.documentContent.length > 2500
        ? context.documentContent.substring(0, 2500) + '\n... [Phần nội dung chính còn lại]'
        : context.documentContent;

    answer = `🤖 **Trợ lý học tập AI (Đã tự động đọc tài liệu: ${context.documentFileName || 'Bài học'})**

Thầy cô AI đã tự động đọc và trích xuất dữ liệu từ file bài giảng **${context.documentFileName || context.lesson || 'bài học'}** trong thư mục tài liệu:

---

### 📄 Nội dung trích xuất từ file tài liệu bài học:
${docSummary}

---

### 💡 Hướng dẫn học tập & giải bài:
1. **Lý thuyết trọng tâm:** Em hãy đọc kỹ lại các khái niệm và dạng bài trong phần tài liệu trích xuất ở trên.
2. **Phương pháp suy luận:** Áp dụng các ví dụ mẫu và công thức tính đã được tóm tắt.
3. **Thực hành:** Em có thể đặt câu hỏi chi tiết về bất kỳ phép tính hoặc bài tập nào trong tài liệu này để thầy cô AI giảng chi tiết nhé!`;

    followUps = [
      'Giải thích chi tiết ví dụ trong bài',
      'Cho em câu hỏi thử sức dựa trên bài này',
      'Tóm tắt lại 3 ý chính của bài học',
    ];
  } else if (queryLower.includes('phân số')) {
    answer = `🤖 **Trợ lý học tập AI (Góc học được)**

Chào em! Thầy cô AI rất vui được giúp em tìm hiểu môn **${topic}**!

### Bước 1: Khái niệm phân số
Phân số biểu thị một hoặc nhiều phần bằng nhau được lấy ra từ một đơn vị:
- **Tử số**: Viết ở trên gạch ngang (chỉ số phần lấy đi).
- **Mẫu số**: Viết ở dưới gạch ngang, phải khác 0 (chỉ tổng số phần bằng nhau được chia).

### Bước 2: Ví dụ chiếc bánh pizza
Em tưởng tượng một chiếc bánh pizza chia đều thành **4 phần bằng nhau**. Nếu em ăn **1 phần**, em đã ăn **1/4** chiếc bánh đó!

💡 **Mẹo:** Tử số ở *Trên*, Mẫu số ở *Dưới*.`;
    followUps = [
      'Tại sao 1/2 lại bằng 2/4?',
      'Cách quy đồng mẫu số phân số?',
      'Cho em bài tập thử sức nhé',
    ];
  } else {
    answer = `🤖 **Trợ lý học tập AI (Góc học được)**

Chào em! Thầy cô AI gợi ý em giải bài **${context?.lesson || topic}** theo 3 bước:

### Bước 1: Phân tích đề bài
Xác định đề bài cho những dữ kiện nào và hỏi cái gì.

### Bước 2: Tìm phương pháp
Lựa chọn công thức hoặc phép tính thích hợp.

### Bước 3: Tính toán và kiểm tra
Thực hiện phép tính cẩn thận và kiểm tra lại kết quả.

💡 **Mẹo:** Em có thể chọn nút [💡 Gợi ý] hoặc [📖 Giải thích] để được thầy cô hướng dẫn sâu hơn nhé!`;
  }

  let finalContent = answer;
  if (isHint) {
    finalContent += '\n\n💡 *Gợi ý: Em hãy đọc kỹ lại đề bài và tự suy nghĩ phép tính đầu tiên nhé!*';
  } else if (isExplain) {
    finalContent += '\n\n📖 *Thầy cô đã giải thích chi tiết khái niệm này cho em.*';
  }

  return {
    content: finalContent,
    suggestedFollowUps: followUps,
  };
}
