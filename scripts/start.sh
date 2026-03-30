#!/bin/bash
set -e

echo "🚀 Starting production server..."

# 设置环境变量
export NODE_ENV=production
export PORT=${DEPLOY_RUN_PORT:-5000}

# 使用 Node.js 直接启动，跳过 pnpm 开销
# 添加 --max-old-space-size=512 限制内存使用，避免 OOM
node --max-old-space-size=512 node_modules/.bin/next start -p $PORT --hostname 0.0.0.0
