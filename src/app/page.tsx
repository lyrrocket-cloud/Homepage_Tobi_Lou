'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Calendar,
  Globe,
  Settings,
  ArrowUp,
} from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { RegionMap } from '@/components/visit-map';
import { Region } from '@/app/api/regions/route';
import { PhotoCarousel } from '@/components/photo-carousel';
import { SplitTextTitle } from '@/components/split-text-title';
import { sizedImageUrl } from '@/lib/image-url';

// 格式化日期：将 '2025.01' 转换为 '2025年01月'
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('.');
  if (!year || !month) return dateStr;
  return `${year}年${month}月`;
}

// 照片接口定义
interface Photo {
  id: number;
  title: string;
  location: string;
  date: string;
  image_url: string;
  url: string;
  region_id?: number;
  category?: string;
  is_yearly?: boolean;
}

// 动态导入地图组件（SSR: false）
const ChinaMap = dynamic(() => import('@/components/china-map').then(mod => ({ default: mod.ChinaMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
        <p className="text-white/60">加载中国地图中...</p>
      </div>
    </div>
  )
});

const WorldMap = dynamic(() => import('@/components/world-map').then(mod => ({ default: mod.WorldMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
        <p className="text-white/60">加载世界地图中...</p>
      </div>
    </div>
  )
});

// 动态导入打卡列表组件
const VisitList = dynamic(() => import('@/components/visit-list').then(mod => ({ default: mod.VisitList })), {
  ssr: false
});

// 世界地图打卡组件
function WorldTracker() {
  const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
  const [visitedRegions, setVisitedRegions] = useState<Set<number>>(new Set());

  // 获取已访问的国家（从 gallery_photos 获取，type='world' 的记录）
  const fetchVisitedRegions = async () => {
    try {
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();
      if (result.photos) {
        // 只获取世界地图类型的 region_id
        const visitedIds = new Set<number>(
          result.photos
            .filter((photo: { region?: { type: string }; region_id: number }) => photo.region?.type === 'world')
            .map((photo: { region_id: number }) => photo.region_id)
        );
        setVisitedRegions(visitedIds);
      }
    } catch (error) {
      console.error('[WorldTracker] Failed to fetch visited regions:', error);
    }
  };

  useEffect(() => {
    fetchVisitedRegions();
  }, []);

  const handleRegionClick = (regionId: number, regionName: string) => {
    // 如果点击已选中的地区，则取消选中（显示全部记录）
    if (selectedRegion?.id === regionId) {
      setSelectedRegion(null);
    } else {
      setSelectedRegion({ id: regionId, name: regionName });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* 左侧：世界地图 */}
      <div className="flex-1 w-full h-[480px]">
        <WorldMap
          selectedRegion={selectedRegion}
          visitedRegions={visitedRegions}
          onRegionClick={handleRegionClick}
        />
      </div>

      {/* 右侧：打卡记录列表 - 固定宽度，手机端最大高度限制 */}
      <div className="w-full md:w-[320px] flex-shrink-0">
        <WorldVisitList
          regionId={selectedRegion?.id || null}
          regionName={selectedRegion?.name || ''}
          onRefresh={fetchVisitedRegions}
        />
      </div>
    </div>
  );
}

// 世界地图到访记录列表组件
function WorldVisitList({ regionId, regionName, onRefresh }: { regionId: number | null; regionName: string; onRefresh?: () => void }) {
  const [visits, setVisits] = useState<Array<{
    id: number;
    title: string;
    region_id: number;
    date: string;
    year: number;
    image_url: string;
    url?: string;
    category: string;
    is_yearly?: boolean;
    region?: { id: number; name: string; type: string };
  }>>([]);
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

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();

      if (result.photos) {
        // 只获取世界地图类型的照片，且排除年度相册
        let worldPhotos = result.photos.filter(
          (photo: { region?: { type: string }; is_yearly?: boolean }) =>
            photo.region?.type === 'world' && !photo.is_yearly
        );

        // 如果有 regionId，只显示该地区的记录
        if (regionId) {
          worldPhotos = worldPhotos.filter(
            (photo: { region_id: number }) => photo.region_id === regionId
          );
        }

        // 按日期降序排列
        const sortedVisits = worldPhotos.sort(
          (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date)
        );
        setVisits(sortedVisits);
      }
    } catch (error) {
      console.error('[WorldVisitList] Failed to fetch visits:', error);
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

  return (
    <div className="bg-gradient-to-br from-[#CEA472]/5 to-black/40 p-4 flex flex-col h-[480px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3
          key={regionName || 'all'}
          className="text-lg font-bold text-[#CEA472] visit-title-in"
        >
          {regionName ? regionName : '全部访问记录'}
        </h3>
        {loading ? (
          <span className="skeleton-shimmer block h-3 w-16 rounded-full" />
        ) : (
          <span key={visits.length} className="text-xs text-[#CEA472]/60 visit-title-in">
            共 {visits.length} 条记录
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 space-y-3 pr-2" key="skeleton">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-[84px] rounded-lg"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-[#CEA472]/50 mx-auto mb-3" />
            <p className="text-[#CEA472]/60">
              {regionName ? '该国家暂无照片记录' : '暂无世界地图照片记录'}
            </p>
          </div>
        </div>
      ) : (
        <div key={regionId ?? 'all'} className="flex-1 overflow-y-auto space-y-3 pr-2">
          {visits.map((visit, index) => (
            <div
              key={visit.id}
              onClick={() => handleClick(visit.url)}
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              className={`visit-card-in bg-black/40 hover:bg-black/60 transition-all duration-300 flex ${visit.url ? 'cursor-pointer' : ''}`}
            >
              {/* 左侧：文字信息 */}
              <div className="flex-1 p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#CEA472]/70 flex-shrink-0" />
                  <span className="text-[#FFFFFF] text-sm font-medium truncate">
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
                <div className="relative aspect-[3/2] h-[72px] flex-shrink-0">
                  <Image
                    src={sizedImageUrl(visit.image_url, 400)}
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

// 旅行打卡追踪器组件（中国地图）
function VisitTracker() {
  const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
  const [visitedRegions, setVisitedRegions] = useState<Set<number>>(new Set());

  // 获取已访问的地区（从 gallery_photos 获取）
  const fetchVisitedRegions = async () => {
    try {
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();
      if (result.photos) {
        const visitedIds = new Set<number>(
          result.photos.map((photo: { region_id: number }) => photo.region_id)
        );
        setVisitedRegions(visitedIds);
      }
    } catch (error) {
      console.error('[VisitTracker] Failed to fetch visited regions:', error);
    }
  };

  useEffect(() => {
    fetchVisitedRegions();
  }, []);

  const handleRegionClick = (regionId: number, regionName: string) => {
    // 如果点击已选中的地区，则取消选中（显示全部记录）
    if (selectedRegion?.id === regionId) {
      setSelectedRegion(null);
    } else {
      setSelectedRegion({ id: regionId, name: regionName });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* 左侧：中国地图 */}
      <div className="flex-1 w-full h-[480px]">
        <ChinaMap
          selectedRegion={selectedRegion}
          visitedRegions={visitedRegions}
          onRegionClick={handleRegionClick}
        />
      </div>

      {/* 右侧：打卡记录列表 - 固定宽度，手机端最大高度限制 */}
      <div className="w-full md:w-[320px] flex-shrink-0">
        <VisitList
          regionId={selectedRegion?.id || null}
          regionName={selectedRegion?.name || ''}
          onRefresh={fetchVisitedRegions}
        />
      </div>
    </div>
  );
}

// ===== 滚动可见 hook =====
function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [onceVisible, setOnceVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setOnceVisible(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView, onceVisible };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [carouselPhotos, setCarouselPhotos] = useState<Photo[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 滚动进度（rAF 节流）
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const pct = total > 0 ? doc.scrollTop / total : 0;
        setScrollProgress(pct);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 各 section 的可见性
  const hero          = useInView<HTMLElement>();
  const carousel      = useInView<HTMLElement>();
  const visits        = useInView<HTMLElement>();
  const visitsLegend  = useInView<HTMLDivElement>();
  const worldTracker  = useInView<HTMLDivElement>();
  const chinaTracker  = useInView<HTMLDivElement>();
  const footer        = useInView<HTMLElement>();

  // 获取最新的9张照片用于轮播
  useEffect(() => {
    const fetchCarouselPhotos = async () => {
      try {
        const response = await fetch('/api/gallery/photos');
        const result = await response.json();
        if (result.photos) {
          // 按日期降序排列，取最新的9张
          const latestPhotos = result.photos
            .filter((photo: Photo) => photo.image_url && !photo.is_yearly)
            .sort((a: Photo, b: Photo) => b.date.localeCompare(a.date))
            .slice(0, 9);
          setCarouselPhotos(latestPhotos);
        }
      } catch (error) {
        console.error('[Home] Failed to fetch carousel photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselPhotos();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans">
      {/* 滚动进度条 */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Hero 区域 */}
      <section ref={hero.ref} className="relative py-20 pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* 头像 */}
            <div className={`relative mb-8 ${hero.onceVisible ? 'animate-hero-avatar' : 'opacity-0 scale-90 transition-all duration-500'}`}>
              {/* 发光效果 */}
              <div className="absolute inset-0 bg-[#CEA472] rounded-full blur-2xl opacity-30 scale-110 animate-pulse" />
              {/* 头像容器 */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#CEA472]/50 shadow-2xl shadow-[#CEA472]/20">
                <Image
                  src="/assets/avatar.jpg"
                  alt="Tobi Lou"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 192px, 256px"
                />
              </div>
              {/* 装饰环 */}
              <div className="absolute -inset-4 rounded-full border-2 border-[#CEA472]/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
              <div className="absolute -inset-8 rounded-full border border-[#CEA472]/10" />
            </div>

            {/* 标题和介绍 */}
            <div className="relative z-10">
              <SplitTextTitle
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                lines={[
                  { text: '你好，我是', className: 'text-[#FFFFFF]' },
                  { text: 'Tobi Lou', className: 'text-[#CEA472]' },
                ]}
                subtitle="志之所趋，无远弗届"
                subtitleClassName="text-lg md:text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 照片轮播区域 */}
      <section
        ref={carousel.ref}
        className={`relative py-12 reveal ${carousel.onceVisible ? 'is-visible' : ''}`}
      >
        <PhotoCarousel photos={carouselPhotos} isLoading={isLoading} />
      </section>

      {/* 旅行打卡区域 */}
      <section
        id="visits"
        ref={visits.ref}
        className={`relative py-20 reveal ${visits.onceVisible ? 'is-visible' : ''}`}
      >
        <div className="relative max-w-7xl mx-auto px-4 space-y-8">
          {/* 图例 - 两幅地图共用 */}
          <div ref={visitsLegend.ref} className={`flex items-center gap-6 text-sm reveal reveal-delayed-1 ${visitsLegend.onceVisible ? 'is-visible' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#002D28] rounded"></div>
              <span className="text-[#FFFFFF]/70">久居</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#CEA472] rounded"></div>
              <span className="text-[#FFFFFF]/70">曾至</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black/30 border-2 border-[#CEA472]/40 rounded"></div>
              <span className="text-[#FFFFFF]/70">未临</span>
            </div>
          </div>

          {/* 世界地图 */}
          <div ref={worldTracker.ref} className={`reveal reveal-delayed-2 ${worldTracker.onceVisible ? 'is-visible' : ''}`}>
            <WorldTracker />
          </div>

          {/* 中国地图 */}
          <div ref={chinaTracker.ref} className={`reveal reveal-delayed-3 ${chinaTracker.onceVisible ? 'is-visible' : ''}`}>
            <VisitTracker />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={footer.ref}
        className={`relative py-12 px-4 reveal reveal-delayed-2 ${footer.onceVisible ? 'is-visible' : ''}`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#CEA472]/50 shadow-lg shadow-[#CEA472]/30">
              <Image
                src="/assets/avatar.jpg"
                alt="Tobi Lou"
                fill
                className="object-cover"
                priority={false}
                sizes="40px"
              />
            </div>
            <span className="text-xl font-bold text-[#CEA472]">Tobi Lou</span>
          </div>
          <p className="text-[#FFFFFF]/60 mb-6">志之所趋，无远弗届</p>
          <div className="text-sm text-[#FFFFFF]/40">
            <p>© {new Date().getFullYear()} Tobi Lou. All rights reserved.</p>
            <p className="mt-2">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#CEA472] transition-colors">
                沪ICP备2026010449号-1
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
