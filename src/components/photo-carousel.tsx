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

type Direction = 'next' | 'prev';

const ANIM_MS = 700;

export function PhotoCarousel({ photos, isLoading = false }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>('next');
  const [animSeq, setAnimSeq] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const isAnimating = prevIndex !== currentIndex;

  const step = (dir: Direction) => {
    if (photos.length <= 1) return;
    setDirection(dir);
    setPrevIndex(currentIndex);
    setCurrentIndex((prev) =>
      dir === 'next' ? (prev + 1) % photos.length : (prev - 1 + photos.length) % photos.length
    );
    setAnimSeq((seq) => seq + 1);
  };

  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;
    const interval = setInterval(() => step('next'), 5000);
    return () => clearInterval(interval);
  });

  // 动画结束后移除离场图层
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setPrevIndex(currentIndex), ANIM_MS);
    return () => clearTimeout(timer);
  }, [currentIndex, prevIndex, isAnimating]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsAutoPlaying(false);
    setDirection(index > currentIndex ? 'next' : 'prev');
    setPrevIndex(currentIndex);
    setCurrentIndex(index);
    setAnimSeq((seq) => seq + 1);
  };

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
      setIsAutoPlaying(false);
      step(delta < 0 ? 'next' : 'prev');
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  /* ===== 骨架屏 ===== */
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-stretch w-full overflow-hidden">
          <div className="hidden md:block md:flex-1 md:min-w-0 md:relative">
            <div className="absolute inset-0 skeleton-shimmer opacity-60" />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative w-full md:w-[min(900px,60vw)] md:shrink-0 aspect-[3/2]">
            <div className="absolute inset-0 skeleton-shimmer" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
              <div className="h-6 md:h-7 w-48 md:w-64 rounded-md skeleton-shimmer mb-2" />
              <div className="h-3 md:h-4 w-36 md:w-48 rounded-md skeleton-shimmer opacity-80" />
            </div>
          </div>

          <div className="hidden md:block md:flex-1 md:min-w-0 md:relative">
            <div className="absolute inset-0 skeleton-shimmer opacity-60" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full skeleton-shimmer ${i === 0 ? 'w-6 h-2' : 'w-2 h-2'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) return null;

  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(currentIndex + 1) % photos.length];
  const outgoingPhoto = photos[prevIndex];
  const activePhoto = photos[currentIndex];

  const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
  const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';

  const renderLayer = (photo: Photo, index: number, extraClass: string, z: string, hidden = false) => (
    <Link
      key={`${photo.id}-${animSeq}`}
      href={photo.url || `/photos?region=${photo.region_id}`}
      onClick={() => setIsAutoPlaying(false)}
      className={`absolute inset-0 block ${z} ${extraClass}`}
      aria-hidden={hidden}
    >
      <Image
        src={photo.image_url}
        alt={photo.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        loading={index === 0 ? 'eager' : 'lazy'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-left">
        <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">
          {photo.title}
        </h3>
        <div className="text-white/85 text-xs md:text-sm drop-shadow-md">
          {photo.location} {photo.date}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="w-full carousel-content-enter">
      <div
        className="flex flex-col md:flex-row md:items-stretch w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 左侧上一张预览 —— 仅桌面 */}
        <div
          className="hidden md:block md:relative md:flex-1 md:min-w-0 cursor-pointer group"
          onClick={() => {
            setIsAutoPlaying(false);
            step('prev');
          }}
        >
          <Image
            src={prevPhoto.image_url}
            alt={prevPhoto.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/30" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
            ← PREV
          </div>
        </div>

        {/* 中间主图 —— 3:2，翻页时右侧图片滑入、当前图片滑向左 */}
        <div className="relative w-full md:w-[min(900px,60vw)] md:shrink-0 aspect-[3/2] overflow-hidden">
          {isAnimating && renderLayer(outgoingPhoto, prevIndex, outClass, 'z-10', true)}
          {renderLayer(activePhoto, currentIndex, isAnimating ? `${inClass} z-20` : '', 'z-20')}
        </div>

        {/* 右侧下一张预览 —— 仅桌面 */}
        <div
          className="hidden md:block md:relative md:flex-1 md:min-w-0 cursor-pointer group"
          onClick={() => {
            setIsAutoPlaying(false);
            step('next');
          }}
        >
          <Image
            src={nextPhoto.image_url}
            alt={nextPhoto.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/30" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#CEA472] transition-colors text-xs font-medium tracking-wider">
            NEXT →
          </div>
        </div>
      </div>

      {/* dots */}
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
