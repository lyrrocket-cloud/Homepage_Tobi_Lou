'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar, ExternalLink, MapPin } from 'lucide-react';
import {
  cancelPhotoTransition,
  peekPhotoTransition,
  playPhotoFlip,
  prefersReducedMotion,
  type SharedPhoto,
} from '@/lib/photo-transition';

/** 分类 id → 中文名（兼容直接存中文的分类） */
const CATEGORY_LABELS: Record<string, string> = {
  friend: '朋友',
  family: '家庭',
  work: '工作',
  personal: '个人',
};

interface ApiPhoto extends SharedPhoto {
  created_at?: string;
}

function formatDate(dateStr: string, isYearly?: boolean) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (year === '2001A') return '2001-2010年';
  if (year === '1991B') return '1991-2000年';
  if (year === '1990C') return '1990及以前';
  if (isYearly || month === '00') return `${year}年`;
  return `${year}年${month}月`;
}

export default function PhotoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const photoId = Number(params?.id);

  // 从照片集跳转过来时能同步拿到数据，避免首屏空白
  const [photo, setPhoto] = useState<ApiPhoto | null>(() => {
    const snapshot = peekPhotoTransition(Number.isFinite(photoId) ? photoId : undefined);
    return snapshot ? (snapshot.photo as ApiPhoto) : null;
  });
  const [revealed, setRevealed] = useState(() => !peekPhotoTransition(
    Number.isFinite(photoId) ? photoId : undefined
  ));
  const [notFound, setNotFound] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef(peekPhotoTransition(
    Number.isFinite(photoId) ? photoId : undefined
  ));

  // 直接访问 / 刷新时回源加载
  useEffect(() => {
    if (photo || !Number.isFinite(photoId)) return;

    let alive = true;
    (async () => {
      try {
        const response = await fetch('/api/gallery/photos');
        const data = await response.json();
        const found = (data.photos as ApiPhoto[] | undefined)?.find((p) => p.id === photoId);
        if (!alive) return;
        if (found) {
          setPhoto(found);
          setRevealed(true);
        } else {
          setNotFound(true);
          setRevealed(true);
        }
      } catch {
        if (alive) {
          setNotFound(true);
          setRevealed(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [photo, photoId]);

  // FLIP：主图渲染后从缩略图位置放大到目标位置
  useEffect(() => {
    if (!photo) return;

    // 快照只取一次；StrictMode 重复执行时复用同一个快照重放
    if (!snapshotRef.current) {
      snapshotRef.current = peekPhotoTransition(photo.id);
    }
    const snapshot = snapshotRef.current;

    const target = mainImageRef.current;
    if (!snapshot || !target || prefersReducedMotion()) {
      cancelPhotoTransition();
      setRevealed(true);
      return;
    }

    setRevealed(false);
    let cancelled = false;

    // 主图未解码完成时先等一小会，避免克隆里出现空白
    const img = target.querySelector('img');
    const ready =
      img && !img.complete
        ? Promise.race([
            img.decode().catch(() => undefined),
            new Promise((resolve) => setTimeout(resolve, 600)),
          ])
        : Promise.resolve();

    ready.then(() => {
      if (cancelled) return;
      playPhotoFlip(snapshot, target, () => setRevealed(true));
    });

    return () => {
      cancelled = true;
      cancelPhotoTransition();
      setRevealed(true);
    };
  }, [photo]);

  const categories = photo?.category ? photo.category.split(',').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* 背景 */}
      <div className="fixed inset-0 z-0">
        <Image src="/assets/background.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#CEA472] hover:text-[#CEA472]/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回照片集
        </button>

        {notFound ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>照片不存在或已删除</p>
            <button
              onClick={() => router.push('/photos')}
              className="mt-4 text-sm text-[#CEA472] hover:text-[#CEA472]/80"
            >
              返回照片集
            </button>
          </div>
        ) : (
          <>
            <div
              ref={mainImageRef}
              className="relative w-full aspect-[4/3] overflow-hidden bg-black/40 border border-[#CEA472]/20"
            >
              {photo && (
                <Image
                  src={photo.image_url}
                  alt={photo.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover transition-opacity duration-200"
                  style={{ opacity: revealed ? 1 : 0 }}
                />
              )}
            </div>

            {photo && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">{photo.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#CEA472]" />
                      {photo.region?.name || '未知地点'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#CEA472]" />
                      {formatDate(photo.date, photo.is_yearly)}
                    </span>
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 text-xs bg-black/60 text-[#CEA472] border border-[#CEA472]/20"
                      >
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                    ))}
                  </div>
                </div>

                {photo.url && (
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#CEA472] border border-[#CEA472]/30 hover:bg-[#CEA472]/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    查看相册原链接
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
