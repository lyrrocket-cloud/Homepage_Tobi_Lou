'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Region } from '@/app/api/regions/route';
import { Visit } from '@/app/api/visits/route';

interface RegionMapProps {
  type: 'china' | 'world';
  selectedRegion: number | null;
  onRegionSelect: (regionId: number | null) => void;
  visitedRegions?: Set<number>;
}

export function RegionMap({
  type,
  selectedRegion,
  onRegionSelect,
  visitedRegions = new Set(),
}: RegionMapProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/regions?type=${type}&withChildren=true`
        );
        const result = await response.json();
        if (result.success) {
          setRegions(result.data);
        }
      } catch (error) {
        console.error('[RegionMap] Failed to fetch regions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegions();
  }, [type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-[#CEA472]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[400px] bg-gradient-to-br from-[#CEA472]/5 to-black/40 rounded-lg border border-[#CEA472]/10 p-4">
      <h3 className="text-2xl font-bold text-[#CEA472] mb-4">
        {type === 'china' ? '中国地图' : '世界地图'}
      </h3>
      <div className="space-y-3">
        {regions.map((region) => (
          <RegionGroup
            key={region.id}
            region={region}
            selectedRegion={selectedRegion}
            onRegionSelect={onRegionSelect}
            visitedRegions={visitedRegions}
          />
        ))}
      </div>
    </div>
  );
}

interface RegionGroupProps {
  region: Region;
  selectedRegion: number | null;
  onRegionSelect: (regionId: number | null) => void;
  visitedRegions: Set<number>;
}

function RegionGroup({
  region,
  selectedRegion,
  onRegionSelect,
  visitedRegions,
}: RegionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const visitedCount = region.children?.filter((r) =>
    visitedRegions.has(r.id)
  ).length;

  return (
    <div className="space-y-2">
      <button
        className="w-full flex items-center justify-between p-2 bg-black/40 hover:bg-black/60 border border-[#CEA472]/20 hover:border-[#CEA472]/40 rounded transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[#FFFFFF] font-semibold">{region.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#CEA472]/60">
            {visitedCount}/{region.children?.length || 0}
          </span>
          <svg
            className={`w-4 h-4 text-[#CEA472] transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && region.children && (
        <div className="grid grid-cols-4 gap-2 pl-2">
          {region.children.map((child) => {
            const isSelected = selectedRegion === child.id;
            const isVisited = visitedRegions.has(child.id);

            return (
              <button
                key={child.id}
                className={`p-2 rounded border transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#CEA472] border-[#CEA472] text-black font-semibold'
                    : isVisited
                    ? 'bg-[#CEA472]/20 border-[#CEA472]/40 text-[#FFFFFF]'
                    : 'bg-black/30 border-[#CEA472]/10 text-[#FFFFFF]/60 hover:border-[#CEA472]/30'
                }`}
                onClick={() => onRegionSelect(child.id)}
              >
                <div className="flex items-center justify-center gap-1">
                  {isVisited && <CheckCircle2 className="w-3 h-3" />}
                  <span className="text-xs">{child.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
