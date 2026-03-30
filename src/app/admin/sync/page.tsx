'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, CheckCircle, XCircle, Loader2, Database, Cloud } from 'lucide-react';

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
}

interface StorageInfo {
  bucketName: string;
  isShared: boolean;
  message: string;
}

export default function SyncAdminPage() {
  const [password, setPassword] = useState('');
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
          <h1 className="text-3xl font-bold text-[#CEA472] mb-2">数据库同步管理</h1>
          <p className="text-[#FFFFFF]/60">将备份数据同步到当前环境数据库</p>
        </div>

        <Card className="bg-black/40 border-[#CEA472]/20">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              执行同步
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              className="w-full bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  开始同步
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
                </div>

                <div className="bg-black/40 rounded-lg p-4 space-y-2">
                  <h4 className="text-[#CEA472] font-semibold mb-3">同步结果：</h4>
                  {Object.entries(result.results).map(([table, data]) => (
                    <div key={table} className="flex items-center justify-between py-2 border-b border-[#CEA472]/10 last:border-0">
                      <span className="text-[#FFFFFF]/80">{table}</span>
                      <span className={data.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {data.status === 'success' ? `✓ ${data.count} 条记录` : `✗ ${data.error}`}
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
          <Card className="bg-black/40 border-[#CEA472]/20 mt-6">
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
                {!storageInfo.isShared && (
                  <div className="bg-yellow-400/10 text-yellow-400 text-sm p-3 rounded-lg">
                    <p className="font-medium mb-1">提示：当前使用独立存储</p>
                    <p>预览环境和生产环境的照片文件不会自动同步。如需共享存储，请联系管理员配置 SHARED_BUCKET_NAME 环境变量。</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-[#FFFFFF]/40 text-sm">
          <p>备份数据来源：预览环境最新数据</p>
          <p className="mt-1">包含：regions, gallery_photos, photos, videos, tools 表</p>
        </div>
      </div>
    </div>
  );
}
