'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fill = true,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`[OptimizedImage] Failed to load image: ${src}`);
    setIsLoading(false);
    setHasError(true);
  };

  // 占位符内容
  const placeholder = (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#CEA472]/20 to-[#CEA472]/5">
      {isLoading ? (
        <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
      ) : (
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-[#CEA472]/60 text-sm">图片加载失败</p>
        </div>
      )}
    </div>
  );

  if (hasError) {
    return placeholder;
  }

  return (
    <>
      {/* 加载中显示占位符 */}
      {isLoading && placeholder}

      {/* 实际图片 */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        // 优化 Next.js Image 配置
        quality={85}
        unoptimized={src.startsWith('/api/image')} // API 代理的图片不优化
      />
    </>
  );
}
