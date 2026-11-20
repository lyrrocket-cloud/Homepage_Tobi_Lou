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
 * - 主标题：每行一个遮罩，字符从下方浮出（yPercent 115 → 0）+ 3D 翻转 + 去模糊
 * - 副标题（可选）：主标题动画结束 0.15s 后，逐字 y+opacity 轻量入场，不抢戏
 * - 字符间 stagger 主 0.045s / 副 0.03s
 *
 * 注意：行/副标题容器在 SSR 首帧就带 opacity: 0，避免 hydrate 前先露出完整文字，
 * 等 SplitText 初始化完成后在同一帧内显示父级（此时字符仍处于 from 隐藏态），
 * 从而保证「先隐藏 → 再逐字浮出」的正确顺序。
 *
 * reduced-motion 与 noscript 均直接显示全部文字。
 */
export function SplitTextTitle({
  lines,
  subtitle,
  className,
  subtitleClassName,
}: {
  lines: SplitLine[];
  subtitle?: string;
  className?: string;
  subtitleClassName?: string;
}) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const maskRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const sub = subtitleRef.current;

    const revealAll = () => {
      maskRefs.current.forEach((el) => {
        if (el) el.style.opacity = '1';
      });
      if (sub) sub.style.opacity = '1';
    };

    // 尊重系统偏好：直接显示，不播动画
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAll();
      return;
    }

    // ---- 主标题拆字 ----
    const splits: SplitText[] = [];
    const chars: Element[] = [];
    if (root) {
      root.querySelectorAll<HTMLElement>('[data-split-line]').forEach((line) => {
        const split = new SplitText(line, {
          type: 'chars',
          charsClass: 'split-char',
        });
        splits.push(split);
        chars.push(...split.chars);
      });
    }

    // ---- 副标题拆字 ----
    let subSplit: SplitText | null = null;
    const subChars: Element[] = [];
    if (sub) {
      const subEl = sub.querySelector<HTMLElement>('[data-split-subtitle]');
      if (subEl) {
        subSplit = new SplitText(subEl, {
          type: 'chars',
          charsClass: 'split-char',
        });
        subChars.push(...subSplit.chars);
      }
    }

    if (!chars.length && !subChars.length) {
      revealAll();
      return;
    }

    if (root) gsap.set(root, { perspective: 900 });

    // 单一时序：主标题 → 0.15s 间隔 → 副标题
    const tl = gsap.timeline();

    if (chars.length) {
      tl.from(chars, {
        yPercent: 115,
        opacity: 0,
        rotateX: -75,
        filter: 'blur(8px)',
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.045,
        delay: 0.1,
      });
    }

    if (subChars.length) {
      // +=0.15：在主标题 tween 结束后再等 0.15s；若无主标题则 0.1s 起步
      const position = chars.length ? '+=0.15' : 0.1;
      tl.from(
        subChars,
        {
          yPercent: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.03,
        },
        position
      );
    }

    // from() 已同步写入隐藏态，此刻显示父级遮罩，不会出现完整文字过渡帧
    revealAll();

    return () => {
      tl.kill();
      splits.forEach((s) => s.revert());
      subSplit?.revert();
    };
  }, []);

  const hasSubtitle = typeof subtitle === 'string' && subtitle.length > 0;

  return (
    <>
      <h2 ref={rootRef} className={className}>
        <noscript>
          <style>{`.split-line-mask,.split-subtitle-mask{opacity:1 !important}`}</style>
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
      {hasSubtitle && (
        <p
          ref={subtitleRef}
          className={`split-subtitle-mask ${subtitleClassName ?? ''}`}
          style={{ opacity: 0 }}
        >
          <span data-split-subtitle className="inline-block will-change-transform">
            {subtitle}
          </span>
        </p>
      )}
    </>
  );
}
