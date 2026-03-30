import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PUT - 更新访问记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { visit } = body;
    const { id: idStr } = await params;
    const id = parseInt(idStr);

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

    const { error } = await client.from('visits').update({
      region_id: regionId,
      title,
      description: description || '',
      date,
      image: image || '',
    }).eq('id', id);

    if (error) {
      console.error('[Visits API] Error updating visit:', error);
      return NextResponse.json(
        { success: false, error: '更新访问记录失败' },
        { status: 500 }
      );
    }

    console.log('[Visits API] Successfully updated visit:', id);

    return NextResponse.json({
      success: true,
      data: {
        id,
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
      { success: false, error: `更新访问记录失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - 删除访问记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少访问记录 ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { error } = await client.from('visits').delete().eq('id', id);

    if (error) {
      console.error('[Visits API] Error deleting visit:', error);
      return NextResponse.json(
        { success: false, error: '删除访问记录失败' },
        { status: 500 }
      );
    }

    console.log('[Visits API] Successfully deleted visit:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Visits API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `删除访问记录失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
