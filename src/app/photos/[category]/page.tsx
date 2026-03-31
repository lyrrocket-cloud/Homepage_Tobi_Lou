'use client';

import { useParams } from 'next/navigation';
import PhotoGallery from '../page';

// 分类映射
const categoryMap: Record<string, string> = {
  'friend': 'friend',
  'family': 'family', 
  'work': 'work',
  'personal': 'personal',
};

export default function CategoryPhotoPage() {
  const params = useParams();
  const category = params.category as string;
  
  // 验证分类是否有效
  const validCategory = categoryMap[category];
  
  if (!validCategory) {
    // 无效分类，显示全部
    return <PhotoGallery />;
  }
  
  return <PhotoGallery initialCategory={validCategory} />;
}
