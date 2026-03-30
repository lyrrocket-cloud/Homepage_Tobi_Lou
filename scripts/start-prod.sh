#!/bin/bash
set -e

echo "🚀 Starting production server..."

# 设置环境变量
export NODE_ENV=production
export PORT=${DEPLOY_RUN_PORT:-5000}

# 禁用图片缓存（生产环境只读文件系统）
export NEXT_PRIVATE_SKIP_CACHE_WORKSPACE=true

# 使用 npx 直接启动 Next.js
echo "Starting Next.js server on port $PORT with memory limit 512MB..."
NODE_OPTIONS="--max-old-space-size=512" exec npx --no next start -p $PORT --hostname 0.0.0.0
