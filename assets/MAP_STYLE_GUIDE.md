# 旅游打卡地图样式与数据源指南

本文档总结了旅游打卡地图的完整实现方案，包括数据源、样式配置和代码模板，可直接复制到其他项目中使用。

---

## 目录

- [一、地图数据源](#一地图数据源)
- [二、核心依赖](#二核心依赖)
- [三、样式配置](#三样式配置)
- [四、世界地图组件](#四世界地图组件)
- [五、中国地图组件](#五中国地图组件)
- [六、投影配置](#六投影配置)
- [七、TypeScript 类型](#七typescript-类型)
- [八、辅助组件](#八辅助组件)
- [九、注意事项](#九注意事项)

---

## 一、地图数据源

### 1. 世界地图

| 属性 | 值 | 说明 |
|------|-----|------|
| URL | `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json` | TopoJSON 格式 |
| 精度 | 110m | 适合大多数场景，体积小 |
| 备用 | `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json` | 更高精度 |

**数据属性：**

```typescript
geo.properties.NAME      // 国家名称（如 "China"）
geo.properties.ISO_A3    // 国家代码（如 "CHN"）
geo.properties.ISO_A2    // 二位国家代码（如 "CN"）
geo.rsmKey               // React Simple Maps 唯一标识
```

### 2. 中国地图

| 属性 | 值 | 说明 |
|------|-----|------|
| 主数据源 | `https://raw.githubusercontent.com/waylau/svg-china-map/master/china-map/china.geo.json` | GeoJSON 格式 |
| 备用数据源 | `https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json` | 阿里云 DataV |

**数据属性：**

```typescript
geo.properties.name      // 省份名称（如 "北京市"）
geo.properties.adcode    // 省份代码（如 "110000"）
geo.properties.id        // 备用代码
geo.properties.code      // 备用代码
geo.properties.center    // 中心坐标（可选）
geo.rsmKey               // React Simple Maps 唯一标识
```

---

## 二、核心依赖

### 安装命令

```bash
pnpm add react-simple-maps topojson-client
pnpm add -D @types/d3-geo
```

### 依赖说明

| 包名 | 版本 | 用途 |
|------|------|------|
| `react-simple-maps` | ^3.0.0 | React 地图组件库 |
| `topojson-client` | ^3.1.0 | TopoJSON 解析 |
| `@types/d3-geo` | ^3.1.0 | TypeScript 类型定义 |

---

## 三、样式配置

### 1. 颜色常量（Tobi Lou 风格）

```typescript
const COLORS = {
  // 主色调
  GOLD: '#CEA472',                          // 金色（已打卡）
  GOLD_HOVER: '#CEA472',                    // 金色悬停
  GOLD_DARK: '#B8935F',                     // 深金色
  
  // 背景色
  BG_DARK: '#0a0a0f',                       // 深黑背景
  BG_CARD: 'rgba(0, 0, 0, 0.4)',            // 半透明卡片
  BG_OVERLAY: 'rgba(0, 0, 0, 0.6)',         // 半透明遮罩
  
  // 未打卡区域
  UNCHECKED: 'rgba(255, 255, 255, 0.1)',    // 白色半透明
  UNCHECKED_OPACITY: 0.4,
  
  // 边框
  BORDER: '#CEA472',
  BORDER_OPACITY_LIGHT: 0.1,                // 浅边框
  BORDER_OPACITY_MEDIUM: 0.3,               // 中等边框
  BORDER_OPACITY_STRONG: 0.5,               // 强边框
  
  // 文字
  TEXT_WHITE: '#FFFFFF',
  TEXT_GOLD: '#CEA472',
  TEXT_WHITE_80: 'rgba(255, 255, 255, 0.8)',
  TEXT_WHITE_60: 'rgba(255, 255, 255, 0.6)',
  TEXT_WHITE_40: 'rgba(255, 255, 255, 0.4)',
};
```

### 2. 地理区域样式

```typescript
const getGeographyStyle = (isChecked: boolean) => ({
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
});
```

### 3. CSS 变量定义

```css
:root {
  --color-gold: #CEA472;
  --color-white: #FFFFFF;
  --color-bg-dark: #0a0a0f;
  --color-bg-card: rgba(0, 0, 0, 0.4);
  --color-bg-overlay: rgba(0, 0, 0, 0.6);
  --color-unchecked: rgba(255, 255, 255, 0.1);
  --border-gold-light: rgba(206, 164, 114, 0.1);
  --border-gold-medium: rgba(206, 164, 114, 0.3);
  --border-gold-strong: rgba(206, 164, 114, 0.5);
}
```

---

## 四、世界地图组件

### 完整代码

```tsx
'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// 地图数据源
const WORLD_MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

interface WorldMapProps {
  checkedCountries: Set<string>;
  onCheckIn: (properties: { NAME: string; ISO_A3: string }) => void;
}

export default function WorldMap({ checkedCountries, onCheckIn }: WorldMapProps) {
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const isChecked = checkedCountries.has(geo.properties.ISO_A3);
    setTooltip({
      show: true,
      content: `${geo.properties.NAME}${isChecked ? ' ✓' : ''}`,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: '#0a0a0f' }}>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={WORLD_MAP_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isChecked = checkedCountries.has(geo.properties.ISO_A3);
                const isValid = geo.properties.ISO_A3 && geo.properties.ISO_A3 !== '-99';

                if (!isValid) return null;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onCheckIn(geo.properties)}
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
        </ZoomableGroup>
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
```

---

## 五、中国地图组件

### 完整代码

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// 地图数据源
const CHINA_MAP_URL = 'https://raw.githubusercontent.com/waylau/svg-china-map/master/china-map/china.geo.json';
const CHINA_MAP_BACKUP = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

interface ChinaMapProps {
  checkedProvinces: Set<string>;
  onCheckIn: (properties: { name: string; adcode: string }) => void;
}

export default function ChinaMap({ checkedProvinces, onCheckIn }: ChinaMapProps) {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // 尝试主数据源
        const response = await fetch(CHINA_MAP_URL);
        if (!response.ok) throw new Error('Primary source failed');
        const data = await response.json();
        setMapData(data);
        setLoading(false);
      } catch (err) {
        // 尝试备用数据源
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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载地图中...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
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
    <div className="relative w-full h-full" style={{ backgroundColor: '#0a0a0f' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [104, 37.5],
          scale: 800,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = getProvinceCode(geo);
                const isChecked = checkedProvinces.has(code);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onCheckIn({
                      name: getProvinceName(geo),
                      adcode: code,
                    })}
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
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
```

---

## 六、投影配置

### 世界地图投影

```typescript
// 默认投影（适合世界地图）
projectionConfig={{
  rotate: [-10, 0, 0],    // 经度偏移，使欧洲居中
  scale: 147,             // 缩放比例
}}

// 替代投影：geoNaturalEarth1（更自然）
projection="geoNaturalEarth1"
projectionConfig={{
  scale: 140,
}}
```

### 中国地图投影

```typescript
projection="geoMercator"
projectionConfig={{
  center: [104, 37.5],    // 中国中心坐标
  scale: 800,             // 缩放比例
}}
```

### 投影类型对比

| 投影类型 | 适用场景 | 特点 |
|---------|---------|------|
| `geoMercator` | 区域地图 | 保持形状，面积失真 |
| `geoNaturalEarth1` | 世界地图 | 折中方案，视觉效果好 |
| `geoOrthographic` | 地球仪效果 | 3D 球形效果 |
| `geoAlbers` | 美国地图 | 等面积圆锥投影 |

---

## 七、TypeScript 类型

### 类型声明文件

```typescript
// src/types/react-simple-maps.d.ts
declare module 'react-simple-maps' {
  import { ReactNode } from 'react';

  export interface GeographyProps {
    geography: any;
    key?: string;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export interface GeographiesProps {
    geography: string | any;
    children: (props: { geographies: any[] }) => ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    onMoveStart?: (event: any) => void;
    onMoveEnd?: (event: any) => void;
    children?: ReactNode;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      center?: [number, number];
      rotate?: [number, number, number];
      scale?: number;
      parallels?: [number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    children?: ReactNode;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function Geographies(props: GeographiesProps): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
  export function Sphere(props: any): JSX.Element;
  export function Graticule(props: any): JSX.Element;
}
```

### 数据类型定义

```typescript
// 打卡点数据类型
interface CheckInPoint {
  id: string;
  name: string;
  code: string;
  date: string;
  note?: string;
  type: 'world' | 'china';
}

// 地理属性类型（世界地图）
interface WorldGeoProperties {
  NAME: string;
  ISO_A3: string;
  ISO_A2?: string;
}

// 地理属性类型（中国地图）
interface ChinaGeoProperties {
  name: string;
  adcode: string;
  id?: string;
  code?: string;
  center?: [number, number];
}
```

---

## 八、辅助组件

### 图例组件

```tsx
interface LegendProps {
  uncheckedLabel?: string;
  checkedLabel?: string;
}

export function MapLegend({ 
  uncheckedLabel = '未打卡', 
  checkedLabel = '已打卡' 
}: LegendProps) {
  return (
    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-[#CEA472]/20 p-4 rounded-lg shadow-lg">
      <div className="text-xs font-semibold mb-3 text-[#CEA472]">图例</div>
      <div className="flex items-center gap-2 text-xs mb-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        <span className="text-white/80">{uncheckedLabel}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#CEA472' }}></div>
        <span className="text-white/80">{checkedLabel}</span>
      </div>
    </div>
  );
}
```

### 提示组件

```tsx
interface HintProps {
  text?: string;
}

export function MapHint({ text = '点击任意区域打卡' }: HintProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-[#CEA472]/20 px-6 py-3 rounded-lg shadow-lg">
      <p className="text-sm text-white/80">{text}</p>
    </div>
  );
}
```

### 加载组件

```tsx
export function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
        <p className="text-white/60">加载地图中...</p>
      </div>
    </div>
  );
}
```

---

## 九、注意事项

### 1. SSR 问题

地图组件必须在客户端渲染，使用 `dynamic` 导入：

```tsx
import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => <MapLoading />
});
```

### 2. CORS 跨域

确保地图数据源支持 CORS：
- ✅ `cdn.jsdelivr.net` - 支持 CORS
- ✅ `raw.githubusercontent.com` - 支持 CORS
- ✅ `geo.datav.aliyun.com` - 支持 CORS

### 3. 数据格式

| 地图类型 | 推荐格式 | 说明 |
|---------|---------|------|
| 世界地图 | TopoJSON | 体积小，性能好 |
| 中国地图 | GeoJSON | 数据完整，易解析 |

### 4. 性能优化

```typescript
// ✅ 推荐：使用 110m 精度
const WORLD_MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

// ⚠️ 仅在需要更高精度时使用
const WORLD_MAP_HIGH_RES = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
```

### 5. 国家代码过滤

某些地理区域没有有效的 ISO_A3 代码，需要过滤：

```typescript
const isValidCountry = (geo: any) => {
  const code = geo.properties.ISO_A3;
  return code && code !== '-99';
};
```

### 6. 缓存策略

```typescript
// 使用 React Query 缓存地图数据
import { useQuery } from '@tanstack/react-query';

const { data: mapData } = useQuery({
  queryKey: ['world-map'],
  queryFn: () => fetch(WORLD_MAP_URL).then(res => res.json()),
  staleTime: Infinity, // 地图数据不会过期
});
```

---

## 十、完整示例

### 使用示例

```tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapLegend, MapHint } from './components';

const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false });

export default function TravelMap() {
  const [checkedCountries, setCheckedCountries] = useState<Set<string>>(new Set());

  const handleCheckIn = (properties: { NAME: string; ISO_A3: string }) => {
    setCheckedCountries(prev => {
      const next = new Set(prev);
      next.add(properties.ISO_A3);
      return next;
    });
  };

  return (
    <div className="relative w-full h-[600px]">
      <WorldMap 
        checkedCountries={checkedCountries}
        onCheckIn={handleCheckIn}
      />
      <MapLegend />
      <MapHint text="点击任意国家打卡" />
    </div>
  );
}
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-03-02 | 1.0.0 | 初始版本，包含世界地图和中国地图 |

---

## 参考资源

- [React Simple Maps 官方文档](https://www.react-simple-maps.io/)
- [TopoJSON 规范](https://github.com/topojson/topojson-specification)
- [GeoJSON 规范](https://geojson.org/)
- [World Atlas 数据](https://github.com/topojson/world-atlas)
- [中国地图数据](https://github.com/waylau/svg-china-map)
