'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, ExternalLink, Edit2, Trash2, Plus, Lock } from 'lucide-react';
import { Region } from '@/app/api/regions/route';
import { Visit } from '@/app/api/visits/route';

interface VisitManagerProps {
  defaultRegionId?: number | null;
  defaultRegionName?: string;
  onVisitAdded?: () => void;
  shouldOpen?: boolean;
  onClose?: () => void;
}

export function VisitManager({ defaultRegionId = null, defaultRegionName = '', onVisitAdded, shouldOpen, onClose }: VisitManagerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 模式：'list' 列表模式, 'add' 添加模式, 'edit' 编辑模式
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');

  // 列表数据
  const [visits, setVisits] = useState<Visit[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // 表单数据
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');

  // 当组件收到新的 shouldOpen 为 true 时，打开弹窗
  useEffect(() => {
    if (shouldOpen) {
      setOpen(true);
      setMode('list');
    }
  }, [shouldOpen]);

  // 获取到访记录列表
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/visits?includeRegion=true');
      const result = await response.json();
      if (result.success) {
        // 按日期降序排列
        const sortedVisits = result.data.sort((a: Visit, b: Visit) =>
          b.date.localeCompare(a.date)
        );
        setVisits(sortedVisits);
      }
    } catch (err) {
      console.error('[VisitManager] Failed to fetch visits:', err);
      setError('获取记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取地区列表
  const fetchRegions = useCallback(async () => {
    try {
      console.log('[VisitManager] Fetching regions...');
      // 添加时间戳强制绕过缓存
      const url = `/api/regions?withChildren=true&_t=${Date.now()}`;
      console.log('[VisitManager] Request URL:', url);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      console.log('[VisitManager] Response status:', response.status);
      console.log('[VisitManager] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('[VisitManager] Regions response:', result);
      console.log('[VisitManager] Regions response data:', result.data);
      console.log('[VisitManager] Regions response data length:', result.data?.length);
      
      if (result.success && result.data) {
        // 只保留中国地区（parentId 为 null 的是省份）
        const chinaRegions = result.data.filter((r: Region) => r.type === 'china' && r.parentId === null);
        console.log('[VisitManager] China regions (parentId=null):', chinaRegions);
        console.log('[VisitManager] China regions count:', chinaRegions.length);
        console.log('[VisitManager] Setting regions state...');
        setRegions(chinaRegions);
        console.log('[VisitManager] Regions state set successfully');
      } else {
        console.error('[VisitManager] Failed to fetch regions:', result.error);
      }
    } catch (err) {
      console.error('[VisitManager] Failed to fetch regions:', err);
    }
  }, []);

  // 打开弹窗后获取数据
  useEffect(() => {
    if (open) {
      fetchVisits();
      fetchRegions();
    }
  }, [open, fetchVisits, fetchRegions]);

  const handleOpenAdd = () => {
    setEditingVisit(null);
    setSelectedRegion(null);
    setDate('');
    setUrl('');
    setMode('add');
  };

  const handleOpenEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setSelectedRegion(visit.regionId);
    setDate(visit.date);
    setUrl(visit.image || '');
    setMode('edit');
  };

  const handleDelete = async (visitId: number) => {
    // 确认删除
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        fetchVisits();
        if (onVisitAdded) {
          onVisitAdded();
        }
      } else {
        setError(result.error || '删除失败');
      }
    } catch (err) {
      setError('删除失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRegion || !date || !url) {
      setError('请填写所有必填字段');
      return;
    }

    setLoading(true);

    try {
      const visitData = {
        regionId: selectedRegion,
        title: getRegionName(selectedRegion),
        description: '',
        date,
        image: url,
      };

      let response: Response;
      if (mode === 'add') {
        response = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visit: visitData }),
        });
      } else if (mode === 'edit' && editingVisit) {
        response = await fetch(`/api/visits/${editingVisit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visit: visitData }),
        });
      } else {
        throw new Error('无效的操作模式');
      }

      const result = await response.json();

      if (result.success) {
        setMode('list');
        fetchVisits();
        if (onVisitAdded) {
          onVisitAdded();
        }
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getRegionName = (regionId: number) => {
    // 只在省份级别查找
    const region = regions.find(r => r.id === regionId);
    return region?.name || '未知地区';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black/90 border-[#CEA472]/30 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#CEA472] flex items-center justify-between">
            <span>{mode === 'list' ? '到访记录管理' : (mode === 'add' ? '添加到访记录' : '编辑到访记录')}</span>
            {mode === 'list' && (
              <Button onClick={handleOpenAdd} className="bg-[#CEA472] text-black hover:bg-[#CEA472]/80 text-sm">
                <Plus className="w-4 h-4 mr-2" />
                添加记录
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            管理您的到访记录
          </DialogDescription>
        </DialogHeader>

        {mode === 'list' ? (
          <div className="flex-1 overflow-y-auto">
            {loading && visits.length === 0 ? (
              <div className="text-center py-8 text-[#FFFFFF]/50">加载中...</div>
            ) : visits.length === 0 ? (
              <div className="text-center py-8 text-[#FFFFFF]/50">暂无记录</div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="bg-black/50 border border-[#CEA472]/10 rounded-lg p-4 hover:border-[#CEA472]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-[#CEA472] flex-shrink-0" />
                          <span className="text-[#FFFFFF] font-medium truncate">
                            {getRegionName(visit.regionId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#CEA472] flex-shrink-0" />
                          <span className="text-[#FFFFFF]/70 text-sm">{visit.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-[#CEA472] flex-shrink-0" />
                          <a
                            href={visit.image || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#CEA472] text-sm hover:underline truncate"
                          >
                            {visit.image || '无链接'}
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleOpenEdit(visit)}
                          variant="ghost"
                          size="icon"
                          className="text-[#CEA472] hover:text-[#CEA472]/80 hover:bg-[#CEA472]/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(visit.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
            <div>
              <Label htmlFor="region" className="text-[#FFFFFF]">
                地区 <span className="text-red-500">*</span>
                <span className="text-[#FFFFFF]/50 text-xs ml-2">
                  (已加载 {regions.length} 个省份)
                </span>
              </Label>
              <select
                id="region"
                value={selectedRegion || ''}
                onChange={(e) => setSelectedRegion(parseInt(e.target.value))}
                className="w-full mt-1 p-2 bg-black/50 border border-[#CEA472]/20 rounded text-[#FFFFFF] focus:border-[#CEA472] outline-none"
                required
              >
                <option value="">请选择省份</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="date" className="text-[#FFFFFF]">
                日期 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="例如：2026.01"
                className="bg-black/50 border-[#CEA472]/20 text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="url" className="text-[#FFFFFF]">
                链接地址 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="bg-black/50 border-[#CEA472]/20 text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#CEA472] text-black hover:bg-[#CEA472]/80"
              >
                {loading ? '保存中...' : (mode === 'add' ? '确认添加' : '确认修改')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('list')}
                className="border-[#CEA472]/30 text-[#CEA472]"
              >
                取消
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
