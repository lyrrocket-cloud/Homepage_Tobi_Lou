'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 路由切换滑入过渡（Next.js App Router template 会在每次导航时重新挂载）
 * 入场：从右侧轻微滑入 + 淡入；结束后移除 transform，避免破坏 fixed 定位。
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
