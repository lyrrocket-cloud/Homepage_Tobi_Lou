import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 工具数据类型
export interface Tool {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  order: number;
  isEmpty?: boolean;
}

// 数据库中的工具记录类型
interface DbTool {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  order: number;
  is_empty: boolean;
  created_at: string;
  updated_at: string | null;
}

// 默认工具数据
const defaultTools: Tool[] = [
  {
    id: 1,
    name: '旅行记账',
    description: '记录旅途中的每一笔开支',
    icon: 'Wallet',
    url: 'https://pvs6b4k729.coze.site',
    order: 1,
  },
  {
    id: 2,
    name: '今天谁开车',
    description: '轮流开车，公平分配',
    icon: 'Car',
    url: 'https://s864znmf32.coze.site',
    order: 2,
  },
  {
    id: 3,
    name: '旅行许愿池',
    description: '许下你的旅行心愿',
    icon: 'Sparkles',
    url: 'https://np9wpj8cx5.coze.site/',
    order: 3,
  },
  {
    id: 4,
    name: '更多工具',
    description: '敬请期待',
    icon: 'Plus',
    url: '',
    order: 4,
    isEmpty: true,
  },
];

// 将数据库记录转换为前端格式
function dbToTool(db: DbTool): Tool {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    icon: db.icon,
    url: db.url,
    order: db.order,
    isEmpty: db.is_empty,
  };
}

// 初始化默认数据（带缓存）
let isInitialized = false;
async function ensureDefaultData() {
  // 使用缓存避免重复检查
  if (isInitialized) return;

  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('tools')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Tools API] Error checking data:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('[Tools API] No data found, inserting default tools');

      const insertData = defaultTools.map(t => ({
        name: t.name,
        description: t.description,
        icon: t.icon,
        url: t.url,
        order: t.order,
        is_empty: t.isEmpty || false,
      }));

      const { error: insertError } = await client
        .from('tools')
        .insert(insertData);

      if (insertError) {
        console.error('[Tools API] Error inserting default data:', insertError);
      } else {
        console.log('[Tools API] Default tools inserted successfully');
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Tools API] Error in ensureDefaultData:', error);
  }
}

// GET - 获取工具列表
export async function GET() {
  try {
    await ensureDefaultData();
    
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('tools')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error('[Tools API] Error reading tools:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read tools' },
        { status: 500 }
      );
    }
    
    const tools = (data as DbTool[]).map(dbToTool);
    return NextResponse.json({ success: true, data: tools });
  } catch (error) {
    console.error('[Tools API] Error reading tools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read tools' },
      { status: 500 }
    );
  }
}

// POST - 更新工具列表（增量更新策略）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools, password } = body;

    if (password !== 'tobi7758258') {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    if (!Array.isArray(tools)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 增量更新策略：只更新变化的记录
    // 1. 获取现有数据
    const { data: existingData, error: fetchError } = await client
      .from('tools')
      .select('id, name, description, icon, url, "order", is_empty');

    if (fetchError) {
      console.error('[Tools API] Error fetching existing tools:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing tools' },
        { status: 500 }
      );
    }

    const existingMap = new Map(
      (existingData || []).map((item: any) => [item.id, item])
    );

    // 2. 分类：新增、更新、删除
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const existingIds = new Set((existingData || []).map((item: any) => item.id));
    const newIds = new Set(tools.map((t: Tool) => t.id));

    for (const tool of tools) {
      const existing = existingMap.get(tool.id);
      if (!existing) {
        // 新增记录
        toInsert.push({
          id: tool.id,
          name: tool.name,
          description: tool.description || '',
          icon: tool.icon || 'Wrench',
          url: tool.url || '',
          order: tool.order,
          is_empty: tool.isEmpty || false,
        });
      } else {
        // 检查是否有变化
        const hasChanges =
          existing.name !== tool.name ||
          existing.description !== tool.description ||
          existing.icon !== tool.icon ||
          existing.url !== tool.url ||
          existing.order !== tool.order ||
          existing.is_empty !== tool.isEmpty;

        if (hasChanges) {
          toUpdate.push({
            id: tool.id,
            name: tool.name,
            description: tool.description || '',
            icon: tool.icon || 'Wrench',
            url: tool.url || '',
            order: tool.order,
            is_empty: tool.isEmpty || false,
          });
        }
      }
    }

    // 3. 找出需要删除的记录
    const toDelete: number[] = [];
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        toDelete.push(id);
      }
    }

    // 4. 执行批量操作
    const errors: string[] = [];

    // 删除
    if (toDelete.length > 0) {
      const { error: deleteError } = await client
        .from('tools')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        errors.push(`Delete: ${deleteError.message}`);
        console.error('[Tools API] Error deleting tools:', deleteError);
      }
    }

    // 更新
    if (toUpdate.length > 0) {
      const { error: updateError } = await client
        .from('tools')
        .upsert(toUpdate);

      if (updateError) {
        errors.push(`Update: ${updateError.message}`);
        console.error('[Tools API] Error updating tools:', updateError);
      }
    }

    // 插入
    if (toInsert.length > 0) {
      const { error: insertError } = await client
        .from('tools')
        .insert(toInsert);

      if (insertError) {
        errors.push(`Insert: ${insertError.message}`);
        console.error('[Tools API] Error inserting tools:', insertError);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join('; ') },
        { status: 500 }
      );
    }

    console.log('[Tools API] Successfully saved', tools.length, 'tools (insert:', toInsert.length, 'update:', toUpdate.length, 'delete:', toDelete.length, ')');
    return NextResponse.json(
      { success: true, data: tools },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Tools API] Error saving tools:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to save tools: ${errorMessage}` },
      { status: 500 }
    );
  }
}
