import { getSupabaseClient } from '../src/storage/database/supabase-client.ts';

async function createToolsTable() {
  try {
    const client = getSupabaseClient();

    console.log('🔍 正在检查 tools 表...');

    // 先检查表是否存在
    const { data, error } = await client
      .from('tools')
      .select('id')
      .limit(1);

    if (!error && data) {
      console.log('✅ tools 表已存在，跳过创建');
      return;
    }

    console.log('❌ tools 表不存在，需要创建');
    console.log('\n💡 请在 Supabase SQL Editor 中手动执行以下 SQL：');
    console.log(`
-- 创建 tools 表
CREATE TABLE IF NOT EXISTS public.tools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  url TEXT,
  "order" INTEGER NOT NULL,
  is_empty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tools_order ON public.tools("order");

-- 插入默认数据
INSERT INTO public.tools (id, name, description, icon, url, "order", is_empty)
VALUES 
  (1, '旅行记账', '记录旅途中的每一笔开支', 'Wallet', 'https://pvs6b4k729.coze.site', 1, FALSE),
  (2, '今天谁开车', '轮流开车，公平分配', 'Car', 'https://s864znmf32.coze.site', 2, FALSE),
  (3, '旅行许愿池', '许下你的旅行心愿', 'Sparkles', 'https://np9wpj8cx5.coze.site/', 3, FALSE),
  (4, '更多工具', '敬请期待', 'Plus', '', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 禁用 RLS（行级安全策略），允许匿名访问
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow read access" ON public.tools
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许所有人写入（实际应该限制，这里为了方便测试）
CREATE POLICY "Allow write access" ON public.tools
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
    `);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

createToolsTable();
