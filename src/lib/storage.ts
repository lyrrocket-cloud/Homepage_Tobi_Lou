import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 统一存储配置
 * 
 * 注意：SDK 使用平台分配的 bucket
 * - 预览环境: coze_storage_7622866075486584870
 * - 生产环境: coze_storage_7622868643713613851
 * 
 * 两个环境的存储是独立的，照片文件不会自动同步
 */

// 存储配置类型
interface StorageConfig {
  endpointUrl: string;
  bucketName: string;
  region: string;
}

// 获取存储配置
function getStorageConfig(): StorageConfig {
  const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL || '';
  const bucketName = process.env.COZE_BUCKET_NAME || '';
  const region = 'cn-beijing';
  
  return {
    endpointUrl,
    bucketName,
    region,
  };
}

// 创建存储实例（单例模式）
let storageInstance: S3Storage | null = null;

export function getStorage(): S3Storage {
  if (!storageInstance) {
    const config = getStorageConfig();
    
    storageInstance = new S3Storage({
      endpointUrl: config.endpointUrl,
      accessKey: '',
      secretKey: '',
      bucketName: config.bucketName,
      region: config.region,
    });
  }
  
  return storageInstance;
}

// 获取当前使用的 bucket name（用于调试）
export function getCurrentBucketName(): string {
  return getStorageConfig().bucketName;
}

// 导出配置信息（用于同步页面显示）
export function getStorageInfo(): {
  bucketName: string;
  isShared: boolean;
} {
  return {
    bucketName: process.env.COZE_BUCKET_NAME || 'unknown',
    isShared: false, // 两个环境使用独立的存储
  };
}
