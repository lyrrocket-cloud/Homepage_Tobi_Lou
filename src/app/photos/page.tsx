'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, ChevronRight, Camera, Upload, Loader2, Check, Lock, Settings, Trash2, Edit, Pencil, Home, ChevronLeft, Menu } from 'lucide-react';

// 照片类型定义
interface Photo {
  id: number;
  title: string;
  location: string;
  date: string;
  year: number;
  image_key: string;
  image_url: string;
  url?: string;
  category: string;
  created_at: string;
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
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number | 'all' | string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true); // 时间轴显示状态
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
    location: string;
    yearMonth: string;
    image: string;
    imageKey: string;
    url: string;
    categories: string[];
  }>({
    title: '',
    location: '',
    yearMonth: '',
    image: '',
    imageKey: '',
    url: '',
    categories: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  // 初始化加载照片
  useEffect(() => {
    loadPhotos();
  }, []);

  // 清空所有筛选
  const clearAllFilters = () => {
    setSelectedYear('all');
    setSelectedCategories([]);
  };

  // 检查是否已筛选
  const hasActiveFilters = selectedYear !== 'all' || selectedCategories.length > 0;

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

  // 切换照片分类标签（添加照片表单）
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
          location: editingPhoto.location,
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
  const filteredPhotos = photos
    .filter(photo => {
      let matchYear = true;
      
      if (selectedYear === 'all') {
        matchYear = true;
      } else if (typeof selectedYear === 'number') {
        matchYear = photo.year === selectedYear;
      } else {
        // 特殊年份范围
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
    if (!newPhoto.title || !newPhoto.location || !newPhoto.yearMonth || !newPhoto.image || newPhoto.categories?.length === 0) return;

    setIsSaving(true);

    try {
      const year = parseInt(newPhoto.yearMonth.split('-')[0]);
      
      // 将多个分类合并为逗号分隔的字符串
      const categoryString = newPhoto.categories.join(',');
      
      await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPhoto.title,
          location: newPhoto.location,
          date: newPhoto.yearMonth,
          year: year,
          imageKey: newPhoto.imageKey,
          imageUrl: newPhoto.image,
          url: newPhoto.url || null,
          category: categoryString,
        }),
      });

      // 重新加载照片列表
      await loadPhotos();
      
      // 重置表单
      setNewPhoto({
        title: '',
        location: '',
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
        // 重新加载照片列表
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
        {/* 深色遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10">
        {/* 顶部导航 - 置顶 */}
        <header className="sticky top-0 z-50 border-b border-[#CEA472]/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 返回主页按钮 */}
                <a
                  href="https://96vw3m4rvp.coze.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-[#CEA472] hover:bg-white/5 transition-colors"
                  title="返回主页"
                >
                  <Home className="w-5 h-5" />
                </a>
                {/* 分隔符 */}
                <span className="text-[#CEA472]/30">|</span>
                {/* 标题 */}
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-[#CEA472]" />
                  <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'PangMenZhengDao, sans-serif' }}>
                    照片集
                  </h1>
                </div>
              </div>

              {/* 管理按钮 */}
              <Button
                onClick={handleOpenManage}
                variant="outline"
                className="gap-2 border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
              >
                <Settings className="w-4 h-4" />
                管理
              </Button>
            </div>
          </div>
        </header>

        <div className="flex relative">
          {/* 时间轴切换按钮 - 移动端收起时显示 */}
          {!isTimelineVisible && (
            <button
              onClick={() => setIsTimelineVisible(true)}
              className="lg:hidden fixed left-0 top-24 z-30 bg-[#CEA472] text-[#0a0a0f] p-1.5 rounded-r-lg shadow-lg"
              title="显示时间轴"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* 左侧时间轴 - 坐标轴样式 */}
          <aside className={`min-h-[calc(100vh-73px)] sticky top-[73px] self-start transition-all duration-300 overflow-hidden ${
            isTimelineVisible ? 'w-48' : 'w-0 lg:w-48'
          }`}>
            <div className={`relative h-full py-6 w-48 ${isTimelineVisible ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}>
              {/* 时间轴切换按钮 - 移动端展开时显示 */}
              {isTimelineVisible && (
                <button
                  onClick={() => setIsTimelineVisible(false)}
                  className="lg:hidden absolute right-2 top-0 z-10 p-1 rounded text-gray-400 hover:text-[#CEA472] transition-colors"
                  title="隐藏时间轴"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              
              {/* 滚轴式时间轴 */}
              <div className="relative h-full flex flex-col">
                {/* 顶部渐变遮罩 */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
                
                {/* 滚动区域 */}
                <div className="flex-1 overflow-y-auto px-2 py-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* 坐标轴竖线 */}
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

                  {/* 近期年份（2026-2010） */}
                  <div className="space-y-1 mb-2">
                    {years.map((year) => {
                      const count = getYearCount(year);
                      const isActive = selectedYear === year;
                      const hasPhotos = count > 0;
                      
                      return (
                        <div key={year} className="relative pl-10 group/item">
                          <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                            isActive
                              ? 'bg-[#CEA472] border-[#CEA472] scale-110'
                              : hasPhotos
                                ? 'bg-[#0a0a0f] border-[#CEA472]/50 group-hover/item:border-[#CEA472] group-hover/item:scale-110'
                                : 'bg-[#0a0a0f] border-gray-700'
                          }`} />
                          <button
                            onClick={() => hasPhotos && setSelectedYear(year)}
                            disabled={!hasPhotos}
                            className={`flex items-center justify-between w-full py-0.5 transition-all text-sm ${
                              isActive
                                ? 'text-[#CEA472] font-medium'
                                : hasPhotos
                                  ? 'text-gray-400 hover:text-white'
                                  : 'text-gray-700 cursor-not-allowed'
                            }`}
                          >
                            <span>{year}</span>
                            {hasPhotos && (
                              <span className={`text-xs ${isActive ? 'text-[#CEA472]' : 'text-gray-500'}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* 可展开的特殊年份范围 */}
                  {specialYears.map((special) => {
                    const count = getSpecialYearCount(special.id);
                    const isActive = selectedYear === special.id;
                    const hasPhotos = count > 0;
                    // 生成年份列表
                    const yearList = special.id === '-1990' 
                      ? Array.from({ length: 10 }, (_, i) => 1990 - i) // 1990-1981
                      : Array.from({ length: 10 }, (_, i) => special.endYear - i);
                    
                    return (
                      <div key={special.id} className="relative group/expand mb-1">
                        {/* 主节点 */}
                        <div className="relative pl-10">
                          <span className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                            isActive
                              ? 'bg-[#CEA472] border-[#CEA472] scale-110'
                              : hasPhotos
                                ? 'bg-[#0a0a0f] border-[#CEA472]/50 group-hover/expand:border-[#CEA472] group-hover/expand:scale-110'
                                : 'bg-[#0a0a0f] border-gray-700'
                          }`} />
                          <button
                            onClick={() => hasPhotos && setSelectedYear(special.id)}
                            disabled={!hasPhotos}
                            className={`flex items-center justify-between w-full py-0.5 transition-all text-sm ${
                              isActive
                                ? 'text-[#CEA472] font-medium'
                                : hasPhotos
                                  ? 'text-gray-500 hover:text-gray-300'
                                  : 'text-gray-700 cursor-not-allowed'
                            }`}
                          >
                            <span>{special.label}</span>
                            {hasPhotos && (
                              <span className="text-xs text-gray-500">{count}</span>
                            )}
                          </button>
                        </div>
                        
                        {/* 悬停展开的子年份 */}
                        <div className="max-h-0 overflow-hidden group-hover/expand:max-h-96 transition-all duration-300 ease-out">
                          <div className="pl-14 space-y-0.5 pt-1">
                            {yearList.map((year) => {
                              const yearCount = getYearCount(year);
                              const yearActive = selectedYear === year;
                              const yearHasPhotos = yearCount > 0;
                              
                              return (
                                <div key={year} className="relative group/sub">
                                  {/* 子节点连接线 */}
                                  <div className="absolute left-[-8px] top-1/2 w-3 h-px bg-[#CEA472]/20" />
                                  <span className={`absolute left-0 w-2 h-2 rounded-full border transition-all ${
                                    yearActive
                                      ? 'bg-[#CEA472] border-[#CEA472]'
                                      : yearHasPhotos
                                        ? 'bg-[#0a0a0f] border-[#CEA472]/40 group-hover/sub:border-[#CEA472]'
                                        : 'bg-[#0a0a0f] border-gray-700'
                                  }`} />
                                  <button
                                    onClick={() => yearHasPhotos && setSelectedYear(year)}
                                    disabled={!yearHasPhotos}
                                    className={`flex items-center justify-between w-full py-0.5 pl-4 transition-all text-xs ${
                                      yearActive
                                        ? 'text-[#CEA472] font-medium'
                                        : yearHasPhotos
                                          ? 'text-gray-500 hover:text-gray-300'
                                          : 'text-gray-700 cursor-not-allowed'
                                    }`}
                                  >
                                    <span>{year}</span>
                                    {yearHasPhotos && (
                                      <span className="text-xs text-gray-600">{yearCount}</span>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 底部渐变遮罩 */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
              </div>
            </div>
          </aside>

          {/* 右侧内容区 */}
          <main className="flex-1 p-6">
            {/* 分类筛选栏 */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-400">分类：</span>
              {/* 全部按钮 */}
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
              {/* 分隔符 */}
              <span className="text-[#CEA472]/30">|</span>
              {categories.map((cat) => {
                const isActive = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategoryFilter(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                      isActive
                        ? 'bg-[#CEA472] text-[#0a0a0f] font-medium'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* 标题区域 */}
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
                    {/* 图片区域 */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={photo.image_url}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* 右上角分类标签 - 悬停显示 */}
                      {photo.category && (
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {photo.category.split(',').map((catId) => {
                            const cat = categories.find(c => c.id === catId);
                            if (!cat) return null;
                            return (
                              <span
                                key={catId}
                                className="px-2 py-0.5 text-xs rounded-full bg-black/60 text-[#CEA472] backdrop-blur-sm"
                              >
                                {cat.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* 悬停渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* 悬停标题动画 */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <h4 className="text-white font-bold text-lg">{photo.title}</h4>
                      </div>
                    </div>
                    
                    {/* 信息区域 */}
                    <CardContent className="p-4 bg-gradient-to-r from-black/60 to-black/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <MapPin className="w-4 h-4 text-[#CEA472]" />
                          <span className="line-clamp-1">{photo.location}</span>
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
        <DialogContent className="sm:max-w-md bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#CEA472]" />
              请输入管理密码
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className={`bg-white/5 border-white/10 text-white ${passwordError ? 'border-red-500' : ''}`}
            />
            {passwordError && (
              <p className="text-red-500 text-sm">密码错误，请重试</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordOpen(false)}
              className="border-white/10 text-gray-400 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="bg-[#CEA472] text-[#0a0a0f] hover:bg-[#CEA472]/90"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 管理面板弹窗 */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#CEA472]" />
              照片管理
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              添加新照片或管理现有照片
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* 添加照片区域 */}
            <div className="border border-[#CEA472]/20 rounded-lg p-4">
              <h3 className="text-[#CEA472] font-medium mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                添加新照片
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 图片上传 */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">照片 *</Label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                      size="sm"
                      className="border-dashed border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          选择图片
                        </>
                      )}
                    </Button>
                    {newPhoto.image && (
                      <div className="relative w-12 h-12 rounded overflow-hidden">
                        <Image src={newPhoto.image} alt="预览" fill className="object-cover" />
                        <div className="absolute top-0 right-0 bg-green-500 rounded-bl p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 标题 */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">标题 *</Label>
                  <Input
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    placeholder="输入照片标题"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9"
                  />
                </div>

                {/* 地点 */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">地点 *</Label>
                  <Input
                    value={newPhoto.location}
                    onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                    placeholder="例如：北京"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9"
                  />
                </div>

                {/* 日期 */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">日期 *</Label>
                  <Input
                    type="month"
                    value={newPhoto.yearMonth}
                    onChange={(e) => setNewPhoto({ ...newPhoto, yearMonth: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>

                {/* 分类 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-white text-sm">分类 *</Label>
                    <span className="text-xs text-[#CEA472] bg-[#CEA472]/10 px-2 py-0.5 rounded">可多选</span>
                    {newPhoto.categories.length > 0 && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        已选 {newPhoto.categories.length} 个
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const isSelected = newPhoto.categories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => togglePhotoCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#CEA472] text-[#0a0a0f] font-semibold shadow-lg shadow-[#CEA472]/20'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 外部链接 */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">外部链接（可选）</Label>
                  <Input
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddPhoto}
                  disabled={isSaving || !newPhoto.title || !newPhoto.location || !newPhoto.yearMonth || !newPhoto.image || !newPhoto.imageKey || newPhoto.categories.length === 0}
                  className="bg-[#CEA472] text-[#0a0a0f] hover:bg-[#CEA472]/90"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      添加照片
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 照片列表区域 */}
            <div className="border border-[#CEA472]/20 rounded-lg p-4">
              <h3 className="text-[#CEA472] font-medium mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                现有照片 ({photos.length})
              </h3>
              
              {photos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无照片</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <Image
                        src={photo.image_url}
                        alt={photo.title}
                        fill
                        className="object-cover"
                      />
                      {/* 信息显示 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                        <p className="text-gray-300 text-xs">{photo.location} · {photo.date}</p>
                      </div>
                      {/* 操作按钮 - 始终显示 */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(photo)}
                          className="p-2 bg-[#CEA472] rounded-lg text-[#0a0a0f] hover:bg-[#CEA472]/80 transition-colors shadow-lg"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors shadow-lg"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsManageOpen(false)}
              className="bg-[#CEA472] text-[#0a0a0f] hover:bg-[#CEA472]/90"
            >
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑照片弹窗 */}
      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#CEA472]" />
              编辑照片
            </DialogTitle>
          </DialogHeader>
          
          {editingPhoto && (
            <div className="space-y-4 py-4">
              {/* 图片预览和上传 */}
              <div className="space-y-2">
                <Label className="text-white">照片</Label>
                <div className="flex items-center gap-4">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <Image
                      src={editingPhoto.image_url}
                      alt="预览"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploading}
                    variant="outline"
                    size="sm"
                    className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      '更换图片'
                    )}
                  </Button>
                </div>
              </div>

              {/* 标题 */}
              <div className="space-y-2">
                <Label className="text-white">标题 *</Label>
                <Input
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  placeholder="输入照片标题"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* 地点 */}
              <div className="space-y-2">
                <Label className="text-white">地点 *</Label>
                <Input
                  value={editingPhoto.location}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                  placeholder="例如：北京"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* 日期 */}
              <div className="space-y-2">
                <Label className="text-white">日期 *</Label>
                <Input
                  type="month"
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* 分类 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-white">分类 *</Label>
                  <span className="text-xs text-[#CEA472] bg-[#CEA472]/10 px-2 py-0.5 rounded">可多选</span>
                  {editingPhoto.category && editingPhoto.category.split(',').filter(Boolean).length > 0 && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      已选 {editingPhoto.category.split(',').filter(Boolean).length} 个
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const currentCategories = editingPhoto.category ? editingPhoto.category.split(',') : [];
                    const isSelected = currentCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleEditPhotoCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#CEA472] text-[#0a0a0f] font-semibold shadow-lg shadow-[#CEA472]/20'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 外部链接 */}
              <div className="space-y-2">
                <Label className="text-white">外部链接（可选）</Label>
                <Input
                  value={editingPhoto.url || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditPhotoOpen(false);
                setEditingPhoto(null);
              }}
              className="border-white/10 text-gray-400 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdatePhoto}
              disabled={isSaving || !editingPhoto?.title || !editingPhoto?.location || !editingPhoto?.date}
              className="bg-[#CEA472] text-[#0a0a0f] hover:bg-[#CEA472]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存修改'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
