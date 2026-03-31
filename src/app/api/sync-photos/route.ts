import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getStorage } from '@/lib/storage';

// 导出路由配置
export const dynamic = 'force-dynamic';

// 获取存储实例
const storage = getStorage();

// 生产环境配置
const PRODUCTION_URL = 'https://727sr6g8sv.coze.site';

// 照片同步结果
interface SyncResult {
  id: number;
  title: string;
  sourceKey: string;
  targetKey: string;
  status: 'success' | 'skipped' | 'error';
  error?: string;
}

// POST - 同步照片文件
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

    // 解析请求
    let body: { direction?: string; table?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = { direction: 'import' };
    }
    
    const direction = body.direction || 'import';
    const table = body.table || 'gallery_photos';

    console.log(`[Sync Photos] Starting sync, direction: ${direction}, table: ${table}`);

    // 获取当前环境的数据库客户端
    const client = getSupabaseClient();

    // 根据表名获取照片列表
    let photos: Array<{ id: number; title: string; image_key: string }> = [];
    
    if (table === 'gallery_photos') {
      const { data, error } = await client
        .from('gallery_photos')
        .select('id, title, image_key');
      
      if (error) {
        return NextResponse.json(
          { success: false, error: `获取照片列表失败: ${error.message}` },
          { status: 500 }
        );
      }
      photos = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        image_key: p.image_key,
      }));
    } else if (table === 'photos') {
      const { data, error } = await client
        .from('photos')
        .select('id, title, image');
      
      if (error) {
        return NextResponse.json(
          { success: false, error: `获取照片列表失败: ${error.message}` },
          { status: 500 }
        );
      }
      photos = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        image_key: p.image,
      }));
    } else {
      return NextResponse.json(
        { success: false, error: `不支持的表: ${table}` },
        { status: 400 }
      );
    }

    if (photos.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要同步的照片',
        results: [],
        total: 0,
        successCount: 0,
        skippedCount: 0,
        errorCount: 0,
      });
    }

    // 确定源环境和目标环境
    const currentDomain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    const sourceUrl = direction === 'import' ? PRODUCTION_URL : currentDomain;
    const targetUrl = direction === 'import' ? currentDomain : PRODUCTION_URL;
    
    console.log(`[Sync Photos] Found ${photos.length} photos`);
    console.log(`[Sync Photos] Direction: ${direction}`);
    console.log(`[Sync Photos] Source: ${sourceUrl}`);
    console.log(`[Sync Photos] Target: ${targetUrl}`);

    const results: SyncResult[] = [];
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 逐个同步照片
    for (const photo of photos) {
      try {
        // 1. 从源环境获取签名 URL
        const signUrlResponse = await fetch(
          `${sourceUrl}/api/gallery/upload?key=${encodeURIComponent(photo.image_key)}`,
          {
            headers: {
              'Authorization': `Bearer ${expectedAuth}`,
            },
          }
        );

        if (!signUrlResponse.ok) {
          results.push({
            id: photo.id,
            title: photo.title,
            sourceKey: photo.image_key,
            targetKey: '',
            status: 'error',
            error: `获取源URL失败: ${signUrlResponse.status}`,
          });
          errorCount++;
          continue;
        }

        const signUrlData = await signUrlResponse.json();
        const signedUrl = signUrlData.url;

        if (!signedUrl) {
          results.push({
            id: photo.id,
            title: photo.title,
            sourceKey: photo.image_key,
            targetKey: '',
            status: 'skipped',
            error: '源环境无此文件',
          });
          skippedCount++;
          continue;
        }

        // 2. 下载照片
        const imageResponse = await fetch(signedUrl);
        if (!imageResponse.ok) {
          results.push({
            id: photo.id,
            title: photo.title,
            sourceKey: photo.image_key,
            targetKey: '',
            status: 'error',
            error: `下载失败: ${imageResponse.status}`,
          });
          errorCount++;
          continue;
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // 3. 上传到目标环境
        // 如果是导出到生产环境，需要调用生产环境的上传接口
        if (direction === 'export') {
          // 创建 FormData 并上传到生产环境
          const formData = new FormData();
          const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
          formData.append('file', blob, photo.image_key.split('/').pop() || 'photo.jpg');

          const uploadResponse = await fetch(`${PRODUCTION_URL}/api/gallery/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${expectedAuth}`,
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            results.push({
              id: photo.id,
              title: photo.title,
              sourceKey: photo.image_key,
              targetKey: '',
              status: 'error',
              error: `上传到生产环境失败: ${errorData.error || uploadResponse.status}`,
            });
            errorCount++;
            continue;
          }

          const uploadResult = await uploadResponse.json();
          results.push({
            id: photo.id,
            title: photo.title,
            sourceKey: photo.image_key,
            targetKey: uploadResult.key || '',
            status: 'success',
          });
          successCount++;
        } else {
          // 导入：上传到当前环境
          const newKey = await storage.uploadFile({
            fileContent: imageBuffer,
            fileName: photo.image_key,
            contentType: 'image/jpeg',
          });

          results.push({
            id: photo.id,
            title: photo.title,
            sourceKey: photo.image_key,
            targetKey: newKey,
            status: 'success',
          });
          successCount++;
        }

        console.log(`[Sync Photos] Synced: ${photo.title}`);

      } catch (error) {
        console.error(`[Sync Photos] Error syncing ${photo.title}:`, error);
        results.push({
          id: photo.id,
          title: photo.title,
          sourceKey: photo.image_key,
          targetKey: '',
          status: 'error',
          error: String(error),
        });
        errorCount++;
      }
    }

    console.log(`[Sync Photos] Completed: ${successCount} success, ${skippedCount} skipped, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `照片同步完成: ${successCount} 成功, ${skippedCount} 跳过, ${errorCount} 失败`,
      results,
      total: photos.length,
      successCount,
      skippedCount,
      errorCount,
      direction,
      table,
      timestamp: new Date().toISOString(),
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
