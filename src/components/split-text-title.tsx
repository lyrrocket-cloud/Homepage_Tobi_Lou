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
 * - 每行一个遮罩，字符从下方浮出（yPercent 110 → 0）+ 3D 翻转 + 去模糊
 * - 字符间 stagger 0.045s，整段比 fade-up 更有质感
 */
export function SplitTextTitle({
  lines,
  className,
}: {
  lines: SplitLine[];
  className?: string;
}) {
  const rootRef = useRef<HTMLHeadingElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // 尊重系统偏好：直接显示
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

    if (!chars.length) return;

    gsap.set(root, { perspective: 900 });

    const tween = gsap.from(chars, {
      yPercent: 115,
      opacity: 0,
      rotateX: -75,
      filter: 'blur(8px)',
      duration: 0.95,
      ease: 'power3.out',
      stagger: 0.045,
      delay: 0.15,
    });

    return () => {
      tween.kill();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <h2 ref={rootRef} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
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
