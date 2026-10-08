import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Lesson from '@/models/Lesson';
import Exercise from '@/models/Exercise';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export interface CurriculumTopic {
  categoryName: string;
  slug: string;
  order: number;
  icon: string;
  color: string;
  description: string;
  lessons: {
    title: string;
    slug: string;
    description?: string;
    objectives?: string[];
  }[];
}

export const CURRICULUM_STRUCTURE: CurriculumTopic[] = [
  {
    categoryName: 'Chủ đề 1. ÔN TẬP VÀ BỔ SUNG',
    slug: 'chu-de-1-on-tap-va-bo-sung',
    order: 1,
    icon: 'Calculator',
    color: '#2563EB',
    description: 'Các bài học ôn tập về số tự nhiên, phép tính, số chẵn lẻ, biểu thức chứa chữ và giải toán 3 bước.',
    lessons: [
      { title: 'Bài 1. Ôn tập các số đến 100 000', slug: 'bai-1-on-tap-cac-so-den-100-000' },
      { title: 'Bài 2. Ôn tập các phép tính trong phạm vi 100 000', slug: 'bai-2-on-tap-cac-phep-tinh-trong-pham-vi-100-000' },
      { title: 'Bài 3. Số chẵn, số lẻ', slug: 'bai-3-so-chan-so-le' },
      { title: 'Bài 4. Biểu thức chứa chữ', slug: 'bai-4-bieu-thuc-chua-chu' },
      { title: 'Bài 5. Giải bài toán có ba bước tính', slug: 'bai-5-giai-bai-toan-co-ba-buoc-tinh' },
      { title: 'Bài 6. Luyện tập chung', slug: 'bai-6-luyen-tap-chung-cd1' },
    ],
  },
  {
    categoryName: 'Chủ đề 2. GÓC VÀ ĐƠN VỊ ĐO GÓC',
    slug: 'chu-de-2-goc-va-don-vi-do-goc',
    order: 2,
    icon: 'Shapes',
    color: '#10B981',
    description: 'Tìm hiểu về khái niệm góc, các loại góc nhọn, tù, bẹt và cách đo góc bằng thước đo góc.',
    lessons: [
      { title: 'Bài 7. Đo góc, đơn vị đo góc', slug: 'bai-7-do-goc-don-vi-do-goc' },
      { title: 'Bài 8. Góc nhọn, góc tù, góc bẹt', slug: 'bai-8-goc-nhon-goc-tu-goc-bet' },
      { title: 'Bài 9. Luyện tập chung', slug: 'bai-9-luyen-tap-chung-cd2' },
    ],
  },
  {
    categoryName: 'Chủ đề 3. SỐ CÓ NHIỀU CHỮ SỐ',
    slug: 'chu-de-3-so-co-nhieu-chu-so',
    order: 3,
    icon: 'BookOpen',
    color: '#F59E0B',
    description: 'Nhận biết, đọc, viết, so sánh và làm tròn các số có nhiều chữ số tới hàng triệu.',
    lessons: [
      { title: 'Bài 10. Số có sáu chữ số. Số 1 000 000', slug: 'bai-10-so-co-sau-chu-so-so-1-000-000' },
      { title: 'Bài 11. Hàng và lớp', slug: 'bai-11-hang-va-lop' },
      { title: 'Bài 12. Các số trong phạm vi lớp triệu', slug: 'bai-12-cac-so-trong-pham-vi-lop-trieu' },
      { title: 'Bài 13. Làm tròn số đến hàng trăm nghìn', slug: 'bai-13-lam-tron-so-den-hang-tram-nghin' },
      { title: 'Bài 14. So sánh các số có nhiều chữ số', slug: 'bai-14-so-sanh-cac-so-co-nhieu-chu-so' },
      { title: 'Bài 15. Làm quen với dãy số tự nhiên', slug: 'bai-15-lam-quen-voi-day-so-tu-nhien' },
      { title: 'Bài 16. Luyện tập chung', slug: 'bai-16-luyen-tap-chung-cd3' },
    ],
  },
  {
    categoryName: 'Chủ đề 4. MỘT SỐ ĐƠN VỊ ĐO ĐẠI LƯỢNG',
    slug: 'chu-de-4-mot-so-don-vi-do-dai-luong',
    order: 4,
    icon: 'Ruler',
    color: '#8B5CF6',
    description: 'Đơn vị đo khối lượng (yến, tạ, tấn), diện tích (dm², m², mm²) và thời gian (giây, thế kỉ).',
    lessons: [
      { title: 'Bài 17. Yến, tạ, tấn', slug: 'bai-17-yen-ta-tan' },
      { title: 'Bài 18. Đề-xi-mét vuông, mét vuông, mi-li-mét vuông', slug: 'bai-18-de-xi-met-vuong-met-vuong-mi-li-met-vuong' },
      { title: 'Bài 19. Giây, thế kỉ', slug: 'bai-19-giay-the-ki' },
      { title: 'Bài 20. Thực hành và trải nghiệm sử dụng một số đơn vị đo đại lượng', slug: 'bai-20-thuc-hanh-va-trai-nghiem-su-dung-mot-so-don-vi-do-dai-luong' },
      { title: 'Bài 21. Luyện tập chung', slug: 'bai-21-luyen-tap-chung-cd4' },
    ],
  },
  {
    categoryName: 'Chủ đề 5. PHÉP CỘNG VÀ PHÉP TRỪ',
    slug: 'chu-de-5-phep-cong-va-phep-tru',
    order: 5,
    icon: 'PlusMinus',
    color: '#EC4899',
    description: 'Thực hành phép cộng, trừ số có nhiều chữ số, các tính chất giao hoán, kết hợp và bài toán tổng hiệu.',
    lessons: [
      { title: 'Bài 22. Phép cộng các số có nhiều chữ số', slug: 'bai-22-phep-cong-cac-so-co-nhieu-chu-so' },
      { title: 'Bài 23. Phép trừ các số có nhiều chữ số', slug: 'bai-23-phep-tru-cac-so-co-nhieu-chu-so' },
      { title: 'Bài 24. Tính chất giao hoán và kết hợp của phép cộng', slug: 'bai-24-tinh-chat-giao-hoan-va-ket-hop-cua-phep-cong' },
      { title: 'Bài 25. Tìm hai số biết tổng và hiệu của hai số đó', slug: 'bai-25-tim-hai-so-biet-tong-va-hieu-cua-hai-so-do' },
      { title: 'Bài 26. Luyện tập chung', slug: 'bai-26-luyen-tap-chung-cd5' },
    ],
  },
  {
    categoryName: 'Chủ đề 6. ĐƯỜNG THẲNG VUÔNG GÓC. ĐƯỜNG THẲNG SONG SONG',
    slug: 'chu-de-6-duong-thang-vuong-goc-duong-thang-song-song',
    order: 6,
    icon: 'Compass',
    color: '#06B6D4',
    description: 'Nhận biết đường thẳng vuông góc, song song, vẽ bằng êke và tìm hiểu hình bình hành, hình thoi.',
    lessons: [
      { title: 'Bài 27. Hai đường thẳng vuông góc', slug: 'bai-27-hai-duong-thang-vuong-goc' },
      { title: 'Bài 28. Thực hành và trải nghiệm về hai đường thẳng vuông góc', slug: 'bai-28-thuc-hanh-va-trai-nghiem-ve-hai-duong-thang-vuong-goc' },
      { title: 'Bài 29. Hai đường thẳng song song', slug: 'bai-29-hai-duong-thang-song-song' },
      { title: 'Bài 30. Thực hành và trải nghiệm về hai đường thẳng song song', slug: 'bai-30-thuc-hanh-va-trai-nghiem-ve-hai-duong-thang-song-song' },
      { title: 'Bài 31. Hình bình hành, hình thoi', slug: 'bai-31-hinh-binh-hanh-hinh-thoi' },
      { title: 'Bài 32. Luyện tập chung', slug: 'bai-32-luyen-tap-chung-cd6' },
    ],
  },
];

export async function seedCurriculumSkeleton(overwrite = false) {
  await connectToDatabase();

  // Seed default demo user accounts if database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const defaultPasswordHash = await hashPassword('123456');
    await User.create([
      {
        name: 'Quản trị viên Hệ thống',
        email: 'admin@hoclieu.vn',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Cô Nguyễn Thị Mai',
        email: 'giaovien@hoclieu.vn',
        passwordHash: defaultPasswordHash,
        role: 'TEACHER',
        status: 'ACTIVE',
        className: '4A',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Em Trần Minh Trí',
        email: 'hocsinh@hoclieu.vn',
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        className: '4A',
        points: 150,
        xp: 450,
        avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Phụ huynh Trần Văn Nam',
        email: 'phuhuynh@hoclieu.vn',
        passwordHash: defaultPasswordHash,
        role: 'PARENT',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    ]);
  }

  let categoriesCreated = 0;
  let lessonsCreated = 0;
  let exercisesCreated = 0;

  for (const topic of CURRICULUM_STRUCTURE) {
    let cat = await Category.findOne({ slug: topic.slug });

    if (!cat) {
      cat = await Category.create({
        name: topic.categoryName,
        slug: topic.slug,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: topic.order,
        status: 'ACTIVE',
      });
      categoriesCreated++;
    } else if (overwrite) {
      cat.name = topic.categoryName;
      cat.description = topic.description;
      cat.icon = topic.icon;
      cat.color = topic.color;
      cat.order = topic.order;
      await cat.save();
    }

    for (const lesItem of topic.lessons) {
      let lesson = await Lesson.findOne({ slug: lesItem.slug });

      const defaultContent = `### Nội dung ${lesItem.title}\n\nNội dung chi tiết của bài học đang được biên soạn chuẩn theo chương trình Toán lớp 4.\n- Mục tiêu bài học: Giúp học sinh nắm vững lý thuyết và áp dụng giải bài tập thành thạo.\n- Phương pháp: Trực quan, sinh động, dễ học.`;

      if (!lesson) {
        lesson = await Lesson.create({
          title: lesItem.title,
          slug: lesItem.slug,
          description: lesItem.description || `Bài học ${lesItem.title} - Thư viện học liệu số Toán 4.`,
          content: defaultContent,
          objectives: lesItem.objectives || ['Nắm vững kiến thức trọng tâm', 'Thực hành giải bài tập cơ bản'],
          categoryId: cat._id,
          difficulty: 'Trung bình',
          duration: 15,
          status: 'PUBLISHED',
        });
        lessonsCreated++;
      } else if (overwrite) {
        lesson.title = lesItem.title;
        lesson.categoryId = cat._id;
        if (!lesson.content || lesson.content.trim().length === 0) {
          lesson.content = defaultContent;
        }
        await lesson.save();
      }

      // Ensure 1 exercise per lesson if missing
      const existingEx = await Exercise.findOne({ lessonId: lesson._id });
      if (!existingEx) {
        await Exercise.create({
          title: `Bài tập ${lesItem.title}`,
          question: `Luyện tập tổng hợp cho ${lesItem.title}. Hãy chọn đáp án đúng nhất.`,
          type: 'MULTIPLE_CHOICE',
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correctAnswer: 0,
          explanation: `Hướng dẫn giải chi tiết cho ${lesItem.title}.`,
          difficulty: 'Cơ bản',
          lessonId: lesson._id,
          categoryId: cat._id,
          status: 'ACTIVE',
        });
        exercisesCreated++;
      }
    }
  }

  return {
    categoriesCount: await Category.countDocuments(),
    lessonsCount: await Lesson.countDocuments(),
    exercisesCount: await Exercise.countDocuments(),
    categoriesCreated,
    lessonsCreated,
    exercisesCreated,
  };
}
