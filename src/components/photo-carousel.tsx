'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Photo {
  id: number;
  title: string;
  location: string;
  date: string;
  image_url: string;
  url: string;
  region_id?: number;
  category?: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
  isLoading?: boolean;
}

/**
 * 计算某张图相对当前索引的位置：0 = 居中，+1 = 右侧一张，-1 = 左侧一张…
 * 采用居中取模，首尾可以无缝循环。
 */
function getSlideOffset(index: number, current: number, total: number) {
  if (total === 0) return 0;
  const half = Math.floor(total / 2);
  let offset = (index - current + half) % total;
  if (offset < 0) offset += total;
  return offset - half;
}

export function PhotoCarousel({ photos, isLoading = false }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 触摸滑动
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };
  const goNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };
  const goPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // 触摸处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const delta = touchDeltaX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // 记住上一次渲染的偏移，用于判断是否为「一步」滑动（一步才做动画）
  const prevOffsetsRef = useRef<number[]>([]);
  useEffect(() => {
    prevOffsetsRef.current = photos.map((_, i) =>
      getSlideOffset(i, currentIndex, photos.length)
    );
  });

  // ===== 骨架屏（full-bleed：两侧预览延伸到边缘，中间主图 3:2）=====
  if (isLoading) {
    return (
      <div className="carousel-content-enter">
        {/* full-bleed 轮播区 */}
        <div className="relative w-full overflow-hidden">
          <div className="flex items-stretch w-full bg-black/40 backdrop-blur-md">
            {/* 左预览骨架（延伸到页面左边缘） */}
            <div className="hidden md:block flex-1 relative">
              <div className="absolute inset-0 skeleton-shimmer opacity-60" />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* 主图骨架 —— 3:2，有 max-width */}
            <div className="relative aspect-[3/2] w-full md:w-auto md:shrink-0 md:max-w-[900px]">
              <div className="absolute inset-0 skeleton-shimmer" />
              {/* 底部信息条占位 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="h-6 md:h-7 w-48 md:w-64 rounded-md skeleton-shimmer mb-2" />
                <div className="h-3 md:h-4 w-36 md:w-48 rounded-md skeleton-shimmer opacity-80" />
              </div>
            </div>

            {/* 右预览骨架（延伸到页面右边缘） */}
            <div className="hidden md:block flex-1 relative">
              <div className="absolute inset-0 skeleton-shimmer opacity-60" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>
        </div>

        {/* 底部 dots —— 居中，不受 full-bleed 影响 */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full skeleton-shimmer ${
                i === 0 ? 'w-6 h-2' : 'w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) return null;

  const offsets = photos.map((_, i) =>
    getSlideOffset(i, currentIndex, photos.length)
  );
  // 只有「一步」之内的位移才播放滑动动画，避免远距离跳转穿屏
  const animateFlags = offsets.map((offset, i) => {
    const prev = prevOffsetsRef.current[i];
    return prev === undefined || Math.abs(offset - prev) <= 1;
  });

  return (
    <div className="carousel-content-enter">
      {/* 滑动轨道：每张卡片等宽，整排平移一格 —— 右侧卡片滑入中心，当前卡片滑向左侧 */}
      <div
        className="carousel-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((photo, index) => {
          const offset = offsets[index];
          const isActive = offset === 0;
          return (
            <div
              key={photo.id}
              className={`carousel-slide ${
                animateFlags[index] ? '' : 'carousel-slide-snap'
              } ${isActive ? 'z-20' : 'z-10'}`}
              style={{ transform: `translateX(calc(${offset} * var(--sw)))` }}
            >
              <Link
                href={photo.url || `/photos?region=${photo.region_id}`}
                className="relative block w-full h-full"
                onClick={() => setIsAutoPlaying(false)}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, min(900px, 60vw)"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
                {/* 非当前图的压暗遮罩 */}
                <div
                  className={`absolute inset-0 bg-black/45 transition-opacity duration-500 ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                {/* 照片信息 —— 仅当前图显示 */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-4 md:p-8 text-left transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">
                    {photo.title}
                  </h3>
                  <div className="text-white/85 text-xs md:text-sm drop-shadow-md">
                    {photo.location} {photo.date}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        {/* 左右点击热区（桌面端）：位于两侧预览之上 */}
        <div
          className="hidden md:block absolute inset-y-0 left-0 z-30 cursor-pointer group"
          style={{ width: 'calc((100% - var(--sw)) / 2)' }}
          onClick={goPrev}
          aria-label="上一张"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
            ← PREV
          </div>
        </div>
        <div
          className="hidden md:block absolute inset-y-0 right-0 z-30 cursor-pointer group"
          style={{ width: 'calc((100% - var(--sw)) / 2)' }}
          onClick={goNext}
          aria-label="下一张"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
            NEXT →
          </div>
        </div>
      </div>

      {/* 底部指示器 —— 居中显示，不受轮播 full-bleed 影响 */}
      <div className="flex justify-center gap-2 mt-4">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'bg-[#CEA472] w-6 h-2 rounded-full'
                : 'bg-[#CEA472]/30 w-2 h-2 rounded-full hover:bg-[#CEA472]/50'
            }`}
            aria-label={`跳转到第 ${index + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}
