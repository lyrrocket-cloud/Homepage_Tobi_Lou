import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getStorage } from '@/lib/storage';

// 导出路由配置
export const dynamic = 'force-dynamic';

// 获取存储实例
const storage = getStorage();

// 照片备份源 URL 前缀（预览环境的存储 URL）
// 这个需要根据实际情况配置

interface PhotoBackup {
  id: number;
  title: string;
  image: string;
  sourceUrl?: string;
}

// POST - 从备份数据同步照片到当前环境
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

    const body = await request.json();
    const { photos } = body as { photos: PhotoBackup[] };

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { success: false, error: 'Invalid photos data' },
        { status: 400 }
      );
    }

    console.log(`[Sync Photos] Starting sync for ${photos.length} photos`);

    const results: Array<{
      id: number;
      title: string;
      status: 'success' | 'skipped' | 'error';
      newKey?: string;
      error?: string;
    }> = [];

    for (const photo of photos) {
      try {
        // 检查当前环境是否已有此文件
        const existingFiles = await storage.listFiles({ prefix: photo.image });
        
        if (existingFiles.keys.includes(photo.image)) {
          console.log(`[Sync Photos] Photo ${photo.id} already exists: ${photo.image}`);
          results.push({
            id: photo.id,
            title: photo.title,
            status: 'skipped',
            newKey: photo.image,
          });
          continue;
        }

        // 如果有 sourceUrl，从源 URL 下载并上传
        if (photo.sourceUrl) {
          console.log(`[Sync Photos] Downloading photo ${photo.id} from source URL`);
          
          const response = await fetch(photo.sourceUrl);
          if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          
          // 上传到当前环境的存储
          const newKey = await storage.uploadFile({
            fileContent: buffer,
            fileName: photo.image,
            contentType: 'image/jpeg',
          });

          console.log(`[Sync Photos] Photo ${photo.id} uploaded: ${newKey}`);
          results.push({
            id: photo.id,
            title: photo.title,
            status: 'success',
            newKey,
          });
        } else {
          results.push({
            id: photo.id,
            title: photo.title,
            status: 'error',
            error: 'No source URL provided',
          });
        }
      } catch (err) {
        console.error(`[Sync Photos] Error syncing photo ${photo.id}:`, err);
        results.push({
          id: photo.id,
          title: photo.title,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`[Sync Photos] Completed: ${successCount} success, ${skippedCount} skipped, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `Photos sync completed: ${successCount} uploaded, ${skippedCount} skipped, ${errorCount} failed`,
      results,
    });
  } catch (error) {
    console.error('[Sync Photos] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - 获取当前环境需要同步的照片列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const password = searchParams.get('password');

    if (password !== 'tobi7758258') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取数据库中的照片记录
    const client = getSupabaseClient();
    const { data: photos, error } = await client
      .from('photos')
      .select('id, title, image')
      .order('id');

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 获取存储中已有的文件
    const existingFiles = await storage.listFiles({ prefix: 'photos/' });
    const existingKeys = new Set(existingFiles.keys);

    // 找出缺失的照片
    const missingPhotos = photos.filter((p: any) => !existingKeys.has(p.image));
    const existingPhotos = photos.filter((p: any) => existingKeys.has(p.image));

    return NextResponse.json({
      success: true,
      data: {
        total: photos.length,
        existing: existingPhotos.length,
        missing: missingPhotos.length,
        missingPhotos: missingPhotos.map((p: any) => ({
          id: p.id,
          title: p.title,
          image: p.image,
        })),
        existingPhotos: existingPhotos.map((p: any) => ({
          id: p.id,
          title: p.title,
          image: p.image,
        })),
      },
    });
  } catch (error) {
    console.error('[Sync Photos] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
