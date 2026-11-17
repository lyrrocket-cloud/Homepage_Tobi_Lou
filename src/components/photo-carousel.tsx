'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  // 图片加载完成
  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  // 图片加载失败
  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // 上一张
  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // 下一张
  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  // 跳转到指定索引
  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(currentIndex + 1) % photos.length];

  return (
    <div className="relative w-full">
      {/* 轮播容器 */}
      <div className="relative w-full aspect-[16/9] max-h-[600px] overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-[#CEA472]/20">
        {/* 左侧上一张预览 */}
        {prevPhoto && (
          <div className="absolute left-0 top-0 w-1/5 h-full opacity-60 transition-opacity hover:opacity-80">
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

        {/* 右侧下一张预览 */}
        {nextPhoto && (
          <div className="absolute right-0 top-0 w-1/5 h-full opacity-60 transition-opacity hover:opacity-80">
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

        {/* 中间当前照片 */}
        <div className="absolute left-1/5 right-1/5 top-0 bottom-0">
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
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  sizes="60vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* 照片信息 - 左对齐 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {photo.title}
                  </h3>
                  <div className="text-white/80 text-sm">
                    {photo.location} {photo.date}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 加载指示器 */}
        {loadedImages.size < photos.length && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#CEA472]/30 border-t-[#CEA472] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-white/60 text-sm">
                加载中... {loadedImages.size}/{photos.length}
              </p>
            </div>
          </div>
        )}

        {/* 左箭头 - 移到左右两侧 */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-0 bottom-0 w-1/5 z-20 flex items-center justify-center group hover:bg-black/20 transition-colors"
          aria-label="上一张"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all duration-300 group-hover:scale-110">
            <ChevronLeft className="w-6 h-6 text-[#CEA472]" />
          </div>
        </button>

        {/* 右箭头 - 移到左右两侧 */}
        <button
          onClick={goToNext}
          className="absolute right-0 top-0 bottom-0 w-1/5 z-20 flex items-center justify-center group hover:bg-black/20 transition-colors"
          aria-label="下一张"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all duration-300 group-hover:scale-110">
            <ChevronRight className="w-6 h-6 text-[#CEA472]" />
          </div>
        </button>
      </div>

      {/* 指示器 */}
      <div className="flex justify-center gap-2 mt-4">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-[#CEA472] w-6'
                : 'bg-[#CEA472]/30 hover:bg-[#CEA472]/50'
            }`}
            aria-label={`跳转到第 ${index + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}
