import { getSupabaseClient } from '../src/storage/database/supabase-client';

async function checkTables() {
  try {
    const client = getSupabaseClient();

    console.log('🔍 正在检查 Supabase 数据库中的表...');

    // 尝试查询 photos 表
    console.log('\n📊 检查 photos 表...');
    const { data: photosData, error: photosError } = await client
      .from('photos')
      .select('id')
      .limit(1);

    if (photosError) {
      console.error('❌ photos 表不存在或无法访问:', photosError.message);
    } else {
      console.log('✅ photos 表存在，记录数:', photosData?.length || 0);
    }

    // 尝试查询 videos 表
    console.log('\n📊 检查 videos 表...');
    const { data: videosData, error: videosError } = await client
      .from('videos')
      .select('id')
      .limit(1);

    if (videosError) {
      console.error('❌ videos 表不存在或无法访问:', videosError.message);
    } else {
      console.log('✅ videos 表存在，记录数:', videosData?.length || 0);
    }

    // 尝试查询 tools 表
    console.log('\n📊 检查 tools 表...');
    const { data: toolsData, error: toolsError } = await client
      .from('tools')
      .select('id')
      .limit(1);

    if (toolsError) {
      console.error('❌ tools 表不存在或无法访问:', toolsError.message);
      console.log('💡 这就是工具箱保存失败的原因！');

      // 尝试创建 tools 表
      console.log('\n🔧 正在创建 tools 表...');
      const { error: createError } = await client.rpc('exec_sql', {
        sql: `
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
        `
      });

      if (createError) {
        console.error('❌ 创建 tools 表失败:', createError.message);
        console.log('\n💡 请手动在 Supabase SQL Editor 中执行以下 SQL：');
        console.log(`
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
        `);
      } else {
        console.log('✅ tools 表创建成功！');
      }
    } else {
      console.log('✅ tools 表存在，记录数:', toolsData?.length || 0);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkTables();
