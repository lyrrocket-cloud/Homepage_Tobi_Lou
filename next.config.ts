import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    // 完全禁用图片优化，避免缓存目录创建失败（只读文件系统）
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.coze.site',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eeqbgbxqcwjsaescpyfr.supabase.co',
        pathname: '/**',
      },
    ],
  },

  // 压缩优化
  compress: true,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 编译缓存
  webpack: (config, { dev, isServer }) => {
    // 生产环境禁用缓存（只读文件系统）
    if (!dev && !isServer) {
      config.cache = false;
    }
    return config;
  },

  // 优化日志输出
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // HTTP 头设置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
