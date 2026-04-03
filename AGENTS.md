# Tobi Lou 个人网站 - 项目文档

## 项目概览

Tobi Lou 的个人旅行主页，展示旅行照片与视频，提供工具箱入口和基于地图的旅行打卡功能（支持中国地图和世界地图）。

### 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Map**: react-simple-maps

### 项目结构

```
src/
├── app/
│   ├── api/              # API 路由
│   │   ├── health/       # 健康检查端点
│   │   ├── init/         # 初始化端点
│   │   ├── image/        # 图片代理
│   │   ├── photos/       # 照片管理
│   │   ├── videos/       # 视频管理
│   │   ├── tools/        # 工具管理
│   │   ├── visits/       # 打卡记录
│   │   ├── regions/      # 地区数据
│   │   └── upload/       # 文件上传
│   ├── page.tsx          # 主页
│   └── layout.tsx        # 布局
├── components/
│   ├── china-map.tsx         # 中国地图组件
│   ├── world-map.tsx         # 世界地图组件
│   ├── visit-list.tsx        # 打卡记录列表
│   ├── visit-manager.tsx     # 打卡管理弹窗
│   ├── photo-manager.tsx     # 照片管理
│   ├── world-photo-manager.tsx # 世界地图照片管理
│   ├── video-manager.tsx     # 视频管理
│   ├── tool-manager.tsx      # 工具管理
│   └── ui/                   # shadcn/ui 组件
├── storage/
│   └── database/
│       └── supabase-client.ts  # Supabase 客户端
└── lib/
    └── utils.ts          # 工具函数
```

## 开发规范

### 环境变量

项目使用以下环境变量（从 Coze 工作区自动加载）：

- `COZE_SUPABASE_URL`: Supabase 项目 URL
- `COZE_SUPABASE_ANON_KEY`: Supabase 匿名访问密钥
- `COZE_PROJECT_DOMAIN_DEFAULT`: 项目访问域名
- `DEPLOY_RUN_PORT`: 服务端口（5000）
- `COZE_BUCKET_ENDPOINT_URL`: 对象存储端点 URL
- `COZE_BUCKET_NAME`: 当前环境的 bucket 名称

#### 共享存储配置

项目已配置为**共享存储模式**，预览环境和生产环境使用同一个 bucket (`bucket_1774837406196`)：

- 在预览环境上传的照片，生产环境立即可见
- 在生产环境上传的照片，预览环境也可见
- 无需额外的同步步骤

存储配置位于 `src/lib/storage.ts`。

### 构建和运行

```bash
# 开发环境
pnpm install
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start
```

### 包管理器

**仅使用 pnpm**，禁止使用 npm 或 yarn。

```bash
# 安装依赖
pnpm add <package>

# 安装开发依赖
pnpm add -D <package>
```

### 按钮 UI 规范

项目统一使用以下按钮 UI 规范，确保界面一致性。

#### 1. 图标按钮（Icon Buttons）

**适用场景**：保存、添加、编辑、关闭、删除等操作按钮

**样式规范**：
```tsx
<Button
  variant="outline"
  size="icon"
  className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
>
  <Icon className="w-4 h-4 text-[#CEA472]" />
</Button>
```

**常见图标映射**：
- 保存 → `Save`
- 添加 → `Plus`
- 编辑 → `Edit2`
- 关闭 → `X`
- 删除 → `Trash2`
- 设置 → `Settings`

**应用位置**：
- 管理界面标题栏的保存/关闭按钮
- 照片/视频/工具列表的编辑/删除按钮
- 添加照片/视频/工具的快速操作按钮

#### 2. 确认/取消按钮（Confirm/Cancel Buttons）

**适用场景**：密码验证弹窗、表单提交弹窗

**样式规范**：

确认按钮（主按钮）：
```tsx
<Button
  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
>
  确认
</Button>
```

**状态说明**：

| 状态 | 背景色 | 边框色 | 文字颜色 | 描述 |
|------|--------|--------|----------|------|
| 非悬停（默认） | 金色 `bg-[#CEA472]` | 无 `无` | 深色 `text-[#0a0a0f]` | 实心金色背景，深色文字 |
| 悬停（hover） | 浅金色 `hover:bg-[#CEA472]/80` | 无 `无` | 深色 `text-[#0a0a0f]` | 80% 透明度金色背景，文字不变 |

取消按钮（次要按钮）：
```tsx
<Button
  variant="outline"
  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
>
  取消
</Button>
```

**状态说明**：

| 状态 | 背景色 | 边框色 | 文字颜色 | 描述 |
|------|--------|--------|----------|------|
| 非悬停（默认） | 白色 `bg-background` | 浅金色 `border-[#CEA472]/30` | 金色 `text-[#CEA472]` | 白色背景，浅金色边框和文字 |
| 悬停（hover） | 浅金色 `hover:bg-[#CEA472]/10` | 浅金色 `border-[#CEA472]/30` | 金色 `hover:text-[#CEA472]` | 10% 透明度金色背景，边框和文字不变 |

**应用位置**：
- 密码验证弹窗（确认 + 取消）
- 添加/编辑表单弹窗（确认添加/保存 + 取消）
- 确认删除弹窗（确认删除 + 取消）

#### 4. 删除按钮（Delete Buttons）

**适用场景**：照片/视频/工具等项目的删除操作

**样式规范 - 图标按钮（列表中的删除按钮）**：
```tsx
<Button
  variant="outline"
  size="icon"
  onClick={() => handleDelete(id)}
  className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
>
  <Trash2 className="w-4 h-4" />
</Button>
```

**样式规范 - 图标按钮（size="sm"，管理列表中）**：
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => handleDelete(id)}
  className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
>
  <Trash2 className="w-4 h-4" />
</Button>
```

**删除确认弹窗样式规范**：

确认删除按钮（红色警告按钮）：
```tsx
<Button
  onClick={handleConfirmDelete}
  className="bg-red-600 hover:bg-red-700 text-white"
>
  确认删除
</Button>
```

**状态说明**：

| 状态 | 背景色 | 边框色 | 文字颜色 | 描述 |
|------|--------|--------|----------|------|
| 非悬停（默认） | 深红色 `bg-red-600` | 无 `无` | 白色 `text-white` | 深红色背景，白色文字 |
| 悬停（hover） | 更深红色 `hover:bg-red-700` | 无 `无` | 白色 `text-white` | 更深的红色背景，文字不变 |

取消按钮（次要按钮）：
```tsx
<Button
  variant="outline"
  onClick={handleCancelDelete}
  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
>
  取消
</Button>
```

**状态说明**：

| 状态 | 背景色 | 边框色 | 文字颜色 | 描述 |
|------|--------|--------|----------|------|
| 非悬停（默认） | 白色 `bg-background` | 浅金色 `border-[#CEA472]/30` | 金色 `text-[#CEA472]` | 白色背景，浅金色边框和文字 |
| 悬停（hover） | 浅金色 `hover:bg-[#CEA472]/10` | 浅金色 `border-[#CEA472]/30` | 金色 `hover:text-[#CEA472]` | 10% 透明度金色背景，边框和文字不变 |

**完整删除确认弹窗示例**：
```tsx
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-red-500">
        <Trash2 className="w-5 h-5" />
        确认删除
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <p className="text-[#FFFFFF]/80">
        确定要删除"{itemTitle}"吗？此操作无法撤销。
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={handleConfirmDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          确认删除
        </Button>
        <Button
          variant="outline"
          onClick={handleCancelDelete}
          className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
        >
          取消
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**颜色说明**：
- 边框：`border-red-500/30`（30% 透明度的红色边框）
- 文字：`text-red-500`（红色文字）
- 悬停背景：`hover:bg-red-500/10`（10% 透明度的红色背景）
- 确认删除按钮背景：`bg-red-600 hover:bg-red-700`（深红色背景）

**应用位置**：
- 照片管理界面：每张照片卡片的删除按钮
- 视频管理界面：每个视频卡片的删除按钮
- 工具管理界面：每个工具卡片的删除按钮
- 打卡记录管理界面：每条打卡记录的删除按钮
- 删除确认弹窗中的确认按钮

**交互提示**：
- 删除按钮应使用红色系颜色，传达警示意味
- 删除操作前应弹出确认弹窗，防止误操作
- 确认弹窗应明确说明删除对象和不可撤销的后果
- 确认删除按钮应使用红色背景，取消按钮使用次要样式

#### 3. 视觉对比总结

| 按钮类型 | 非悬停背景 | 非悬停边框 | 悬停背景 | 悬停边框 | 文字颜色 | 用途 |
|---------|-----------|-----------|---------|---------|---------|------|
| 确认按钮 | 金色 `bg-[#CEA472]` | 无 `无` | 浅金色 `hover:bg-[#CEA472]/80` | 无 `无` | 深色 `text-[#0a0a0f]` | 主要操作（保存、添加、确认） |
| 取消按钮 | 白色 `bg-background` | 浅金色 `border-[#CEA472]/30` | 浅金色 `hover:bg-[#CEA472]/10` | 浅金色 `border-[#CEA472]/30` | 金色 `text-[#CEA472]` | 次要操作（取消、关闭） |
| 确认删除按钮 | 深红色 `bg-red-600` | 无 `无` | 更深红色 `hover:bg-red-700` | 无 `无` | 白色 `text-white` | 危险操作（删除） |

**颜色值参考**：

| 用途 | 颜色值 | 十六进制 |
|------|--------|----------|
| 金色（主色） | `[#CEA472]` | #CEA472 |
| 深色文字 | `[#0a0a0f]` | #0a0a0f |
| 白色背景 | `bg-background` | 系统默认（白色/浅色） |
| 警示红 | `red-600` | #DC2626 |
| 深警示红 | `red-700` | #B91C1C |
| 浅红色 | `red-500` | #EF4444 |

#### 4. 按钮布局规范

- **主按钮在左**：确认/保存按钮位于左侧，为主要操作
- **取消按钮在右**：取消按钮位于右侧，为次要操作
- **间距**：按钮之间使用 `gap-2` 或 `gap-3` 保持适当间距

**示例**：
```tsx
<div className="flex gap-3 justify-end">
  <Button className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]">
    确认
  </Button>
  <Button
    variant="outline"
    className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
  >
    取消
  </Button>
</div>
```

## 核心功能

### 1. 旅行打卡

**组件**: `WorldTracker` (世界地图) + `VisitTracker` (中国地图)

**功能**:
- 显示世界地图和中国地图
- 已打卡地区显示金色
- 点击地区自动打开打卡弹窗
- 世界地图支持国家名称映射到数据库 ID
- **左右分栏布局**：地图在左，到访记录列表在右
- 世界地图的到访记录仅显示 `type='world'` 的照片
- 中国地图的到访记录显示所有中国地区的照片

**API**:
- `GET /api/visits` - 获取打卡记录
- `POST /api/visits` - 添加打卡记录
- `GET /api/regions?type=world` - 获取世界地区数据
- `GET /api/regions?type=china` - 获取中国地区数据
- `GET /api/gallery/photos` - 获取照片记录（包含 region 信息）

**世界地图数据源**:
- GeoJSON: https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson
- 国家 ID 映射: 欧洲(800-849), 亚洲(900-940), 北美洲(1000-1018), 大洋洲(1100-1113), 南美洲(1200-1212), 非洲(1300-1333)

**布局结构**:
```
┌─────────────────────────────────────────────────┐
│ 🌍 旅行打卡                                      │
├─────────────────────────────────────────────────┤
│ ▣ 已访问  □ 未访问                               │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────┬───────────────────────┐ │
│ │ 🌍 世界地图          │    世界访问记录        │ │
│ │      (左侧)          │    (右侧 320px)       │ │
│ └─────────────────────┴───────────────────────┘ │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────┬───────────────────────┐ │
│ │ 🗺️ 中国地图          │    中国访问记录        │ │
│ │      (左侧)          │    (右侧 320px)       │ │
│ └─────────────────────┴───────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2. 照片管理

**组件**: `PhotoManager`

**功能**:
- 展示照片网格
- 管理照片（增删改）
- 支持上传新照片

**API**:
- `GET /api/photos` - 获取照片列表
- `POST /api/photos` - 更新照片列表
- `POST /api/upload` - 上传图片
- `GET /api/image/[key]` - 图片代理

### 3. 视频管理

**组件**: `VideoManager`

**功能**:
- 展示视频列表
- 管理视频（增删改）
- 支持 Bilibili 嵌入

**API**:
- `GET /api/videos` - 获取视频列表
- `POST /api/videos` - 更新视频列表

### 4. 工具箱

**组件**: `ToolManager`

**功能**:
- 展示工具列表
- 管理工具（增删改）
- 跳转到外部工具

**API**:
- `GET /api/tools` - 获取工具列表
- `POST /api/tools` - 更新工具列表

## 数据库设计

### Photos 表

```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Videos 表

```sql
CREATE TABLE videos (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  embedUrl TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Tools 表

```sql
CREATE TABLE tools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Visits 表

```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  regionId INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (regionId) REFERENCES regions(id)
);
```

### Regions 表

```sql
CREATE TABLE regions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parentId INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES regions(id)
);
```

## 生产环境优化

### 启动优化

项目已优化生产环境启动速度，启动时间约 838ms（实测）。

**优化措施**:
- 使用优化的启动脚本 `scripts/start-prod.sh`
- 移除 `output: 'standalone'` 模式，加快启动
- 设置内存限制 512MB，避免 GC 拖慢启动
- 使用 SWC 压缩器，提升构建速度
- 禁用生产环境 webpack 缓存
- 完全禁用 Next.js 图片优化功能

**启动脚本**:
```bash
#!/bin/bash
export NODE_ENV=production
export PORT=${DEPLOY_RUN_PORT:-5000}
export NODE_OPTIONS="--max-old-space-size=512"

# 禁用图片缓存以适应只读文件系统
export NEXT_PRIVATE_SKIP_CACHE_WORKSPACE=true

# 使用 npx 启动 Next.js
exec npx next start -p $PORT --hostname 0.0.0.0
```

**Next.js 配置**:
```typescript
const nextConfig: NextConfig = {
  images: {
    // 完全禁用图片优化，避免缓存目录创建失败（只读文件系统）
    unoptimized: true,
    remotePatterns: [
      // ... 配置
    ],
  },
};
```

### 图片服务

项目使用自定义 `/api/image/[key]` 代理 API 提供图片服务，不依赖 Next.js 图片优化。

**优势**:
- 避免只读文件系统的缓存目录创建问题
- 更好的控制和错误处理
- 支持从 Supabase Storage 直接获取图片
- 支持自定义缓存策略

**API**:
- `GET /api/image/[key]` - 图片代理

详细说明请参考 [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)。

### 健康检查

定期调用健康检查端点以保持实例活跃：

```bash
curl https://your-domain.com/api/health
```

### 初始化预热

部署后立即调用初始化端点：

```bash
curl https://your-domain.com/api/init
```

### 超时配置

- 数据库查询: 8s
- HTTP 请求: 10s
- 图片代理: 15s
- 文件上传: 30s

### 文件大小限制

- 图片上传: 最大 10MB
- 图片代理: 最大 10MB

详细优化指南请参考 [PRODUCTION_OPTIMIZATION.md](./PRODUCTION_OPTIMIZATION.md)。

## 常见问题

### Q1: 地图显示不正常？

**A**: 检查以下几点：
1. 确认地图数据 URL 可访问
2. 检查省份代码映射是否正确
3. 查看浏览器控制台是否有错误

### Q2: 图片无法加载？

**A**: 检查以下几点：
1. 确认 Supabase Storage 配置正确
2. 检查文件大小是否超过 10MB
3. 查看网络请求是否有错误

### Q3: 打卡记录无法保存？

**A**: 检查以下几点：
1. 确认密码正确（tobi7758258）
2. 确认 Supabase 数据库连接正常
3. 检查 regions 表是否有对应数据

## 调试指南

### 查看日志

```bash
# 应用日志
tail -f /app/work/logs/bypass/app.log

# 开发日志
tail -f /app/work/logs/bypass/dev.log

# 控制台日志
tail -f /app/work/logs/bypass/console.log
```

### 检查端口

```bash
# 检查 5000 端口是否监听
ss -lptn 'sport = :5000'

# 检查服务状态
curl -I http://localhost:5000
```

### 类型检查

```bash
npx tsc --noEmit
```

## 更新日志

### 2026-04-03

- 统一所有管理组件的按钮样式
- 保存/添加/编辑/关闭按钮统一使用图标按钮样式（`variant="outline" size="icon"`）
- 确认/取消按钮保持为带文字的原状样式
- 新增"按钮 UI 规范"章节到开发规范文档，明确按钮样式规范
- 所有密码验证弹窗的取消按钮均为文字形式的次要按钮
- 统一使用 `Edit2` 图标替代 `Edit` 图标

### 2026-03-29

- 添加世界地图打卡模块
- 创建 WorldMap 组件，使用 react-simple-maps 和自然地球投影
- 支持国家名称到数据库 ID 的映射
- 在首页旅行打卡区域添加世界地图（在中国地图上方）
- 更新 AGENTS.md 文档

### 2026-03-28

- 完全禁用 Next.js 图片优化功能，解决只读文件系统缓存目录创建失败问题
- 通过设置 `images.unoptimized = true` 避免 `.next/cache/images` 目录创建
- 项目继续使用自定义 `/api/image/[key]` 代理 API 提供图片服务
- 无缓存错误，服务稳定运行

### 2026-03-27

- 修复生产环境只读文件系统错误
- 优化启动脚本，使用 npx 替代 node 直接调用
- 禁用图片缓存以适应只读文件系统
- 移除 Next.js 配置中的无效选项
- 优化启动时间从 35s 降至 841ms
- 添加环境变量禁用缓存目录创建
- 优化 Supabase 客户端配置

### 2026-03-27

- 优化中国地图打卡功能
- 删除世界地图
- 调整地图尺寸为 640×480px
- 添加手动打卡按钮
- 优化生产环境性能
- 添加健康检查和初始化端点
