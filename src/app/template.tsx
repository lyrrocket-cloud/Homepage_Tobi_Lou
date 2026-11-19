'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 路由切换淡入淡出过渡（Next.js App Router template 会在每次导航时重新挂载）
 * 新页面内容淡入；结束后动画自动失效（backwards）。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="page-transition-clip">
      <div className="page-transition-inner">{children}</div>
    </div>
  );
}
