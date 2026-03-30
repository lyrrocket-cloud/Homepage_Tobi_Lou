import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

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
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/restore-database.ts <backup-file>');
    console.error('Example: npx tsx scripts/restore-database.ts .backups/backup-2026-03-30.json');
    process.exit(1);
  }

  const backupFile = args[0];

  if (!existsSync(backupFile)) {
    console.error(`Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  loadEnv();

  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 读取备份文件
  console.log(`Loading backup from: ${backupFile}`);
  const backup = JSON.parse(readFileSync(backupFile, 'utf-8'));

  console.log(`Backup timestamp: ${backup.timestamp}`);
  console.log(`Backup source: ${backup.supabaseUrl}`);
  console.log('');

  // 确认操作
  console.log('⚠️  WARNING: This will overwrite existing data!');
  console.log('⚠️  Make sure you want to restore this backup.');
  console.log('');
  console.log('Tables to restore:');
  for (const table of Object.keys(backup.tables)) {
    const tableData = backup.tables[table];
    if (tableData.error) {
      console.log(`  ${table}: ❌ ${tableData.error}`);
    } else {
      console.log(`  ${table}: ${tableData.count} records`);
    }
  }
  console.log('');

  // 实际恢复数据
  console.log('Starting restore...\n');

  for (const tableName of Object.keys(backup.tables)) {
    const tableData = backup.tables[tableName];

    if (tableData.error) {
      console.log(`Skipping ${tableName}: ${tableData.error}`);
      continue;
    }

    try {
      console.log(`Restoring table: ${tableName}...`);

      // 删除现有数据
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 0); // 删除所有记录

      if (deleteError && deleteError.message !== 'PGRST116') {
        console.error(`  - Error clearing ${tableName}:`, deleteError.message);
        continue;
      }

      // 插入备份数据
      if (tableData.data && tableData.data.length > 0) {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(tableData.data);

        if (insertError) {
          console.error(`  - Error inserting into ${tableName}:`, insertError.message);
        } else {
          console.log(`  ✅ Restored ${tableData.data.length} records to ${tableName}`);
        }
      } else {
        console.log(`  ✅ Table ${tableName} is empty, skipped`);
      }
    } catch (err) {
      console.error(`  - Unexpected error restoring ${tableName}:`, err);
    }
  }

  console.log('\n✅ Restore completed!');
}

main().catch(console.error);
