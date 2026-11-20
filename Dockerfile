# ============ 构建阶段 ============
FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# 固定 pnpm 版本，使用国内镜像加速
RUN npm install -g pnpm@9.0.0 --registry=https://registry.npmmirror.com

# 先装依赖，利用层缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 运行时不需要 TS 的 next config：转成纯 JS，避免启动时动态安装 typescript
RUN rm -f next.config.ts && cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // coze-coding-dev-sdk 的 rslib 输出交给 Node 直接 require
  serverExternalPackages: ['coze-coding-dev-sdk'],

  images: {
    // 同步关闭 Next 图片优化（与线上保持一致，避免只读/缓存目录问题）
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'lf-coze-web-cdn.coze.cn', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.coze.site', pathname: '/**' },
      { protocol: 'https', hostname: 'eeqbgbxqcwjsaescpyfr.supabase.co', pathname: '/**' },
      { protocol: 'http', hostname: '192.168.31.110', pathname: '/**' },
    ],
  },

  compress: true,

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

# 构建生产产物
RUN npx next build

# 裁剪 devDependencies
RUN pnpm prune --prod

# ============ 运行阶段 ============
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 本地文件存储目录（NAS 部署时挂载宿主机 ./data）
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"]
