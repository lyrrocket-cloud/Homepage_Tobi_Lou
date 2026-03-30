import { NextResponse } from 'next/server';
import { getStorageInfo } from '@/lib/storage';

// 导出路由配置
export const dynamic = 'force-dynamic';

// GET - 获取存储配置信息
export async function GET() {
  const info = getStorageInfo();
  
  return NextResponse.json({
    success: true,
    data: {
      bucketName: info.bucketName,
      isShared: info.isShared,
      message: info.isShared 
        ? '使用共享存储（预览环境和生产环境共享同一个 bucket）'
        : '使用独立存储（预览环境和生产环境使用不同的 bucket）',
    },
  });
}
