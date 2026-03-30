import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 导出路由配置：禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - 同步数据库（从备份恢复到生产环境）
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（简单安全检查）
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.SYNC_SECRET || 'tobi7758258';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.COZE_SUPABASE_URL;
    const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // 读取备份文件
    const backupPath = join(process.cwd(), 'scripts/production-backup.json');
    
    if (!existsSync(backupPath)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 500 }
      );
    }

    const backup = JSON.parse(readFileSync(backupPath, 'utf-8'));
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const results: Record<string, { status: string; count?: number; error?: string }> = {};
    const tables = ['regions', 'photos', 'videos', 'tools', 'visits'];

    for (const table of tables) {
      const tableData = backup.tables[table];
      if (!tableData || !tableData.data) {
        results[table] = { status: 'skipped', count: 0 };
        continue;
      }

      try {
        // 清空表
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', 0);

        if (deleteError) {
          results[table] = { status: 'error', error: deleteError.message };
          continue;
        }

        // 插入数据
        const { error: insertError } = await supabase
          .from(table)
          .insert(tableData.data);

        if (insertError) {
          results[table] = { status: 'error', error: insertError.message };
        } else {
          results[table] = { status: 'success', count: tableData.data.length };
        }
      } catch (err) {
        results[table] = { status: 'error', error: String(err) };
      }
    }

    console.log('[Sync Database] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Database sync completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync Database] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
