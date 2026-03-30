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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到上传的文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 生成文件名（使用 gallery/ 前缀便于管理）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `gallery/${timestamp}-${randomStr}.${ext}`;
    
    // 上传到对象存储
    const actualKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });
    
    // 生成签名 URL（有效期 30 天）
    const signedUrl = await storage.generatePresignedUrl({
      key: actualKey,
      expireTime: 2592000, // 30 天
    });
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
      key: actualKey,
      fileName: fileName,
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}

// 获取签名 URL 的接口（用于刷新过期的 URL）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: '缺少文件 key' },
        { status: 400 }
      );
    }
    
    // 生成新的签名 URL
    const signedUrl = await storage.generatePresignedUrl({
      key: key,
      expireTime: 2592000, // 30 天
    });
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error('获取签名 URL 失败:', error);
    return NextResponse.json(
      { error: '获取签名 URL 失败' },
      { status: 500 }
    );
  }
}
