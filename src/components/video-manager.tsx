'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video } from '@/app/api/videos/route';
import {
  Settings,
  Lock,
  Save,
  X,
  GripVertical,
  Loader2,
  Video as VideoIcon,
  Play,
  ExternalLink,
} from 'lucide-react';

interface VideoManagerProps {
  videos: Video[];
  onVideosUpdate: (videos: Video[]) => void;
}

export function VideoManager({ videos: initialVideos, onVideosUpdate }: VideoManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [originalVideos, setOriginalVideos] = useState<Video[]>(initialVideos);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 同步外部videos（仅在弹窗关闭时同步）
  useEffect(() => {
    if (!isOpen) {
      setVideos(initialVideos);
      setOriginalVideos(initialVideos);
      setHasChanges(false);
    }
  }, [initialVideos, isOpen]);

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
    setEditingVideo(null);
  };

  // 保存所有更改
  const handleSaveAll = async () => {
    // 检查是否有更改
    if (!hasChanges) {
      alert('没有需要保存的更改');
      return;
    }

    // 确保提交完整的9个栏位数据
    const videosToSave = Array.from({ length: 9 }, (_, i) => {
      const video = videos.find(v => v.order === i + 1);
      return video || {
        id: i + 1,
        title: '',
        location: '',
        date: '',
        embedUrl: '',
        order: i + 1,
        isEmpty: true,
      };
    });

    setIsSaving(true);
    console.log('[VideoManager] Saving videos:', videosToSave.length);
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos: videosToSave,
          password: 'tobi7758258',
        }),
      });

      console.log('[VideoManager] Response status:', response.status, response.ok);

      const result = await response.json();
      console.log('[VideoManager] Response data:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      onVideosUpdate(videos);
      setOriginalVideos(videos);
      setHasChanges(false);
      alert('保存成功！');
    } catch (error) {
      console.error('[VideoManager] Save error:', error);
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
      const video = videos.find(v => v.order === i + 1);
      return video || {
        id: i + 1,
        title: '',
        location: '',
        date: '',
        embedUrl: '',
        order: i + 1,
        isEmpty: true,
      };
    });

    // 交换位置
    const newSlots = [...fixedSlots];
    const draggedVideo = newSlots[draggedIndex];
    newSlots.splice(draggedIndex, 1);
    newSlots.splice(index, 0, draggedVideo);
    
    // 更新order并过滤掉空占位符
    const updatedVideos = newSlots
      .filter(v => !v.isEmpty || v.title || v.embedUrl)
      .map((v, i) => ({ ...v, order: i + 1 }));
    
    setVideos(updatedVideos);
    setHasChanges(true);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 从B站链接提取BV号
  const extractBvid = (url: string): string | null => {
    const match = url.match(/BV[a-zA-Z0-9]+/);
    return match ? match[0] : null;
  };

  // 生成B站嵌入链接
  const generateBilibiliEmbed = (bvid: string): string => {
    return `//player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0&muted=0&autoplay=0`;
  };

  return (
    <>
      {/* 管理按钮 */}
      <Button
        onClick={handleOpenManager}
        variant="outline"
        size="icon"
        className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
      >
        <Settings className="w-4 h-4 text-[#CEA472]" />
      </Button>

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
              <Label htmlFor="video-password" className="text-[#FFFFFF]/80">
                请输入管理密码
              </Label>
              <Input
                id="video-password"
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
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
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
                视频管理
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
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#FFFFFF]/60 text-sm">
              拖拽视频卡片可调整顺序，点击编辑按钮修改视频信息。支持B站视频链接，自动识别BV号。
            </p>

            {/* 视频列表 - 固定显示9个栏位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 9 }, (_, index) => {
                const video = videos.find(v => v.order === index + 1) || {
                  id: index + 1,
                  title: '',
                  location: '',
                  date: '',
                  embedUrl: '',
                  order: index + 1,
                  isEmpty: true,
                };
                return (
                  <div
                    key={video.id}
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
                      {/* 视频预览 */}
                      <div className="relative w-full aspect-video rounded overflow-hidden border border-[#CEA472]/20 bg-black/60 flex items-center justify-center">
                        {video.isEmpty || !video.embedUrl ? (
                          <div className="flex flex-col items-center gap-2 text-[#CEA472]/30">
                            <VideoIcon className="w-12 h-12" />
                            <span className="text-sm">敬请期待</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-12 h-12 text-[#CEA472]/50" />
                          </div>
                        )}
                      </div>

                      {/* 基本信息 */}
                      <div>
                        <h4 className="font-bold text-[#FFFFFF] truncate">{video.title || '敬请期待'}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#FFFFFF]/60 mt-1">
                          <span>{video.location || '未设置位置'}</span>
                          <span className="text-[#CEA472]/60">{video.date || '未设置日期'}</span>
                        </div>
                        {video.isEmpty && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#CEA472]/10 text-[#CEA472]/60 rounded">
                            占位符
                          </span>
                        )}
                      </div>

                      {/* 编辑按钮 */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingVideo(video)}
                        className="w-full border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472] text-xs"
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

      {/* 编辑视频弹窗 */}
      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#CEA472]">编辑视频信息 - 第 {editingVideo?.order} 个位置</DialogTitle>
          </DialogHeader>
          {editingVideo && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">标题</Label>
                <Input
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="输入视频标题"
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">地点</Label>
                <Input
                  value={editingVideo.location}
                  onChange={(e) => setEditingVideo({ ...editingVideo, location: e.target.value })}
                  placeholder="如：中国云南"
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">日期</Label>
                <Input
                  value={editingVideo.date}
                  onChange={(e) => setEditingVideo({ ...editingVideo, date: e.target.value })}
                  placeholder="如: 2025.01"
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">B站视频链接</Label>
                <Input
                  value={editingVideo.embedUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    const bvid = extractBvid(url);
                    const embedUrl = bvid ? generateBilibiliEmbed(bvid) : url;
                    setEditingVideo({ ...editingVideo, embedUrl: embedUrl });
                  }}
                  placeholder="https://www.bilibili.com/video/BVxxx 或直接输入嵌入链接"
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
                <p className="text-xs text-[#FFFFFF]/40">
                  支持直接粘贴B站视频链接，自动识别BV号
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEmpty"
                  checked={editingVideo.isEmpty}
                  onChange={(e) => setEditingVideo({ ...editingVideo, isEmpty: e.target.checked })}
                  className="w-4 h-4 rounded border-[#CEA472]/30 bg-black/40"
                />
                <Label htmlFor="isEmpty" className="text-[#FFFFFF]/80 text-sm">
                  标记为占位符（敬请期待）
                </Label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingVideo(null)}
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
                >
                  取消
                </Button>
                <Button
                  onClick={() => {
                    console.log('[VideoManager] Confirming edit for video:', editingVideo);
                    console.log('[VideoManager] Current videos:', videos);
                    const updatedVideos = videos.map(v => 
                      v.order === editingVideo.order ? editingVideo : v
                    );
                    console.log('[VideoManager] Updated videos:', updatedVideos);
                    setVideos(updatedVideos);
                    setHasChanges(true);
                    setEditingVideo(null);
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
