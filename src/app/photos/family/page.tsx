'use client';

import { Suspense } from 'react';
import { PhotoGallery } from '@/components/photo-gallery';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

// 加载中组件
function PhotoGalleryLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Image
          src="/assets/background.jpg"
          alt="背景"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f]" />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
      </div>
    </div>
  );
}

export default function FamilyPhotosPage() {
  return (
    <Suspense fallback={<PhotoGalleryLoading />}>
      <PhotoGallery 
        forceCategory="family"
        pageTitle="照片集 · 家庭"
        showCategoryFilter={false}
        showBackToMain={true}
      />
    </Suspense>
  );
}
