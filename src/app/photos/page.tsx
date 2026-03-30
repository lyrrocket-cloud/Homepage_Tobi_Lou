'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, ChevronRight, Camera, Upload, Loader2, Check, Lock, Settings, Trash2, Edit, Home, ChevronLeft, Menu } from 'lucide-react';
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

// 管理密码
const ADMIN_PASSWORD = 'tobi7758258';

export default function PhotoGallery() {
  // 照片数据
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number | 'all' | string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState<{
    title: string;
    regionId: number | null;
    yearMonth: string;
    image: string;
    imageKey: string;
    url: string;
    categories: string[];
  }>({
    title: '',
    regionId: null,
    yearMonth: '',
    image: '',
    imageKey: '',
    url: '',
    categories: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // 加载地区数据（只加载中国省份一级）
  const loadRegions = async () => {
    try {
      const response = await fetch('/api/regions?type=china');
      const data = await response.json();
      if (data.success && data.data) {
        // 只保留省一级（parent_id 为 null）
        const provinces = data.data.filter((r: Region) => !r.parentId);
        setRegions(provinces);
      }
    } catch (error) {
      console.error('加载地区失败:', error);
    }
  };

  // 从数据库加载照片
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

  // 初始化加载
  useEffect(() => {
    loadRegions();
    loadPhotos();
  }, []);

  // 清空所有筛选
  const clearAllFilters = () => {
    setSelectedYear('all');
    setSelectedCategories([]);
  };

  // 切换分类筛选
  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(c => c !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // 切换照片分类标签
  const togglePhotoCategory = (categoryId: string) => {
    setNewPhoto(prev => ({
      ...prev,
      categories: prev.categories?.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...(prev.categories || []), categoryId]
    }));
  };

  // 切换编辑照片的分类标签
  const toggleEditPhotoCategory = (categoryId: string) => {
    if (!editingPhoto) return;
    const currentCategories = editingPhoto.category ? editingPhoto.category.split(',') : [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(c => c !== categoryId)
      : [...currentCategories, categoryId];
    setEditingPhoto({ ...editingPhoto, category: newCategories.join(',') });
  };

  // 验证密码
  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setPasswordError(false);
      setPassword('');
      setIsPasswordOpen(false);
      setIsManageOpen(true);
    } else {
      setPasswordError(true);
    }
  };

  // 打开管理面板
  const handleOpenManage = () => {
    setPassword('');
    setPasswordError(false);
    setIsPasswordOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (photo: Photo) => {
    setEditingPhoto({
      ...photo,
      image_url: photo.image_url,
    });
    setIsEditPhotoOpen(true);
  };

  // 编辑照片图片上传
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setEditingPhoto(prev => prev ? ({
          ...prev,
          image_url: data.url,
          image_key: data.key,
        }) : null);
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 更新照片
  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/gallery/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPhoto.id,
          title: editingPhoto.title,
          regionId: editingPhoto.region_id,
          date: editingPhoto.date,
          year: parseInt(editingPhoto.date.split('-')[0]),
          imageKey: editingPhoto.image_key,
          imageUrl: editingPhoto.image_url,
          url: editingPhoto.url || null,
          category: editingPhoto.category,
        }),
      });

      if (response.ok) {
        await loadPhotos();
        setIsEditPhotoOpen(false);
        setEditingPhoto(null);
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('更新照片失败:', error);
      alert('更新照片失败，请重试');
    } finally {
      setIsSaving(false);
    }
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
  });

  // 获取指定年份的照片数量
  const getYearCount = (year: number) => {
    return photos.filter(photo => photo.year === year).length;
  };

  // 获取特殊年份范围的照片数量
  const getSpecialYearCount = (specialId: string) => {
    const special = specialYears.find(s => s.id === specialId);
    if (!special) return 0;
    
    return photos.filter(photo => {
      if (special.id === '-1989') {
        return (photo.year || 0) <= 1989;
      }
      return (photo.year || 0) >= special.startYear && (photo.year || 0) <= special.endYear;
    }).length;
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setNewPhoto(prev => ({
          ...prev,
          image: data.url,
          imageKey: data.key,
        }));
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 添加照片到数据库
  const handleAddPhoto = async () => {
    if (!newPhoto.title || !newPhoto.regionId || !newPhoto.yearMonth || !newPhoto.image || newPhoto.categories?.length === 0) return;

    setIsSaving(true);

    try {
      const year = parseInt(newPhoto.yearMonth.split('-')[0]);
      const categoryString = newPhoto.categories.join(',');
      
      await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPhoto.title,
          regionId: newPhoto.regionId,
          date: newPhoto.yearMonth,
          year: year,
          imageKey: newPhoto.imageKey,
          imageUrl: newPhoto.image,
          url: newPhoto.url || null,
          category: categoryString,
        }),
      });

      await loadPhotos();
      
      setNewPhoto({
        title: '',
        regionId: null,
        yearMonth: '',
        image: '',
        imageKey: '',
        url: '',
        categories: [],
      });
      setIsAddPhotoOpen(false);
    } catch (error) {
      console.error('添加照片失败:', error);
      alert('添加照片失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 删除照片
  const handleDeletePhoto = async (id: number) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const response = await fetch(`/api/gallery/photos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadPhotos();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      alert('删除照片失败');
    }
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${year}年${month}月`;
  };

  // 获取地区名称
  const getRegionName = (photo: Photo) => {
    return photo.region?.name || '未知地点';
  };

  // 渲染地区选择器选项（只显示省份）
  const renderRegionOptions = (regionList: Region[]): React.ReactNode[] => {
    return regionList.map(region => (
      <option key={region.id} value={region.id}>
        {region.name}
      </option>
    ));
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
                {/* 返回主页按钮 */}
                <button
                  onClick={() => window.location.href = '/'}
                  className="p-1.5 rounded-md text-[#CEA472] hover:bg-[#CEA472]/20 transition-colors"
                  title="返回主页"
                >
                  <Home className="w-5 h-5" />
                </button>
                <span className="text-[#CEA472]/30">|</span>
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-[#CEA472]" />
                  <h1 className="text-2xl font-bold text-white tracking-wide">照片集</h1>
                </div>
              </div>
              {/* 管理按钮 */}
              <button
                onClick={handleOpenManage}
                className="p-1.5 rounded-md text-[#CEA472] hover:bg-[#CEA472]/20 transition-colors"
                title="管理照片"
              >
                <Settings className="w-5 h-5" />
              </button>
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
                        selectedYear === 'all' && selectedCategories.length === 0
                          ? 'text-[#CEA472] font-medium'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                        selectedYear === 'all' && selectedCategories.length === 0
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

            {/* 标题 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {selectedYear === 'all' ? '全部照片' : 
                  typeof selectedYear === 'number' ? `${selectedYear}年` :
                  specialYears.find(s => s.id === selectedYear)?.label || '照片集'
                }
                {selectedCategories.length > 0 && (
                  <span className="text-[#CEA472]">
                    · {selectedCategories.map(c => categories.find(cat => cat.id === c)?.name).join('、')}
                  </span>
                )}
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
                <p className="text-sm mt-1">点击右上角"管理"添加照片</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <MapPin className="w-4 h-4 text-[#CEA472]" />
                          <span className="line-clamp-1">{getRegionName(photo)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="w-4 h-4 text-[#CEA472]" />
                          <span>{formatDate(photo.date)}</span>
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

      {/* 密码验证弹窗 */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#CEA472]">
              <Lock className="w-5 h-5" />
              管理员验证
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photo-password" className="text-[#FFFFFF]/80">
                请输入管理密码
              </Label>
              <Input
                id="photo-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="输入密码..."
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
              {passwordError && (
                <p className="text-red-400 text-sm">密码错误，请重试</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
              >
                取消
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 管理弹窗 */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#CEA472]" />
              照片管理
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 添加照片按钮 */}
            <Button
              onClick={() => {
                setIsAddPhotoOpen(true);
              }}
              className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加照片
            </Button>

            {/* 照片列表 */}
            <div className="space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-[#CEA472]/10">
                  <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                    <Image src={photo.image_url} alt={photo.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{photo.title}</h4>
                    <p className="text-gray-400 text-sm">{getRegionName(photo)} · {formatDate(photo.date)}</p>
                    <div className="flex gap-1 mt-1">
                      {photo.category?.split(',').map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        return cat ? <span key={catId} className="text-xs text-[#CEA472]">{cat.name}</span> : null;
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(photo)} className="border-[#CEA472]/30 text-[#CEA472]">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePhoto(photo.id)} className="border-red-500/30 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加照片弹窗 */}
      <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white">添加照片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">照片标题</Label>
              <Input
                value={newPhoto.title}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/40 border-[#CEA472]/30 text-white"
                placeholder="请输入标题"
              />
            </div>

            <div>
              <Label className="text-gray-400">地点</Label>
              <select
                value={newPhoto.regionId || ''}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, regionId: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
              >
                <option value="">请选择地点</option>
                {renderRegionOptions(regions)}
              </select>
            </div>

            <div>
              <Label className="text-gray-400">日期（年-月）</Label>
              <Input
                type="month"
                value={newPhoto.yearMonth}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, yearMonth: e.target.value }))}
                className="bg-black/40 border-[#CEA472]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-400">分类</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => togglePhotoCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      newPhoto.categories?.includes(cat.id)
                        ? 'bg-[#CEA472] text-[#0a0a0f]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-400">照片</Label>
              <div className="mt-2">
                {newPhoto.image ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image src={newPhoto.image} alt="预览" fill className="object-cover" />
                    <button
                      onClick={() => setNewPhoto(prev => ({ ...prev, image: '', imageKey: '' }))}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#CEA472]/30 rounded-lg cursor-pointer hover:border-[#CEA472]/50 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#CEA472]/50" />
                        <span className="text-gray-400 text-sm mt-2">点击上传照片</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-400">链接（可选）</Label>
              <Input
                value={newPhoto.url}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, url: e.target.value }))}
                className="bg-black/40 border-[#CEA472]/30 text-white"
                placeholder="点击照片跳转的链接"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddPhotoOpen(false)} className="border-[#CEA472]/30 text-[#CEA472]">
                取消
              </Button>
              <Button
                onClick={handleAddPhoto}
                disabled={isSaving || !newPhoto.title || !newPhoto.regionId || !newPhoto.yearMonth || !newPhoto.image || !newPhoto.categories?.length}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '添加'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑照片弹窗 */}
      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white">编辑照片</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">照片标题</Label>
                <Input
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-400">地点</Label>
                <select
                  value={editingPhoto.region_id || ''}
                  onChange={(e) => setEditingPhoto(prev => prev ? ({ ...prev, region_id: Number(e.target.value) }) : null)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                >
                  <option value="">请选择地点</option>
                  {renderRegionOptions(regions)}
                </select>
              </div>

              <div>
                <Label className="text-gray-400">日期（年-月）</Label>
                <Input
                  type="month"
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-400">分类</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleEditPhotoCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editingPhoto.category?.split(',').includes(cat.id)
                          ? 'bg-[#CEA472] text-[#0a0a0f]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-400">照片</Label>
                <div className="mt-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image src={editingPhoto.image_url} alt="预览" fill className="object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-white" />
                      )}
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">链接（可选）</Label>
                <Input
                  value={editingPhoto.url || ''}
                  onChange={(e) => setEditingPhoto(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditPhotoOpen(false)} className="border-[#CEA472]/30 text-[#CEA472]">
                  取消
                </Button>
                <Button
                  onClick={handleUpdatePhoto}
                  disabled={isSaving}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
