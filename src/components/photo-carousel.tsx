'use client';

import { useState, useEffect } from 'react';
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

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // 5秒切换

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

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

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* 轮播容器 */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md border border-[#CEA472]/20">
        {/* 照片 */}
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
                priority={index === 0}
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* 照片信息 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {photo.title}
                </h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span>{photo.location}</span>
                  <span>·</span>
                  <span>{photo.date}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* 左箭头 */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all duration-300"
          aria-label="上一张"
        >
          <ChevronLeft className="w-5 h-5 text-[#CEA472]" />
        </button>

        {/* 右箭头 */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 backdrop-blur-md border border-[#CEA472]/30 hover:border-[#CEA472]/50 hover:bg-[#CEA472]/20 transition-all duration-300"
          aria-label="下一张"
        >
          <ChevronRight className="w-5 h-5 text-[#CEA472]" />
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
