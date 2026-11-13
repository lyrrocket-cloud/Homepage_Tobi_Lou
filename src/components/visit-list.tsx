'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 照片类型定义（从 gallery_photos 获取）
interface PhotoVisit {
  id: number;
  title: string;
  region_id: number;
  date: string;
  year: number;
  image_url: string;
  url?: string;
  category: string;
  is_yearly?: boolean;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

interface VisitListProps {
  regionId: number | null;
  regionName: string;
  onRefresh?: () => void;
}

export function VisitList({ regionId, regionName, onRefresh }: VisitListProps) {
  const router = useRouter();
  const [visits, setVisits] = useState<PhotoVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const onRefreshRef = useRef(onRefresh);

  // 处理点击事件
  const handleClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 更新 onRefresh 的引用
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // 获取访问记录（从 gallery_photos 表）
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();

      if (result.photos) {
        // 只获取中国地图类型的照片，且排除年度相册
        let chinaPhotos = result.photos.filter(
          (photo: PhotoVisit) => photo.region?.type === 'china' && !photo.is_yearly
        );

        // 如果有 regionId，只显示该地区的记录
        if (regionId) {
          chinaPhotos = chinaPhotos.filter((photo: PhotoVisit) => photo.region_id === regionId);
        }

        // 按日期降序排列（最新的在前）
        const sortedVisits = chinaPhotos.sort((a: PhotoVisit, b: PhotoVisit) =>
          b.date.localeCompare(a.date)
        );
        setVisits(sortedVisits);
      }
    } catch (error) {
      console.error('[VisitList] Failed to fetch visits:', error);
    } finally {
      setLoading(false);
      // 数据加载完成后通知父组件刷新
      if (onRefreshRef.current) {
        onRefreshRef.current();
      }
    }
  }, [regionId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  if (loading) {
    return (
      <div className="w-full h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#CEA472]/5 to-black/40 rounded-lg border border-[#CEA472]/10 p-4 flex flex-col h-[480px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-2xl font-bold text-[#CEA472]">
          {regionName ? regionName : '全部访问记录'}
        </h3>
        <span className="text-sm text-[#CEA472]/60">
          共 {visits.length} 条记录
        </span>
      </div>
      
      {visits.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-[#CEA472]/50 mx-auto mb-3" />
            <p className="text-[#CEA472]/60">
              {regionName ? '该地区暂无照片记录' : '暂无照片记录'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {visits.map((visit) => (
            <div
              key={visit.id}
              onClick={() => handleClick(visit.url)}
              className={`bg-black/40 border border-[#CEA472]/10 hover:border-[#CEA472]/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-black/60 flex ${visit.url ? 'cursor-pointer' : ''}`}
            >
              {/* 左侧：文字信息 */}
              <div className="flex-1 p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#CEA472]/70 flex-shrink-0" />
                  <span className="text-[#FFFFFF] text-base font-medium truncate">
                    {!regionId && visit.region?.name ? visit.region.name : visit.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[#CEA472]/70 flex-shrink-0" />
                  <p className="text-[#FFFFFF]/70 text-xs">
                    {visit.date.split('-')[0]}年{visit.date.split('-')[1]}月
                  </p>
                </div>
              </div>
              
              {/* 右侧：图片 */}
              {visit.image_url && (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={visit.image_url}
                    alt={visit.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
