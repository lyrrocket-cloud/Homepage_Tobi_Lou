'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 全局平滑滚动（Lenis）+ ScrollTrigger 同步
 * - 惯性滚动物理让滚动更"贵"
 * - Lenis 驱动真实 window 滚动，因此滚动事件/进度条/IntersectionObserver reveal 均正常工作
 * - 单一时钟源：GSAP ticker 驱动 lenis.raf，同时 lenis.on('scroll') 喂给 ScrollTrigger.update
 * - 仅客户端生效；prefers-reduced-motion 时不初始化，保留原生滚动
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // SSR 防护（useEffect 本就只在客户端跑，这里显式声明更安全）
    if (typeof window === 'undefined') return;

    // 尊重系统"减少动态效果"偏好：不初始化 lenis
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1, // 固定时长（秒），替代 lerp，滚动更线性可控
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Lenis 滚动 → ScrollTrigger 同步触发点
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker 作为单一时钟源驱动 lenis（time 单位为秒，lenis.raf 需毫秒）
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // 页内锚点：交给 lenis 平滑滚动，避免原生滚动与惯性互相抢占；
    // 找不到目标时不拦截，保持原生行为（不影响浏览器滚动恢复）
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a[href^="#"]') as
        | HTMLAnchorElement
        | null;
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0 });
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // 路由切换后重新计算 ScrollTrigger 触发点（布局/高度可能变化）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
