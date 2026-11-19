'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 路由切换过渡
 * 使用独立的全屏遮罩做淡出（fade-in 视觉），而不是对整页内容做 opacity 动画。
 * 这样页面元素自身的入场动画（reveal / SplitText / count-up）不会被二次叠加，
 * 也不会让容器成为 position: fixed 的包含块。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      {children}
      <div className="page-fade-overlay" aria-hidden="true" />
    </>
  );
}
