'use client';

/**
 * 照片集 → 照片详情页的共享元素过渡（FLIP）
 *
 * 流程：
 * 1. 点击缩略图：beginPhotoTransition() 记录缩略图 rect 与照片数据
 * 2. 路由跳转：template.tsx 读取 isPhotoTransitionPending()，跳过全屏遮罩淡出
 * 3. 详情页渲染主图后：playPhotoFlip() 用 fixed 克隆元素从起始 rect 变换到目标 rect
 * 4. 结束后移除克隆并显示真实主图
 *
 * 纯客户端实现；中途被打断（返回 / 再次点击 / 卸载）时直接清理克隆。
 */

import { sizedImageUrl } from '@/lib/image-url';

export interface SharedPhoto {
  id: number;
  title: string;
  image_url: string;
  url?: string;
  date: string;
  year: number;
  category?: string;
  is_yearly?: boolean;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PhotoTransitionSnapshot {
  photo: SharedPhoto;
  rect: Rect;
  at: number;
}

/** 起始快照过期时间：避免详情页未挂载时残留快照影响后续跳转 */
const PENDING_TTL = 2500;
/** 过渡时长（350-450ms） */
const DURATION = 420;
const EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
/** 克隆元素层级需高于 .page-fade-overlay 的 300 */
const CLONE_Z_INDEX = 400;

let pending: PhotoTransitionSnapshot | null = null;
let cloneElement: HTMLDivElement | null = null;
let token = 0;
let onCancel: (() => void) | null = null;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function clearStalePending() {
  if (pending && Date.now() - pending.at > PENDING_TTL) {
    pending = null;
  }
}

/** 点击缩略图时调用；返回 false 表示不进入共享元素流程（仍应正常跳转） */
export function beginPhotoTransition(element: HTMLElement, photo: SharedPhoto): boolean {
  cancelPhotoTransition();
  if (prefersReducedMotion()) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return false;

  pending = {
    photo,
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    at: Date.now(),
  };
  return true;
}

/** 供 template.tsx 判断本次导航是否跳过全屏遮罩 */
export function isPhotoTransitionPending(): boolean {
  clearStalePending();
  return pending !== null;
}

/** 只读查询起始快照（不消费，便于 StrictMode 下重复执行） */
export function peekPhotoTransition(photoId?: number): PhotoTransitionSnapshot | null {
  clearStalePending();
  if (!pending) return null;
  if (photoId != null && pending.photo.id !== photoId) return null;
  return pending;
}

/** 清理进行中的克隆与快照 */
export function cancelPhotoTransition() {
  token += 1;
  pending = null;

  if (cloneElement) {
    cloneElement.remove();
    cloneElement = null;
  }

  const cancel = onCancel;
  onCancel = null;
  cancel?.();
}

/**
 * 播放 FLIP：克隆元素初始尺寸/位置与目标一致，用 transform 反向偏移到起始 rect，
 * 再动画回 transform: none。
 *
 * @param snapshot 起始快照
 * @param target 详情页真实主图容器
 * @param onReveal 克隆开始淡出前显示真实主图（需立即不透明）
 * @param waitReady 动画结束后的等待（如主图解码），确保克隆淡出时下方已有画面
 */
export function playPhotoFlip(
  snapshot: PhotoTransitionSnapshot,
  target: HTMLElement,
  onReveal: () => void,
  waitReady?: () => Promise<void>
): void {
  if (prefersReducedMotion()) {
    pending = null;
    onReveal();
    return;
  }

  const targetRect = target.getBoundingClientRect();
  if (targetRect.width < 8 || targetRect.height < 8) {
    pending = null;
    onReveal();
    return;
  }

  // 同一时间只保留一个克隆
  if (cloneElement) {
    cloneElement.remove();
    cloneElement = null;
  }
  token += 1;
  const myToken = token;

  const { rect } = snapshot;
  const scaleX = rect.width / targetRect.width;
  const scaleY = rect.height / targetRect.height;
  const offsetX = rect.left - targetRect.left;
  const offsetY = rect.top - targetRect.top;
  const from = `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`;
  const to = 'translate(0px, 0px) scale(1, 1)';

  const clone = document.createElement('div');
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    position: 'fixed',
    top: `${targetRect.top}px`,
    left: `${targetRect.left}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    backgroundImage: `url("${sizedImageUrl(snapshot.photo.image_url, 400)}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#0a0a0f',
    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.55)',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: String(CLONE_Z_INDEX),
    transformOrigin: 'top left',
    transform: from,
    willChange: 'transform',
  } as Partial<CSSStyleDeclaration>);

  document.body.appendChild(clone);
  cloneElement = clone;

  const finish = async () => {
    if (myToken !== token) return;
    // 等真实主图解码完成，避免克隆淡出时露出空白
    if (waitReady) await waitReady();
    if (myToken !== token) return;

    onCancel = null;
    pending = null;
    // 真实主图先瞬间上屏（不做透明度过渡）
    onReveal();

    // 等两帧确保主图已绘制，再让克隆淡出后移除，避免闪黑
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (myToken !== token) return;
        clone.style.transition = 'opacity 140ms ease-out';
        clone.style.opacity = '0';
        window.setTimeout(() => {
          if (myToken !== token) return;
          clone.remove();
          if (cloneElement === clone) cloneElement = null;
        }, 160);
      });
    });
  };

  onCancel = () => onReveal();

  requestAnimationFrame(() => {
    if (myToken !== token) return;
    const animation = clone.animate(
      [{ transform: from }, { transform: to }],
      { duration: DURATION, easing: EASING, fill: 'forwards' }
    );
    animation.onfinish = finish;
  });
}
