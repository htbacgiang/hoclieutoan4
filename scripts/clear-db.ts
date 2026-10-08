import mongoose from 'mongoose';
import dns from 'dns';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

import User from '../src/models/User';
import Category from '../src/models/Category';
import Lesson from '../src/models/Lesson';
import Resource from '../src/models/Resource';
import Exercise from '../src/models/Exercise';
import Quiz from '../src/models/Quiz';
import Achievement from '../src/models/Achievement';
import Progress from '../src/models/Progress';

async function clear() {
  console.log('🗑️ Đang xóa toàn bộ dữ liệu trong MongoDB...');

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/toan4_db';

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Đã kết nối MongoDB tại:', MONGODB_URI);

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Lesson.deleteMany({}),
      Resource.deleteMany({}),
      Exercise.deleteMany({}),
      Quiz.deleteMany({}),
      Achievement.deleteMany({}),
      Progress.deleteMany({}),
    ]);

    console.log('🎉 Xóa toàn bộ dữ liệu thành công!');
  } catch (err) {
    console.error('❌ Thất bại khi kết nối/xóa dữ liệu MongoDB:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clear();
