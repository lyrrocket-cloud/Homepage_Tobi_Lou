'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Camera,
  Video,
  Wrench,
  ChevronRight,
  MapPin,
  Calendar,
  Wallet,
  Car,
  Plus,
  Sparkles,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Globe,
  Plane,
  Compass,
  Heart,
  Star,
  Gift,
  Settings,
  RefreshCw,
  ArrowUp,
} from 'lucide-react';
import { PhotoManager } from '@/components/photo-manager';
import { VideoManager } from '@/components/video-manager';
import { ToolManager } from '@/components/tool-manager';
import { OptimizedImage } from '@/components/OptimizedImage';
import { RegionMap } from '@/components/visit-map';
import { Photo } from '@/app/api/photos/route';
import { Video as VideoType } from '@/app/api/videos/route';
import { Tool } from '@/app/api/tools/route';
import { Region } from '@/app/api/regions/route';

// 动态导入地图组件（SSR: false）
const ChinaMap = dynamic(() => import('@/components/china-map').then(mod => ({ default: mod.ChinaMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[480px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent"></div>
    </div>
  )
});

const WorldMap = dynamic(() => import('@/components/world-map').then(mod => ({ default: mod.WorldMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[400px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent"></div>
    </div>
  )
});

// 动态导入打卡列表组件
const VisitList = dynamic(() => import('@/components/visit-list').then(mod => ({ default: mod.VisitList })), {
  ssr: false
});

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Car,
  Sparkles,
  MapPin: MapPinIcon,
  Calendar: CalendarIcon,
  Camera,
  Video: VideoIcon,
  Wrench,
  Globe,
  Plane,
  Compass,
  Heart,
  Star,
  Gift,
  Plus,
};

// 默认照片数据（9张）
const defaultPhotos: Photo[] = [
  {
    id: 1,
    title: '元阳梯田',
    location: '中国云南',
    date: '2026.01',
    image: '/assets/yunnan-025.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/TVaRw7iRq',
    order: 1,
  },
  {
    id: 2,
    title: '新天鹅堡',
    location: '德国',
    date: '2025.12',
    image: '/assets/germany-031.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/a9FuKhqcd',
    order: 2,
  },
  {
    id: 3,
    title: '马特洪峰',
    location: '欧洲',
    date: '2025.10',
    image: '/assets/europe-053.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/t2SsMNSu8',
    order: 3,
  },
  {
    id: 4,
    title: '武功山',
    location: '中国江西',
    date: '2025.09',
    image: '/assets/jiangxi-032.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/36y3K2gm1',
    order: 4,
  },
  {
    id: 5,
    title: '国清寺',
    location: '中国浙江',
    date: '2025.07',
    image: '/assets/zhejiang-003.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/ghF4s7F9D',
    order: 5,
  },
  {
    id: 6,
    title: '千户苗寨',
    location: '中国贵州',
    date: '2025.05',
    image: '/assets/guizhou-036.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/1ylcTSRaI',
    order: 6,
  },
  {
    id: 7,
    title: '稻城亚丁',
    location: '中国四川',
    date: '2025.03',
    image: '/assets/sichuan-042.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/3kLmN9oPq',
    order: 7,
  },
  {
    id: 8,
    title: '桂林山水',
    location: '中国广西',
    date: '2025.01',
    image: '/assets/guangxi-058.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/7rStU2vWx',
    order: 8,
  },
  {
    id: 9,
    title: '张家界',
    location: '中国湖南',
    date: '2024.12',
    image: '/assets/hunan-067.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/4yVwM1nZx',
    order: 9,
  },
];

// 默认视频数据（9个）
const defaultVideos: VideoType[] = [
  {
    id: 1,
    title: '滇东南之旅',
    location: '中国云南',
    date: '2026.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV13MzzBZEQT&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 1,
  },
  {
    id: 2,
    title: '虎跳峡徒步',
    location: '中国云南',
    date: '2025.03',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV17VGHzTEJB&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 2,
  },
  {
    id: 3,
    title: '川西之旅',
    location: '中国四川',
    date: '2025.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1ErLoz1Eg1&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 3,
  },
  {
    id: 4,
    title: '稻城亚丁之旅',
    location: '中国四川',
    date: '2025.03',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1yrL6YRE7W&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 4,
  },
  {
    id: 5,
    title: '张家界探险',
    location: '中国湖南',
    date: '2024.12',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1h4L6YRE8V&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 5,
  },
  {
    id: 6,
    title: '桂林山水游',
    location: '中国广西',
    date: '2025.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV2iRLLYRE9V&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 6,
  },
  {
    id: 7,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 7,
    isEmpty: true,
  },
  {
    id: 8,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 8,
    isEmpty: true,
  },
  {
    id: 9,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 9,
    isEmpty: true,
  },
];

// 默认工具数据
const defaultTools: Tool[] = [
  {
    id: 1,
    name: '旅行记账',
    description: '记录旅途中的每一笔开支',
    icon: 'Wallet',
    url: 'https://pvs6b4k729.coze.site',
    order: 1,
  },
  {
    id: 2,
    name: '今天谁开车',
    description: '轮流开车，公平分配',
    icon: 'Car',
    url: 'https://s864znmf32.coze.site',
    order: 2,
  },
  {
    id: 3,
    name: '旅行许愿池',
    description: '许下你的旅行心愿',
    icon: 'Sparkles',
    url: 'https://np9wpj8cx5.coze.site/',
    order: 3,
  },
  {
    id: 4,
    name: '更多工具',
    description: '敬请期待',
    icon: 'Plus',
    url: '',
    order: 4,
    isEmpty: true,
  },
];

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
    <div className="space-y-4">
      {/* 标题区域 */}
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-[#CEA472]" />
        <h3 className="text-2xl font-bold text-[#CEA472]">
          世界地图
        </h3>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#CEA472] rounded"></div>
          <span className="text-[#FFFFFF]/70">已访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-black/30 border border-[#CEA472]/10 rounded"></div>
          <span className="text-[#FFFFFF]/70">未访问</span>
        </div>
      </div>

      {/* 世界地图 */}
      <div className="w-full">
        <WorldMap
          selectedRegion={selectedRegion}
          visitedRegions={visitedRegions}
          onRegionClick={handleRegionClick}
        />
      </div>
    </div>
  );
}

// 旅行打卡追踪器组件（中国地图）
function VisitTracker() {
  const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
  const [visitedRegions, setVisitedRegions] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-[#CEA472]" />
        <h3 className="text-4xl font-bold text-[#CEA472]">
          旅行打卡
        </h3>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#CEA472] rounded"></div>
          <span className="text-[#FFFFFF]/70">已访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black/30 border border-[#CEA472]/10 rounded"></div>
          <span className="text-[#FFFFFF]/70">未访问</span>
        </div>
      </div>

      {/* 左右分栏布局 - 桌面和平板保持地图在左、打卡记录在右 */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* 左侧：响应式地图 */}
        <div className="flex-1 w-full">
          <ChinaMap
            selectedRegion={selectedRegion}
            visitedRegions={visitedRegions}
            onRegionClick={handleRegionClick}
          />
        </div>

        {/* 右侧：打卡记录列表 - 固定宽度，与地图等高 */}
        <div className="w-full md:w-[320px] flex-shrink-0 h-[300px] md:h-[480px] overflow-y-auto">
          <VisitList
            regionId={selectedRegion?.id || null}
            regionName={selectedRegion?.name || ''}
            onRefresh={fetchVisitedRegions}
          />
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从API获取照片数据
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        const result = await response.json();
        if (result.success && result.data) {
          setPhotos(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      }
    };
    fetchPhotos();
  }, []);

  // 从API获取视频数据
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const result = await response.json();
        if (result.success && result.data) {
          setVideos(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };
    fetchVideos();
  }, []);

  // 从API获取工具数据
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const result = await response.json();
        if (result.success && result.data) {
          setTools(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      }
    };
    fetchTools();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative font-sans">
      {/* 右上角同步图标 - 固定在页面顶端，滚动后消失 */}
      <a
        href="/admin/sync"
        className="absolute top-4 right-4 z-[100] p-2 rounded-md bg-black/40 backdrop-blur-md border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all duration-300"
        title="数据同步"
      >
        <RefreshCw className="w-4 h-4 text-[#CEA472]" />
      </a>
      
      {/* 背景图片 */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/assets/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority={false}
        />
        {/* 深色渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Hero 区域 */}
      <section className="relative py-20 pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* 头像 */}
            <div className="relative mb-8">
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
              <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-[#FFFFFF]">你好，我是</span>
                <br />
                <span className="text-[#CEA472]">Tobi Lou</span>
              </h2>
              
              <p className="text-lg md:text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                志之所趋，无远弗届
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#photos">
                  <Button
                    size="lg"
                    className="gap-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] shadow-lg font-semibold px-8 border-0"
                  >
                    <Camera className="w-5 h-5" />
                    照片集
                  </Button>
                </a>
                <a href="#videos">
                  <Button
                    size="lg"
                    className="gap-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] shadow-lg font-semibold px-8 border-0"
                  >
                    <Video className="w-5 h-5" />
                    视频集
                  </Button>
                </a>
                <a href="#tools">
                  <Button
                    size="lg"
                    className="gap-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] shadow-lg font-semibold px-8 border-0"
                  >
                    <Wrench className="w-5 h-5" />
                    工具箱
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 旅行打卡区域 */}
      <section id="visits" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* 世界地图 */}
          <WorldTracker />
          
          {/* 中国地图 */}
          <VisitTracker />
        </div>
      </section>

      {/* 照片墙区域 */}
      <section id="photos" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12 relative">
            <Camera className="w-8 h-8 text-[#CEA472]" />
            <h3 className="text-4xl font-bold text-[#CEA472]">
              照片集
            </h3>
            {/* 管理按钮和回顶端按钮放在右侧 */}
            <div className="ml-auto flex items-center gap-2">
              <PhotoManager 
                photos={photos} 
                onPhotosUpdate={(updatedPhotos) => setPhotos(updatedPhotos)} 
              />
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded-md bg-black/40 border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all"
                title="回到顶端"
              >
                <ArrowUp className="w-4 h-4 text-[#CEA472]" />
              </button>
            </div>
          </div>

          {/* 照片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.slice(0, 9).map((photo, index) => (
              <Card
                key={photo.id}
                className="group overflow-hidden border border-[#CEA472]/10 bg-black/40 backdrop-blur-sm hover:border-[#CEA472]/50 hover:bg-black/60 transition-all duration-500 cursor-pointer"
                onClick={() => {
                  if (photo.url) {
                    window.open(photo.url, '_blank');
                  }
                }}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={photo.imageUrl || photo.image}
                    alt={photo.title}
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3} // 前3张图片优先加载
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h4 className="text-[#FFFFFF] font-bold text-lg">{photo.title}</h4>
                  </div>
                  {/* 发光边框 */}
                  <div className="absolute inset-0 border-2 border-[#CEA472]/0 group-hover:border-[#CEA472]/30 rounded-t-lg transition-colors duration-300" />
                </div>
                <CardContent className="p-4 bg-gradient-to-r from-black/60 to-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#FFFFFF]/80">
                      <MapPin className="w-4 h-4 text-[#CEA472]" />
                      <span>{photo.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#FFFFFF]/60">
                      <Calendar className="w-4 h-4 text-[#CEA472]" />
                      <span>{photo.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 更多照片 */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="gap-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] shadow-lg font-semibold px-8 border-0"
              onClick={() => window.location.href = '/photos'}
            >
              <Camera className="w-5 h-5" />
              更多照片
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 视频区域 */}
      <section id="videos" className="relative py-20 px-4 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12 relative">
            <Video className="w-8 h-8 text-[#CEA472]" />
            <h3 className="text-4xl font-bold text-[#CEA472]">
              视频集
            </h3>
            {/* 管理按钮和回顶端按钮放在右侧 */}
            <div className="ml-auto flex items-center gap-2">
              <VideoManager 
                videos={videos} 
                onVideosUpdate={(updatedVideos) => setVideos(updatedVideos)} 
              />
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded-md bg-black/40 border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all"
                title="回到顶端"
              >
                <ArrowUp className="w-4 h-4 text-[#CEA472]" />
              </button>
            </div>
          </div>

          {/* 视频网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 9).map((video) => (
              <Card
                key={video.id}
                className={`group overflow-hidden border border-[#CEA472]/10 bg-black/60 backdrop-blur-sm hover:border-[#CEA472]/50 transition-all duration-500 ${
                  video.isEmpty ? 'flex items-center justify-center' : ''
                }`}
              >
                {video.isEmpty ? (
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <Plus className="w-12 h-12 text-[#CEA472]/50 group-hover:text-[#CEA472] transition-colors mb-3" />
                    <p className="text-sm text-[#CEA472]/50 group-hover:text-[#CEA472] transition-colors">
                      敬请期待
                    </p>
                  </CardContent>
                ) : (
                  <>
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {video.embedUrl ? (
                        <iframe
                          src={video.embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#CEA472]/50">
                          <Video className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 bg-gradient-to-r from-black/60 to-black/40">
                      <h4 className="font-bold text-[#FFFFFF] mb-2 group-hover:text-[#CEA472] transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[#FFFFFF]/60">
                          <MapPin className="w-3 h-3 text-[#CEA472]" />
                          <span>{video.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#FFFFFF]/60">
                          <Calendar className="w-3 h-3 text-[#CEA472]" />
                          <span>{video.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>

          {/* 更多视频 */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="gap-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] shadow-lg font-semibold px-8 border-0"
              onClick={() => window.open('https://lyrrocket.quickconnect.cn/mo/sharing/7xLwl056X', '_blank')}
            >
              <Video className="w-5 h-5" />
              更多视频
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 工具箱区域 */}
      <section id="tools" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12 relative">
            <Wrench className="w-8 h-8 text-[#CEA472]" />
            <h3 className="text-4xl font-bold text-[#CEA472]">
              工具箱
            </h3>
            {/* 管理按钮和回顶端按钮放在右侧 */}
            <div className="ml-auto flex items-center gap-2">
              <ToolManager 
                tools={tools} 
                onToolsUpdate={(updatedTools) => setTools(updatedTools)} 
              />
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded-md bg-black/40 border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all"
                title="回到顶端"
              >
                <ArrowUp className="w-4 h-4 text-[#CEA472]" />
              </button>
            </div>
          </div>

          {/* 工具网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const IconComponent = iconMap[tool.icon] || Wrench;
              return (
                <Card
                  key={tool.id}
                  className={`group border border-[#CEA472]/10 bg-black/40 backdrop-blur-sm hover:border-[#CEA472]/50 hover:bg-black/60 transition-all duration-500 cursor-pointer overflow-hidden ${
                    tool.isEmpty ? 'flex items-center justify-center' : ''
                  }`}
                  onClick={() => {
                    if (tool.url && !tool.isEmpty) {
                      window.open(tool.url, '_blank');
                    }
                  }}
                >
                  {tool.isEmpty ? (
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                      <IconComponent className="w-12 h-12 text-[#CEA472]/50 group-hover:text-[#CEA472] transition-colors mb-3" />
                      <p className="text-sm text-[#CEA472]/50 group-hover:text-[#CEA472] transition-colors">
                        敬请期待
                      </p>
                    </CardContent>
                  ) : (
                    <CardContent className="p-6">
                      <IconComponent className="w-10 h-10 text-[#CEA472] mb-4" />
                      <h4 className="font-bold text-[#FFFFFF] mb-2 group-hover:text-[#CEA472] transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-sm text-[#FFFFFF]/60 mb-4">{tool.description}</p>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group-hover:bg-[#CEA472]/10 text-[#CEA472] transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tool.url) {
                            window.open(tool.url, '_blank');
                          }
                        }}
                      >
                        <span>立即使用</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 bg-black/60 backdrop-blur-sm border-t border-[#CEA472]/10">
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
          <div className="flex justify-center gap-8 text-sm text-[#FFFFFF]/50">
            <a href="#photos" className="hover:text-[#CEA472] transition-colors">
              照片集
            </a>
            <a href="#videos" className="hover:text-[#CEA472] transition-colors">
              视频集
            </a>
            <a href="#tools" className="hover:text-[#CEA472] transition-colors">
              工具箱
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-[#CEA472]/10 text-sm text-[#FFFFFF]/40">
            <p>© 2024 Tobi Lou. All rights reserved.</p>
            <p className="mt-2">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#CEA472] transition-colors">
                沪ICP备2026010449号-1
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 自定义样式 */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
