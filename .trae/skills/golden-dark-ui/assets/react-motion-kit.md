# React Motion Kit — 可直接复制的 4 个基础组件

> 依赖：`pnpm add gsap lenis`（GSAP ≥ 3.13，SplitText 已免费内置）。
> 配套样式：`design-tokens.css` + `motion.css`。

---

## 0. 挂载位置速查

| 组件 | 放置位置 | 作用 |
|------|----------|------|
| `SmoothScroll` | `src/app/layout.tsx`（全局一次） | Lenis 平滑滚动 + ScrollTrigger 同步 |
| `Template` | `src/app/template.tsx` | 路由切换遮罩淡出 |
| `SplitTextTitle` | 任意 Hero/标题处 | 逐字入场 |
| `CountUp` | 任意统计数字处 | 进入视口数字滚动 |

---

## 1. SplitTextTitle

```tsx
'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type SplitLine = {
  text: string;
  className?: string;
};

/**
 * 逐字 SplitText 标题入场
 * - 每行一个遮罩，字符从下方浮出 + 3D 翻转 + 去模糊
 * - 字符 stagger 0.045s
 *
 * 关键：行容器在 SSR 首帧就带 opacity: 0，避免 hydrate 前先露出完整文字；
 * SplitText 初始化后在同一帧内显示父级（此时字符仍处于 from 隐藏态）。
 */
export function SplitTextTitle({
  lines,
  className,
}: {
  lines: SplitLine[];
  className?: string;
}) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const maskRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealMasks = () => {
      maskRefs.current.forEach((el) => {
        if (el) el.style.opacity = '1';
      });
    };

    // 尊重系统偏好：直接显示
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealMasks();
      return;
    }

    const splits: SplitText[] = [];
    const chars: Element[] = [];

    root.querySelectorAll<HTMLElement>('[data-split-line]').forEach((line) => {
      const split = new SplitText(line, {
        type: 'chars',
        charsClass: 'split-char',
      });
      splits.push(split);
      chars.push(...split.chars);
    });

    if (!chars.length) {
      revealMasks();
      return;
    }

    gsap.set(root, { perspective: 900 });

    // from() 同步写入隐藏态（immediateRender），随后再显示父级遮罩，
    // 此时页面上不会出现「完整文字」的过渡帧。
    const tween = gsap.from(chars, {
      yPercent: 115,
      opacity: 0,
      rotateX: -75,
      filter: 'blur(8px)',
      duration: 0.95,
      ease: 'power3.out',
      stagger: 0.045,
      delay: 0.1,
    });

    revealMasks();

    return () => {
      tween.kill();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <h2 ref={rootRef} className={className}>
      <noscript>
        <style>{`.split-line-mask{opacity:1 !important}`}</style>
      </noscript>
      {lines.map((line, i) => (
        <span
          key={i}
          ref={(el) => {
            maskRefs.current[i] = el;
          }}
          className="split-line-mask block overflow-hidden"
          style={{ opacity: 0 }}
        >
          <span
            data-split-line
            className={`inline-block will-change-transform ${line.className ?? ''}`}
          >
            {line.text}
          </span>
        </span>
      ))}
    </h2>
  );
}
```

**用法**

```tsx
<SplitTextTitle
  className="text-4xl md:text-6xl font-bold"
  lines={[
    { text: '你好，我是 Tobi Lou', className: 'text-white' },
    { text: '无远弗届', className: 'text-[#CEA472]' },
  ]}
/>
```

---

## 2. CountUp

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 数字滚动 count-up
 * - 进入视口（top 88%）时从 0 滚动到目标值，只播放一次
 */
export function CountUp({
  value,
  duration = 1.6,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = value.toLocaleString();
      return;
    }

    const obj = { v: 0 };
    el.textContent = '0';

    const tween = gsap.to(obj, {
      v: value,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.v).toLocaleString();
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}
```

**用法**（保持原有文案/字号，只替换数字节点）

```tsx
<span className="text-xl font-bold text-[#CEA472] tabular-nums">
  <CountUp value={visited} />
</span>
<span className="text-sm text-white/50"> / {total} 国家</span>
```

> 数字使用 `tabular-nums`，避免滚动时宽度抖动。

---

## 3. SmoothScroll（Lenis + GSAP ticker）

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 全局平滑滚动（Lenis）+ ScrollTrigger 同步
 * - Lenis 驱动真实 window 滚动，进度条 / IntersectionObserver 均正常工作
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // 路由切换后重新计算触发点
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
```

**接入**：在 root layout 内渲染一次。

```tsx
<body>
  <SmoothScroll />
  {children}
</body>
```

> 必须移除 `html { scroll-behavior: smooth; }`，否则与 Lenis 冲突。

---

## 4. Template（路由切换淡入淡出）

```tsx
'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 路由切换过渡
 * 使用独立全屏遮罩淡出（视觉上的 fade-in），而不是对整页内容做 opacity 动画。
 * 避免与页面元素入场动画叠加，也避免容器成为 fixed 的包含块。
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
```

对应样式在 `motion.css`：

```css
.page-fade-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: #0a0a0f;
  pointer-events: none;
  animation: gd-page-overlay-fade-out 0.4s ease-out forwards;
}
```

---

## 5. 图片预解码（照片/轮播必用）

```tsx
useEffect(() => {
  if (!photos.length) return;
  let cancelled = false;

  Promise.all(
    photos.map(
      (p) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            // decode() 确保整张图解码完成，避免渐进式 JPEG 半幅显示
            const done = () => resolve();
            if (typeof img.decode === 'function') {
              img.decode().then(done).catch(done);
            } else {
              done();
            }
          };
          img.onerror = () => resolve();
          img.src = p.url;
        }),
    ),
  ).then(() => {
    if (!cancelled) setReady(true);
  });

  return () => {
    cancelled = true;
  };
}, [photos]);
```

骨架屏条件：`isLoading || (photos.length > 0 && !ready)`；自动轮播在 `ready` 后才启动。

---

## 6. 骨架屏结构示例（与真实卡片同尺寸）

```tsx
<div className="photo-grid-skeleton">
  {Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="photo-skeleton-card">
      <div className="skel-image" />
      <div className="skel-meta">
        <div className="skel-line short" />
        <div className="skel-line xshort" />
      </div>
    </div>
  ))}
</div>
```

> 卡片数量按真实网格列数取整（2/3/4 列 → 8 张即可覆盖首屏）。
