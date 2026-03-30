import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 导出路由配置：禁用所有缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// 地区数据类型
export interface Region {
  id: number;
  name: string;
  type: 'china' | 'world';
  parentId: number | null;
  orderNum: number;
  children?: Region[];
  hasVisited?: boolean;
}

// 数据库中的地区记录类型
interface DbRegion {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
  order_num: number;
}

// GET - 获取地区列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取搜索参数
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'china' | 'world' | null;
    const withChildren = searchParams.get('withChildren') === 'true';

    // 添加调试日志
    console.log('[Regions API] Request params:', { type, withChildren, allParams: Object.fromEntries(searchParams) });

    // 构建查询
    let query = client.from('regions').select('*');

    if (type) {
      console.log('[Regions API] Filtering by type:', type);
      query = query.eq('type', type);
    }

    query = query.order('order_num', { ascending: true });

    const { data, error } = await query;

    console.log('[Regions API] Query result:', { 
      hasError: !!error, 
      error: error?.message, 
      dataLength: data?.length, 
      firstItem: data?.[0] 
    });

    if (error) {
      console.error('[Regions API] Error reading regions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read regions' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [] }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    const regions: Region[] = (data as DbRegion[]).map((db) => ({
      id: db.id,
      name: db.name,
      type: db.type as 'china' | 'world',
      parentId: db.parent_id,
      orderNum: db.order_num,
    }));

    console.log('[Regions API] Mapped regions count:', regions.length);
    console.log('[Regions API] Sample regions:', regions.slice(0, 3).map(r => ({ id: r.id, name: r.name, type: r.type, parentId: r.parentId })));

    // 如果需要获取子区域
    if (withChildren) {
      console.log('[Regions API] Building parent/child structure...');
      const parentRegions = regions.filter((r) => !r.parentId);
      const childRegions = regions.filter((r) => r.parentId);

      console.log('[Regions API] Parent regions count:', parentRegions.length);
      console.log('[Regions API] Child regions count:', childRegions.length);

      if (parentRegions.length === 0) {
        console.error('[Regions API] No parent regions found! All regions have parentId.');
        console.error('[Regions API] First 10 regions:', regions.slice(0, 10).map(r => ({ id: r.id, name: r.name, type: r.type, parentId: r.parentId })));
      }

      // 为每个父区域添加子区域
      parentRegions.forEach((parent) => {
        parent.children = childRegions
          .filter((child) => child.parentId === parent.id)
          .sort((a, b) => a.orderNum - b.orderNum);
      });

      // 检查每个地区是否有访问记录
      const visitsQuery = await client.from('visits').select('region_id');
      const visitedRegionIds = new Set(
        (visitsQuery.data || []).map((v: any) => v.region_id)
      );

      const markVisited = (region: Region) => {
        region.hasVisited = visitedRegionIds.has(region.id);
        if (region.children) {
          region.children.forEach(markVisited);
        }
      };

      parentRegions.forEach(markVisited);

      console.log('[Regions API] Returning parent regions count:', parentRegions.length);

      return NextResponse.json({ success: true, data: parentRegions }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    }

    return NextResponse.json({ success: true, data: regions }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[Regions API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to read regions: ${errorMessage}` },
      { status: 500 }
    );
  }
}
