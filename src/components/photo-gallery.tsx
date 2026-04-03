'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Calendar, Camera, Upload, Loader2, ChevronLeft, Menu, Home } from 'lucide-react';
import { UnifiedPhotoManager } from '@/components/unified-photo-manager';
import React from 'react';

// 照片类型定义
interface Photo {
  id: number;
  title: string;
  region_id: number;
  date: string;
  year: number;
  image_key: string;
  image_url: string;
  url?: string;
  category: string;
  is_yearly?: boolean;
  created_at: string;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// 地区类型定义
interface Region {
  id: number;
  name: string;
  type: string;
  parentId: number | null;
  children?: Region[];
}

// 生成年份数组 (2026-2011)
const years = Array.from({ length: 16 }, (_, i) => 2026 - i);

// 特殊年份选项
const specialYears = [
  { id: '2001-2010', label: '2001-2010', startYear: 2001, endYear: 2010 },
  { id: '1991-2000', label: '1991-2000', startYear: 1991, endYear: 2000 },
  { id: '-1990', label: '1990及以前', startYear: 0, endYear: 1990 },
];

// 分类列表
const categories = [
  { id: 'friend', name: '朋友' },
  { id: 'family', name: '家庭' },
  { id: 'work', name: '工作' },
  { id: 'personal', name: '个人' },
];

interface PhotoGalleryProps {
  forceCategory?: string; // 强制分类，不可更改
  pageTitle?: string; // 页面标题
  showCategoryFilter?: boolean; // 是否显示分类筛选
  showBackToMain?: boolean; // 是否显示返回主照片页按钮
}

export function PhotoGallery({ 
  forceCategory, 
  pageTitle,
  showCategoryFilter = true,
  showBackToMain = false
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number | 'all' | string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    // 如果有强制分类，使用强制分类
    if (forceCategory && categories.some(c => c.id === forceCategory)) {
      return [forceCategory];
    }
    return [];
  });
  
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 加载地区数据
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch('/api/regions?type=china');
        const data = await response.json();
        if (data.success && data.data) {
          const provinces = data.data.filter((r: Region) => !r.parentId);
          setRegions(provinces);
        }
      } catch (error) {
        console.error('加载地区失败:', error);
      }
    };
    loadRegions();
  }, []);

  // 从数据库加载照片
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/api/gallery/photos');
        const data = await response.json();
        if (data.photos) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error('加载照片失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, []);

  // 清空所有筛选
  const clearAllFilters = () => {
    setSelectedYear('all');
    // 如果有强制分类，不清空分类
    if (!forceCategory) {
      setSelectedCategories([]);
    }
  };

  // 切换分类筛选
  const toggleCategoryFilter = (categoryId: string) => {
    // 如果有强制分类，不允许更改
    if (forceCategory) return;
    
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(c => c !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // 按年份和分类筛选照片
  const filteredPhotos = photos.filter(photo => {
    let matchYear = true;
    
    if (selectedYear === 'all') {
      matchYear = true;
    } else if (typeof selectedYear === 'number') {
      matchYear = photo.year === selectedYear;
    } else {
      const special = specialYears.find(s => s.id === selectedYear);
      if (special) {
        if (special.id === '-1989') {
          matchYear = (photo.year || 0) <= 1989;
        } else {
          matchYear = (photo.year || 0) >= special.startYear && (photo.year || 0) <= special.endYear;
        }
      }
    }
    
    const matchCategory = selectedCategories.length === 0 ? true : 
      selectedCategories.some(cat => (photo.category || '').split(',').includes(cat));
    return matchYear && matchCategory;
  }).sort((a, b) => {
    // 排序逻辑：同年内，月份照片按日期降序，年度相册排在最后
    // 1. 先按年份降序
    if (b.year !== a.year) {
      return b.year - a.year;
    }
    // 2. 同年内，年度相册排在最后
    if (a.is_yearly && !b.is_yearly) return 1;
    if (!a.is_yearly && b.is_yearly) return -1;
    // 3. 都是月份照片或都是年度相册，按日期降序
    return b.date.localeCompare(a.date);
  });

  // 获取指定年份的照片数量
  const getYearCount = (year: number) => {
    return photos.filter(photo => {
      const matchYear = photo.year === year;
      const matchCategory = selectedCategories.length === 0 ? true : 
        selectedCategories.some(cat => (photo.category || '').split(',').includes(cat));
      return matchYear && matchCategory;
    }).length;
  };

  // 获取特殊年份范围的照片数量
  const getSpecialYearCount = (specialId: string) => {
    const special = specialYears.find(s => s.id === specialId);
    if (!special) return 0;
    
    return photos.filter(photo => {
      let matchYear = false;
      if (special.id === '-1989') {
        matchYear = (photo.year || 0) <= 1989;
      } else {
        matchYear = (photo.year || 0) >= special.startYear && (photo.year || 0) <= special.endYear;
      }
      const matchCategory = selectedCategories.length === 0 ? true : 
        selectedCategories.some(cat => (photo.category || '').split(',').includes(cat));
      return matchYear && matchCategory;
    }).length;
  };

  // 获取地区名称
  const getRegionName = (photo: Photo) => {
    return photo.region?.name || '未知地点';
  };

  // 格式化日期显示
  const formatDate = (dateStr: string, isYearly?: boolean) => {
    const [year, month] = dateStr.split('-');
    // 年度相册或月份为00时只显示年份
    if (isYearly || month === '00') {
      return `${year}年`;
    }
    return `${year}年${month}月`;
  };

  // 获取页面标题
  const getTitle = () => {
    if (pageTitle) return pageTitle;
    if (selectedCategories.length === 1) {
      const cat = categories.find(c => c.id === selectedCategories[0]);
      return cat ? `照片集 · ${cat.name}` : '照片集';
    }
    return '照片集';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* 背景图 */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/assets/background.jpg"
          alt="背景"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 border-b border-[#CEA472]/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 返回按钮 */}
                <button
                  onClick={() => window.location.href = '/'}
                  className="p-1.5 rounded-md text-[#CEA472] hover:bg-[#CEA472]/20 transition-colors"
                  title="返回主页"
                >
                  <Home className="w-5 h-5" />
                </button>
                {showBackToMain && (
                  <>
                    <span className="text-[#CEA472]/30">|</span>
                    <button
                      onClick={() => window.location.href = '/photos'}
                      className="p-1.5 rounded-md text-[#CEA472] hover:bg-[#CEA472]/20 transition-colors"
                      title="返回照片集"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
                <span className="text-[#CEA472]/30">|</span>
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-[#CEA472]" />
                  <h1 className="text-2xl font-bold text-white tracking-wide">{getTitle()}</h1>
                </div>
              </div>
              {/* 管理按钮 */}
              <UnifiedPhotoManager onPhotoAdded={() => {
                const loadPhotos = async () => {
                  const response = await fetch('/api/gallery/photos');
                  const data = await response.json();
                  if (data.photos) setPhotos(data.photos);
                };
                loadPhotos();
              }} />
            </div>
          </div>
        </header>

        <div className="flex relative">
          {/* 时间轴切换按钮 - 移动端 */}
          {!isTimelineVisible && (
            <button
              onClick={() => setIsTimelineVisible(true)}
              className="lg:hidden fixed left-0 top-24 z-30 bg-[#CEA472] text-[#0a0a0f] p-1.5 rounded-r-lg shadow-lg"
              title="显示时间轴"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* 左侧时间轴 */}
          <aside className={`min-h-[calc(100vh-73px)] sticky top-[73px] self-start transition-all duration-300 overflow-hidden ${
            isTimelineVisible ? 'w-48' : 'w-0 lg:w-48'
          }`}>
            <div className={`relative h-full py-6 w-48 ${isTimelineVisible ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}>
              {isTimelineVisible && (
                <button
                  onClick={() => setIsTimelineVisible(false)}
                  className="lg:hidden absolute right-2 top-0 z-10 p-1 rounded text-gray-400 hover:text-[#CEA472] transition-colors"
                  title="隐藏时间轴"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              
              <div className="relative h-full flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
                
                <div className="flex-1 overflow-y-auto px-2 py-8" style={{ scrollbarWidth: 'none' }}>
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#CEA472]/20" />
                  
                  {/* 全部按钮 */}
                  <div className="relative pl-10 mb-3">
                    <button
                      onClick={clearAllFilters}
                      className={`flex items-center gap-2 transition-all text-sm ${
                        selectedYear === 'all' && selectedCategories.length === (forceCategory ? 1 : 0)
                          ? 'text-[#CEA472] font-medium'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                        selectedYear === 'all' && selectedCategories.length === (forceCategory ? 1 : 0)
                          ? 'bg-[#CEA472] border-[#CEA472]'
                          : 'bg-[#0a0a0f] border-[#CEA472]/50'
                      }`} />
                      <span>全部</span>
                    </button>
                  </div>

                  {/* 年份列表 */}
                  <div className="space-y-1 mb-2">
                    {years.map((year) => {
                      const count = getYearCount(year);
                      const isActive = selectedYear === year;
                      const hasPhotos = count > 0;
                      
                      return (
                        <div key={year} className="relative pl-10 group/item">
                          <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                            isActive ? 'bg-[#CEA472] border-[#CEA472] scale-110'
                              : hasPhotos ? 'bg-[#0a0a0f] border-[#CEA472]/50 group-hover/item:border-[#CEA472] group-hover/item:scale-110'
                              : 'bg-[#0a0a0f] border-gray-700'
                          }`} />
                          <button
                            onClick={() => hasPhotos && setSelectedYear(year)}
                            disabled={!hasPhotos}
                            className={`flex items-center justify-between w-full py-0.5 transition-all text-sm ${
                              isActive ? 'text-[#CEA472] font-medium'
                                : hasPhotos ? 'text-gray-400 hover:text-white'
                                : 'text-gray-700 cursor-not-allowed'
                            }`}
                          >
                            <span>{year}</span>
                            {hasPhotos && <span className={`text-xs ${isActive ? 'text-[#CEA472]' : 'text-gray-500'}`}>{count}</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* 特殊年份 */}
                  {specialYears.map((special) => {
                    const count = getSpecialYearCount(special.id);
                    const isActive = selectedYear === special.id;
                    const hasPhotos = count > 0;
                    
                    return (
                      <div key={special.id} className="relative pl-10">
                        <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                          isActive ? 'bg-[#CEA472] border-[#CEA472] scale-110'
                            : hasPhotos ? 'bg-[#0a0a0f] border-[#CEA472]/50'
                            : 'bg-[#0a0a0f] border-gray-700'
                        }`} />
                        <button
                          onClick={() => hasPhotos && setSelectedYear(special.id)}
                          disabled={!hasPhotos}
                          className={`flex items-center justify-between w-full py-0.5 transition-all text-sm ${
                            isActive ? 'text-[#CEA472] font-medium'
                              : hasPhotos ? 'text-gray-500 hover:text-gray-300'
                              : 'text-gray-700 cursor-not-allowed'
                          }`}
                        >
                          <span>{special.label}</span>
                          {hasPhotos && <span className="text-xs text-gray-500">{count}</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
              </div>
            </div>
          </aside>

          {/* 右侧内容区 */}
          <main className="flex-1 p-6">
            {/* 分类筛选栏 */}
            {showCategoryFilter && !forceCategory && (
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-400">分类：</span>
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategories.length === 0
                      ? 'bg-[#CEA472] text-[#0a0a0f] font-medium'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  全部
                </button>
                <span className="text-[#CEA472]/30">|</span>
                {categories.map((cat) => {
                  const isActive = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryFilter(cat.id)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                        isActive ? 'bg-[#CEA472] text-[#0a0a0f] font-medium'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 标题 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {selectedYear === 'all' ? '全部照片' : 
                  typeof selectedYear === 'number' ? `${selectedYear}年` :
                  specialYears.find(s => s.id === selectedYear)?.label || '照片集'
                }
              </h2>
            </div>

            {/* 照片网格 */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Camera className="w-12 h-12 mb-4 opacity-50" />
                <p>暂无照片</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredPhotos.map((photo) => (
                  <Card 
                    key={photo.id} 
                    className="group border border-[#CEA472]/10 bg-black/40 backdrop-blur-sm hover:border-[#CEA472]/50 hover:bg-black/60 transition-all duration-500 cursor-pointer overflow-hidden"
                    onClick={() => {
                      if (photo.url) {
                        window.open(photo.url, '_blank');
                      }
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={photo.image_url}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {photo.category && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {photo.category.split(',').map((catId) => {
                            const cat = categories.find(c => c.id === catId);
                            if (!cat) return null;
                            return (
                              <span key={catId} className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-[#CEA472] backdrop-blur-sm">
                                {cat.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <h4 className="text-white font-bold text-lg">{photo.title}</h4>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 bg-gradient-to-r from-black/60 to-black/40">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <MapPin className="w-4 h-4 text-[#CEA472] flex-shrink-0" />
                          <span className="line-clamp-1">{getRegionName(photo)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="w-4 h-4 text-[#CEA472] flex-shrink-0" />
                          <span>{formatDate(photo.date, photo.is_yearly)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
