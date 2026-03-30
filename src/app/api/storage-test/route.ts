import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 测试 Supabase Storage 配置
export async function GET() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || '';
  
  const config = {
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '(not set)',
    supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 10)}***` : '(not set)',
  };
  
  console.log('[Storage Test] Checking Supabase Storage config');
  console.log('  - supabaseUrl:', config.supabaseUrl);
  console.log('  - supabaseKey:', config.supabaseKey);
  
  // 检查配置是否完整
  if (!supabaseUrl) {
    return NextResponse.json({
      success: false,
      error: 'COZE_SUPABASE_URL 未配置',
      help: '请在 .env 文件中配置 Supabase 项目 URL',
    });
  }
  
  if (!supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'COZE_SUPABASE_ANON_KEY 未配置',
      help: '请在 .env 文件中配置 Supabase anon key',
    });
  }
  
  // 测试 Storage 连接
  try {
    const client = getSupabaseClient();
    
    // 尝试列出 photos bucket 中的文件
    const { data, error } = await client.storage
      .from('photos')
      .list('', { limit: 5 });
    
    if (error) {
      console.error('[Storage Test] Error:', error);
      
      let suggestion = '';
      let action = '';
      
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        suggestion = 'Storage bucket "photos" 不存在';
        action = `请在 Supabase 控制台创建 Storage bucket：
        
1. 登录 Supabase Dashboard
2. 进入 Storage 页面
3. 点击 "New bucket"
4. 名称填写: photos
5. 勾选 "Public bucket"（公开访问）
6. 点击创建`;
      } else if (error.message.includes('permission') || error.message.includes('Policy')) {
        suggestion = '没有访问权限';
        action = `请配置 Storage bucket 的 RLS 策略：

在 Supabase SQL Editor 中执行：
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');`;
      } else {
        suggestion = error.message;
        action = '请检查 Supabase 配置';
      }
      
      return NextResponse.json({
        success: false,
        error: 'Storage 连接失败',
        errorInfo: {
          message: error.message,
          name: error.name,
        },
        suggestion,
        action,
        config,
      }, { status: 500 });
    }
    
    console.log('[Storage Test] Success! Found', data?.length || 0, 'files');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase Storage 连接成功！',
      config,
      bucket: 'photos',
      fileCount: data?.length || 0,
      files: data?.slice(0, 5).map(f => f.name) || [],
    });
  } catch (error) {
    console.error('[Storage Test] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: '连接失败',
      errorInfo: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      config,
    }, { status: 500 });
  }
}
