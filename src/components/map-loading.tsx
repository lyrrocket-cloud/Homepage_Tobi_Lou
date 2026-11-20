/**
 * 地图加载态：金色脉冲圆点 + 骨架微光
 *
 * - 容器固定 480px 高，与地图容器一致，避免加载完成后的布局跳动
 * - 微光复用 globals.css 中已有的 .skeleton-shimmer（1.6s 横扫）
 * - prefers-reduced-motion 下停用动画，仅保留静态文字
 */
export function MapLoading({
  label = '加载中',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full h-[480px] rounded-xl border border-[#CEA472]/15 bg-black/25 overflow-hidden ${className}`}
    >
      {/* 骨架微光层（复用现有 skeleton-shimmer 关键帧） */}
      <div className="map-loading-shimmer skeleton-shimmer absolute inset-0" aria-hidden="true" />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="map-loading-dots flex items-center gap-2" aria-hidden="true">
          <span className="map-loading-dot" />
          <span className="map-loading-dot" />
          <span className="map-loading-dot" />
        </div>
        <p className="map-loading-text text-white/60 text-sm tracking-wider">{label}</p>
      </div>
    </div>
  );
}
