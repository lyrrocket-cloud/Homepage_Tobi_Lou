import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 图片代理API - 从 Supabase Storage 获取图片并返回
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  // 添加请求超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

  try {
    const { key } = await params;

    // 解码 key（URL 编码）
    const decodedKey = decodeURIComponent(key);

    // 验证 key 的安全性
    if (!decodedKey || decodedKey.includes('..') || decodedKey.includes('\\')) {
      console.error('[Image API] Invalid key:', decodedKey);
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: '无效的图片路径' },
        { status: 400 }
      );
    }

    console.log('[Image API] Fetching image from Supabase Storage:', decodedKey);

    // 获取 Supabase 客户端
    const client = getSupabaseClient();

    // 从 Supabase Storage 下载图片
    const { data, error } = await client.storage
      .from('photos')
      .download(decodedKey);

    clearTimeout(timeoutId);

    if (error) {
      console.error('[Image API] Download error:', error.message, error);

      // 返回详细的错误信息
      return NextResponse.json(
        {
          error: '图片加载失败',
          details: error.message,
          hint: '请检查 Supabase Storage 中是否存在该文件',
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.error('[Image API] No data returned for key:', decodedKey);
      return NextResponse.json(
        { error: '图片不存在', key: decodedKey },
        { status: 404 }
      );
    }

    // 验证数据是否为 Blob
    if (!(data instanceof Blob)) {
      console.error('[Image API] Invalid data type:', typeof data);
      return NextResponse.json(
        { error: '无效的图片数据' },
        { status: 500 }
      );
    }

    // 检查文件大小（限制 10MB）
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (data.size > MAX_FILE_SIZE) {
      console.error('[Image API] File too large:', data.size, 'bytes');
      return NextResponse.json(
        { error: '图片文件过大（最大10MB）', size: data.size },
        { status: 413 }
      );
    }

    // 根据 key 确定内容类型
    const ext = decodedKey.split('.').pop()?.toLowerCase() || 'jpg';
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';

    // 返回图片
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 缓存1年
        'Content-Disposition': 'inline', // 直接在浏览器中显示
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Image API] Request timeout');
      return NextResponse.json(
        { error: '图片加载超时', details: '请求超过15秒' },
        { status: 504 }
      );
    }

    console.error('[Image API] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: '图片加载失败',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
