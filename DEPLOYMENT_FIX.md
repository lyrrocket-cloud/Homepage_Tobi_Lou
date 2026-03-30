# 部署问题修复记录

## 2026-03-28 - 完全禁用图片优化（最终解决方案）

### 问题描述

生产环境仍然出现图片缓存目录创建错误：

```
Failed to write image to cache [Error: ENOENT: no such file or directory, mkdir '/opt/bytefaas/.next/cache/images']
```

即使设置了环境变量 `NEXT_PRIVATE_SKIP_CACHE_WORKSPACE=true`，Next.js 的图片优化功能仍在尝试创建缓存目录。

### 根本原因

Next.js 的图片优化功能（Image Optimization）必须使用缓存目录来存储优化后的图片。在只读文件系统中，这会导致错误。

### 最终解决方案

完全禁用 Next.js 的图片优化功能，因为项目已经通过 `/api/image/[key]` 代理 API 提供图片服务，不需要 Next.js 的图片优化。

#### 修改 next.config.ts

```typescript
const nextConfig: NextConfig = {
  images: {
    // 完全禁用图片优化，避免缓存目录创建失败（只读文件系统）
    unoptimized: true,
    remotePatterns: [
      // ... 其他配置
    ],
  },
};
```

**关键修改**：
- 设置 `images.unoptimized = true`
- 移除 `formats`、`deviceSizes`、`imageSizes` 等优化相关配置
- 保留 `remotePatterns` 配置（仍然需要用于外部图片）

### 影响分析

**优点**：
- ✅ 完全避免缓存目录创建问题
- ✅ 不再依赖 Next.js 图片优化
- ✅ 通过自定义 API 提供更好的控制

**缺点**：
- ❌ 失去 Next.js 自动图片优化功能（WebP、AVIF、响应式图片等）
- ❌ 需要手动管理图片优化（如果需要）

### 替代方案

如果需要图片优化，可以考虑：
1. 使用 CDN 提供的图片优化服务
2. 预生成优化后的图片
3. 使用外部缓存服务（如 Redis）存储优化结果

### 测试结果

修复后的表现：

- ✅ 无缓存目录创建错误
- ✅ 服务启动正常（838ms）
- ✅ 所有 API 接口正常工作
- ✅ 首页正常访问
- ✅ 照片和视频正常展示

---

## 2026-03-27 - 启动超时问题修复

### 问题描述

生产环境启动超时（30s），导致部署失败。

### 根本原因

1. 启动脚本使用 `lsof` 检查端口占用，在某些环境中性能较差
2. 未设置内存限制，GC 可能频繁触发
3. 使用 `output: 'standalone'` 模式，启动速度较慢

### 解决方案

#### 1. 优化启动脚本

使用 `ss` 替代 `lsof` 检查端口：

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

#### 2. 设置内存限制

```bash
export NODE_OPTIONS="--max-old-space-size=512"
```

限制 Node.js 最大内存为 512MB，避免 GC 频繁触发。

#### 3. 移除 standalone 模式

移除 `next.config.ts` 中的 `output: 'standalone'` 配置：

```typescript
const nextConfig: NextConfig = {
  // 移除这行
  // output: 'standalone',
};
```

### 测试结果

修复后的启动性能：

- ✅ 启动时间：从 35s 降至 841ms
- ✅ 无启动超时错误
- ✅ 服务稳定运行

### 已知限制

1. 内存限制为 512MB，如果应用需要更多内存，可以适当调整
2. 移除 standalone 模式后，构建产物可能会稍大

---

## 其他修复记录

### Next.js 配置警告

**问题**：`swcMinify` 配置无效

```
⚠ Invalid next.config.ts options detected:
⚠     Unrecognized key(s) in object: 'swcMinify' at "experimental"
```

**解决**：移除 `swcMinify` 配置（Next.js 15.1.0 已默认启用）

### 启动脚本语法错误

**问题**：SyntaxError: missing ) after argument list

**解决**：使用 `npx next start` 替代 `node node_modules/.bin/next`

### 图片缓存目录创建失败

**问题**：ENOENT: no such file or directory

**解决**：通过设置 `images.unoptimized = true` 完全禁用图片优化
