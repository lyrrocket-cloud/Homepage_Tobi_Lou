import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getStorage } from '@/lib/storage';

// 获取存储实例
const storage = getStorage();

// 照片数据类型
export interface Photo {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string; // 照片key（用于从对象存储获取）
  url: string;  // 外部链接
  order: number;
  imageUrl?: string; // 动态生成的访问URL（仅用于前端显示，不持久化）
}

// 数据库中的照片记录类型（snake_case）
interface DbPhoto {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string;
  url: string;
  order: number;
  created_at: string;
  updated_at: string | null;
}

// 默认照片数据（9张）
const defaultPhotos: Photo[] = [
  {
    id: 1,
    title: '元阳梯田',
    location: '中国云南',
    date: '2026.01',
    image: 'photos/yunnan-025.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/TVaRw7iRq',
    order: 1,
  },
  {
    id: 2,
    title: '新天鹅堡',
    location: '德国',
    date: '2025.12',
    image: 'photos/germany-031.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/a9FuKhqcd',
    order: 2,
  },
  {
    id: 3,
    title: '马特洪峰',
    location: '欧洲',
    date: '2025.10',
    image: 'photos/europe-053.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/t2SsMNSu8',
    order: 3,
  },
  {
    id: 4,
    title: '武功山',
    location: '中国江西',
    date: '2025.09',
    image: 'photos/jiangxi-032.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/36y3K2gm1',
    order: 4,
  },
  {
    id: 5,
    title: '国清寺',
    location: '中国浙江',
    date: '2025.07',
    image: 'photos/zhejiang-003.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/ghF4s7F9D',
    order: 5,
  },
  {
    id: 6,
    title: '千户苗寨',
    location: '中国贵州',
    date: '2025.05',
    image: 'photos/guizhou-036.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/1ylcTSRaI',
    order: 6,
  },
  {
    id: 7,
    title: '稻城亚丁',
    location: '中国四川',
    date: '2025.03',
    image: 'photos/sichuan-042.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/3kLmN9oPq',
    order: 7,
  },
  {
    id: 8,
    title: '桂林山水',
    location: '中国广西',
    date: '2025.01',
    image: 'photos/guangxi-058.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/7rStU2vWx',
    order: 8,
  },
  {
    id: 9,
    title: '张家界',
    location: '中国湖南',
    date: '2024.12',
    image: 'photos/hunan-067.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/4yVwM1nZx',
    order: 9,
  },
];

// 将数据库记录转换为前端格式
function dbToPhoto(db: DbPhoto): Photo {
  return {
    id: db.id,
    title: db.title,
    location: db.location,
    date: db.date,
    image: db.image,
    url: db.url,
    order: db.order,
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
      .from('photos')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Photos API] Error checking data:', error);
      return;
    }

    // 如果没有数据，插入默认数据
    if (!data || data.length === 0) {
      console.log('[Photos API] No data found, inserting default photos');

      const insertData = defaultPhotos.map(p => ({
        title: p.title,
        location: p.location,
        date: p.date,
        image: p.image,
        url: p.url,
        order: p.order,
      }));

      const { error: insertError } = await client
        .from('photos')
        .insert(insertData);

      if (insertError) {
        console.error('[Photos API] Error inserting default data:', insertError);
      } else {
        console.log('[Photos API] Default photos inserted successfully');
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Photos API] Error in ensureDefaultData:', error);
  }
}

// GET - 获取照片列表
export async function GET() {
  try {
    await ensureDefaultData();

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('photos')
      .select('*')
      .order('order', { ascending: true })
      .limit(9); // 限制只返回前9张照片

    if (error) {
      console.error('[Photos API] Error reading photos:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to read photos' },
        { status: 500 }
      );
    }

    const photos = (data as DbPhoto[]).map(dbToPhoto);
    
    // 为每张照片生成访问URL
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        try {
          // 尝试从对象存储生成访问URL
          const url = await storage.generatePresignedUrl({
            key: photo.image,
            expireTime: 86400, // 1天有效期
          });
          return { ...photo, imageUrl: url };
        } catch (error) {
          console.error(`[Photos API] Failed to generate URL for ${photo.image}:`, error);
          // 如果对象存储中没有文件，返回本地路径
          return { ...photo, imageUrl: `/assets/${photo.image.replace('photos/', '')}` };
        }
      })
    );

    console.log('[Photos API] Returning', photosWithUrls.length, 'photos');
    return NextResponse.json({ success: true, data: photosWithUrls });
  } catch (error) {
    console.error('[Photos API] Error reading photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to read photos: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - 更新照片列表（增量更新策略）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photos, password } = body;

    console.log('[Photos API] Received request, photos count:', photos?.length);

    // 验证密码
    if (password !== 'tobi7758258') {
      console.log('[Photos API] Invalid password');
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    // 验证数据格式
    if (!Array.isArray(photos)) {
      console.log('[Photos API] Invalid data format, photos is not array');
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // 验证照片数量（限制最多9张）
    if (photos.length > 9) {
      console.log('[Photos API] Photos count exceeds limit:', photos.length);
      return NextResponse.json(
        { success: false, error: '照片数量不能超过9张' },
        { status: 400 }
      );
    }

    // 验证每个照片对象
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      if (typeof p.id !== 'number' || typeof p.order !== 'number') {
        console.log(`[Photos API] Invalid photo at index ${i}:`, p);
        return NextResponse.json(
          { success: false, error: `Invalid photo data at index ${i}` },
          { status: 400 }
        );
      }
    }

    const client = getSupabaseClient();

    // 增量更新策略：只更新变化的记录
    // 1. 获取现有数据
    const { data: existingData, error: fetchError } = await client
      .from('photos')
      .select('id, title, location, date, image, url, "order"');

    if (fetchError) {
      console.error('[Photos API] Error fetching existing photos:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing photos' },
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
    const newIds = new Set(photos.map((p: Photo) => p.id));

    for (const photo of photos) {
      const existing = existingMap.get(photo.id);
      if (!existing) {
        // 新增记录
        toInsert.push({
          id: photo.id,
          title: photo.title,
          location: photo.location,
          date: photo.date,
          image: photo.image,
          url: photo.url,
          order: photo.order,
        });
      } else {
        // 检查是否有变化
        const hasChanges =
          existing.title !== photo.title ||
          existing.location !== photo.location ||
          existing.date !== photo.date ||
          existing.image !== photo.image ||
          existing.url !== photo.url ||
          existing.order !== photo.order;

        if (hasChanges) {
          toUpdate.push({
            id: photo.id,
            title: photo.title,
            location: photo.location,
            date: photo.date,
            image: photo.image,
            url: photo.url,
            order: photo.order,
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
        .from('photos')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        errors.push(`Delete: ${deleteError.message}`);
        console.error('[Photos API] Error deleting photos:', deleteError);
      }
    }

    // 更新
    if (toUpdate.length > 0) {
      const { error: updateError } = await client
        .from('photos')
        .upsert(toUpdate);

      if (updateError) {
        errors.push(`Update: ${updateError.message}`);
        console.error('[Photos API] Error updating photos:', updateError);
      }
    }

    // 插入
    if (toInsert.length > 0) {
      const { error: insertError } = await client
        .from('photos')
        .insert(toInsert);

      if (insertError) {
        errors.push(`Insert: ${insertError.message}`);
        console.error('[Photos API] Error inserting photos:', insertError);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join('; ') },
        { status: 500 }
      );
    }

    console.log('[Photos API] Successfully saved', photos.length, 'photos (insert:', toInsert.length, 'update:', toUpdate.length, 'delete:', toDelete.length, ')');
    return NextResponse.json(
      { success: true, data: photos },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Photos API] Error in POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
