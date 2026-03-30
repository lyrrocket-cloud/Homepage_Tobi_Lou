# Tobi Homepage

Tobi Lou 的个人旅行主页，展示旅行照片与视频，提供工具箱入口。

## 功能特性

- **照片展示**: 瀑布流展示旅行照片，支持上传管理
- **视频展示**: 展示旅行视频，支持缩略图预览
- **工具箱**: 旅行相关小程序入口
- **管理后台**: 密码保护的后台管理系统

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS 4
- **数据库**: Supabase PostgreSQL
- **文件存储**: Supabase Storage
- **进程管理**: PM2

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 配置

# 启动开发服务器
pnpm dev
```

## 部署

详细部署教程请查看 [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)

### 快速部署

```bash
# 构建
pnpm build

# 启动
pm2 start ecosystem.config.js
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── photos/        # 照片 CRUD
│   │   ├── videos/        # 视频 CRUD
│   │   ├── tools/         # 工具 CRUD
│   │   ├── upload/        # 图片上传
│   │   └── image/[key]/   # 图片代理
│   ├── admin/             # 管理后台
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 布局
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   └── ...               # 业务组件
└── lib/                   # 工具函数
    ├── supabase.ts       # Supabase 客户端
    └── utils.ts          # 通用工具
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |

## 管理后台

访问 `/admin` 进入管理后台，密码：`tobi7758258`

## License

MIT
