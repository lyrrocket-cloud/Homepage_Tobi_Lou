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
import { Tool } from '@/app/api/tools/route';
import {
  Settings,
  Lock,
  Save,
  X,
  GripVertical,
  Loader2,
  Trash2,
  Plus,
  Edit,
} from 'lucide-react';

// 可用图标列表
const availableIcons = [
  { name: 'Wallet', label: '钱包' },
  { name: 'Car', label: '汽车' },
  { name: 'Sparkles', label: '星星' },
  { name: 'MapPin', label: '地图' },
  { name: 'Calendar', label: '日历' },
  { name: 'Camera', label: '相机' },
  { name: 'Video', label: '视频' },
  { name: 'Wrench', label: '工具' },
  { name: 'Globe', label: '地球' },
  { name: 'Plane', label: '飞机' },
  { name: 'Compass', label: '指南针' },
  { name: 'Heart', label: '爱心' },
  { name: 'Star', label: '星标' },
  { name: 'Gift', label: '礼物' },
  { name: 'Plus', label: '占位' },
];

interface ToolManagerProps {
  tools: Tool[];
  onToolsUpdate: (tools: Tool[]) => void;
}

export function ToolManager({ tools: initialTools, onToolsUpdate }: ToolManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [originalTools, setOriginalTools] = useState<Tool[]>(initialTools);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 同步外部 tools
  useEffect(() => {
    if (!isOpen) {
      setTools(initialTools);
      setOriginalTools(initialTools);
      setHasChanges(false);
    }
  }, [initialTools, isOpen]);

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
    setEditingTool(null);
  };

  // 保存所有更改
  const handleSaveAll = async () => {
    if (!hasChanges) {
      alert('没有需要保存的更改');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools,
          password: 'tobi7758258',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      onToolsUpdate(tools);
      setOriginalTools(tools);
      setHasChanges(false);
      alert('保存成功！');
    } catch (error) {
      console.error('[ToolManager] Save error:', error);
      const errorMsg = error instanceof Error ? error.message : '网络错误，请重试';
      alert('保存失败：' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // 添加新工具
  const handleAddTool = () => {
    const newId = Math.max(...tools.map(t => t.id), 0) + 1;
    const newTool: Tool = {
      id: newId,
      name: '新工具',
      description: '工具描述',
      icon: 'Wrench',
      url: '',
      order: tools.length + 1,
      isEmpty: false,
    };
    setTools([...tools, newTool]);
    setHasChanges(true);
    setEditingTool(newTool);
  };

  // 删除工具
  const handleDeleteTool = (toolId: number) => {
    if (confirm('确定要删除这个工具吗？')) {
      const updatedTools = tools.filter(t => t.id !== toolId);
      // 更新顺序
      updatedTools.forEach((t, i) => {
        t.order = i + 1;
      });
      setTools(updatedTools);
      setHasChanges(true);
    }
  };

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTools = [...tools];
    const draggedTool = newTools[draggedIndex];
    newTools.splice(draggedIndex, 1);
    newTools.splice(index, 0, draggedTool);
    
    newTools.forEach((t, i) => {
      t.order = i + 1;
    });
    
    setTools(newTools);
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
                onClick={handleVerifyPassword}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                确认
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
              >
                取消
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
                工具箱管理
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTool}
                  variant="outline"
                  size="icon"
                  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
                >
                  <Plus className="w-4 h-4 text-[#CEA472]" />
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={isSaving || !hasChanges}
                  variant="outline"
                  size="icon"
                  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 text-[#CEA472] animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-[#CEA472]" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCloseManager}
                  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
                >
                  <X className="w-4 h-4 text-[#CEA472]" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#FFFFFF]/60 text-sm">
              拖拽工具卡片可调整顺序，点击编辑按钮修改详细信息
            </p>

            {/* 工具列表 */}
            <div className="space-y-3">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-4 bg-black/40 border border-[#CEA472]/20 rounded-lg p-4 cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  {/* 拖拽手柄 */}
                  <div className="text-[#CEA472]/50 group-hover:text-[#CEA472]">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* 序号 */}
                  <div className="w-8 h-8 rounded-full bg-[#CEA472]/20 text-[#CEA472] text-sm flex items-center justify-center font-bold shrink-0">
                    {tool.order}
                  </div>

                  {/* 工具信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#FFFFFF] truncate">{tool.name}</h4>
                      {tool.isEmpty && (
                        <span className="text-xs text-[#CEA472]/60 bg-[#CEA472]/10 px-2 py-0.5 rounded">
                          占位
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#FFFFFF]/60 truncate">{tool.description || '无描述'}</p>
                    {tool.url && (
                      <p className="text-xs text-[#CEA472]/60 truncate mt-1">{tool.url}</p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingTool(tool)}
                      className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
                    >
                      <Edit className="w-4 h-4 text-[#CEA472]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTool(tool.id)}
                      className="bg-black/40 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑工具弹窗 */}
      <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-[#CEA472]">编辑工具信息</DialogTitle>
          </DialogHeader>
          {editingTool && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">工具名称</Label>
                <Input
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">描述</Label>
                <Input
                  value={editingTool.description}
                  onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">跳转链接</Label>
                <Input
                  value={editingTool.url}
                  onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-black/40 border-[#CEA472]/30 text-white focus:border-[#CEA472]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">图标</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setEditingTool({ ...editingTool, icon: icon.name })}
                      className={`p-2 rounded border transition-all ${
                        editingTool.icon === icon.name
                          ? 'border-[#CEA472] bg-[#CEA472]/20 text-[#CEA472]'
                          : 'border-[#CEA472]/30 text-[#CEA472]/60 hover:border-[#CEA472]/50'
                      }`}
                    >
                      <span className="text-xs">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEmpty"
                  checked={editingTool.isEmpty}
                  onChange={(e) => setEditingTool({ ...editingTool, isEmpty: e.target.checked })}
                  className="rounded border-[#CEA472]/30"
                />
                <Label htmlFor="isEmpty" className="text-[#FFFFFF]/80 text-sm">
                  标记为"敬请期待"占位
                </Label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingTool(null)}
                  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
                >
                  <X className="w-4 h-4 text-[#CEA472]" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => {
                    const updatedTools = tools.map(t => 
                      t.id === editingTool.id ? editingTool : t
                    );
                    setTools(updatedTools);
                    setHasChanges(true);
                    setEditingTool(null);
                  }}
                  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
                >
                  <Save className="w-4 h-4 text-[#CEA472]" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
