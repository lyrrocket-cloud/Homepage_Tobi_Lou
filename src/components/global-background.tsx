import Image from 'next/image';

/**
 * 全局背景组件
 * 雪山背景图 + 统一遮罩，在 layout 中全局渲染，
 * 路由切换时不会重新渲染，保证跨页面背景位置与透明度完全一致。
 */
export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Image
        src="/assets/background.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        quality={90}
      />
      {/* 垂直渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      {/* 水平渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
    </div>
  );
}
