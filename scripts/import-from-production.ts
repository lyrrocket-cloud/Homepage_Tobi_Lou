import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// 加载环境变量
function loadEnv(): void {
  try {
    require('dotenv').config();
  } catch {}

  try {
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load env:', error);
  }
}

// 主函数
async function main() {
  loadEnv();

  // 生产环境配置
  const PRODUCTION_URL = 'https://727sr6g8sv.coze.site';
  const PASSWORD = 'tobi7758258';

  // 当前环境（预览环境）的 Supabase 配置
  const previewSupabaseUrl = process.env.COZE_SUPABASE_URL;
  const previewSupabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!previewSupabaseUrl || !previewSupabaseKey) {
    console.error('Missing preview environment Supabase credentials');
    process.exit(1);
  }

  console.log('=== 从生产环境导入数据到预览环境 ===\n');
  console.log(`生产环境: ${PRODUCTION_URL}`);
  console.log(`预览环境 Supabase: ${previewSupabaseUrl}\n`);

  // 步骤1: 从生产环境导出数据
  console.log('步骤1: 从生产环境导出数据...\n');

  const tables = ['regions', 'gallery_photos', 'photos', 'videos', 'tools'];
  const exportedData: Record<string, any[]> = {};

  // 特殊 API 路径映射
  const apiPathMap: Record<string, string> = {
    'gallery_photos': 'gallery/photos',
  };

  for (const table of tables) {
    try {
      console.log(`  导出 ${table}...`);
      const apiPath = apiPathMap[table] || table;
      const response = await fetch(`${PRODUCTION_URL}/api/${apiPath}`, {
        headers: {
          'Authorization': `Bearer ${PASSWORD}`,
        },
      });

      if (!response.ok) {
        console.log(`    ⚠️  ${table}: HTTP ${response.status}`);
        exportedData[table] = [];
        continue;
      }

      const result = await response.json();
      // gallery_photos 返回的是 result.photos
      const data = result.data || result.photos || result.videos || result.tools || [];
      exportedData[table] = data;
      console.log(`    ✓ ${table}: ${data.length} 条记录`);
    } catch (error) {
      console.log(`    ⚠️  ${table}: ${error}`);
      exportedData[table] = [];
    }
  }

  // 保存导出的数据到文件（作为备份）
  const backupPath = join(process.cwd(), 'scripts/production-export.json');
  writeFileSync(backupPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    source: PRODUCTION_URL,
    tables: exportedData,
  }, null, 2));
  console.log(`\n  数据已保存到: ${backupPath}\n`);

  // 步骤2: 导入数据到预览环境
  console.log('步骤2: 导入数据到预览环境...\n');

  const previewSupabase = createClient(previewSupabaseUrl, previewSupabaseKey);

  const results: Record<string, { status: string; count?: number; error?: string }> = {};

  // 需要排除的计算字段（API 动态生成，不应存储到数据库）
  const computedFields = ['imageUrl', 'thumbnailUrl', 'videoUrl', 'children', 'hasVisited', 'image_url', 'region'];

  // 字段名映射：驼峰 -> 下划线
  function convertToDbFormat(data: any[], table: string): any[] {
    return data.map(item => {
      const converted: any = {};
      for (const [key, value] of Object.entries(item)) {
        // 跳过计算字段
        if (computedFields.includes(key)) continue;
        
        // 将驼峰转换为下划线
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        converted[dbKey] = value;
      }
      return converted;
    });
  }

  // 先导入 regions（其他表依赖它）
  for (const table of tables) {
    const data = exportedData[table];
    if (!data || data.length === 0) {
      results[table] = { status: 'skipped', count: 0 };
      continue;
    }

    // 转换字段名
    const dbData = convertToDbFormat(data, table);

    try {
      console.log(`  导入 ${table}...`);

      if (table === 'regions') {
        // regions 使用 upsert 避免外键约束问题
        const { error } = await previewSupabase
          .from(table)
          .upsert(dbData, { onConflict: 'id' });

        if (error) {
          results[table] = { status: 'error', error: error.message };
          console.log(`    ✗ ${error.message}`);
        } else {
          results[table] = { status: 'success', count: data.length };
          console.log(`    ✓ ${data.length} 条记录`);
        }
      } else {
        // 其他表：先清空再插入
        const { error: deleteError } = await previewSupabase
          .from(table)
          .delete()
          .neq('id', 0);

        if (deleteError) {
          results[table] = { status: 'error', error: deleteError.message };
          console.log(`    ✗ 删除失败: ${deleteError.message}`);
          continue;
        }

        const { error: insertError } = await previewSupabase
          .from(table)
          .insert(dbData);

        if (insertError) {
          results[table] = { status: 'error', error: insertError.message };
          console.log(`    ✗ 插入失败: ${insertError.message}`);
        } else {
          results[table] = { status: 'success', count: data.length };
          console.log(`    ✓ ${data.length} 条记录`);
        }
      }
    } catch (error) {
      results[table] = { status: 'error', error: String(error) };
      console.log(`    ✗ ${error}`);
    }
  }

  // 打印结果摘要
  console.log('\n=== 导入结果 ===\n');
  for (const [table, result] of Object.entries(results)) {
    const icon = result.status === 'success' ? '✓' : result.status === 'skipped' ? '○' : '✗';
    const info = result.status === 'success' 
      ? `${result.count} 条记录`
      : result.error || '跳过';
    console.log(`  ${icon} ${table}: ${info}`);
  }

  console.log('\n✅ 导入完成！');
}

main().catch(console.error);
