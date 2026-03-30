import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 视频数据类型
export interface Video {
  id: number;
  title: string;
  location: string;
  date: string;
  embedUrl: string;
  coverImage?: string;
  order: number;
  isEmpty?: boolean;
}

// 数据库中的视频记录类型（snake_case）
interface DbVideo {
  id: number;
  title: string;
  location: string;
  date: string;
  embed_url: string;
  cover_image: string | null;
  order: number;
  is_empty: boolean;
  created_at: string;
  updated_at: string | null;
}

// 默认视频数据（9个）
const defaultVideos: Video[] = [
  {
    id: 1,
    title: '滇东南之旅',
    location: '中国云南',
    date: '2026.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV13MzzBZEQT&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 1,
  },
  {
    id: 2,
    title: '虎跳峡徒步',
    location: '中国云南',
    date: '2025.03',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV17VGHzTEJB&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 2,
  },
  {
    id: 3,
    title: '川西之旅',
    location: '中国四川',
    date: '2025.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1ErLoz1Eg1&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 3,
  },
  {
    id: 4,
    title: '稻城亚丁之旅',
    location: '中国四川',
    date: '2025.03',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1yrL6YRE7W&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 4,
  },
  {
    id: 5,
    title: '张家界探险',
    location: '中国湖南',
    date: '2024.12',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1h4L6YRE8V&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 5,
  },
  {
    id: 6,
    title: '桂林山水游',
    location: '中国广西',
    date: '2025.01',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV2iRLLYRE9V&high_quality=1&danmaku=0&muted=0&autoplay=0',
    order: 6,
  },
  {
    id: 7,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 7,
    isEmpty: true,
  },
  {
    id: 8,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 8,
    isEmpty: true,
  },
  {
    id: 9,
    title: '敬请期待',
    location: '',
    date: '',
    embedUrl: '',
    order: 9,
    isEmpty: true,
  },
];

// 将数据库记录转换为前端格式
function dbToVideo(db: DbVideo): Video {
  return {
    id: db.id,
    title: db.title,
    location: db.location,
    date: db.date,
    embedUrl: db.embed_url,
    coverImage: db.cover_image || undefined,
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

    // 检查是否已有数据
    const { data, error } = await client
      .from('videos')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Videos API] Error checking data:', error);
      return;
    }

    // 如果没有数据，插入默认数据
    if (!data || data.length === 0) {
      console.log('[Videos API] No data found, inserting default videos');

      const insertData = defaultVideos.map(v => ({
        title: v.title,
        location: v.location || '',
        date: v.date || '',
        embed_url: v.embedUrl || '',
        cover_image: v.coverImage || null,
        order: v.order,
        is_empty: v.isEmpty || false,
      }));

      const { error: insertError } = await client
        .from('videos')
        .insert(insertData);

      if (insertError) {
        console.error('[Videos API] Error inserting default data:', insertError);
      } else {
        console.log('[Videos API] Default videos inserted successfully');
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Videos API] Error in ensureDefaultData:', error);
  }
}

// GET - 获取视频列表
export async function GET() {
  try {
    await ensureDefaultData();

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('videos')
      .select('*')
      .order('order', { ascending: true })
      .limit(9); // 限制只返回前9个视频

    if (error) {
      console.error('[Videos API] Error reading videos:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read videos' },
        { status: 500 }
      );
    }

    const videos = (data as DbVideo[]).map(dbToVideo);
    return NextResponse.json(
      { success: true, data: videos },
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('[Videos API] Error reading videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read videos' },
      { status: 500 }
    );
  }
}

// POST - 更新视频列表（增量更新策略）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videos, password } = body;

    console.log('[Videos API] Received request, videos count:', videos?.length);

    // 验证密码
    if (password !== 'tobi7758258') {
      console.log('[Videos API] Invalid password');
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    // 验证数据格式
    if (!Array.isArray(videos)) {
      console.log('[Videos API] Invalid data format, videos is not array');
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // 验证视频数量（限制最多9个）
    if (videos.length > 9) {
      console.log('[Videos API] Videos count exceeds limit:', videos.length);
      return NextResponse.json(
        { success: false, error: '视频数量不能超过9个' },
        { status: 400 }
      );
    }

    // 验证每个视频对象
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (typeof v.id !== 'number' || typeof v.order !== 'number') {
        console.log(`[Videos API] Invalid video at index ${i}:`, v);
        return NextResponse.json(
          { success: false, error: `Invalid video data at index ${i}` },
          { status: 400 }
        );
      }
    }

    const client = getSupabaseClient();

    // 增量更新策略：只更新变化的记录
    // 1. 获取现有数据
    const { data: existingData, error: fetchError } = await client
      .from('videos')
      .select('id, title, location, date, embed_url, cover_image, "order", is_empty');

    if (fetchError) {
      console.error('[Videos API] Error fetching existing videos:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing videos' },
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
    const newIds = new Set(videos.map((v: Video) => v.id));

    for (const video of videos) {
      const existing = existingMap.get(video.id);
      if (!existing) {
        // 新增记录
        toInsert.push({
          id: video.id,
          title: video.title,
          location: video.location || '',
          date: video.date || '',
          embed_url: video.embedUrl || '',
          cover_image: video.coverImage || null,
          order: video.order,
          is_empty: video.isEmpty || false,
        });
      } else {
        // 检查是否有变化
        const hasChanges =
          existing.title !== video.title ||
          existing.location !== video.location ||
          existing.date !== video.date ||
          existing.embed_url !== video.embedUrl ||
          existing.cover_image !== video.coverImage ||
          existing.order !== video.order ||
          existing.is_empty !== video.isEmpty;

        if (hasChanges) {
          toUpdate.push({
            id: video.id,
            title: video.title,
            location: video.location || '',
            date: video.date || '',
            embed_url: video.embedUrl || '',
            cover_image: video.coverImage || null,
            order: video.order,
            is_empty: video.isEmpty || false,
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
        .from('videos')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        errors.push(`Delete: ${deleteError.message}`);
        console.error('[Videos API] Error deleting videos:', deleteError);
      }
    }

    // 更新
    if (toUpdate.length > 0) {
      const { error: updateError } = await client
        .from('videos')
        .upsert(toUpdate);

      if (updateError) {
        errors.push(`Update: ${updateError.message}`);
        console.error('[Videos API] Error updating videos:', updateError);
      }
    }

    // 插入
    if (toInsert.length > 0) {
      const { error: insertError } = await client
        .from('videos')
        .insert(toInsert);

      if (insertError) {
        errors.push(`Insert: ${insertError.message}`);
        console.error('[Videos API] Error inserting videos:', insertError);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join('; ') },
        { status: 500 }
      );
    }

    console.log('[Videos API] Successfully saved', videos.length, 'videos (insert:', toInsert.length, 'update:', toUpdate.length, 'delete:', toDelete.length, ')');
    return NextResponse.json(
      { success: true, data: videos },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Videos API] Error saving videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to save videos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
