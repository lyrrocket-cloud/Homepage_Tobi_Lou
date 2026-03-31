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
  created_at: string;
  updated_at?: string;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// 获取所有照片
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('gallery_photos')
      .select('*, region:regions(id, name, type)')
      .order('date', { ascending: false });

    if (error) {
      console.error('获取照片失败:', error);
      return NextResponse.json({ error: '获取照片失败' }, { status: 500 });
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
    console.error('获取照片失败:', error);
    return NextResponse.json({ error: '获取照片失败' }, { status: 500 });
  }
}

// 添加照片
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, regionId, date, year, imageKey, imageUrl, url, category } = body;

    if (!title || !regionId || !date || !year || !imageKey || !imageUrl || !category) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const client = getSupabaseClient();

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
      })
      .select('*, region:regions(id, name, type)')
      .single();

    if (error) {
      console.error('添加照片失败:', error);
      // 检查是否是主键冲突，尝试重新插入
      if (error.code === '23505') {
        // 获取当前最大 ID
        const { data: maxIdResult } = await client
          .from('gallery_photos')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);
        
        const newId = (maxIdResult?.[0]?.id || 0) + 1;
        
        const { data: retryData, error: retryError } = await client
          .from('gallery_photos')
          .insert({
            id: newId,
            title,
            region_id: regionId,
            date,
            year,
            image_key: imageKey,
            image_url: imageUrl,
            url: url || null,
            category,
          })
          .select('*, region:regions(id, name, type)')
          .single();
        
        if (retryError) {
          console.error('重试添加照片失败:', retryError);
          return NextResponse.json({ error: '添加照片失败', details: retryError.message }, { status: 500 });
        }
        
        return NextResponse.json({ photo: retryData });
      }
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
    const { id, title, regionId, date, year, imageKey, imageUrl, url, category } = body;

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
