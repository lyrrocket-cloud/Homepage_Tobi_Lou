'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Calendar, ExternalLink, Camera } from 'lucide-react';
import Image from 'next/image';

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
  const [visits, setVisits] = useState<PhotoVisit[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取访问记录（从 gallery_photos 表）
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();
      
      if (result.photos) {
        // 如果有 regionId，只显示该地区的记录
        let filteredPhotos = result.photos;
        if (regionId) {
          filteredPhotos = result.photos.filter((photo: PhotoVisit) => photo.region_id === regionId);
        }
        
        // 按日期降序排列（最新的在前）
        const sortedVisits = filteredPhotos.sort((a: PhotoVisit, b: PhotoVisit) =>
          b.date.localeCompare(a.date)
        );
        setVisits(sortedVisits);
      }
    } catch (error) {
      console.error('[VisitList] Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // 暴露给父组件的刷新函数
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [regionId, onRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[480px] bg-gradient-to-br from-[#CEA472]/5 to-black/40 rounded-lg border border-[#CEA472]/10 p-4">
        <div className="text-[#CEA472]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[480px] bg-gradient-to-br from-[#CEA472]/5 to-black/40 rounded-lg border border-[#CEA472]/10 p-4 flex flex-col">
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
            <Camera className="w-12 h-12 text-[#CEA472]/50 mx-auto mb-3" />
            <p className="text-[#CEA472]/60">
              {regionName ? '该地区暂无照片记录' : '暂无照片记录'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} showRegion={!regionId} />
          ))}
        </div>
      )}
    </div>
  );
}

interface VisitCardProps {
  visit: PhotoVisit;
  showRegion?: boolean;
}

function VisitCard({ visit, showRegion = false }: VisitCardProps) {
  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${year}年${month}月`;
  };

  // 点击图片跳转外部链接
  const handleImageClick = () => {
    if (visit.url) {
      window.open(visit.url, '_blank');
    }
  };

  return (
    <div className="bg-black/40 border border-[#CEA472]/10 hover:border-[#CEA472]/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-black/60 flex">
      {/* 左侧：文字信息 */}
      <div className="flex-1 p-3 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#CEA472]/70 flex-shrink-0" />
          <span className="text-[#FFFFFF] text-base font-medium truncate">
            {showRegion && visit.region?.name ? visit.region.name : visit.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-[#CEA472]/70 flex-shrink-0" />
          <p className="text-[#FFFFFF]/70 text-xs">{formatDate(visit.date)}</p>
        </div>
      </div>
      
      {/* 右侧：图片 */}
      {visit.image_url && (
        <div 
          className={`relative w-24 h-24 flex-shrink-0 ${visit.url ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        >
          <Image
            src={visit.image_url}
            alt={visit.title}
            fill
            className="object-cover"
          />
          {visit.url && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
