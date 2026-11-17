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

  // ===== 骨架屏（加载时占住位置 + shimmer 动效）=====
  if (isLoading) {
    return (
      <div className="relative w-full px-4">
        <div className="max-w-7xl mx-auto">
          {/* 轮播骨架 —— 和真实容器完全相同的比例与圆角 */}
          <div
            className="relative w-full aspect-[3/2] md:aspect-[16/9] overflow-hidden rounded-lg border border-[#CEA472]/10"
            aria-busy="true"
            aria-label="相册加载中"
          >
            {/* 主图区域 shimmer */}
            <div className="absolute inset-0 skeleton-shimmer" />

            {/* 桌面端左右预览骨架 */}
            <div className="hidden md:block absolute left-0 top-0 w-1/5 h-full skeleton-shimmer opacity-70 border-r border-black/30" />
            <div className="hidden md:block absolute right-0 top-0 w-1/5 h-full skeleton-shimmer opacity-70 border-l border-black/30" />

            {/* 底部信息条骨架（标题 + 日期占位条） */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="h-6 md:h-7 w-48 md:w-64 rounded-md skeleton-shimmer mb-2" />
              <div className="h-3 md:h-4 w-36 md:w-48 rounded-md skeleton-shimmer opacity-80" />
            </div>
          </div>

          {/* 底部 dots 骨架 */}
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
      </div>
    );
  }

  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(currentIndex + 1) % photos.length];

  return (
    <div className="relative w-full px-4 carousel-content-enter">
      <div className="max-w-7xl mx-auto">
        {/* 轮播容器 —— 手机 3:2，桌面 16:9 */}
        <div
          className="relative w-full aspect-[3/2] md:aspect-[16/9] overflow-hidden bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 桌面端左侧上一张预览（手机隐藏） */}
          {prevPhoto && (
            <div className="hidden md:block absolute left-0 top-0 w-1/5 h-full opacity-60 transition-opacity hover:opacity-90 cursor-pointer z-10"
                 onClick={goPrev}>
              <Image
                src={prevPhoto.image_url}
                alt={prevPhoto.title}
                fill
                className="object-cover"
                sizes="20vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* 桌面端右侧下一张预览（手机隐藏） */}
          {nextPhoto && (
            <div className="hidden md:block absolute right-0 top-0 w-1/5 h-full opacity-60 transition-opacity hover:opacity-90 cursor-pointer z-10"
                 onClick={goNext}>
              <Image
                src={nextPhoto.image_url}
                alt={nextPhoto.title}
                fill
                className="object-cover"
                sizes="20vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* 中间当前照片 —— 手机占满全宽，桌面占中间 3/5 */}
          <div className="absolute inset-0 md:left-1/5 md:right-1/5">
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
                    sizes="(max-width: 768px) 100vw, 60vw"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                  {/* 照片信息 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">
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
        </div>

        {/* 底部指示器（保留） */}
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
    </div>
  );
}
