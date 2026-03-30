#!/bin/bash

# ========================================
# 创建部署包脚本
# ========================================

set -e

PACKAGE_NAME="tobi-homepage-deploy"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_FILE="${PACKAGE_NAME}-${TIMESTAMP}.tar.gz"

echo "📦 创建部署包..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR="/tmp/${PACKAGE_NAME}"

# 创建临时目录
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 复制必要文件
echo "📋 复制项目文件..."

# 复制配置文件
cp package.json "$TEMP_DIR/"
cp pnpm-lock.yaml "$TEMP_DIR/"
cp next.config.ts "$TEMP_DIR/"
cp tsconfig.json "$TEMP_DIR/"
cp tailwind.config.ts "$TEMP_DIR/" 2>/dev/null || true
cp postcss.config.mjs "$TEMP_DIR/"
cp components.json "$TEMP_DIR/"
cp next-env.d.ts "$TEMP_DIR/"
cp ecosystem.config.js "$TEMP_DIR/"

# 复制环境变量示例
cp .env.example "$TEMP_DIR/"

# 复制目录
cp -r src "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"

# 复制部署文档
cp DEPLOY-GUIDE.md "$TEMP_DIR/" 2>/dev/null || true
cp DEPLOY-ECS.md "$TEMP_DIR/" 2>/dev/null || true
cp SUPABASE-TUTORIAL.md "$TEMP_DIR/" 2>/dev/null || true
cp SUPABASE-STORAGE-GUIDE.md "$TEMP_DIR/" 2>/dev/null || true

# 创建 README
cat > "$TEMP_DIR/README.txt" << 'EOF'
================================
Tobi Homepage 部署包
================================

快速部署步骤：

1. 解压文件
   cd /var/www
   rm -rf tobi-homepage
   mkdir -p tobi-homepage
   tar -xzf tobi-homepage-deploy.tar.gz -C tobi-homepage
   cd tobi-homepage

2. 安装依赖并构建
   pnpm install
   export NODE_OPTIONS="--max-old-space-size=1536"
   npx next build

3. 启动服务
   pm2 delete tobi-homepage 2>/dev/null
   pm2 start ecosystem.config.js
   pm2 save

详细说明请查看 SUPABASE-STORAGE-GUIDE.md 文件
EOF

# 打包
echo "🗜️  压缩文件..."
cd "$TEMP_DIR"
tar -czf "$SCRIPT_DIR/$OUTPUT_FILE" *

# 清理临时目录
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 部署包创建成功！"
echo ""
echo "📁 文件: $OUTPUT_FILE"
echo "📊 大小: $(du -h "$SCRIPT_DIR/$OUTPUT_FILE" | cut -f1)"
