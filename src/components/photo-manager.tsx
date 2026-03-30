'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Photo } from '@/app/api/photos/route';
import {
  Settings,
  Lock,
  Save,
  X,
  GripVertical,
  Loader2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface PhotoManagerProps {
  photos: Photo[];
  onPhotosUpdate: (photos: Photo[]) => void;
}

export function PhotoManager({ photos: initialPhotos, onPhotosUpdate }: PhotoManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [originalPhotos, setOriginalPhotos] = useState<Photo[]>(initialPhotos);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步外部photos（仅在弹窗关闭时同步）
  useEffect(() => {
    if (!isOpen) {
      setPhotos(initialPhotos);
      setOriginalPhotos(initialPhotos);
      setHasChanges(false);
    }
  }, [initialPhotos, isOpen]);

  // 打开管理界面
  const handleOpenManager = () => {
    setIsPasswordDialogOpen(true);
    setPassword('');
    setPasswordError('');
  };

  // 验证密码
  const handleVerifyPassword = () => {
    if (password === 'tobi7758258') {
      setIsPasswordDialogOpen(false);
      setIsOpen(true);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  // 关闭管理界面
  const handleCloseManager = () => {
    setIsOpen(false);
    setEditingPhoto(null);
  };

  // 上传图片
  const handleUploadImage = async (photoId: number, file: File) => {
    setUploadingId(photoId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', 'tobi7758258');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // 更新照片路径
        const updatedPhotos = photos.map(p =>
          p.id === photoId ? { ...p, image: result.data.path } : p
        );
        setPhotos(updatedPhotos);
        setHasChanges(true);
        
        // 如果正在编辑这张照片，也更新编辑状态
        if (editingPhoto?.id === photoId) {
          setEditingPhoto({ ...editingPhoto, image: result.data.path });
        }
      } else {
        alert('上传失败：' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploadingId(null);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, photoId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImage(photoId, file);
    }
    // 清空input以便重复选择同一文件
    e.target.value = '';
  };

  // 保存所有更改
  const handleSaveAll = async () => {
    // 检查是否有更改
    if (!hasChanges) {
      alert('没有需要保存的更改');
      return;
    }

    // 确保提交完整的9个栏位数据
    const photosToSave = Array.from({ length: 9 }, (_, i) => {
      const photo = photos.find(p => p.order === i + 1);
      return photo || {
        id: i + 1,
        title: '',
        location: '',
        date: '',
        image: '',
        url: '',
        order: i + 1,
      };
    });

    setIsSaving(true);
    console.log('[PhotoManager] Saving photos:', photosToSave.length);
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photosToSave,
          password: 'tobi7758258',
        }),
      });

      console.log('[PhotoManager] Response status:', response.status, response.ok);

      const result = await response.json();
      console.log('[PhotoManager] Response data:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      onPhotosUpdate(photos);
      setOriginalPhotos(photos);
      setHasChanges(false);
      alert('保存成功！');
    } catch (error) {
      console.error('[PhotoManager] Save error:', error);
      const errorMsg = error instanceof Error ? error.message : '网络错误，请重试';
      alert('保存失败：' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // 创建9个固定栏位的数组
    const fixedSlots = Array.from({ length: 9 }, (_, i) => {
      const photo = photos.find(p => p.order === i + 1);
      return photo || {
        id: i + 1,
        title: '',
        location: '',
        date: '',
        image: '',
        url: '',
        order: i + 1,
      };
    });

    // 交换位置
    const newSlots = [...fixedSlots];
    const draggedPhoto = newSlots[draggedIndex];
    newSlots.splice(draggedIndex, 1);
    newSlots.splice(index, 0, draggedPhoto);
    
    // 更新order并过滤掉空照片
    const updatedPhotos = newSlots
      .filter(p => p.title || p.image || p.imageUrl)
      .map((p, i) => ({ ...p, order: i + 1 }));
    
    setPhotos(updatedPhotos);
    setHasChanges(true);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      {/* 管理按钮 */}
      <Button
        onClick={handleOpenManager}
        variant="outline"
        size="icon"
        className="absolute right-0 top-0 bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
      >
        <Settings className="w-4 h-4 text-[#CEA472]" />
      </Button>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        id="photo-upload"
      />

      {/* 密码验证弹窗 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#CEA472]">
              <Lock className="w-5 h-5" />
              管理员验证
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#FFFFFF]/80">
                请输入管理密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                placeholder="输入密码..."
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
              >
                取消
              </Button>
              <Button
                onClick={handleVerifyPassword}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 管理界面 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-[#CEA472]">
              <span className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                照片管理
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAll}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {hasChanges ? '保存更改' : '无更改'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseManager}
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#FFFFFF]/60 text-sm">
              拖拽照片卡片可调整顺序，点击图片可上传替换，点击编辑按钮修改详细信息
            </p>

            {/* 照片列表 - 固定显示9个栏位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 9 }, (_, index) => {
                const photo = photos.find(p => p.order === index + 1) || {
                  id: index + 1,
                  title: '',
                  location: '',
                  date: '',
                  image: '',
                  url: '',
                  order: index + 1,
                };
                return (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group relative bg-black/40 border border-[#CEA472]/20 rounded-lg p-4 cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {/* 拖拽手柄 */}
                    <div className="absolute top-2 left-2 text-[#CEA472]/50 group-hover:text-[#CEA472]">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* 序号 */}
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#CEA472]/20 text-[#CEA472] text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    {/* 内容 */}
                    <div className="ml-6 space-y-3">
                      {/* 图片预览+上传 */}
                      <div className="relative w-full aspect-video rounded overflow-hidden border border-[#CEA472]/20 group/img">
                        {photo.image || photo.imageUrl ? (
                          <img
                            src={photo.imageUrl || photo.image}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black/60 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[#CEA472]/30" />
                          </div>
                        )}
                        
                        {/* 上传遮罩 */}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2">
                          {uploadingId === photo.id ? (
                            <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-[#CEA472]" />
                              <span className="text-sm text-[#CEA472]">点击上传替换</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, photo.id)}
                            disabled={uploadingId === photo.id}
                          />
                        </label>
                      </div>

                      {/* 基本信息 */}
                      <div>
                        <h4 className="font-bold text-[#FFFFFF] truncate">{photo.title || '敬请期待'}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#FFFFFF]/60 mt-1">
                          <span>{photo.location || '未设置位置'}</span>
                          <span className="text-[#CEA472]/60">{photo.date || '未设置日期'}</span>
                        </div>
                      </div>

                      {/* 编辑按钮 */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPhoto(photo)}
                        className="w-full border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 text-xs"
                      >
                        编辑详细信息
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑照片弹窗 */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-[#CEA472]">编辑照片信息</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4 py-4">
              {/* 图片预览 */}
              <div className="relative w-full aspect-video rounded overflow-hidden border border-[#CEA472]/20">
                {editingPhoto.image || editingPhoto.imageUrl ? (
                  <img
                    src={editingPhoto.imageUrl || editingPhoto.image}
                    alt={editingPhoto.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/60 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#CEA472]/30" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2">
                  {uploadingId === editingPhoto.id ? (
                    <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#CEA472]" />
                      <span className="text-sm text-[#CEA472]">点击上传替换</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, editingPhoto.id)}
                    disabled={uploadingId === editingPhoto.id}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">标题</Label>
                <Input
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">地点</Label>
                <Input
                  value={editingPhoto.location}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">日期</Label>
                <Input
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  placeholder="如: 2025.01"
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">跳转链接</Label>
                <Input
                  value={editingPhoto.url}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingPhoto(null)}
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                >
                  取消
                </Button>
                <Button
                  onClick={() => {
                    const updatedPhotos = photos.map(p => 
                      p.id === editingPhoto.id ? editingPhoto : p
                    );
                    setPhotos(updatedPhotos);
                    setHasChanges(true);
                    setEditingPhoto(null);
                  }}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  确认修改
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
