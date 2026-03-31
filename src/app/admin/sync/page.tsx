'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  RefreshCw, CheckCircle, XCircle, Loader2, Database, 
  ArrowDownToLine, ArrowUpFromLine
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

type SyncDirection = 'import' | 'export';

export default function SyncAdminPage() {
  const [password, setPassword] = useState('');
  const [direction, setDirection] = useState<SyncDirection>('import');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div 
      className="min-h-screen text-[#FFFFFF]"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage: `linear-gradient(rgba(10, 10, 15, 0.85), rgba(10, 10, 15, 0.85)), url('/europe-mountain.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <div 
              className="w-20 h-20 flex items-center justify-center rounded-2xl"
              style={{
                backgroundColor: '#CEA472',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              <RefreshCw className="w-10 h-10" style={{ color: '#0a0a0f' }} />
            </div>
            <h1 className="text-5xl font-bold text-[#FFFFFF] drop-shadow-lg">数据同步</h1>
          </div>
          <p className="text-[#FFFFFF] font-normal">在开发环境和生产环境之间同步数据</p>
        </div>

        {/* 环境信息卡片 */}
        <Card className="border-[#CEA472]/10 bg-black/40 backdrop-blur-sm hover:border-[#CEA472]/50 hover:bg-black/60 transition-all duration-500 mb-6">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <Database className="w-5 h-5" />
              环境信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 font-semibold mb-1">开发环境</p>
                <p className="text-[#FFFFFF]/60 text-sm">当前预览环境</p>
                <p className="text-[#FFFFFF]/50 text-xs mt-1">测试和开发使用</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <p className="text-green-400 font-semibold mb-1">生产环境</p>
                <p className="text-[#FFFFFF]/60 text-sm">tobilou.top 线上</p>
                <p className="text-[#FFFFFF]/50 text-xs mt-1">正式对外服务</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据库同步卡片 */}
        <Card className="border-[#CEA472]/10 bg-black/40 backdrop-blur-sm hover:border-[#CEA472]/50 hover:bg-black/60 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-[#CEA472] flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              数据库同步
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 密码输入 */}
            <div className="space-y-2">
              <Label className="text-[#CEA472]">管理密码</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入管理密码"
                className="bg-black/40 backdrop-blur-sm border-[#CEA472]/30 text-[#FFFFFF] placeholder:text-[#FFFFFF]/50 focus:border-[#CEA472]/50 focus:ring-0"
              />
            </div>

            {/* 同步方向选择 */}
            <div>
              <Label className="text-[#CEA472] text-sm mb-3 block">同步方向</Label>
              <RadioGroup value={direction} onValueChange={(v) => setDirection(v as SyncDirection)}>
                <div className="space-y-3">
                  <Label 
                    htmlFor="import-db" 
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      direction === 'import' 
                        ? 'border-[#CEA472] bg-[#CEA472]/10' 
                        : 'border-[#CEA472]/20 bg-black/40 hover:border-[#CEA472]/50'
                    }`}
                  >
                    <RadioGroupItem value="import" id="import-db" className="border-[#CEA472]/60 text-[#CEA472]" />
                    <ArrowDownToLine className="w-5 h-5 text-[#CEA472]" />
                    <div className="flex-1">
                      <span className="text-[#FFFFFF]">从生产环境导入</span>
                      <span className="text-green-400 text-xs ml-2">安全</span>
                    </div>
                  </Label>
                  <Label 
                    htmlFor="export-db" 
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      direction === 'export' 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-[#CEA472]/20 bg-black/40 hover:border-[#CEA472]/50'
                    }`}
                  >
                    <RadioGroupItem value="export" id="export-db" className="border-orange-500/60 text-orange-400" />
                    <ArrowUpFromLine className="w-5 h-5 text-orange-400" />
                    <div className="flex-1">
                      <span className="text-[#FFFFFF]">导出到生产环境</span>
                      <span className="text-orange-400 text-xs ml-2">危险</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 同步数据表 */}
            <div className="bg-black/40 rounded-lg p-3 border border-[#CEA472]/10">
              <p className="text-[#FFFFFF]/60 text-xs mb-2">同步数据表：</p>
              <div className="flex flex-wrap gap-2">
                {['regions', 'gallery_photos', 'photos', 'videos', 'tools'].map((table) => (
                  <span key={table} className="px-2 py-1 bg-[#CEA472]/10 text-[#CEA472] text-xs rounded border border-[#CEA472]/20">
                    {table}
                  </span>
                ))}
              </div>
            </div>

            {/* 同步按钮 */}
            <Button
              onClick={handleSync}
              disabled={loading}
              className={`w-full font-semibold shadow-lg transition-all duration-300 ${
                direction === 'export' 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-700/20'
                  : 'bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] border border-[#CEA472]/20'
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
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 同步结果 */}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{result.message}</span>
                </div>
                <div className="bg-black/40 rounded-lg p-3 border border-[#CEA472]/10 text-sm">
                  {Object.entries(result.results).map(([table, data]) => (
                    <div key={table} className="flex justify-between py-2 border-b border-[#CEA472]/10 last:border-0">
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
      </div>
    </div>
  );
}
