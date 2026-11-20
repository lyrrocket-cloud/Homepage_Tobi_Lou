/** 图片 URL 工具 */

/** 支持缩放的图片代理前缀 */
const SIZED_PREFIX = '/api/image/';

/**
 * 为本地图片代理 URL 附加速率参数
 * 非 /api/image/ 的地址（静态资源、外链）原样返回
 */
export function sizedImageUrl(src: string | undefined | null, width: number): string {
  if (!src) return '';
  if (!src.startsWith(SIZED_PREFIX)) return src;
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
}
