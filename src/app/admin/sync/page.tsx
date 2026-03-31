'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  RefreshCw, CheckCircle, XCircle, Loader2, Database, Cloud, 
  ArrowDownToLine, ArrowUpFromLine, AlertTriangle 
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

  const handleSync = async () => {
    if (!password) {
      setError('请输入管理密码');
      return;
    }

    // 导出操作需要二次确认
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#CEA472] mb-2">数据同步管理</h1>
          <p className="text-[#FFFFFF]/60">在开发环境和生产环境之间同步数据</p>
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
                <p className="text-[#FFFFFF]/60 text-sm">当前预览环境数据库</p>
                <p className="text-[#FFFFFF]/40 text-xs mt-1">测试和开发使用</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-green-400 font-semibold mb-1">生产环境</p>
                <p className="text-[#FFFFFF]/60 text-sm">tobilou.top 线上数据库</p>
                <p className="text-[#FFFFFF]/40 text-xs mt-1">正式对外服务</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 同步方向选择 */}
        <Card className="bg-black/40 border-[#CEA472]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              同步方向
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={direction} onValueChange={(v) => setDirection(v as SyncDirection)}>
              <div className="space-y-4">
                {/* 导入：生产 → 开发 */}
                <Label 
                  htmlFor="import" 
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    direction === 'import' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-[#CEA472]/20 hover:border-[#CEA472]/40'
                  }`}
                >
                  <RadioGroupItem value="import" id="import" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowDownToLine className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-[#FFFFFF]">从生产环境导入</span>
                    </div>
                    <p className="text-[#FFFFFF]/60 text-sm">
                      将生产环境数据导入到当前开发环境
                    </p>
                    <p className="text-green-400 text-xs mt-1">
                      ✓ 安全操作，仅影响开发环境
                    </p>
                  </div>
                </Label>

                {/* 导出：开发 → 生产 */}
                <Label 
                  htmlFor="export" 
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    direction === 'export' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-[#CEA472]/20 hover:border-[#CEA472]/40'
                  }`}
                >
                  <RadioGroupItem value="export" id="export" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpFromLine className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold text-[#FFFFFF]">导出到生产环境</span>
                    </div>
                    <p className="text-[#FFFFFF]/60 text-sm">
                      将当前开发环境数据导出到生产环境
                    </p>
                    <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      ⚠️ 危险操作，将覆盖线上数据
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 执行同步 */}
        <Card className="bg-black/40 border-[#CEA472]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              {direction === 'import' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
              执行同步
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 同步数据表列表 */}
            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <p className="text-[#FFFFFF]/60 text-sm mb-2">将同步以下数据表：</p>
              <div className="flex flex-wrap gap-2">
                {['regions', 'visits', 'gallery_photos', 'photos', 'videos', 'tools'].map((table) => (
                  <span 
                    key={table} 
                    className="px-2 py-1 bg-[#CEA472]/10 text-[#CEA472] text-xs rounded"
                  >
                    {table}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#FFFFFF]/80">
                管理密码
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入管理密码"
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40"
                onKeyDown={(e) => e.key === 'Enter' && handleSync()}
              />
            </div>

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
                  从生产环境导入
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  导出到生产环境
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  {result.message}
                  {result.direction && (
                    <span className="text-[#FFFFFF]/40 text-sm ml-2">
                      ({result.direction === 'import' ? '生产 → 开发' : '开发 → 生产'})
                    </span>
                  )}
                </div>

                <div className="bg-black/40 rounded-lg p-4 space-y-2">
                  <h4 className="text-[#CEA472] font-semibold mb-3">同步结果：</h4>
                  {Object.entries(result.results).map(([table, data]) => (
                    <div key={table} className="flex items-center justify-between py-2 border-b border-[#CEA472]/10 last:border-0">
                      <span className="text-[#FFFFFF]/80">{table}</span>
                      <span className={
                        data.status === 'success' ? 'text-green-400' : 
                        data.status === 'skipped' ? 'text-[#FFFFFF]/40' : 'text-red-400'
                      }>
                        {data.status === 'success' ? `✓ ${data.count} 条记录` : 
                         data.status === 'skipped' ? '- 跳过' : `✗ ${data.error}`}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[#FFFFFF]/40 text-sm text-center">
                  同步时间: {new Date(result.timestamp).toLocaleString('zh-CN')}
                </p>
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
                  <span className="text-[#FFFFFF]/60">Bucket 名称</span>
                  <span className="text-[#FFFFFF] font-mono text-sm">{storageInfo.bucketName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#FFFFFF]/60">存储模式</span>
                  <span className={storageInfo.isShared ? 'text-green-400' : 'text-yellow-400'}>
                    {storageInfo.isShared ? '共享存储 ✓' : '独立存储'}
                  </span>
                </div>
                <p className="text-[#FFFFFF]/40 text-sm pt-2 border-t border-[#CEA472]/10">
                  {storageInfo.message}
                </p>
                {storageInfo.isShared && (
                  <div className="bg-green-400/10 text-green-400 text-sm p-3 rounded-lg">
                    <p className="font-medium mb-1">共享存储已启用</p>
                    <p>照片文件在开发环境和生产环境间自动同步，无需手动操作。</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
