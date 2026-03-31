'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface ChinaMapProps {
  onRegionClick: (regionId: number, regionName: string) => void;
  selectedRegion?: { id: number; name: string } | null;
  visitedRegions?: Set<number>;
  className?: string;
}

// 地图数据源 - 优先本地，网络作为备用
const CHINA_MAP_LOCAL = '/data/china.json';
const CHINA_MAP_BACKUP = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

// 省份代码到数据库 ID 的映射（备份数据源格式）
const provinceCodeToId: Record<string, number> = {
  '110000': 100, '120000': 101, '310000': 108, '500000': 121,
  '130000': 102, '140000': 103, '150000': 104,
  '210000': 105, '220000': 106, '230000': 107,
  '320000': 109, '330000': 110, '340000': 111, '350000': 112, '360000': 113, '370000': 114,
  '410000': 115, '420000': 116, '430000': 117,
  '440000': 118, '450000': 119, '460000': 120,
  '510000': 122, '520000': 123, '530000': 124, '540000': 125,
  '610000': 126, '620000': 127, '630000': 128, '640000': 129, '650000': 130,
  '710000': 131, '810000': 132, '820000': 133,
};

// 省份名称到数据库 ID 的映射（主数据源格式）
// 数据库中的省份 ID 从 100 开始
const provinceNameToId: Record<string, number> = {
  // 直辖市
  '北京': 100,
  '北京市': 100,
  '天津': 101,
  '天津市': 101,
  '上海': 108,
  '上海市': 108,
  '重庆': 121,
  '重庆市': 121,
  
  // 华北地区
  '河北': 102,
  '河北省': 102,
  '山西': 103,
  '山西省': 103,
  '内蒙古': 104,
  '内蒙古自治区': 104,
  
  // 东北地区
  '辽宁': 105,
  '辽宁省': 105,
  '吉林': 106,
  '吉林省': 106,
  '黑龙江': 107,
  '黑龙江省': 107,
  
  // 华东地区
  '江苏': 109,
  '江苏省': 109,
  '浙江': 110,
  '浙江省': 110,
  '安徽': 111,
  '安徽省': 111,
  '福建': 112,
  '福建省': 112,
  '江西': 113,
  '江西省': 113,
  '山东': 114,
  '山东省': 114,
  
  // 华中地区
  '河南': 115,
  '河南省': 115,
  '湖北': 116,
  '湖北省': 116,
  '湖南': 117,
  '湖南省': 117,
  
  // 华南地区
  '广东': 118,
  '广东省': 118,
  '广西': 119,
  '广西壮族自治区': 119,
  '海南': 120,
  '海南省': 120,
  
  // 西南地区
  '四川': 122,
  '四川省': 122,
  '贵州': 123,
  '贵州省': 123,
  '云南': 124,
  '云南省': 124,
  '西藏': 125,
  '西藏自治区': 125,
  
  // 西北地区
  '陕西': 126,
  '陕西省': 126,
  '甘肃': 127,
  '甘肃省': 127,
  '青海': 128,
  '青海省': 128,
  '宁夏': 129,
  '宁夏回族自治区': 129,
  '新疆': 130,
  '新疆维吾尔自治区': 130,
  '新疆维吾尔族自治区': 130,
  
  // 港澳台
  '台湾': 131,
  '台湾省': 131,
  '香港': 132,
  '香港特别行政区': 132,
  '澳门': 133,
  '澳门特别行政区': 133,
};

export function ChinaMap({ onRegionClick, selectedRegion, visitedRegions = new Set(), className = '' }: ChinaMapProps) {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 优先从本地加载
      const response = await fetch(CHINA_MAP_LOCAL);
      if (!response.ok) throw new Error('Local source failed');
      const data = await response.json();
      console.log('[ChinaMap] 本地数据加载成功, features:', data.features?.length);
      setMapData(data);
      setLoading(false);
    } catch (err) {
      console.warn('[ChinaMap] 本地加载失败，尝试网络备用源:', err);
      try {
        const backupResponse = await fetch(CHINA_MAP_BACKUP);
        if (!backupResponse.ok) throw new Error('Backup source failed');
        const data = await backupResponse.json();
        console.log('[ChinaMap] 网络数据加载成功, features:', data.features?.length);
        setMapData(data);
        setLoading(false);
      } catch (backupErr) {
        console.error('[ChinaMap] 所有数据源加载失败:', backupErr);
        setError('无法加载地图数据');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
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
    // 首先尝试使用省份名称映射
    const name = getProvinceName(geo);
    const mappedById = provinceNameToId[name];
    if (mappedById) {
      return mappedById;
    }
    
    // 如果名称映射失败，尝试使用 adcode（备用数据源格式）
    const code = geo.properties.adcode?.toString() ||
                 geo.properties.id?.toString() ||
                 geo.properties.code?.toString() || '';
    
    if (code && provinceCodeToId[code]) {
      return provinceCodeToId[code];
    }
    
    // 如果都没有映射，返回 0
    console.log('[ChinaMap] No mapping for name:', name, 'code:', code);
    return 0;
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
      <div className={`w-full h-[300px] md:h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载地图中...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className={`w-full h-[300px] md:h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || '地图数据加载失败'}</p>
          <button
            onClick={fetchMapData}
            className="px-6 py-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] rounded-lg font-semibold"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[300px] md:h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 overflow-hidden select-none ${className}`}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [105, 35],
          scale: 500,
        }}
        className="w-full h-full"
      >
        <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionId = getRegionId(geo);
                const isChecked = visitedRegions.has(regionId);
                const isSelected = selectedRegion?.id === regionId;
                // 上海(108)和江苏(109)使用特殊颜色（住在）
                const isHome = regionId === 108 || regionId === 109;

                // 根据状态确定填充颜色
                const getFillColor = () => {
                  if (isHome) return '#002D28'; // 深绿色表示"住在"
                  if (isChecked) return '#CEA472'; // 金色表示"已访问"
                  return 'rgba(255, 255, 255, 0.1)';
                };

                const getFillOpacity = () => {
                  if (isHome) return 1;
                  if (isChecked) return 0.9;
                  return 0.4;
                };

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onRegionClick(regionId, getProvinceName(geo))}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: getFillColor(),
                        fillOpacity: getFillOpacity(),
                        stroke: isHome ? '#004d44' : '#CEA472',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      },
                      hover: {
                        fill: isHome ? '#003d36' : '#CEA472',
                        fillOpacity: 1,
                        stroke: isHome ? '#004d44' : '#CEA472',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: isHome ? '#001f1c' : '#CEA472',
                        fillOpacity: 1,
                        stroke: isHome ? '#004d44' : '#CEA472',
                        strokeWidth: 1.5,
                        outline: 'none',
                        cursor: 'pointer',
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
