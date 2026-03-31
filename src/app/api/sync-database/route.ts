import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 导出路由配置：禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 需要排除的计算字段（API 动态生成，不应存储到数据库）
const COMPUTED_FIELDS = ['imageUrl', 'thumbnailUrl', 'videoUrl', 'children', 'hasVisited', 'image_url', 'region'];

// 生产环境配置
const PRODUCTION_URL = 'https://727sr6g8sv.coze.site';

// 同步的数据表列表
const SYNC_TABLES = ['regions', 'visits', 'gallery_photos', 'photos', 'videos', 'tools'];

// API 路径映射
const API_PATH_MAP: Record<string, string> = {
  'gallery_photos': 'gallery/photos',
};

// 字段名映射：驼峰 -> 下划线
function convertToDbFormat(data: any[]): any[] {
  return data.map(item => {
    const converted: any = {};
    for (const [key, value] of Object.entries(item)) {
      // 跳过计算字段
      if (COMPUTED_FIELDS.includes(key)) continue;
      // 将驼峰转换为下划线
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      converted[dbKey] = value;
    }
    return converted;
  });
}

// 从指定环境获取数据
async function fetchDataFromEnv(baseUrl: string, password: string): Promise<Record<string, any[]>> {
  const exportedData: Record<string, any[]> = {};

  for (const table of SYNC_TABLES) {
    try {
      const apiPath = API_PATH_MAP[table] || table;
      const response = await fetch(`${baseUrl}/api/${apiPath}`, {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        console.log(`[Sync] Failed to fetch ${table}: HTTP ${response.status}`);
        exportedData[table] = [];
        continue;
      }

      const result = await response.json();
      const data = result.data || result.photos || result.videos || result.tools || [];
      exportedData[table] = data;
      console.log(`[Sync] Fetched ${table}: ${data.length} records`);
    } catch (error) {
      console.log(`[Sync] Error fetching ${table}:`, error);
      exportedData[table] = [];
    }
  }

  return exportedData;
}

// 导入数据到指定数据库
async function importDataToDb(
  supabase: any, 
  data: Record<string, any[]>
): Promise<Record<string, { status: string; count?: number; error?: string }>> {
  const results: Record<string, { status: string; count?: number; error?: string }> = {};

  for (const table of SYNC_TABLES) {
    const tableData = data[table];
    if (!tableData || tableData.length === 0) {
      results[table] = { status: 'skipped', count: 0 };
      continue;
    }

    // 转换字段名
    const dbData = convertToDbFormat(tableData);

    try {
      if (table === 'regions') {
        // regions 使用 upsert 避免外键约束问题
        const { error } = await supabase
          .from(table)
          .upsert(dbData, { onConflict: 'id' });

        if (error) {
          results[table] = { status: 'error', error: error.message };
        } else {
          results[table] = { status: 'success', count: tableData.length };
        }
      } else {
        // 其他表：先清空再插入
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', 0);

        if (deleteError) {
          results[table] = { status: 'error', error: deleteError.message };
          continue;
        }

        const { error: insertError } = await supabase
          .from(table)
          .insert(dbData);

        if (insertError) {
          results[table] = { status: 'error', error: insertError.message };
        } else {
          results[table] = { status: 'success', count: tableData.length };
        }
      }
    } catch (err) {
      results[table] = { status: 'error', error: String(err) };
    }
  }

  return results;
}

// POST - 同步数据库
export async function POST(request: NextRequest) {
  try {
    // 验证密码
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.SYNC_SECRET || 'tobi7758258';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 解析请求体
    let body: { direction?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = { direction: 'import' };
    }
    
    const direction = body.direction || 'import';

    // 当前环境的 Supabase 配置
    const currentSupabaseUrl = process.env.COZE_SUPABASE_URL;
    const currentSupabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

    if (!currentSupabaseUrl || !currentSupabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    let results: Record<string, { status: string; count?: number; error?: string }>;
    let message: string;

    if (direction === 'import') {
      // 导入：生产环境 → 当前环境
      console.log('[Sync] Importing from production...');
      
      // 从生产环境获取数据
      const productionData = await fetchDataFromEnv(PRODUCTION_URL, expectedAuth);
      
      // 导入到当前环境
      const currentSupabase = createClient(currentSupabaseUrl, currentSupabaseKey);
      results = await importDataToDb(currentSupabase, productionData);
      message = '数据已从生产环境导入到开发环境';

    } else if (direction === 'export') {
      // 导出：当前环境 → 生产环境
      // 需要生产环境的 Supabase 凭据
      const productionSupabaseUrl = process.env.PRODUCTION_SUPABASE_URL;
      const productionSupabaseKey = process.env.PRODUCTION_SUPABASE_KEY;

      if (!productionSupabaseUrl || !productionSupabaseKey) {
        return NextResponse.json(
          { 
            success: false, 
            error: '导出功能需要配置生产环境数据库凭据。\n\n请在环境变量中设置：\n- PRODUCTION_SUPABASE_URL\n- PRODUCTION_SUPABASE_KEY\n\n或联系管理员进行配置。' 
          },
          { status: 500 }
        );
      }

      console.log('[Sync] Exporting to production...');
      
      // 从当前环境获取数据
      const currentDomain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
      const currentData = await fetchDataFromEnv(currentDomain, expectedAuth);
      
      // 导入到生产环境
      const productionSupabase = createClient(productionSupabaseUrl, productionSupabaseKey);
      results = await importDataToDb(productionSupabase, currentData);
      message = '数据已从开发环境导出到生产环境';

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid direction. Use "import" or "export".' },
        { status: 400 }
      );
    }

    console.log('[Sync] Results:', results);

    return NextResponse.json({
      success: true,
      message,
      results,
      direction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
