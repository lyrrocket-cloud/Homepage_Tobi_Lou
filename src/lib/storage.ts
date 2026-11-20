import { S3Storage } from 'coze-coding-dev-sdk';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 统一存储配置
 *
 * - 默认：Coze 对象存储（S3Storage，平台分配 bucket）
 * - NAS 自托管：STORAGE_TYPE=local 时使用本地文件存储
 *   文件保存在 DATA_STORAGE_PATH（默认 <cwd>/data），通过 /api/image/[key] 访问
 */

export interface StorageClient {
  uploadFile(options: {
    fileContent: Buffer;
    fileName: string;
    contentType: string;
  }): Promise<string>;
  generatePresignedUrl(options: { key: string; expireTime: number }): Promise<string>;
  deleteFile(options: { fileKey: string }): Promise<void>;
  listFiles(options: { prefix: string }): Promise<{ keys: string[]; isTruncated: boolean }>;
}

export function isLocalStorage(): boolean {
  return process.env.STORAGE_TYPE === 'local';
}

export function getStorageRoot(): string {
  return process.env.DATA_STORAGE_PATH || path.join(process.cwd(), 'data');
}

/** 将 key 解析为存储根目录内的绝对路径，阻止路径穿越 */
function resolveKey(key: string): string {
  const root = getStorageRoot();
  const safeKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
  const resolved = path.resolve(root, safeKey);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`Invalid storage key: ${key}`);
  }
  return resolved;
}

/** 本地存储模式下读取文件内容（/api/image/[key] 使用） */
export async function readLocalFile(key: string): Promise<Buffer> {
  return fs.readFile(resolveKey(key));
}

class LocalFileStorage implements StorageClient {
  async uploadFile({ fileContent, fileName }: {
    fileContent: Buffer;
    fileName: string;
    contentType: string;
  }): Promise<string> {
    const filePath = resolveKey(fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileContent);
    return fileName;
  }

  async generatePresignedUrl({ key }: { key: string; expireTime: number }): Promise<string> {
    // 文件不存在时抛错，让调用方走既有的本地资源回退逻辑
    await fs.access(resolveKey(key));
    return `/api/image/${encodeURIComponent(key)}`;
  }

  async deleteFile({ fileKey }: { fileKey: string }): Promise<void> {
    try {
      await fs.unlink(resolveKey(fileKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  async listFiles({ prefix }: { prefix: string }): Promise<{ keys: string[]; isTruncated: boolean }> {
    const root = getStorageRoot();
    const baseDir = resolveKey(prefix || '.');
    const keys: string[] = [];

    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        // 跳过缩略图缓存等隐藏目录
        if (entry.name.startsWith('.')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          keys.push(path.relative(root, fullPath).split(path.sep).join('/'));
        }
      }
    };

    try {
      await walk(baseDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }

    return { keys, isTruncated: false };
  }
}

// 创建存储实例（单例模式）
let storageInstance: StorageClient | null = null;

export function getStorage(): StorageClient {
  if (!storageInstance) {
    storageInstance = isLocalStorage()
      ? new LocalFileStorage()
      : (new S3Storage({
          endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
          accessKey: '',
          secretKey: '',
          bucketName: process.env.COZE_BUCKET_NAME || '',
          region: 'cn-beijing',
        }) as unknown as StorageClient);
  }

  return storageInstance;
}
