import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 使用 Coze 对象存储上传图片
export async function POST(request: NextRequest) {
  // 添加请求超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

  try {
    // 检查对象存储配置
    const bucketName = process.env.COZE_BUCKET_NAME;

    if (!bucketName) {
      console.error('[Upload] Missing Coze Storage config');
      clearTimeout(timeoutId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Coze 对象存储未配置，请检查环境变量 COZE_BUCKET_NAME' 
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    // 验证密码
    if (password !== 'tobi7758258') {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    if (!file) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: '不支持的文件类型，仅支持 JPG/PNG/GIF/WEBP' },
        { status: 400 }
      );
    }

    // 验证文件大小（限制 10MB）
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      clearTimeout(timeoutId);
      console.error('[Upload] File too large:', file.size, 'bytes');
      return NextResponse.json(
        { success: false, error: '文件过大（最大10MB）', size: file.size },
        { status: 413 }
      );
    }

    // 生成文件名
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `photos/photo-${timestamp}.${ext}`;

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('[Upload] Uploading to Coze Storage, file:', fileName, 'size:', file.size);

    // 上传到 Coze 对象存储
    const key = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });

    clearTimeout(timeoutId);

    console.log('[Upload] File uploaded successfully, key:', key);

    // 生成访问URL（永久有效）
    const url = await storage.generatePresignedUrl({
      key: key,
      expireTime: 86400 * 365 * 10, // 10年有效期
    });

    return NextResponse.json({
      success: true,
      data: {
        path: key,
        key: key,
        fileName: key,
        url: url,
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Upload] Request timeout');
      return NextResponse.json(
        { success: false, error: '上传超时', details: '请求超过30秒' },
        { status: 504 }
      );
    }

    console.error('[Upload] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    return NextResponse.json(
      { success: false, error: `上传失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
