import { execSync } from 'child_process';

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

  const PRODUCTION_URL = 'https://727sr6g8sv.coze.site';
  const PASSWORD = 'tobi7758258';

  console.log('=== 更新生产环境照片记录 ===\n');

  // 1. 获取生产环境存储中的新照片文件
  console.log('1. 获取生产环境存储中的照片文件...');
  const listResponse = await fetch(`${PRODUCTION_URL}/api/storage/list?prefix=photos/&password=${PASSWORD}`);
  const listResult = await listResponse.json();
  
  if (!listResult.success) {
    console.error('获取文件列表失败:', listResult.error);
    return;
  }

  // 只获取新上传的文件（以 photo-17748460 开头）
  const newFiles = listResult.data.files.filter((f: string) => 
    f.includes('photo-17748460')
  );
  console.log(`找到 ${newFiles.length} 个新上传的文件`);

  // 2. 获取当前数据库中的照片记录
  console.log('\n2. 获取当前照片记录...');
  const photosResponse = await fetch(`${PRODUCTION_URL}/api/photos`);
  const photosResult = await photosResponse.json();
  
  if (!photosResult.success) {
    console.error('获取照片记录失败:', photosResult.error);
    return;
  }

  const photos = photosResult.data;
  console.log(`找到 ${photos.length} 条照片记录`);

  // 3. 按顺序匹配（上传顺序与数据库 ID 顺序一致）
  // 上传顺序: 9, 1, 3, 2, 4, 5, 7, 8, 6
  const uploadOrder = [9, 1, 3, 2, 4, 5, 7, 8, 6];
  
  const updatedPhotos = photos.map((p: any) => {
    const index = uploadOrder.indexOf(p.id);
    if (index !== -1 && newFiles[index]) {
      return {
        ...p,
        image: newFiles[index],
      };
    }
    return p;
  });

  console.log('\n3. 更新照片记录...');
  for (const photo of updatedPhotos) {
    console.log(`  ${photo.id}: ${photo.title} -> ${photo.image}`);
  }

  // 4. 发送更新请求
  console.log('\n4. 发送更新请求到生产环境...');
  const updateResponse = await fetch(`${PRODUCTION_URL}/api/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      photos: updatedPhotos,
      password: PASSWORD,
    }),
  });

  const updateResult = await updateResponse.json();
  
  if (updateResult.success) {
    console.log('\n✅ 照片记录更新成功！');
  } else {
    console.error('\n❌ 更新失败:', updateResult.error);
  }

  // 5. 验证
  console.log('\n5. 验证更新结果...');
  const verifyResponse = await fetch(`${PRODUCTION_URL}/api/photos`);
  const verifyResult = await verifyResponse.json();
  
  console.log('\n生产环境照片（更新后）:');
  for (const p of verifyResult.data) {
    console.log(`  ${p.id}: ${p.title} - ${p.image}`);
  }
}

main().catch(console.error);
