import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 统一存储配置
 * 
 * 注意：SDK 使用平台分配的 bucket
 * - 预览环境和生产环境使用独立的存储桶
 */

// 创建存储实例（单例模式）
let storageInstance: S3Storage | null = null;

export function getStorage(): S3Storage {
  if (!storageInstance) {
    storageInstance = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: 'cn-beijing',
    });
  }
  
  return storageInstance;
}
