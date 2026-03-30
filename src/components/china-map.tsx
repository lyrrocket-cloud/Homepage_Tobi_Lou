'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface ChinaMapProps {
  onRegionClick: (regionId: number, regionName: string) => void;
  selectedRegion?: { id: number; name: string } | null;
  visitedRegions?: Set<number>;
}

// 地图数据源
const CHINA_MAP_URL = 'https://raw.githubusercontent.com/waylau/svg-china-map/master/china-map/china.geo.json';
const CHINA_MAP_BACKUP = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

// 省份代码到数据库 ID 的映射（根据数据库中的实际ID）
// 数据库中的省份 ID 从 100 开始
const provinceCodeToId: Record<string, number> = {
  // 直辖市
  '110000': 100,  // 北京
  '120000': 101,  // 天津
  '310000': 108,  // 上海
  '500000': 121,  // 重庆
  
  // 华北地区
  '130000': 102,  // 河北
  '140000': 103,  // 山西
  '150000': 104,  // 内蒙古
  
  // 东北地区
  '210000': 105,  // 辽宁
  '220000': 106,  // 吉林
  '230000': 107,  // 黑龙江
  
  // 华东地区
  '320000': 109,  // 江苏
  '330000': 110,  // 浙江
  '340000': 111,  // 安徽
  '350000': 112,  // 福建
  '360000': 113,  // 江西
  '370000': 114,  // 山东
  
  // 华中地区
  '410000': 115,  // 河南
  '420000': 116,  // 湖北
  '430000': 117,  // 湖南
  
  // 华南地区
  '440000': 118,  // 广东
  '450000': 119,  // 广西
  '460000': 120,  // 海南
  
  // 西南地区
  '510000': 122,  // 四川
  '520000': 123,  // 贵州
  '530000': 124,  // 云南
  '540000': 125,  // 西藏
  
  // 西北地区
  '610000': 126,  // 陕西
  '620000': 127,  // 甘肃
  '630000': 128,  // 青海
  '640000': 129,  // 宁夏
  '650000': 130,  // 新疆
  
  // 港澳台
  '710000': 131,  // 台湾
  '810000': 132,  // 香港
  '820000': 133,  // 澳门
};

export function ChinaMap({ onRegionClick, selectedRegion, visitedRegions = new Set() }: ChinaMapProps) {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(CHINA_MAP_URL);
        if (!response.ok) throw new Error('Primary source failed');
        const data = await response.json();
        setMapData(data);
        setLoading(false);
      } catch (err) {
        try {
          const backupResponse = await fetch(CHINA_MAP_BACKUP);
          if (!backupResponse.ok) throw new Error('Backup source failed');
          const data = await backupResponse.json();
          setMapData(data);
          setLoading(false);
        } catch (backupErr) {
          setError('无法加载地图数据');
          setLoading(false);
        }
      }
    };

    fetchMapData();
  }, []);

  const getProvinceCode = (geo: any): string => {
    return geo.properties.adcode?.toString() ||
           geo.properties.id?.toString() ||
           geo.properties.code?.toString() || '';
  };

  const getProvinceName = (geo: any): string => {
    return geo.properties.name ||
           geo.properties.NAME ||
           geo.properties.province ||
           geo.properties.nm || '';
  };

  const getRegionId = (geo: any): number => {
    const code = getProvinceCode(geo);
    const mappedId = provinceCodeToId[code];
    if (mappedId) {
      return mappedId;
    }
    // 如果没有映射，尝试直接转换
    const parsedId = parseInt(code);
    return isNaN(parsedId) ? 0 : parsedId;
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const name = getProvinceName(geo);
    const regionId = getRegionId(geo);
    const isSelected = selectedRegion?.id === regionId;
    const isVisited = visitedRegions.has(regionId);
    
    setTooltip({
      show: true,
      content: `${name}${isVisited ? ' ✓' : ''}`,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="w-[640px] h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载地图中...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="w-[640px] h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || '地图数据加载失败'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] rounded-lg font-semibold"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[640px] h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 overflow-hidden select-none">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [104, 37.5],
          scale: 600,
        }}
        className="w-full h-full"
      >
        <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionId = getRegionId(geo);
                const isChecked = visitedRegions.has(regionId);
                const isSelected = selectedRegion?.id === regionId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onRegionClick(regionId, getProvinceName(geo))}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isChecked ? '#CEA472' : 'rgba(255, 255, 255, 0.1)',
                        fillOpacity: isChecked ? 0.9 : 0.4,
                        stroke: '#CEA472',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      },
                      hover: {
                        fill: '#CEA472',
                        fillOpacity: 0.9,
                        stroke: '#CEA472',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#CEA472',
                        fillOpacity: 1,
                        stroke: '#CEA472',
                        strokeWidth: 1.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed pointer-events-none bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 border border-[#CEA472]/30"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            transform: 'translateY(-100%)',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
