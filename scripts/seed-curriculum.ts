import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

async function main() {
  console.log('🌱 Đang kết nối tới Database và lưu Khung sườn bài giảng (6 Chủ đề, 32 Bài học)...');
  const { seedCurriculumSkeleton } = await import('../src/lib/curriculumSeed');
  try {
    const res = await seedCurriculumSkeleton(true);
    console.log('✅ Hoàn tất lưu Khung sườn bài giảng vào Database:');
    console.log(` - Số chủ đề (Category): ${res.categoriesCount}`);
    console.log(` - Số bài học (Lesson): ${res.lessonsCount}`);
    console.log(` - Số bài tập (Exercise): ${res.exercisesCount}`);
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo khung sườn:', err);
  } finally {
    process.exit(0);
  }
}

main();
