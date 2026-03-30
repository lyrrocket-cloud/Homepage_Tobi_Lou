import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 统一存储配置
 * 
 * 默认情况下，预览环境和生产环境使用不同的 bucket（由 COZE_BUCKET_NAME 指定）
 * 
 * 如果希望两个环境共享同一个存储，可以设置 SHARED_BUCKET_NAME 环境变量
 * 这样两边都会使用同一个 bucket，实现数据同步
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
  
  // 优先使用共享 bucket（如果配置了的话）
  // 这样预览环境和生产环境可以使用同一个 bucket
  const bucketName = process.env.SHARED_BUCKET_NAME || process.env.COZE_BUCKET_NAME || '';
  
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
  const config = getStorageConfig();
  const isShared = !!process.env.SHARED_BUCKET_NAME;
  
  return {
    bucketName: config.bucketName,
    isShared,
  };
}
