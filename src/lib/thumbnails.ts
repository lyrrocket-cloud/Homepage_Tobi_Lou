import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getStorageRoot, readLocalFile } from '@/lib/storage';

/** 允许的缩略图宽度（防止任意尺寸刷缓存） */
export const ALLOWED_WIDTHS = [400, 900, 1600];

/** 各宽度对应的 WebP 质量：显示尺寸越小，质量可适当降低 */
export const WIDTH_QUALITY: Record<number, number> = {
  400: 68,
  900: 68,
  1600: 76,
};

/** 新上传图片预生成的档位 */
const WARM_WIDTHS = [400, 900, 1600];

/** 缩略图缓存路径（缓存名包含质量，调整质量后自动生成新文件） */
function cachePathFor(key: string, width: number): string {
  const hash = createHash('sha1').update(key).digest('hex').slice(0, 16);
  const quality = WIDTH_QUALITY[width] ?? 78;
  return path.join(getStorageRoot(), '.thumbs', `${hash}-w${width}-q${quality}.webp`);
}

/** 读取或生成缩略图（webp，落盘缓存到 .thumbs） */
export async function getThumbnail(key: string, width: number): Promise<Buffer> {
  const cachePath = cachePathFor(key, width);

  try {
    return await fs.readFile(cachePath);
  } catch {
    // 未命中缓存，生成后写入
  }

  const quality = WIDTH_QUALITY[width] ?? 78;
  const source = await readLocalFile(key);
  const buffer = await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, buffer);
  return buffer;
}

/**
 * 上传后预生成各档缩略图，保证新图片立刻按统一规则走缓存。
 * 单档失败不影响其它档，也不影响上传结果。
 */
export async function prewarmThumbnails(key: string): Promise<void> {
  await Promise.all(
    WARM_WIDTHS.map((width) => getThumbnail(key, width).catch(() => undefined))
  );
}
