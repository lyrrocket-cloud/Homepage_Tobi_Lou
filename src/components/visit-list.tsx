'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Calendar, ExternalLink, Plus } from 'lucide-react';
import { Visit } from '@/app/api/visits/route';

interface VisitListProps {
  regionId: number | null;
  regionName: string;
  onRefresh?: () => void;
  onAddVisit?: () => void;
}

export function VisitList({ regionId, regionName, onRefresh, onAddVisit }: VisitListProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取访问记录
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      // 如果有regionId，只获取该地区的访问记录；否则获取所有访问记录
      const url = regionId
        ? `/api/visits?regionId=${regionId}&includeRegion=true`
        : '/api/visits?includeRegion=true';

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        // 按日期降序排列（最新的在前）
        const sortedVisits = result.data.sort((a: Visit, b: Visit) =>
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
      // 当 regionId 变化时通知父组件
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
            <ExternalLink className="w-12 h-12 text-[#CEA472]/50 mx-auto mb-3" />
            <p className="text-[#CEA472]/60">
              {regionName ? '该地区暂无访问记录' : '暂无访问记录'}
            </p>
            {onAddVisit && (
              <button
                onClick={onAddVisit}
                className="mt-4 px-4 py-2 bg-[#CEA472]/20 hover:bg-[#CEA472]/30 text-[#CEA472] border border-[#CEA472]/30 rounded transition-colors text-sm flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                添加到访记录
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} showRegion={!regionId} onRefresh={onRefresh} />
            ))}
          </div>
          
          {/* 底部添加按钮 */}
          {onAddVisit && (
            <div className="mt-4 pt-4 border-t border-[#CEA472]/10 flex-shrink-0">
              <button
                onClick={onAddVisit}
                className="w-full px-4 py-2 bg-[#CEA472]/10 hover:bg-[#CEA472]/20 text-[#CEA472] border border-[#CEA472]/30 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加到访记录
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface VisitCardProps {
  visit: Visit;
  showRegion?: boolean;
  onRefresh?: () => void;
}

function VisitCard({ visit, showRegion = false, onRefresh }: VisitCardProps) {
  return (
    <div className="bg-black/40 border border-[#CEA472]/10 hover:border-[#CEA472]/30 rounded-lg p-4 transition-all duration-300 hover:bg-black/60">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#CEA472]/70 flex-shrink-0" />
          <span className="text-[#FFFFFF] text-lg font-medium">{visit.region?.name || visit.title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-[#CEA472]/70 flex-shrink-0" />
        <p className="text-[#FFFFFF]/70 text-sm">{visit.date}</p>
      </div>
      {visit.image && (
        <a
          href={visit.image}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#CEA472] hover:text-[#CEA472]/80 transition-colors"
        >
          查看详情
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
