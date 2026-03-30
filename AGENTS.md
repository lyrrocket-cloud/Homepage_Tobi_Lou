# Tobi Lou 个人网站 - 项目文档

## 项目概览

Tobi Lou 的个人旅行主页，展示旅行照片与视频，提供工具箱入口和基于中国地图的旅行打卡功能。

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
│   ├── china-map.tsx     # 中国地图组件
│   ├── visit-list.tsx    # 打卡记录列表
│   ├── visit-manager.tsx # 打卡管理弹窗
│   ├── photo-manager.tsx # 照片管理
│   ├── video-manager.tsx # 视频管理
│   ├── tool-manager.tsx  # 工具管理
│   └── ui/               # shadcn/ui 组件
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

## 核心功能

### 1. 旅行打卡

**组件**: `VisitTracker`

**功能**:
- 显示中国地图（固定尺寸 640×480px）
- 已打卡省份显示金色
- 点击省份自动打开打卡弹窗
- 手动添加打卡按钮

**API**:
- `GET /api/visits` - 获取打卡记录
- `POST /api/visits` - 添加打卡记录

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
