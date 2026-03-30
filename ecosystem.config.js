module.exports = {
  apps: [{
    name: 'tobi-homepage',
    script: 'pnpm',
    args: 'start',
    cwd: '/var/www/tobi-homepage',
    instances: 1, // 单实例，Next.js 自带优化
    exec_mode: 'cluster',
    max_memory_restart: '512M', // 内存限制 512MB，超出自动重启
    env: {
      NODE_ENV: 'production',
      COZE_SUPABASE_URL: 'https://eeqbgbxqcwjsaescpyfr.supabase.co',
      COZE_SUPABASE_ANON_KEY: 'sb_publishable_DlVT8jCBJ0XDaMDGD44oUg_FNw0LpVm',
      NODE_OPTIONS: '--max-old-space-size=512', // V8 内存限制 512MB
    },
    error_file: '/var/www/tobi-homepage/logs/pm2-error.log',
    out_file: '/var/www/tobi-homepage/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10, // 最大重启次数
    min_uptime: '10s', // 最小运行时间
    restart_delay: 4000, // 重启延迟 4 秒
  }]
};
