import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

// 导出路由配置
export const dynamic = 'force-dynamic';

// 获取存储实例
const storage = getStorage();

// GET - 列出对象存储中的文件
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get('prefix') || 'photos/';
    const password = searchParams.get('password');

    // 验证密码
    if (password !== 'tobi7758258') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 列出文件
    const result = await storage.listFiles({ prefix });

    return NextResponse.json({
      success: true,
      data: {
        prefix,
        count: result.keys.length,
        files: result.keys,
        isTruncated: result.isTruncated,
      },
    });
  } catch (error) {
    console.error('[Storage List] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
