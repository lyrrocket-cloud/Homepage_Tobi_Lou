import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 加载环境变量
function loadEnv(): void {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not available
  }

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

  // 使用固定的生产备份文件
  const backupFile = join(process.cwd(), 'scripts/production-backup.json');
  
  if (!existsSync(backupFile)) {
    console.error('Backup file not found: scripts/production-backup.json');
    process.exit(1);
  }
  
  console.log(`Using backup file: scripts/production-backup.json`);
  console.log('');

  // 读取备份数据
  const backup = JSON.parse(readFileSync(backupFile, 'utf-8'));
  
  console.log('Backup summary:');
  for (const [table, data] of Object.entries(backup.tables)) {
    const tableData = data as { count?: number; data?: any[]; error?: string };
    console.log(`  ${table}: ${tableData.count || 0} records`);
  }
  console.log('');

  // 连接到当前数据库（生产环境运行时就是生产数据库）
  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  console.log(`Target database: ${supabaseUrl}`);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 定义表的处理顺序（先处理被依赖的表）
  const tables = ['regions', 'photos', 'videos', 'tools', 'visits'];

  console.log('Starting data sync to production...\n');

  for (const table of tables) {
    const tableData = backup.tables[table];
    if (!tableData || !tableData.data || tableData.data.length === 0) {
      console.log(`⏭️  Skipping ${table}: no data`);
      continue;
    }

    console.log(`📝 Processing ${table} (${tableData.data.length} records)...`);

    // 1. 清空表
    console.log(`   - Clearing existing data...`);
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .neq('id', 0); // 删除所有记录

    if (deleteError) {
      console.error(`   ❌ Error clearing ${table}:`, deleteError.message);
      continue;
    }

    // 2. 插入新数据
    console.log(`   - Inserting ${tableData.data.length} records...`);
    const { error: insertError } = await supabase
      .from(table)
      .insert(tableData.data);

    if (insertError) {
      console.error(`   ❌ Error inserting ${table}:`, insertError.message);
    } else {
      console.log(`   ✅ ${table}: synced ${tableData.data.length} records`);
    }
  }

  console.log('\n✅ Data sync completed!');
}

main().catch(console.error);
