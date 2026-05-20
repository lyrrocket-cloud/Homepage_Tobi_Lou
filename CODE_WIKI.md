# Tobi Homepage - Code Wiki

## 项目概述

**项目名称**: Tobi Homepage  
**版本**: 0.1.0  
**描述**: Tobi Lou 的个人旅行主页，展示旅行照片与视频，提供工具箱入口  
**Slogan**: 志之所趋，无远弗届

---

## 技术栈

### 前端技术
- **框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **类型系统**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **图标库**: lucide-react
- **地图库**: react-simple-maps

### 后端/服务
- **数据库**: Supabase PostgreSQL
- **文件存储**: Supabase Storage
- **进程管理**: PM2

### 开发工具
- **包管理器**: pnpm
- **Linting**: ESLint
- **格式检查**: TypeScript 编译检查

---

## 项目结构

```
/workspace
├── assets/                      # 静态资源（文档）
│   ├── BUTTON_UI_GUIDE.md
│   └── MAP_STYLE_GUIDE.md
├── public/                      # 公共静态资源
│   ├── assets/                  # 图片资源
│   ├── data/                    # 地图数据
│   │   ├── china.geo.json      # 中国地图 GeoJSON
│   │   └── world-countries.geojson
│   └── *.svg
├── scripts/                     # 工具脚本
│   ├── backup-database.ts
│   ├── build.sh
│   ├── dev.sh
│   └── sync-photos-to-production.ts
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── admin/
│   │   │   └── sync/
│   │   ├── api/                 # API 路由
│   │   │   ├── gallery/
│   │   │   ├── health/
│   │   │   ├── image/[key]/
│   │   │   ├── init/
│   │   │   ├── photos/          # 照片 CRUD
│   │   │   ├── regions/
│   │   │   ├── storage/
│   │   │   ├── sync-database/
│   │   │   ├── tools/           # 工具 CRUD
│   │   │   ├── upload/
│   │   │   ├── videos/          # 视频 CRUD
│   │   │   └── visits/          # 访问记录 CRUD
│   │   ├── photos/              # 照片页面
│   │   ├── globals.css
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 首页
│   ├── components/              # React 组件
│   │   ├── ui/                  # shadcn/ui 组件
│   │   ├── OptimizedImage.tsx   # 优化图片组件
│   │   ├── china-map.tsx        # 中国地图组件
│   │   ├── world-map.tsx        # 世界地图组件
│   │   ├── photo-manager.tsx    # 照片管理组件
│   │   ├── video-manager.tsx    # 视频管理组件
│   │   ├── tool-manager.tsx     # 工具箱管理组件
│   │   ├── visit-manager.tsx    # 访问记录管理组件
│   │   ├── visit-map.tsx        # 旅行打卡地图
│   │   ├── visit-list.tsx       # 访问记录列表
│   │   └── unified-photo-manager.tsx
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── storage.ts           # 存储工具
│   │   └── utils.ts
│   └── storage/database/
│       ├── regions-init.sql     # 地区初始化 SQL
│       └── supabase-client.ts   # Supabase 客户端
├── .env.example                 # 环境变量示例
├── ecosystem.config.js          # PM2 配置
├── next.config.ts               # Next.js 配置
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## 核心功能模块

### 1. 首页模块 (`src/app/page.tsx`)

**功能描述**: 项目主页面，展示所有核心功能

**主要组件**:
- Hero 区域：个人介绍、头像
- 旅行打卡地图：中国地图 + 世界地图
- 照片展示：瀑布流展示精选照片（最多9张）
- 视频展示：展示旅行视频
- 工具箱：展示实用工具入口
- Footer：版权信息、备案信息

**关键函数**:
- `formatDate(dateStr)`: 格式化日期显示
- `WorldTracker()`: 世界地图打卡追踪组件
- `WorldVisitList()`: 世界地图访问记录列表
- `VisitTracker()`: 中国地图打卡追踪组件

---

### 2. 地图组件

#### 中国地图 (`src/components/china-map.tsx`)

**功能描述**: 交互式中国地图，展示已访问省份

**主要 Props**:
```typescript
interface ChinaMapProps {
  onRegionClick: (regionId: number, regionName: string) => void;
  selectedRegion?: { id: number; name: string } | null;
  visitedRegions?: Set<number>;
  className?: string;
}
```

**关键常量**:
- `provinceNameToId`: 省份名称到数据库 ID 的映射
- `provinceCodeToId`: 省份代码到数据库 ID 的映射

**地图状态颜色**:
- **久居** (上海、江苏): `#002D28` (深绿色)
- **曾至**: `#CEA472` (金色)
- **未临**: 半透明白色

#### 世界地图 (`src/components/world-map.tsx`)

**功能描述**: 交互式世界地图，展示已访问国家

**主要 Props**: 与中国地图相同

---

### 3. 照片管理模块

#### 照片 API (`src/app/api/photos/route.ts`)

**数据类型**:
```typescript
interface Photo {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string;          // 存储键
  url: string;            // 外部链接
  order: number;
  imageUrl?: string;      // 动态生成的访问 URL
}
```

**HTTP 方法**:

**GET** - 获取照片列表
- 返回前 9 张照片（按 order 排序）
- 自动生成对象存储访问 URL
- 如果对象存储失败，回退到本地路径

**POST** - 更新照片列表
- 需要密码验证 (`tobi7758258`)
- 支持增量更新（新增、更新、删除）
- 限制最多 9 张照片

**关键函数**:
- `dbToPhoto(db)`: 数据库记录转前端格式
- `ensureDefaultData()`: 初始化默认数据

#### 照片管理组件 (`src/components/photo-manager.tsx`)

**功能描述**: 后台照片编辑管理组件

---

### 4. 视频管理模块

#### 视频 API (`src/app/api/videos/route.ts`)

**数据类型**:
```typescript
interface Video {
  id: number;
  title: string;
  location: string;
  date: string;
  embedUrl: string;        // 嵌入 URL
  order: number;
  isEmpty?: boolean;
}
```

---

### 5. 工具箱模块

#### 工具 API (`src/app/api/tools/route.ts`)

**数据类型**:
```typescript
interface Tool {
  id: number;
  name: string;
  description: string;
  icon: string;            // 图标名称
  url: string;
  order: number;
  isEmpty?: boolean;
}
```

**默认工具**:
1. 旅行记账
2. 今天谁开车
3. 旅行许愿池

---

### 6. 旅行打卡模块

#### 访问记录 API (`src/app/api/visits/route.ts`)

**数据类型**:
```typescript
interface Visit {
  id: number;
  regionId: number;
  title: string;
  description: string;
  date: string;
  image: string;
  orderNum: number;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}
```

**HTTP 方法**:

**GET** - 获取访问记录
- 支持按 `regionId` 筛选
- 支持按地区类型（china/world）筛选
- 支持关联查询地区信息

**POST** - 添加访问记录

#### 访问记录列表 (`src/components/visit-list.tsx`)

**功能描述**: 展示特定地区的旅行记录列表

---

### 7. 数据库客户端 (`src/storage/database/supabase-client.ts`)

**主要功能**:
- 单例模式管理 Supabase 客户端
- 环境变量加载（支持多种方式）
- 请求超时配置
- Python 脚本获取 Coze 环境变量

**关键函数**:
- `getSupabaseClient(token?)`: 获取 Supabase 客户端实例
- `loadEnv()`: 加载环境变量
- `initSupabase()`: 初始化 Supabase

**环境变量**:
- `COZE_SUPABASE_URL`: Supabase 项目 URL
- `COZE_SUPABASE_ANON_KEY`: Supabase 匿名密钥

---

## API 路由总览

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/photos` | GET | 获取照片列表 |
| `/api/photos` | POST | 更新照片列表 |
| `/api/videos` | GET | 获取视频列表 |
| `/api/videos` | POST | 更新视频列表 |
| `/api/tools` | GET | 获取工具列表 |
| `/api/tools` | POST | 更新工具列表 |
| `/api/visits` | GET | 获取访问记录 |
| `/api/visits` | POST | 添加访问记录 |
| `/api/regions` | GET | 获取地区列表 |
| `/api/gallery/photos` | GET | 获取相册照片 |
| `/api/gallery/upload` | POST | 上传相册照片 |
| `/api/upload` | POST | 上传文件 |
| `/api/image/[key]` | GET | 获取图片代理 |
| `/api/init` | POST | 初始化数据库 |
| `/api/init/regions` | POST | 初始化地区数据 |
| `/api/storage/list` | GET | 列出存储文件 |
| `/api/storage-test` | GET | 存储测试 |
| `/api/sync-database` | POST | 同步数据库 |
| `/api/health` | GET | 健康检查 |

---

## 数据库设计

### 主要数据表

#### 1. `photos` - 照片表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | text | 照片标题 |
| location | text | 地点 |
| date | text | 日期 |
| image | text | 图片存储键 |
| url | text | 外部链接 |
| order | integer | 排序 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

#### 2. `videos` - 视频表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | text | 视频标题 |
| location | text | 地点 |
| date | text | 日期 |
| embed_url | text | 嵌入 URL |
| order | integer | 排序 |

#### 3. `tools` - 工具表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| name | text | 工具名称 |
| description | text | 描述 |
| icon | text | 图标名称 |
| url | text | 工具链接 |
| order | integer | 排序 |

#### 4. `regions` - 地区表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| name | text | 地区名称 |
| type | text | 类型 (china/world) |
| code | text | 地区代码 |

#### 5. `visits` - 访问记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| region_id | integer | 关联地区 ID |
| title | text | 标题 |
| description | text | 描述 |
| date | text | 日期 |
| image | text | 图片 |
| order_num | integer | 排序 |

#### 6. `gallery_photos` - 相册照片表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| region_id | integer | 关联地区 ID |
| title | text | 标题 |
| date | text | 日期 |
| image_url | text | 图片 URL |
| url | text | 外部链接 |
| category | text | 分类 |
| is_yearly | boolean | 是否年度相册 |

---

## 依赖关系图

```
src/app/page.tsx (首页)
├── src/components/china-map.tsx
├── src/components/world-map.tsx
├── src/components/visit-list.tsx
├── src/components/photo-manager.tsx
├── src/components/video-manager.tsx
├── src/components/tool-manager.tsx
└── src/components/OptimizedImage.tsx

src/app/api/* (API 路由)
├── src/storage/database/supabase-client.ts
└── src/lib/storage.ts

Components
└── src/components/ui/* (shadcn/ui 组件库)
```

---

## 项目配置

### Next.js 配置 (`next.config.ts`)

**关键配置**:
- 图片优化禁用 (`unoptimized: true`)
- 远程图片域名配置
- 缓存控制头设置
- Webpack 生产环境禁用缓存

### TypeScript 配置 (`tsconfig.json`)

**路径别名**:
- `@/*`: 指向 `./src/*`

---

## 运行方式

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Supabase 配置

# 3. 启动开发服务器
pnpm dev
# 访问 http://localhost:5000
```

### 生产部署

```bash
# 1. 构建
pnpm build

# 2. 使用 PM2 启动
pm2 start ecosystem.config.js

# 或使用脚本
./scripts/start.sh
```

### 可用脚本

```bash
pnpm dev          # 开发模式 (端口 5000)
pnpm build        # 构建
pnpm start        # 生产模式 (端口 5000)
pnpm lint         # ESLint 检查
pnpm ts-check     # TypeScript 类型检查
```

---

## 部署指南

详细部署指南请参考 [`DEPLOY-GUIDE.md`](./DEPLOY-GUIDE.md)

**关键要点**:
- 需要配置 Supabase 环境变量
- PM2 进程管理
- 只读文件系统的特殊处理（禁用图片优化和 Webpack 缓存）

---

## 安全注意事项

1. **管理后台密码**: `tobi7758258`
   - 用于照片/视频/工具更新 API
   - 建议生产环境修改为更安全的密码

2. **环境变量**:
   - 不要将 `.env.local` 提交到 Git
   - 使用环境变量管理工具（如 Coze Workload Identity）

3. **Supabase 权限**:
   - 正确配置 RLS (Row Level Security)
   - 限制匿名用户的操作权限

---

## 性能优化

1. **图片优化**: 使用 `OptimizedImage` 组件，支持懒加载和优先级加载
2. **动态导入**: 地图组件使用动态导入，减少首屏加载
3. **缓存策略**: API 响应合理设置缓存头
4. **单例模式**: Supabase 客户端使用单例避免重复初始化

详细性能优化说明请参考 [`PERFORMANCE.md`](./PERFORMANCE.md)

---

## 相关文档

- [`README.md`](./README.md) - 项目主文档
- [`DEPLOY-GUIDE.md`](./DEPLOY-GUIDE.md) - 部署指南
- [`PERFORMANCE.md`](./PERFORMANCE.md) - 性能优化说明
- [`PHOTO-OPTIMIZATION.md`](./PHOTO-OPTIMIZATION.md) - 图片优化指南
- [`PRODUCTION_OPTIMIZATION.md`](./PRODUCTION_OPTIMIZATION.md) - 生产环境优化
- [`AGENTS.md`](./AGENTS.md) - AI Agent 说明
- [`BUTTON_UI_GUIDE.md`](./BUTTON_UI_GUIDE.md) - 按钮 UI 指南
- [`MAP_STYLE_GUIDE.md`](./MAP_STYLE_GUIDE.md) - 地图样式指南
- [`SCROLLBAR_GUIDE.md`](./SCROLLBAR_GUIDE.md) - 滚动条样式指南

---

## 技术支持

如有问题，请查看相关文档或联系维护者。

---

## License

MIT License
