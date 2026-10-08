'use client';

import { useState, useEffect } from 'react';
import { Award, Trophy, Lock } from 'lucide-react';

interface AchievementAdminItem {
  _id: string;
  name: string;
  description: string;
  condition: string;
  points: number;
}

export default function AdminThanhTichPage() {
  const [achievements, setAchievements] = useState<AchievementAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch('/api/achievements');
        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Thành Tích & Huy Hiệu</h1>
          <p className="text-xs text-slate-500">Cấu hình điều kiện nhận huy hiệu và điểm thưởng Gamification cho học sinh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-400 text-xs">Đang tải huy hiệu...</p>
        ) : (
          achievements.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
              <p className="text-xs text-slate-500">{item.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Điều kiện: {item.condition}</span>
                <span className="text-amber-600">+{item.points} XP</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
