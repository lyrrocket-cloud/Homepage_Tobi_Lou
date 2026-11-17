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

  const currentPhoto = photos[currentIndex];
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(currentIndex + 1) % photos.length];

  return (
    <div className="carousel-content-enter">
      {/* full-bleed 轮播区：左预览 flex-1 + 主图 3:2 + 右预览 flex-1 */}
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-stretch w-full bg-black/40 backdrop-blur-md">
          {/* 左侧上一张预览 —— hidden 在手机端，桌面端延伸到页面左边缘 */}
          {prevPhoto && (
            <div
              className="hidden md:flex-1 md:block relative cursor-pointer group"
              onClick={goPrev}
            >
              <Image
                src={prevPhoto.image_url}
                alt={prevPhoto.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 25vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 group-hover:from-black/30 group-hover:to-black/30 transition-colors" />
              {/* 方向箭头提示 */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
                ← PREV
              </div>
            </div>
          )}

          {/* 中间主图 —— aspect-[3/2] 决定整体高度，有 max-width 限制 */}
          <div className="relative aspect-[3/2] w-full md:w-auto md:shrink-0 md:max-w-[900px]">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Link
                  href={photo.url || `/photos?region=${photo.region_id}`}
                  className="block w-full h-full"
                  onClick={() => setIsAutoPlaying(false)}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                  {/* 照片信息 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-left">
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">
                      {photo.title}
                    </h3>
                    <div className="text-white/85 text-xs md:text-sm drop-shadow-md">
                      {photo.location} {photo.date}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* 右侧下一张预览 —— hidden 在手机端，桌面端延伸到页面右边缘 */}
          {nextPhoto && (
            <div
              className="hidden md:flex-1 md:block relative cursor-pointer group"
              onClick={goNext}
            >
              <Image
                src={nextPhoto.image_url}
                alt={nextPhoto.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 25vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/30 to-black/50 group-hover:from-black/30 group-hover:to-black/30 transition-colors" />
              {/* 方向箭头提示 */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
                NEXT →
              </div>
            </div>
          )}
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
