'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  RefreshCw, CheckCircle, XCircle, Loader2, Database, Cloud, 
  ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Image, ChevronDown, ChevronUp
} from 'lucide-react';

interface SyncResult {
  status: string;
  count?: number;
  error?: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  results: Record<string, SyncResult>;
  timestamp: string;
  direction?: string;
}

interface PhotoSyncResult {
  id: number;
  title: string;
  sourceKey: string;
  targetKey: string;
  status: 'success' | 'skipped' | 'error';
  error?: string;
}

interface PhotoSyncResponse {
  success: boolean;
  message: string;
  results: PhotoSyncResult[];
  total: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  direction?: string;
  table?: string;
  timestamp: string;
}

interface StorageInfo {
  bucketName: string;
  isShared: boolean;
  message: string;
}

type SyncDirection = 'import' | 'export';

export default function SyncAdminPage() {
  const [password, setPassword] = useState('');
  const [direction, setDirection] = useState<SyncDirection>('import');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // 照片同步状态
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState<PhotoSyncResponse | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPhotoDetails, setShowPhotoDetails] = useState(false);

  // 获取存储信息
  useEffect(() => {
    fetch('/api/storage/info')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStorageInfo(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // 数据库同步
  const handleSync = async () => {
    if (!password) {
      setError('请输入管理密码');
      return;
    }

    if (direction === 'export') {
      const confirmed = confirm(
        '⚠️ 警告：导出操作将覆盖生产环境的数据！\n\n' +
        '此操作不可逆，请确保：\n' +
        '1. 已备份生产环境数据\n' +
        '2. 确认要覆盖生产环境\n\n' +
        '确定继续吗？'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ direction }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || '同步失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 照片文件同步
  const handlePhotoSync = async () => {
    if (!password) {
      setPhotoError('请输入管理密码');
      return;
    }

    setPhotoLoading(true);
    setPhotoError(null);
    setPhotoResult(null);

    try {
      const response = await fetch('/api/sync-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ direction: 'import', table: 'gallery_photos' }),
      });

      const data = await response.json();

      if (data.success) {
        setPhotoResult(data);
      } else {
        setPhotoError(data.error || '同步失败');
      }
    } catch (err) {
      setPhotoError('网络错误，请重试');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#CEA472] mb-2">数据同步管理</h1>
          <p className="text-[#FFFFFF]/60">在开发环境和生产环境之间同步数据和照片</p>
        </div>

        {/* 环境说明 */}
        <Card className="bg-black/40 border-[#CEA472]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <Database className="w-5 h-5" />
              环境信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4">
                <p className="text-blue-400 font-semibold mb-1">开发环境</p>
                <p className="text-[#FFFFFF]/60 text-sm">当前预览环境</p>
                <p className="text-[#FFFFFF]/40 text-xs mt-1">测试和开发使用</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-green-400 font-semibold mb-1">生产环境</p>
                <p className="text-[#FFFFFF]/60 text-sm">tobilou.top 线上</p>
                <p className="text-[#FFFFFF]/40 text-xs mt-1">正式对外服务</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据库同步 */}
        <Card className="bg-black/40 border-[#CEA472]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              数据库同步
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 同步方向选择 */}
            <div className="mb-4">
              <Label className="text-[#FFFFFF]/80 text-sm mb-2 block">同步方向</Label>
              <RadioGroup value={direction} onValueChange={(v) => setDirection(v as SyncDirection)}>
                <div className="space-y-3">
                  <Label 
                    htmlFor="import" 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      direction === 'import' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-[#CEA472]/20 hover:border-[#CEA472]/40'
                    }`}
                  >
                    <RadioGroupItem value="import" id="import" />
                    <ArrowDownToLine className="w-4 h-4 text-blue-400" />
                    <span className="text-[#FFFFFF] text-sm">从生产环境导入</span>
                    <span className="text-green-400 text-xs ml-auto">安全</span>
                  </Label>
                  <Label 
                    htmlFor="export" 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      direction === 'export' 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-[#CEA472]/20 hover:border-[#CEA472]/40'
                    }`}
                  >
                    <RadioGroupItem value="export" id="export" />
                    <ArrowUpFromLine className="w-4 h-4 text-orange-400" />
                    <span className="text-[#FFFFFF] text-sm">导出到生产环境</span>
                    <span className="text-orange-400 text-xs ml-auto">危险</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 同步数据表 */}
            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-[#FFFFFF]/60 text-xs mb-2">同步数据表：</p>
              <div className="flex flex-wrap gap-1">
                {['regions', 'gallery_photos', 'photos', 'videos', 'tools'].map((table) => (
                  <span key={table} className="px-2 py-0.5 bg-[#CEA472]/10 text-[#CEA472] text-xs rounded">
                    {table}
                  </span>
                ))}
              </div>
            </div>

            {/* 密码输入 */}
            <div className="mb-4">
              <Label htmlFor="password" className="text-[#FFFFFF]/80 text-sm mb-1 block">
                管理密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入管理密码"
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40"
              />
            </div>

            {/* 同步按钮 */}
            <Button
              onClick={handleSync}
              disabled={loading}
              className={`w-full font-semibold ${
                direction === 'export' 
                  ? 'bg-orange-500 hover:bg-orange-500/80 text-white'
                  : 'bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  同步中...
                </>
              ) : direction === 'import' ? (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  从生产环境导入数据
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  导出到生产环境
                </>
              )}
            </Button>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg mt-4">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 同步结果 */}
            {result && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{result.message}</span>
                </div>
                <div className="bg-black/40 rounded-lg p-3 text-sm">
                  {Object.entries(result.results).map(([table, data]) => (
                    <div key={table} className="flex justify-between py-1 border-b border-[#CEA472]/10 last:border-0">
                      <span className="text-[#FFFFFF]/60">{table}</span>
                      <span className={
                        data.status === 'success' ? 'text-green-400' : 
                        data.status === 'skipped' ? 'text-[#FFFFFF]/40' : 'text-red-400'
                      }>
                        {data.status === 'success' ? `✓ ${data.count} 条` : 
                         data.status === 'skipped' ? '- 跳过' : `✗ ${data.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 照片文件同步 */}
        <Card className="bg-black/40 border-[#CEA472]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <Image className="w-5 h-5" />
              照片文件同步
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-400/10 text-yellow-400 text-sm p-3 rounded-lg mb-4">
              <p className="font-medium mb-1">注意</p>
              <p>预览环境和生产环境使用独立的存储桶，照片文件需要单独同步。</p>
            </div>

            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-[#FFFFFF]/60 text-xs mb-1">同步内容：</p>
              <p className="text-[#FFFFFF]/80 text-sm">gallery_photos 表中的照片文件（80 张）</p>
              <p className="text-[#FFFFFF]/40 text-xs mt-1">从生产环境下载并上传到开发环境</p>
            </div>

            <Button
              onClick={handlePhotoSync}
              disabled={photoLoading || !password}
              className="w-full bg-blue-500 hover:bg-blue-500/80 text-white font-semibold"
            >
              {photoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  从生产环境同步照片
                </>
              )}
            </Button>

            {/* 错误提示 */}
            {photoError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg mt-4">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{photoError}</span>
              </div>
            )}

            {/* 同步结果 */}
            {photoResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{photoResult.message}</span>
                </div>
                
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="flex justify-between py-1 border-b border-[#CEA472]/10">
                    <span className="text-[#FFFFFF]/60 text-sm">总计</span>
                    <span className="text-[#FFFFFF] text-sm">{photoResult.total} 张</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#CEA472]/10">
                    <span className="text-green-400/60 text-sm">成功</span>
                    <span className="text-green-400 text-sm">{photoResult.successCount} 张</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#CEA472]/10">
                    <span className="text-[#FFFFFF]/40 text-sm">跳过</span>
                    <span className="text-[#FFFFFF]/60 text-sm">{photoResult.skippedCount} 张</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-red-400/60 text-sm">失败</span>
                    <span className="text-red-400 text-sm">{photoResult.errorCount} 张</span>
                  </div>
                </div>

                {/* 详细结果 */}
                {photoResult.results.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowPhotoDetails(!showPhotoDetails)}
                      className="flex items-center gap-1 text-[#CEA472] text-sm hover:underline"
                    >
                      {showPhotoDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      查看详细结果
                    </button>
                    
                    {showPhotoDetails && (
                      <div className="mt-2 max-h-60 overflow-y-auto bg-black/40 rounded-lg p-2 text-xs">
                        {photoResult.results.map((r) => (
                          <div 
                            key={r.id} 
                            className={`py-1 border-b border-[#CEA472]/10 last:border-0 ${
                              r.status === 'success' ? 'text-green-400' : 
                              r.status === 'skipped' ? 'text-[#FFFFFF]/40' : 'text-red-400'
                            }`}
                          >
                            <span className="mr-2">
                              {r.status === 'success' ? '✓' : r.status === 'skipped' ? '○' : '✗'}
                            </span>
                            {r.title}
                            {r.error && <span className="ml-2 text-red-400/60">({r.error})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 存储信息 */}
        {storageInfo && (
          <Card className="bg-black/40 border-[#CEA472]/20">
            <CardHeader>
              <CardTitle className="text-[#CEA472] flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                存储配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#FFFFFF]/60 text-sm">Bucket 名称</span>
                  <span className="text-[#FFFFFF] font-mono text-sm">{storageInfo.bucketName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#FFFFFF]/60 text-sm">存储模式</span>
                  <span className={storageInfo.isShared ? 'text-green-400' : 'text-yellow-400'}>
                    {storageInfo.isShared ? '共享存储 ✓' : '独立存储'}
                  </span>
                </div>
                <p className="text-[#FFFFFF]/40 text-xs pt-2 border-t border-[#CEA472]/10">
                  {storageInfo.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
