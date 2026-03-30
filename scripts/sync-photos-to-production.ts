import { S3Storage } from 'coze-coding-dev-sdk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
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

async function main() {
  loadEnv();

  // 生产环境域名
  const PRODUCTION_URL = 'https://727sr6g8sv.coze.site';
  const PASSWORD = 'tobi7758258';

  // 初始化预览环境的对象存储
  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: '',
    secretKey: '',
    bucketName: process.env.COZE_BUCKET_NAME,
    region: 'cn-beijing',
  });

  console.log('=== 照片同步脚本 ===\n');
  console.log('从预览环境读取照片并上传到生产环境\n');

  // 读取备份文件
  const backupFile = join(process.cwd(), 'scripts/photos-backup.json');
  const backup = JSON.parse(readFileSync(backupFile, 'utf-8'));
  const photosWithUrls = backup.photosWithUrls || [];

  console.log(`找到 ${photosWithUrls.length} 张照片需要同步\n`);

  const results: Array<{ id: number; title: string; status: string }> = [];

  for (const photo of photosWithUrls) {
    console.log(`处理照片 ${photo.id}: ${photo.title}`);
    console.log(`  源文件: ${photo.image}`);

    try {
      // 从预览环境存储读取照片
      console.log('  正在从预览环境读取...');
      const fileBuffer = await storage.readFile({ fileKey: photo.image });
      console.log(`  文件大小: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

      // 上传到生产环境
      console.log('  正在上传到生产环境...');
      
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'image/jpeg' });
      formData.append('file', blob, photo.image);
      formData.append('password', PASSWORD);

      const response = await fetch(`${PRODUCTION_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ 上传成功: ${result.data.key}`);
        results.push({ id: photo.id, title: photo.title, status: 'success' });
      } else {
        console.log(`  ❌ 上传失败: ${result.error}`);
        results.push({ id: photo.id, title: photo.title, status: `error: ${result.error}` });
      }
    } catch (err) {
      console.error(`  ❌ 错误:`, err);
      results.push({ id: photo.id, title: photo.title, status: `error: ${err}` });
    }

    console.log('');
  }

  // 汇总
  console.log('\n=== 同步结果 ===');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status !== 'success').length;
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${errorCount}`);

  for (const r of results) {
    if (r.status !== 'success') {
      console.log(`  ❌ ${r.title}: ${r.status}`);
    }
  }

  // 如果全部成功，更新生产环境的数据库记录
  if (errorCount === 0) {
    console.log('\n正在更新数据库记录...');
    
    // 获取新上传的文件列表
    const listResponse = await fetch(`${PRODUCTION_URL}/api/storage/list?prefix=photos/&password=${PASSWORD}`);
    const listResult = await listResponse.json();
    
    console.log(`生产环境现有照片文件: ${listResult.data.count}`);
    for (const key of listResult.data.files) {
      console.log(`  - ${key}`);
    }
  }
}

main().catch(console.error);
