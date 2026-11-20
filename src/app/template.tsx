'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** 首页全屏背景图，加载完成前遮罩保持不透明，避免慢网下露出黑底 */
const HOME_BG_IMAGE = '/assets/background.jpg';
/** 背景图加载失败/过慢时的兜底，防止遮罩卡死 */
const BG_READY_TIMEOUT = 1500;

/**
 * 路由切换过渡
 * 使用独立的全屏遮罩做淡出（fade-in 视觉），而不是对整页内容做 opacity 动画。
 * 这样页面元素自身的入场动画（reveal / SplitText / count-up）不会被二次叠加，
 * 也不会让容器成为 position: fixed 的包含块。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 仅首页需要等背景图；其他页面与 reduced-motion 用户保持原有 .4s 直接淡出
    const isHome = pathname === '/';
    if (!isHome || reduceMotion) {
      overlay.classList.add('ready');
      return;
    }

    let done = false;
    const release = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      overlay.classList.add('ready');
    };
    const timer = window.setTimeout(release, BG_READY_TIMEOUT);

    const img = new Image();
    img.onload = release;
    img.onerror = release;
    img.src = HOME_BG_IMAGE;
    // 已在缓存中/已完成解码
    if (img.complete) {
      release();
    }

    return () => {
      done = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }, [pathname]);

  return (
    <>
      {children}
      <div ref={overlayRef} className="page-fade-overlay" aria-hidden="true" />
    </>
  );
}
