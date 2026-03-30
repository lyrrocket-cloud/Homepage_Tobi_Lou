import { createClient } from '@supabase/supabase-js';
import { S3Storage } from 'coze-coding-dev-sdk';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
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

  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 初始化对象存储
  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: '',
    secretKey: '',
    bucketName: process.env.COZE_BUCKET_NAME,
    region: 'cn-beijing',
  });

  // 创建备份目录
  const backupDir = join(process.cwd(), '.backups');
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = join(backupDir, `backup-with-photos-${timestamp}.json`);

  console.log('Starting database backup with photo URLs...');
  console.log(`Backup file: ${backupFile}`);

  const backup: any = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl,
    tables: {},
    photosWithUrls: [],
  };

  // 备份表数据
  const tables = ['regions', 'gallery_photos', 'photos', 'videos', 'tools'];

  for (const table of tables) {
    try {
      console.log(`Exporting table: ${table}...`);

      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.error(`Error exporting ${table}:`, error.message);
        backup.tables[table] = { error: error.message, data: [] };
      } else {
        console.log(`  - Found ${data?.length || 0} records in ${table}`);
        backup.tables[table] = { count: data?.length || 0, data: data || [] };
      }
    } catch (err) {
      console.error(`Unexpected error exporting ${table}:`, err);
      backup.tables[table] = { error: String(err), data: [] };
    }
  }

  // 为照片生成签名 URL（用于跨环境同步）
  console.log('\nGenerating signed URLs for photos...');
  const photos = backup.tables.photos?.data || [];
  
  for (const photo of photos) {
    try {
      const signedUrl = await storage.generatePresignedUrl({
        key: photo.image,
        expireTime: 86400, // 1天有效期
      });
      
      backup.photosWithUrls.push({
        id: photo.id,
        title: photo.title,
        image: photo.image,
        sourceUrl: signedUrl,
      });
      
      console.log(`  - ${photo.title}: ${signedUrl.substring(0, 80)}...`);
    } catch (err) {
      console.error(`  - Failed to generate URL for ${photo.title}:`, err);
      backup.photosWithUrls.push({
        id: photo.id,
        title: photo.title,
        image: photo.image,
        sourceUrl: null,
        error: String(err),
      });
    }
  }

  // 保存备份文件
  writeFileSync(backupFile, JSON.stringify(backup, null, 2), 'utf-8');

  console.log('\n✅ Backup completed successfully!');
  console.log(`Backup saved to: ${backupFile}`);
  console.log('\nSummary:');
  for (const table of tables) {
    const tableData = backup.tables[table];
    if (tableData.error) {
      console.log(`  ${table}: ❌ ${tableData.error}`);
    } else {
      console.log(`  ${table}: ✅ ${tableData.count} records`);
    }
  }
  console.log(`  photosWithUrls: ✅ ${backup.photosWithUrls.length} photos`);
}

main().catch(console.error);
