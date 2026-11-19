'use client';

import { useEffect, useState } from 'react';
import { Globe, MapPin, Camera } from 'lucide-react';
import { CountUp } from './count-up';

interface Stats {
  countries: number;
  cities: number;
  photos: number;
}

type ApiPhoto = {
  region_id: number;
  is_yearly?: boolean;
  region?: { id: number; name: string; type: string };
};

/**
 * 旅行统计（地图旁）
 * 去过 X 国 / Y 城 / Z 张照片 —— 进入视口时数字从 0 滚动到位
 */
export function TravelStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/gallery/photos')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled || !Array.isArray(result.photos)) return;
        const photos = (result.photos as ApiPhoto[]).filter((p) => !p.is_yearly);

        const countrySet = new Set<number>();
        const citySet = new Set<number>();

        photos.forEach((p) => {
          if (!p.region) return;
          if (p.region.type === 'world') countrySet.add(p.region_id);
          else citySet.add(p.region_id);
        });

        setStats({
          countries: countrySet.size,
          cities: citySet.size,
          photos: photos.length,
        });
      })
      .catch((error) => {
        console.error('[TravelStats] Failed to fetch stats:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { icon: Globe, value: stats?.countries ?? 0, label: '个国家' },
    { icon: MapPin, value: stats?.cities ?? 0, label: '座城市' },
    { icon: Camera, value: stats?.photos ?? 0, label: '张照片' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
      {items.map(({ icon: Icon, value, label }, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <Icon className="w-5 h-5 text-[#CEA472]/70 mb-2" />
          <div className="flex items-baseline gap-1">
            {stats ? (
              <CountUp
                value={value}
                className="text-4xl md:text-5xl font-bold text-[#CEA472] tabular-nums"
              />
            ) : (
              <span className="skeleton-shimmer inline-block h-10 w-16 rounded-md" />
            )}
            <span className="text-sm text-[#FFFFFF]/50">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
