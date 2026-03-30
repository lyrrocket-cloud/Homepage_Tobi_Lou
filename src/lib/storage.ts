import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 统一存储配置
 * 
 * 预览环境和生产环境使用同一个共享 bucket
 * 确保两边的数据完全同步
 */

// 共享的 bucket 名称（预览环境和生产环境共用）
const SHARED_BUCKET_NAME = 'bucket_1774837406196';

// 存储配置类型
interface StorageConfig {
  endpointUrl: string;
  bucketName: string;
  region: string;
}

// 获取存储配置
function getStorageConfig(): StorageConfig {
  const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL || '';
  
  // 始终使用共享 bucket
  const bucketName = SHARED_BUCKET_NAME;
  
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
  
  return {
    bucketName: config.bucketName,
    isShared: true, // 始终是共享模式
  };
}
