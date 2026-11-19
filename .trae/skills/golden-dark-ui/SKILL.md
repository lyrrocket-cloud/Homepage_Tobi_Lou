---
name: "golden-dark-ui"
description: "Golden dark design system: flat borderless cards, gold accents, staggered entry, skeleton loading, GSAP SplitText/count-up, Lenis smooth scroll, fade page transitions. Invoke when building or restyling landing pages, galleries, card grids, maps, or any premium dark gold-accent UI."
---

# Golden Dark UI — 金色暗基调 UI & 动效标准库（v2）

> 面向 Next.js + React + Tailwind CSS 项目的视觉与动效规范。
> 核心原则：**金色品牌色 · 深色页面 · 扁平无框 · 动效分层 · 缓动统一 · 无第三方字体依赖**。

**可复用资产**（复制到任意项目即可使用）：

| 文件 | 用途 |
|------|------|
| [`assets/design-tokens.css`](assets/design-tokens.css) | 颜色 / 字体 / 圆角 / 容器宽度 / 滚动条 / Lenis 基础样式 |
| [`assets/motion.css`](assets/motion.css) | 全部 CSS 动效（背景光斑、入场、骨架屏、轮播、页面过渡） |
| [`assets/react-motion-kit.md`](assets/react-motion-kit.md) | 4 个可直接复制的 React 组件（SplitText / CountUp / SmoothScroll / Template） |

---

## 一、动效分层模型（先分层，再选型）

| 层 | 名称 | 作用 | 典型实现 |
|----|------|------|----------|
| **L0** | 环境层 | 常驻氛围，不打断阅读 | 背景光斑 drift、地图 `visited-glow`、滚动进度条 |
| **L1** | 过渡层 | 页面/视图切换 | 全屏遮罩淡出（禁止内容容器 transform/opacity） |
| **L2** | 区块层 | 一屏内的区块依次进场 | `.animate-section-in` + `animation-delay` |
| **L3** | 内容层 | 列表/网格/骨架屏 | `.photo-card` / `.visit-card-in` / shimmer |
| **L4** | 交互层 | hover / 点击 / 滚动驱动 | 背景加深、数字 count-up、SplitText |

> 同一元素只允许出现在**一个层**。多层叠加会导致发灰、慢半拍、看起来卡顿。

---

## 二、触发动效 Checklist

| # | 场景 | 推荐方案 | 关键参数 |
|---|------|----------|----------|
| 1 | 页面切换 | `.page-fade-overlay`（`template.tsx`） | 0.4s ease-out opacity 1→0 |
| 2 | 首屏大标题 | `SplitTextTitle`（GSAP） | yPercent 115 + rotateX −75 + blur 8px，stagger 45ms，0.95s |
| 3 | 首屏副标题/头像 | `.animate-hero-sub` / `.animate-hero-avatar` | 0.9s / 1.1s，delay 0.3s / 0 |
| 4 | 区块入场 | `.animate-section-in` | 0.7s，delay 80/160/240ms 递增 |
| 5 | 筛选标签 | `.animate-chip-in` | 0.45s，每项 +60ms |
| 6 | 卡片网格 | `.photo-card` + `--pc-delay` | 0.6s，每项 +40ms |
| 7 | 列表卡片 | `.visit-card-in` | 0.55s，每项 +70ms |
| 8 | 时间轴 | `.timeline-item` | 0.5s，每项 +40ms |
| 9 | 异步加载 | 骨架屏（**禁止 spinner**） | shimmer 1.6s + breathe 2.4s，交错 60ms |
| 10 | 轮播翻页 | `.carousel-slide` transform | 0.75s `cubic-bezier(0.33,1,0.68,1)` |
| 11 | 统计数字 | `CountUp`（GSAP ScrollTrigger） | start `top 88%`，once，1.6s power2.out |
| 12 | 滚动 reveal | `.reveal` + IntersectionObserver | 0.85s，delay 80~320ms |
| 13 | 全局滚动 | Lenis + GSAP ticker | lerp 0.1，wheel 1，touch 1.5 |
| 14 | hover 反馈 | 仅改背景透明度/文字色 | 禁止边框、圆角、阴影变化 |

---

## 三、色彩 / 字体 / 容器

```css
--color-gold:  #CEA472;              /* 品牌金：标题、高亮、图标、发光 */
--bg-page:     #0a0a0f;              /* 页面底色 */
--card:        rgba(0,0,0,0.40);     /* 卡片底 */
--card-hover:  rgba(0,0,0,0.60);
--text:        #FFFFFF;
--text-muted:  rgba(255,255,255,0.60);
--text-sub:    rgba(255,255,255,0.80); /* 次级可点击文字 / 非激活导航 */
```

**字体**：只用系统字体栈，**禁止 CDN/第三方字体**（曾因 jsDelivr 字体 404 产生 `net::ERR_ABORTED` 报错已全面移除）。

```css
--font-sans: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
             ui-sans-serif, system-ui, -apple-system, sans-serif;
```

**容器宽度**：所有页面统一 `max-w-7xl mx-auto px-4`（1280px），保证跨页切换时右边界不跳动。

---

## 四、扁平化规范（v2 关键变更）

| 元素 | 规范 |
|------|------|
| 内容卡片（照片、访问记录、骨架屏） | **无边框、无圆角**，仅 `bg-black/40`，hover → `bg-black/60` |
| 分类筛选 / 导航文字按钮 | 无底框无边框；激活 `text-[#CEA472]`，未激活 `text-white/80` + hover 金色 |
| 图标按钮（设置/同步） | 透明背景、无边框（`border-0 shadow-none bg-transparent`），hover 仅降透明度 |
| 时间轴 | 无独立背景、无渐变蒙层；圆点纯色填充（激活实心金，其余 30% 金） |
| 图片比例 | 统一按内容：`aspect-[3/2]`（照片/缩略图），骨架屏 `4/3` 占位 |
| 对话框 / 模态层 | **保留**圆角与描边（`rounded` + `border-[#CEA472]/20`），属层级区分，不参与扁平化 |

---

## 五、动效时序与缓动

| 曲线 | 用途 |
|------|------|
| `cubic-bezier(0.22, 1, 0.36, 1)` | **全局标准**：区块、卡片、骨架、时间轴 |
| `cubic-bezier(0.33, 1, 0.68, 1)` | 轮播/拖拽（惯性更强） |
| `cubic-bezier(0.2, 0.8, 0.2, 1)` ≈ 标准 | Hero 系列、滚动 reveal |
| `ease-out` | 遮罩淡出、轻量提示（0.3~0.45s） |
| GSAP `power3.out` / `power2.out` | SplitText（0.95s）/ CountUp（1.6s） |

**错峰节奏基准**

- 区块之间：120ms → 200ms → 300ms → 400ms
- 列表/卡片：40~70ms/项
- 骨架屏：60ms/项
- 总入场时长控制在 **≤ 1.6s**，超过会让页面显慢

---

## 六、页面过渡（L1）

- 实现：`src/app/template.tsx` 渲染 `.page-fade-overlay`（fixed 全屏 `#0a0a0f`，`pointer-events: none`，`z-index: 300`，0.4s 淡出）。
- **禁止**：给页面内容包裹层加 `opacity` / `transform` 过渡动画。
  - 原因 1：与内部元素的 reveal / SplitText / CountUp 形成**双层 opacity 相乘**（发灰、慢半拍）。
  - 原因 2：`will-change: opacity` 或残留 `transform` 会让容器成为 `position: fixed` 的包含块，滚动进度条等 fixed 元素会跟着乱跑。
- App Router 原生不支持旧页滑出；如需双向推拉，使用 View Transitions API，而不是给根容器加动画。

---

## 七、GSAP 规范

### 7.1 SplitText（逐字标题）
- GSAP ≥ 3.13 起 SplitText **免费内置**（`gsap/SplitText`），无需 Club 插件。
- **必须处理 SSR 首帧**：行容器内联 `style={{ opacity: 0 }}`，避免 hydrate 前先显示完整文字。
- `gsap.from()` 同步写入隐藏态（immediateRender）后，**同一帧内**显示父级遮罩。
- 必须提供 `<noscript>` 兜底（`opacity: 1 !important`）与 `prefers-reduced-motion` 直显分支。
- 完整代码见 [react-motion-kit.md](assets/react-motion-kit.md#1-splittexttitle)。

### 7.2 CountUp（数字滚动）
- `gsap.to({v:0}, {v: target, scrollTrigger:{ trigger, start:'top 88%', once:true }})`。
- 文案、字号、颜色保持原样，只替换数字节点。
- `toLocaleString()` 输出；`tabular-nums` 防宽度跳动。

### 7.3 Lenis（平滑滚动）
```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
- 必须**移除**原生 `html { scroll-behavior: smooth; }`，否则两者冲突。
- 路由变化后 `ScrollTrigger.refresh()`（延迟 200~350ms）。
- Lenis 驱动真实 window 滚动，因此进度条 / IntersectionObserver 无需改造。

---

## 八、骨架屏规范（L3）

- 骨架元素尺寸 = 真实元素尺寸（**高度不得塌陷**），底座 `bg-black/40`，无边框无圆角。
- shimmer：1.6s 无限；整体 breathe：2.4s 无限；交错 60ms。
- 照片类组件必须等 `new window.Image().decode()` **全部完成**后再退出骨架屏，避免渐进式 JPEG 半幅显示。
- 自动轮播/自动播放必须等解码完成后再启动。
- **任何页面级加载态禁止 spinner**（转圈）。操作级（上传/保存按钮内）可保留。

---

## 九、轮播（3:2 中心 + 两侧延伸）

```css
.carousel-stage { aspect-ratio: 3 / 2; --sw: 100%; }
@media (min-width: 768px) {
  .carousel-stage { --sw: min(900px, 60vw); height: calc(var(--sw) * 2 / 3); aspect-ratio: auto; }
}
.carousel-slide {
  position: absolute; top: 0; height: 100%; width: var(--sw);
  left: calc(50% - var(--sw) / 2);
  transition: transform 0.75s cubic-bezier(0.33, 1, 0.68, 1);
  will-change: transform;
}
```
- 手机端中心卡 3:2、两侧卡片延伸占满视口；不提供翻页按钮，仅触摸滑动。
- 骨架屏舞台复用**同一套尺寸变量**（`.carousel-skeleton`）。
- 翻页方向：下一张从右滑入，当前张滑向左侧。

---

## 十、红线（违反需回退）

| 规则 | 原因 |
|------|------|
| 禁止内容卡片加边框 / 圆角 | 破坏扁平统一视觉（模态层除外） |
| 禁止页面级 spinner | 高级感差，统一用骨架屏 |
| 禁止给页面容器加 opacity/transform 过渡 | 与内层动效叠加、破坏 fixed 定位 |
| 禁止第三方 CDN 字体 | 网络失败即报错，改用系统字体栈 |
| 骨架屏尺寸必须与真实元素一致 | 避免高度塌陷、CLS |
| 轮播必须解码完成后再显示/自动播放 | 避免半幅 JPEG |
| 交错延迟用 CSS `animation-delay`（或 `--pc-delay` 变量） | SSR 友好、无 JS 抖动 |
| 新动效缓动优先 `(0.22,1,0.36,1)` | 全站感知一致 |
| 页面容器统一 `max-w-7xl mx-auto px-4` | 跨页右边界对齐 |
| 所有动效支持 `prefers-reduced-motion` | 无障碍 |

---

## 十一、类名索引

| 类名 | 作用 | 时长 |
|------|------|------|
| `.page-fade-overlay` | 路由切换遮罩淡出 | 0.4s |
| `.bg-blob-a/b/c` | 背景光斑漂移 | 22~34s ∞ alternate |
| `.animate-hero-title/sub` | Hero 文本入场 | 0.9s |
| `.animate-hero-avatar` | Hero 头像 scale-in | 1.1s |
| `.animate-section-in` | 区块 fade-up | 0.7s |
| `.animate-section-delay-1/2/3` | 区块错峰 | 80/160/240ms |
| `.animate-chip-in` | 筛选 chip pop-in | 0.45s |
| `.timeline-item` | 时间轴左滑入 | 0.5s |
| `.photo-card` | 卡片 blur+scale 入场 | 0.6s |
| `.photo-grid-fade` | 筛选切换重入 | 0.45s |
| `.visit-card-in` | 访问记录卡片 | 0.55s |
| `.visit-title-in` | 标题切换淡入 | 0.35s |
| `.reveal` / `.reveal-delayed-1~4` | 滚动 reveal | 0.85s |
| `.visited-glow` | 地图发光 pulse | 3.5s ∞ |
| `.skeleton-shimmer` / `.skeleton-breathe` | 骨架屏 | 1.6s / 2.4s ∞ |
| `.photo-grid-skeleton` / `.photo-skeleton-card` | 照片骨架网格 | 交错 60ms |
| `.carousel-stage` / `.carousel-slide` / `.carousel-skeleton` | 轮播 | 0.75s |
| `.split-char` | SplitText 字符基类 | GSAP 驱动 |

---

## 十二、接入新项目（三步）

1. 复制 [`assets/design-tokens.css`](assets/design-tokens.css) 到项目全局样式入口（或与 Tailwind `@theme inline` 合并声明）。
2. 复制 [`assets/motion.css`](assets/motion.css) 到全局样式（纯 CSS，无 Tailwind 依赖）。
3. 按需复制 [`assets/react-motion-kit.md`](assets/react-motion-kit.md) 中的组件：`SmoothScroll` 挂载到 root layout，`Template` 放 `app/template.tsx`，`SplitTextTitle` / `CountUp` 用于标题与统计。
4. 安装依赖：`pnpm add gsap lenis`。
