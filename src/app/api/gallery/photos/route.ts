import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getStorage } from '@/lib/storage';

// 获取存储实例
const storage = getStorage();

// 照片类型定义
export interface GalleryPhoto {
  id: number;
  title: string;
  region_id: number;
  date: string;
  year: number;
  image_key: string;
  image_url: string;
  url?: string;
  category: string;
  is_yearly?: boolean;
  created_at: string;
  updated_at?: string;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// ===== 默认本地照片（Supabase 不可用时的兜底数据） =====
// 使用 public/assets 下已有的本地图片，保证本地预览完整可用
const FALLBACK_PHOTOS: GalleryPhoto[] = [
  {
    id: 1,
    title: '元阳梯田',
    region_id: 124,
    date: '2026-01',
    year: 2026,
    image_key: 'assets/yunnan-025.jpg',
    image_url: '/assets/yunnan-025.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/TVaRw7iRq',
    category: '国内旅行',
    created_at: new Date().toISOString(),
    region: { id: 124, name: '云南', type: 'china' },
  },
  {
    id: 2,
    title: '新天鹅堡',
    region_id: 800,
    date: '2025-12',
    year: 2025,
    image_key: 'assets/germany-031.jpg',
    image_url: '/assets/germany-031.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/a9FuKhqcd',
    category: '国际旅行',
    created_at: new Date().toISOString(),
    region: { id: 800, name: '德国', type: 'world' },
  },
  {
    id: 3,
    title: '马特洪峰',
    region_id: 803,
    date: '2025-10',
    year: 2025,
    image_key: 'assets/europe-053.jpg',
    image_url: '/assets/europe-053.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/t2SsMNSu8',
    category: '国际旅行',
    created_at: new Date().toISOString(),
    region: { id: 803, name: '瑞士', type: 'world' },
  },
  {
    id: 4,
    title: '武功山',
    region_id: 113,
    date: '2025-09',
    year: 2025,
    image_key: 'assets/jiangxi-032.jpg',
    image_url: '/assets/jiangxi-032.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/36y3K2gm1',
    category: '国内旅行',
    created_at: new Date().toISOString(),
    region: { id: 113, name: '江西', type: 'china' },
  },
  {
    id: 5,
    title: '国清寺',
    region_id: 110,
    date: '2025-07',
    year: 2025,
    image_key: 'assets/zhejiang-003.jpg',
    image_url: '/assets/zhejiang-003.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/ghF4s7F9D',
    category: '国内旅行',
    created_at: new Date().toISOString(),
    region: { id: 110, name: '浙江', type: 'china' },
  },
  {
    id: 6,
    title: '千户苗寨',
    region_id: 123,
    date: '2025-05',
    year: 2025,
    image_key: 'assets/guizhou-036.jpg',
    image_url: '/assets/guizhou-036.jpg',
    url: 'https://lyrrocket.quickconnect.cn/mo/sharing/1ylcTSRaI',
    category: '国内旅行',
    created_at: new Date().toISOString(),
    region: { id: 123, name: '贵州', type: 'china' },
  },
];

// 获取所有照片
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('gallery_photos')
      .select('*, region:regions(id, name, type)')
      .order('date', { ascending: false });

    if (error) {
      console.warn('[Gallery API] Supabase error, using fallback photos:', error.message);
      return NextResponse.json({ photos: FALLBACK_PHOTOS, fallback: true });
    }

    // 没有数据也返回兜底（避免空 gallery）
    if (!data || data.length === 0) {
      console.warn('[Gallery API] No data in Supabase, using fallback photos');
      return NextResponse.json({ photos: FALLBACK_PHOTOS, fallback: true });
    }

    // 为每张照片刷新签名 URL
    const photosWithUrls = await Promise.all(
      (data || []).map(async (photo: GalleryPhoto) => {
        try {
          const imageUrl = await storage.generatePresignedUrl({
            key: photo.image_key,
            expireTime: 2592000, // 30 天
          });
          return {
            ...photo,
            image_url: imageUrl,
          };
        } catch {
          return photo;
        }
      })
    );

    return NextResponse.json({ photos: photosWithUrls });
  } catch (error) {
    // Supabase 未配置或连接失败 → 返回本地兜底数据，不 500
    console.warn('[Gallery API] Supabase unavailable, using fallback photos:', (error as Error).message);
    return NextResponse.json({ photos: FALLBACK_PHOTOS, fallback: true });
  }
}

// 添加照片
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, regionId, date, year, imageKey, imageUrl, url, category, isYearly } = body;

    if (!title || !regionId || !date || !year || !imageKey || !imageUrl || !category) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 不指定 ID，让数据库自动生成
    const { data, error } = await client
      .from('gallery_photos')
      .insert({
        title,
        region_id: regionId,
        date,
        year,
        image_key: imageKey,
        image_url: imageUrl,
        url: url || null,
        category,
        is_yearly: isYearly || false,
      })
      .select('*, region:regions(id, name, type)')
      .single();

    if (error) {
      console.error('添加照片失败:', error);
      return NextResponse.json({ error: '添加照片失败', details: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error('添加照片失败:', error);
    return NextResponse.json({ error: '添加照片失败' }, { status: 500 });
  }
}

// 删除照片
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少照片 ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 先获取照片信息，以便删除对象存储中的文件
    const { data: photo, error: fetchError } = await client
      .from('gallery_photos')
      .select('image_key')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('获取照片失败:', fetchError);
      return NextResponse.json({ error: '获取照片失败' }, { status: 500 });
    }

    // 删除数据库记录
    const { error: deleteError } = await client
      .from('gallery_photos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('删除照片失败:', deleteError);
      return NextResponse.json({ error: '删除照片失败' }, { status: 500 });
    }

    // 删除对象存储中的文件
    if (photo?.image_key) {
      try {
        await storage.deleteFile({ fileKey: photo.image_key });
      } catch (e) {
        console.error('删除存储文件失败:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除照片失败:', error);
    return NextResponse.json({ error: '删除照片失败' }, { status: 500 });
  }
}

// 更新照片
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, regionId, date, year, imageKey, imageUrl, url, category, isYearly } = body;

    if (!id || !title || !regionId || !date || !year || !imageKey || !imageUrl || !category) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 先获取旧照片信息
    const { data: oldPhoto, error: fetchError } = await client
      .from('gallery_photos')
      .select('image_key')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('获取照片失败:', fetchError);
      return NextResponse.json({ error: '获取照片失败' }, { status: 500 });
    }

    // 更新数据库记录
    const { data, error } = await client
      .from('gallery_photos')
      .update({
        title,
        region_id: regionId,
        date,
        year,
        image_key: imageKey,
        image_url: imageUrl,
        url: url || null,
        category,
        is_yearly: isYearly || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, region:regions(id, name, type)')
      .single();

    if (error) {
      console.error('更新照片失败:', error);
      return NextResponse.json({ error: '更新照片失败' }, { status: 500 });
    }

    // 如果图片更换了，删除旧的存储文件
    if (oldPhoto?.image_key && oldPhoto.image_key !== imageKey) {
      try {
        await storage.deleteFile({ fileKey: oldPhoto.image_key });
      } catch (e) {
        console.error('删除旧存储文件失败:', e);
      }
    }

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error('更新照片失败:', error);
    return NextResponse.json({ error: '更新照片失败' }, { status: 500 });
  }
}
