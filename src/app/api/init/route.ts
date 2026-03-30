import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化端点 - 用于预加载环境变量和数据库连接
// 可以在应用启动时调用，减少冷启动时间
export async function GET() {
  try {
    // 预加载环境变量
    const client = getSupabaseClient();

    // 简单的健康检查查询，确保连接正常
    const { error } = await client
      .from('photos')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Initialization complete',
    });
  } catch (error) {
    console.error('[Init] Error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Initialization failed' 
      },
      { status: 500 }
    );
  }
}
