import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Resource from '@/models/Resource';
import {
  Search,
  ArrowRight,
  Download,
  Play,
  Check,
  ChevronRight,
  FileText,
  Gamepad2,
  Brain,
  Award,
  MessageSquare,
  Compass,
  Calculator,
  PencilRuler,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';

import FeaturedLessonsSection, { HomeLessonItem } from '@/components/home/FeaturedLessonsSection';

export const revalidate = 60; // Revalidate home data every 60 seconds

interface HomeResourceItem {
  id: string;
  title: string;
  type: string;
  date: string;
  url: string;
}

async function getHomeData() {
  try {
    await connectToDatabase();
    const dbLessons = await Lesson.find({ status: 'PUBLISHED' })
      .populate('categoryId', 'name')
      .lean();

    // Sort by numerical lesson number (Bài 1 -> Bài 32)
    const parseNum = (str: string) => {
      const match = str.match(/Bài\s*(\d+)/i) || str.match(/bai-(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    };

    dbLessons.sort((a, b) => parseNum(a.title || a.slug) - parseNum(b.title || b.slug));

    const dbResources = await Resource.find({ status: 'ACTIVE' }).limit(4).sort({ createdAt: -1 });

    const lessons: HomeLessonItem[] = dbLessons.map((l) => ({
      id: l._id.toString(),
      slug: l.slug,
      title: l.title,
      duration: l.duration ? `${l.duration}:00` : '15:00',
      thumbnail: l.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      categoryName: (l.categoryId as { name?: string })?.name || 'Khám phá',
      tags: [
        { label: 'Video bài giảng', color: 'bg-blue-100 text-blue-600' },
        { label: 'Khám phá', color: 'bg-amber-100 text-amber-700' },
      ],
    }));

    const resources: HomeResourceItem[] = dbResources.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      type: r.type || 'Tài liệu',
      date: new Date(r.createdAt || Date.now()).toLocaleDateString('vi-VN'),
      url: r.url || '#',
    }));

    return { lessons, resources };
  } catch (error) {
    console.error('Home data fetch error:', error);
    return { lessons: [], resources: [] };
  }
}

export default async function HomePage() {
  const { lessons, resources } = await getHomeData();

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

      {/* 1. HERO BANNER SECTION (COMPACT & BALANCED PANORAMA) */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-blue-200 bg-[#70C5FF]">
        {/* Background Landscape with balanced height */}
        <div className="relative w-full h-[260px] sm:h-[300px] lg:h-[340px] overflow-hidden flex flex-col items-center justify-between">
          <img
            src="/images/hero-bg.jpg"
            alt="Nền Thư viện học liệu số Toán 4"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Center Title and Subtitle (Shifted downwards) */}
          <div className="relative z-10 text-center pt-5 sm:pt-7 lg:pt-9 px-2 max-w-xl mx-auto select-none">
            <div className="w-full max-w-[500px] sm:max-w-[580px] mx-auto">
              {/* Curved Arc for Line 1: Thư viện học liệu số */}
              <svg viewBox="0 0 600 100" className="w-full h-auto overflow-visible block -mb-2 sm:-mb-3">
                <defs>
                  <path id="hero-title-curve" d="M 25,82 Q 300,24 575,82" />
                </defs>
                <text fill="#062056" className="font-hero-title font-black" fontSize="48" letterSpacing="-0.5">
                  <textPath href="#hero-title-curve" startOffset="50%" textAnchor="middle">
                    Thư viện học liệu số
                  </textPath>
                </text>
              </svg>

              {/* Line 2: môn Toán 4 */}
              <div className="font-hero-title text-3xl sm:text-5xl lg:text-6xl font-black text-[#062056] leading-none">
                <span>môn </span>
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent drop-shadow-md px-1">
                  Toán 4
                </span>
              </div>

              {/* Subtitle */}
              <p className="mt-1.5 text-xs sm:text-sm lg:text-base font-extrabold text-[#082668] tracking-tight">
                Học thông minh hơn – Khám phá Toán học dễ dàng hơn cùng AI
              </p>
            </div>
          </div>

          {/* SEPARATED ANIMATED ELEMENTS */}

          {/* 1. Boy character (Shifted towards center, right next to search bar) */}
          <div className="absolute bottom-0 left-[10%] sm:left-[14%] lg:left-[18%] w-[110px] sm:w-[150px] lg:w-[190px] z-20 pointer-events-none animate-character-bob">
            <img
              src="/images/hero-parts/boy.png"
              alt="Học sinh nam Toán 4"
              className="w-full h-auto drop-shadow-xl"
            />
          </div>

          {/* 2. Yellow glowing lightbulb (Shifted towards center above the boy) */}
          <div className="absolute top-[6%] left-[20%] sm:left-[24%] lg:left-[28%] w-[34px] sm:w-[46px] lg:w-[54px] z-20 pointer-events-none animate-bulb-glow">
            <img
              src="/images/hero-parts/lightbulb.png"
              alt="Ý tưởng sáng tạo"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          {/* 3. Formula card 1/2 + 1/2 = ? (Shifted towards center beside search bar) */}
          <div className="absolute top-[30%] left-[22%] sm:left-[26%] lg:left-[28%] w-[45px] sm:w-[60px] lg:w-[72px] z-20 pointer-events-none animate-float-slow">
            <img
              src="/images/hero-parts/formula.png"
              alt="Phân số Toán 4"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          {/* 4. Geometric blue triangle ruler (Floating top right) */}
          <div className="absolute top-[6%] right-[22%] sm:right-[24%] lg:right-[25%] w-[38px] sm:w-[50px] lg:w-[60px] z-20 pointer-events-none animate-float-reverse">
            <img
              src="/images/hero-parts/triangle.png"
              alt="Hình học Toán 4"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          {/* 5. Mini 3D Bar chart (Floating near top right) */}
          <div className="absolute top-[10%] right-[15%] sm:right-[17%] lg:right-[18%] w-[32px] sm:w-[42px] lg:w-[50px] z-20 pointer-events-none animate-float">
            <img
              src="/images/hero-parts/barchart.png"
              alt="Thống kê biểu đồ"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          {/* 6. AI Robot (Floating right-center) */}
          <div className="absolute bottom-[16%] right-[18%] sm:right-[20%] lg:right-[21%] w-[85px] sm:w-[115px] lg:w-[140px] z-20 pointer-events-none animate-robot-hover">
            <img
              src="/images/hero-parts/robot.png"
              alt="Robot AI Trợ giảng"
              className="w-full h-auto drop-shadow-xl"
            />
          </div>

          {/* 7. Girl character (Right bottom) */}
          <div className="absolute bottom-0 right-[7%] sm:right-[8%] lg:right-[9%] w-[105px] sm:w-[140px] lg:w-[175px] z-20 pointer-events-none animate-character-bob">
            <img
              src="/images/hero-parts/girl.png"
              alt="Học sinh nữ Toán 4"
              className="w-full h-auto drop-shadow-xl"
            />
          </div>

          {/* 8. Note paper sticker (Far right) */}
          <div className="absolute top-[8%] right-[1%] sm:right-[1.5%] w-[75px] sm:w-[95px] lg:w-[115px] z-20 pointer-events-none animate-gentle-sway">
            <img
              src="/images/hero-parts/note.png"
              alt="Khám phá Luyện tập Hỏi đáp Chinh phục cùng AI!"
              className="w-full h-auto drop-shadow-md"
            />
          </div>

          {/* Clean Interactive Search Bar centered on bottom grass (Shifted higher up) */}
          <div className="relative z-30 w-full max-w-xl px-4 pb-10 sm:pb-14 lg:pb-16 -mt-8 sm:-mt-14 lg:-mt-18">
            <form
              action="/tim-kiem"
              method="GET"
              className="flex items-center bg-white/95 backdrop-blur-md rounded-full border-2 border-blue-400 shadow-xl p-1 sm:p-1.5 hover:border-blue-600 transition-all focus-within:ring-4 focus-within:ring-blue-400/30"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 ml-2.5 sm:ml-3.5 shrink-0" />
              <div className="flex-1 flex flex-col justify-center px-2.5 min-w-0">
                <input
                  type="text"
                  name="q"
                  placeholder="Bạn nhỏ muốn học gì hôm nay?"
                  className="w-full text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-500 bg-transparent focus:outline-none"
                />

              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold rounded-full text-xs sm:text-sm shadow-md shadow-blue-500/30 transition-all shrink-0 cursor-pointer"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 3. SECTION: ⭐ 4 góc trải nghiệm chính */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              4 góc trải nghiệm chính
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Một hành trình học tập toàn diện – Trực quan – Tương tác – Cá nhân hóa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Corner 1: Góc Khám phá */}
          <Link
            href="/kham-pha"
            className="bg-[#EBF4FF] p-5 rounded-3xl border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 overflow-hidden relative border border-blue-100">
                <Image
                  src="/illustrations/kham-pha.jpg"
                  alt="Góc Khám phá"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Góc Khám phá
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                  Video, bài giảng, hình ảnh trực quan hóa khái niệm Toán học
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-200/80 text-blue-700 flex items-center justify-center shrink-0 ml-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Corner 2: Góc Luyện tập */}
          <Link
            href="/luyen-tap"
            className="bg-[#E8F8F0] p-5 rounded-3xl border border-emerald-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 overflow-hidden relative border border-emerald-100">
                <Image
                  src="/illustrations/hoc-tap.jpg"
                  alt="Góc Luyện tập"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                  Góc Luyện tập
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                  Bài tập phân cấp, tương tác và trợ giảng AI
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 ml-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Corner 3: Góc Hỏi đáp */}
          <Link
            href="/hoi-dap"
            className="bg-[#FFF4E5] p-5 rounded-3xl border border-amber-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 overflow-hidden relative border border-amber-100">
                <Image
                  src="/illustrations/ai-chat.jpg"
                  alt="Góc Hỏi đáp"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                  Góc Hỏi đáp
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                  Đặt câu hỏi cho AI và giáo viên – Giải đáp nhanh 24/7
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 ml-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Corner 4: Góc Chinh phục & Đánh giá */}
          <Link
            href="/chinh-phuc"
            className="bg-[#F3EBFB] p-5 rounded-3xl border border-purple-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 overflow-hidden relative border border-purple-100">
                <Image
                  src="/illustrations/chinh-phuc.jpg"
                  alt="Góc Chinh phục & Đánh giá"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                  Góc Chinh phục &amp; Đánh giá
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                  Trò chơi, bài kiểm tra định kỳ, thử thách toán học
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-200/80 text-purple-700 flex items-center justify-center shrink-0 ml-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

        </div>
      </section>

      {/* 4. SECTION: 🔥 Bài học nổi bật (Bài 1 - Bài 32 & Vị trí bài đang học) */}
      <FeaturedLessonsSection initialLessons={lessons} />

      {/* 5. SECTION: 📑 Học liệu mới cập nhật */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📑</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Học liệu mới cập nhật
            </h2>
          </div>
          <Link
            href="/hoc-lieu"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {resources.map((res, idx) => {
            let iconElement = <FileText className="w-6 h-6 text-blue-600" />;
            if (idx === 1) iconElement = <Gamepad2 className="w-6 h-6 text-purple-600" />;
            if (idx === 2) iconElement = <Brain className="w-6 h-6 text-emerald-600" />;
            if (idx === 3) iconElement = <FileText className="w-6 h-6 text-amber-600" />;

            let typeStyle = 'bg-pink-100 text-pink-700';
            if (idx === 1) typeStyle = 'bg-purple-100 text-purple-700';
            if (idx === 2) typeStyle = 'bg-emerald-100 text-emerald-700';
            if (idx === 3) typeStyle = 'bg-amber-100 text-amber-700';

            return (
              <div
                key={res.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {iconElement}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {res.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-md ${typeStyle}`}>
                        {res.type}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {res.date}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center shrink-0 ml-2 transition-colors"
                  title="Tải về học liệu"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
