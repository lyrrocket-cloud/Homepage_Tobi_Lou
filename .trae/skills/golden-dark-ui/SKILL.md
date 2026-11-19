---
name: "golden-dark-ui"
description: "Golden dark UI system with drift backgrounds, staggered entry, skeleton shimmer. Invoke when building landing pages, hero sections, card grids, carousels, or any component that needs premium dark-mode visuals with gold accents."
---

# Golden Dark UI — 金色暗基调视觉与动效规范

> 面向 Next.js + Tailwind CSS 项目的通用视觉与动效规范。核心原则：**金色品牌色 + 深色页面 + 无框简约 + 缓动一致 + 动效分层**。

---

## 一、触发动效 Checklist（开发新组件时对照）

每次新增区块/卡片/页面，按以下顺序决策：

| # | 类型 | 判断标准 | 推荐类/技巧 |
|---|------|----------|------------|
| 1 | **持续环境动效** | 背景层、氛围层、地图已访问标记 | `.bg-blob-a/b/c` drift、`.visited-glow` pulse |
| 2 | **首屏 Hero 入场** | 首屏标题/副标题/头像/Logo | `.animate-hero-title` / `.animate-hero-sub` / `.animate-hero-avatar` |
| 3 | **区块级入场** | 独立 section（aside、筛选栏、网格容器） | `.animate-section-in` + `.animate-section-delay-N` |
| 4 | **交错卡片入场** | 列表/网格内卡片 | CSS `animation-delay` 递增（每项 +40~60ms），不写 JS |
| 5 | **滚动 reveal** | 视口外的区块 | `.reveal` + `.reveal-delayed-N`（IntersectionObserver 触发） |
| 6 | **筛选/切换重入** | 筛选条件改变、Tab 切换 | React `key={deps.join(',')}` → 强制 remount → 重放入场 |
| 7 | **骨架屏** | 所有异步加载数据 | 与真实元素**同尺寸** + shimmer + 交错延迟，无 spinner |
| 8 | **轮播/滑动** | 横向轮播、卡片滑动 | transform 过渡 0.75s `cubic-bezier(0.33,1,0.68,1)` |
| 9 | **悬停反馈** | 卡片/按钮 hover | 仅改背景深浅，**不加边框色/圆角/阴影变化** |

---

## 二、色彩与背景

```css
/* 品牌主色（金色） */
--color-gold: #CEA472;

/* 页面背景 */
body { background-color: #0a0a0f; }

/* 卡片底色（统一） */
.card-bg { background: rgba(0, 0, 0, 0.4); }
.card-bg:hover { background: rgba(0, 0, 0, 0.6); }

/* 文字 */
.text-primary { color: #FFFFFF; }
.text-muted   { color: rgba(255, 255, 255, 0.6); }
.text-accent  { color: #CEA472; }
```

### ❌ 已弃用（不要再加回）
- 每卡片独立 `border border-[#CEA472]/10 rounded-lg`（视觉割裂）
- spinner/loading dot 作为加载态（高级感差）
- 正方形 `w-20 h-20` 作为照片缩略图（不贴合照片比例）

### ✅ 正确做法
- **无框**：统一卡片底色，hover 仅加深
- **圆角**：全局 `rounded-lg`（0.625rem），骨架屏 0.5rem
- **图片比例**：按内容定——横版用 `aspect-[3/2]`，竖版 `aspect-[2/3]`，方形 `aspect-square`

---

## 三、缓动曲线（全局统一）

| 曲线 | 用途 | 类名/关键帧 |
|------|------|------------|
| `cubic-bezier(0.22, 1, 0.36, 1)` | **全局标准**：卡片入场、区块入场、骨架屏 | 默认，所有新动效优先用 |
| `cubic-bezier(0.33, 1, 0.68, 1)` | 轮播滑动（更顺滑的惯性感） | `.carousel-slide` |
| `cubic-bezier(0.2, 0.8, 0.2, 1)` | Hero 首屏入场 | `.animate-hero-title` 系列 |

> 规则：**新动效一律优先 `(0.22,1,0.36,1)`**，只有轮播/拖拽类才用 `(0.33,1,0.68,1)`。

---

## 四、CSS 动效模板（可直接复制）

### 4.1 背景光斑漂移（持续氛围层）
```css
@keyframes drift-a {
  0%   { transform: translate(0,0) scale(1); }
  50%  { transform: translate(80px,-60px) scale(1.2); }
  100% { transform: translate(-40px,30px) scale(0.95); }
}
.bg-blob-a {
  position: absolute; width: 720px; height: 720px;
  top: -200px; left: -200px;
  background: radial-gradient(circle, rgba(206,164,114,0.18) 0%, rgba(206,164,114,0.04) 45%, transparent 70%);
  filter: blur(40px); pointer-events: none;
  animation: drift-a 28s ease-in-out infinite alternate;
}
```
> 可复制 2~3 个 blob，随机换尺寸/位置/时长（22s~34s），形成层次。

### 4.2 Hero 首屏入场
```css
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hero-avatar-in {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-hero-title   { animation: hero-fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) 0.1s both; }
.animate-hero-sub     { animation: hero-fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) 0.3s both; }
.animate-hero-avatar  { animation: hero-avatar-in 1.1s cubic-bezier(0.2,0.8,0.2,1) both; }
```

### 4.3 区块级入场（section-fade-up）
```css
@keyframes section-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-section-in {
  animation: section-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both;
}
.animate-section-delay-1 { animation-delay: 80ms; }
.animate-section-delay-2 { animation-delay: 160ms; }
.animate-section-delay-3 { animation-delay: 240ms; }
```

### 4.4 筛选标签入场（chip-pop-in）
```css
@keyframes chip-pop-in {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-chip-in {
  animation: chip-pop-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
}
```

### 4.5 卡片交错入场（photo-card-in — 带 blur 高级感）
```css
@keyframes photo-card-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
.photo-card {
  animation: photo-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both;
}
/* 交错延迟：每项 +60ms（不用 JS） */
.photo-card:nth-child(1n)  { animation-delay: calc(var(--pc-delay, 0) + 0ms); }
.photo-card:nth-child(2n)  { animation-delay: calc(var(--pc-delay, 0) + 60ms); }
.photo-card:nth-child(3n)  { animation-delay: calc(var(--pc-delay, 0) + 120ms); }
.photo-card:nth-child(4n)  { animation-delay: calc(var(--pc-delay, 0) + 180ms); }
```
> 如果卡片数量不固定，可传 CSS 变量 `style={{ '--pc-delay': `${i * 40}ms` }}` 进一步调。

### 4.6 骨架屏 shimmer + 呼吸
```css
@keyframes skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(206, 164, 114, 0.06) 0%,
    rgba(206, 164, 114, 0.20) 42%,
    rgba(206, 164, 114, 0.06) 80%
  );
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes skeleton-breathe {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}
.skeleton-breathe {
  animation: skeleton-breathe 2.4s ease-in-out infinite;
}
```

### 4.7 滚动 reveal
```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.85s cubic-bezier(0.22,1,0.36,1),
              transform 0.85s cubic-bezier(0.22,1,0.36,1);
  will-change: opacity, transform;
}
.reveal.is-visible { opacity: 1; transform: translateY(0); }
.reveal-delayed-1 { transition-delay: 80ms; }
.reveal-delayed-2 { transition-delay: 160ms; }
.reveal-delayed-3 { transition-delay: 240ms; }
```

### 4.8 地图/标记发光 pulse
```css
@keyframes visited-pulse {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(206,164,114,0.4)); }
  50%      { filter: drop-shadow(0 0 7px rgba(206,164,114,0.9)); }
}
.visited-glow { animation: visited-pulse 3.5s ease-in-out infinite; }
```

### 4.9 轮播舞台（固定比例）
```css
.carousel-stage {
  position: relative; width: 100%; overflow: hidden;
  aspect-ratio: 3 / 2;
}
@media (min-width: 768px) {
  .carousel-stage {
    height: calc(min(900px, 60vw) * 2 / 3);
    aspect-ratio: auto;
  }
}
.carousel-slide {
  position: absolute; top: 0; height: 100%;
  width: 100%;
  transition: transform 0.75s cubic-bezier(0.33, 1, 0.68, 1);
  will-change: transform;
}
```
> 骨架屏舞台必须用**完全相同的尺寸**，否则加载时会高度塌陷。

---

## 五、React 组件开发 Checklist

### 5.1 异步数据组件
```tsx
// 伪代码模板
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [decoded, setDecoded] = useState(false);

useEffect(() => {
  fetch(url).then(setData).finally(() => setLoading(false));
}, []);

// 照片类组件：额外等 Image.decode() 全部完成（避免渐进式 JPEG 半幅闪烁）
useEffect(() => {
  if (!data.length) return;
  Promise.all(data.map(item => new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.src = item.url;
  }))).then(() => setDecoded(true));
}, [data]);

const ready = !loading && decoded;
```

### 5.2 筛选切换重入
```tsx
// React key 绑定筛选条件 → 切换时 remount → 重放入场动画
<div
  key={`${selectedYear}-${selectedCat}`}
  className="animate-section-in"
>
  {cards.map((card, i) => (
    <div
      key={card.id}
      className="photo-card"
      style={{ '--pc-delay': `${i * 40}ms` }}
    />
  ))}
</div>
```

### 5.3 滚动 reveal IntersectionObserver
```tsx
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible'));
  }, { threshold: 0.1 });
  io.observe(el);
  return () => io.disconnect();
}, []);
```

---

## 六、Tailwind / CSS 变量集成

在 Tailwind `@theme inline` 或 CSS 中声明：

```css
@theme inline {
  --color-gold: #CEA472;
  --font-sans: 'PangMenZhengDao', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif;
}

:root {
  --radius: 0.625rem;
}

html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background-color: #0a0a0f; }
```

---

## 七、实现约束 & 红线

| 规则 | 原因 |
|------|------|
| **交错延迟用 CSS `animation-delay` 递增**，不用 JS 算 setTimeout | 可维护、性能好、SSR 友好 |
| **骨架屏尺寸必须与真实元素完全一致** | 避免加载时高度塌陷/布局跳变 |
| **轮播自动播放前必须等照片 decode 完成** | 避免渐进式 JPEG 半幅闪烁 |
| **卡片 hover 不改边框/圆角** | 视觉抖动、破坏统一简约感 |
| **新动效缓动一律优先 `(0.22,1,0.36,1)`** | 保证全站动效一致，用户感知统一 |
| **全局背景色 `#0a0a0f`** | 兜底，配合 layout 中全局背景图 |
| **禁用 spinner**，所有异步用骨架屏 | 高级感 |
| **长驻 dev 服务必须后台独立启动** | 同终端执行其他命令会杀进程（Next.js 历史高频坑） |

---

## 八、滚动条规范

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb {
  background: rgba(206,164,114,0.3); border-radius: 4px;
  transition: background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover  { background: rgba(206,164,114,0.5); }
::-webkit-scrollbar-thumb:active { background: rgba(206,164,114,0.7); }
```

---

## 九、可直接复用的类名索引

| 类名 | 作用 | 时长/缓动 |
|------|------|----------|
| `.bg-blob-a/b/c` | 背景光斑 drift | 22~34s infinite alternate |
| `.animate-hero-title` | Hero 标题入场 | 0.9s |
| `.animate-hero-sub` | Hero 副标题 | 0.9s, delay 0.3s |
| `.animate-hero-avatar` | Hero 头像 scale-in | 1.1s |
| `.animate-section-in` | 区块级 fade-up | 0.7s |
| `.animate-section-delay-1/2/3` | 区块延迟 | 80/160/240ms |
| `.animate-chip-in` | 筛选 chip pop-in | 0.45s |
| `.timeline-item` | 时间轴左滑入 | 0.5s |
| `.photo-card` | 卡片 blur+scale 入场 | 0.6s |
| `.photo-grid-fade` | 网格容器切换重入 | 0.45s |
| `.skeleton-shimmer` | shimmer 高光 | 1.6s infinite |
| `.skeleton-breathe` | 骨架屏呼吸 | 2.4s infinite |
| `.reveal` + `.is-visible` | 滚动 reveal | 0.85s |
| `.visit-card-in` | 访问记录卡片 | 0.55s |
| `.visited-glow` | 地图发光 pulse | 3.5s infinite |
| `.carousel-slide` | 轮播滑动 | 0.75s |
