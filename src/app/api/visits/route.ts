import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 访问记录数据类型
export interface Visit {
  id: number;
  regionId: number;
  title: string;
  description: string;
  date: string;
  image: string;
  orderNum: number;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// 数据库中的访问记录类型
interface DbVisit {
  id: number;
  region_id: number;
  title: string;
  description: string | null;
  date: string;
  image: string | null;
  order_num: number;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// GET - 获取访问记录
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取搜索参数
    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const type = searchParams.get('type') as 'china' | 'world' | null;
    const includeRegion = searchParams.get('includeRegion') === 'true';

    let query = client.from('visits').select('*');

    // 如果需要包含地区信息
    if (includeRegion) {
      query = client.from('visits').select('*, regions(id, name, type)');
    }

    // 按地区筛选
    if (regionId) {
      query = query.eq('region_id', parseInt(regionId));
    }

    query = query.order('order_num', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Visits API] Error reading visits:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read visits' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const visits: Visit[] = (data as DbVisit[]).map((db) => ({
      id: db.id,
      regionId: db.region_id,
      title: db.title,
      description: db.description || '',
      date: db.date,
      image: db.image || '',
      orderNum: db.order_num,
      region: db.region
        ? {
            id: db.region.id,
            name: db.region.name,
            type: db.region.type,
          }
        : undefined,
    }));

    return NextResponse.json({ success: true, data: visits });
  } catch (error) {
    console.error('[Visits API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to read visits: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - 添加访问记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visit } = body;

    if (!visit) {
      return NextResponse.json(
        { success: false, error: '缺少访问记录数据' },
        { status: 400 }
      );
    }

    const { regionId, title, description, date, image } = visit;

    if (!regionId || !title || !date) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段（regionId、title、date）' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取当前最大的 ID
    const { data: maxIdData } = await client
      .from('visits')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    const newId = (maxIdData && maxIdData[0]?.id ? maxIdData[0].id + 1 : 1);

    // 插入新的访问记录
    const { data, error } = await client.from('visits').insert({
      id: newId,
      region_id: regionId,
      title,
      description: description || '',
      date,
      image: image || '',
      order_num: newId,
    });

    if (error) {
      console.error('[Visits API] Error inserting visit:', error);
      return NextResponse.json(
        { success: false, error: '添加访问记录失败' },
        { status: 500 }
      );
    }

    console.log('[Visits API] Successfully added visit:', title);

    return NextResponse.json({
      success: true,
      data: {
        id: newId,
        regionId,
        title,
        description,
        date,
        image,
      },
    });
  } catch (error) {
    console.error('[Visits API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `添加访问记录失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
