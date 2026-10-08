export interface AIQuestionResponse {
  answer: string;
  suggestedFollowUps?: string[];
  relatedTopics?: string[];
}

export interface AIHintResponse {
  hint: string;
  step: number;
}

export interface AIExplanationResponse {
  concept: string;
  explanation: string;
  examples: string[];
}

export interface AIPracticeQuestionResponse {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AIProvider {
  answerQuestion(prompt: string, context?: string): Promise<AIQuestionResponse>;
  generateHint(question: string, studentAttempt?: string): Promise<AIHintResponse>;
  explainConcept(conceptName: string): Promise<AIExplanationResponse>;
  generatePracticeQuestion(topic: string, difficulty?: string): Promise<AIPracticeQuestionResponse>;
}

export class MockAIProvider implements AIProvider {
  async answerQuestion(prompt: string): Promise<AIQuestionResponse> {
    const p = prompt.toLowerCase();
    
    if (p.includes('phân số')) {
      return {
        answer: 'Chào em! **Phân số** là sự biểu thị một phần của một đơn vị. Phân số gồm hai phần: **Tử số** (viết trên gạch ngang, chỉ số phần lấy đi) và **Mẫu số** (viết dưới gạch ngang, chỉ số phần bằng nhau được chia ra). Ví dụ: Trong phân số \\(\\frac{3}{4}\\), số 3 là tử số, số 4 là mẫu số!',
        suggestedFollowUps: ['Làm sao để so sánh 2 phân số?', 'Phân số bằng nhau là gì?', 'Cho em bài tập ví dụ về phân số'],
        relatedTopics: ['Số và phép tính', 'Phân số', 'Quy đồng mẫu số'],
      };
    }

    if (p.includes('trung bình cộng')) {
      return {
        answer: 'Để tìm **Số trung bình cộng** của nhiều số, em làm theo 2 bước đơn giản:\n1. Tính tổng của tất cả các số đó.\n2. Chia tổng đó cho số các số hạng.\n\n*Ví dụ:* Tìm trung bình cộng của 10, 20 và 30.\n- Tổng = 10 + 20 + 30 = 60.\n- Có 3 số hạng, nên TBC = 60 : 3 = 20!',
        suggestedFollowUps: ['Bài toán có lời văn về trung bình cộng', 'Luyện tập tính trung bình cộng'],
        relatedTopics: ['Số và phép tính', 'Số tự nhiên'],
      };
    }

    if (p.includes('hình chữ nhật') || p.includes('chu vi') || p.includes('diện tích')) {
      return {
        answer: 'Chào em! Trong chương trình Toán 4:\n- **Chu vi hình chữ nhật** = (Chiều dài + Chiều rộng) × 2 (cùng đơn vị đo).\n- **Diện tích hình chữ nhật** = Chiều dài × Chiều rộng (cùng đơn vị đo).\n\nEm cần thầy Robot hướng dẫn thêm bài tập cụ thể nào không?',
        suggestedFollowUps: ['Chu vi hình vuông là gì?', 'Diện tích hình vuông tính thế nào?'],
        relatedTopics: ['Hình học và đo lường', 'Diện tích'],
      };
    }

    if (p.includes('biểu đồ') || p.includes('thống kê')) {
      return {
        answer: 'Chào em! **Biểu đồ cột** giúp em so sánh số lượng của các đối tượng một cách trực quan qua chiều cao của các cột. Cột nào cao hơn thể hiện số lượng nhiều hơn!',
        suggestedFollowUps: ['Xem ví dụ biểu đồ cột', 'Làm bài tập biểu đồ cột'],
        relatedTopics: ['Một số yếu tố thống kê và xác suất'],
      };
    }

    return {
      answer: `Thầy Robot Toán học xin chào! Với câu hỏi "${prompt}", thầy gợi ý em hãy ôn lại lý thuyết trong bài học tương ứng hoặc phân tích bài toán thành từng bước nhỏ: 1) Tìm xem đề bài cho gì, 2) Đề bài hỏi gì, 3) Lựa chọn phép tính thích hợp nhé!`,
      suggestedFollowUps: ['Cho em xem ví dụ', 'Giải thích kĩ hơn cho em', 'Gợi ý bài tập tương tự'],
      relatedTopics: ['Số và phép tính', 'Hình học', 'Thống kê'],
    };
  }

  async generateHint(question: string): Promise<AIHintResponse> {
    return {
      hint: `Gợi ý cho bài toán "${question}": Em hãy đọc kỹ đề bài và xem xét mối quan hệ giữa các dữ kiện. Hãy thử rút về đơn vị hoặc quy đồng mẫu số nhé!`,
      step: 1,
    };
  }

  async explainConcept(conceptName: string): Promise<AIExplanationResponse> {
    return {
      concept: conceptName,
      explanation: `${conceptName} là một kiến thức trọng tâm của Toán 4. Để hiểu rõ khái niệm này, em nên xem lại hình ảnh minh họa và ví dụ trực quan trong Góc Khám Phá!`,
      examples: [
        `Ví dụ 1 cho ${conceptName}: Minh có 4 quả táo, chia làm 2 phần bằng nhau...`,
        `Ví dụ 2 cho ${conceptName}: Thùng A có 15l dầu, thùng B có 25l dầu...`,
      ],
    };
  }

  async generatePracticeQuestion(topic: string, difficulty = 'Cơ bản'): Promise<AIPracticeQuestionResponse> {
    return {
      question: `[${difficulty}] Rút gọn phân số 12/16 ta được phân số tối giản là:`,
      options: ['3/4', '2/3', '6/8', '1/4'],
      correctAnswer: 0,
      explanation: 'Ta chia cả tử số và mẫu số cho 4: 12 : 4 = 3 và 16 : 4 = 4. Vậy 12/16 = 3/4.',
    };
  }
}

export function getAIProvider(): AIProvider {
  // If provider is set to openai or gemini and key exists, we can plug in real API providers.
  // Default is MockAIProvider which functions immediately without external dependencies.
  return new MockAIProvider();
}
