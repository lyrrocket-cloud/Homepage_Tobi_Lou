# 数据备份与恢复指南

## 环境说明

根据 Coze 平台的架构，生产环境和预览环境通常使用**相同的** Supabase 数据库实例（通过环境变量 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 配置）。这意味着：

- ✅ **生产环境和预览环境数据是共享的**
- ✅ **任何一方的数据修改都会实时同步到另一方**
- ✅ **不需要手动同步数据**

如果您的生产环境和预览环境使用**不同的**数据库实例，请按照以下步骤进行数据同步。

## 备份数据

### 1. 创建备份

```bash
npx tsx scripts/backup-database.ts
```

备份文件将保存在 `.backups/` 目录下，文件名格式为 `backup-2026-03-30T02-06-26-778Z.json`。

### 2. 查看现有备份

```bash
ls -la .backups/
```

### 3. 备份内容

备份包含以下表的数据：

| 表名 | 说明 |
|------|------|
| `regions` | 地区数据（中国省份 + 世界地区） |
| `visits` | 访问打卡记录 |
| `photos` | 照片数据 |
| `videos` | 视频数据 |
| `tools` | 工具数据 |

## 恢复数据

### 1. 从备份恢复

```bash
npx tsx scripts/restore-database.ts .backups/backup-2026-03-30T02-06-26-778Z.json
```

### 2. 恢复过程

恢复过程会：
1. ⚠️ **删除目标环境中的所有现有数据**
2. 插入备份文件中的数据
3. 显示每个表的恢复状态

### 3. 注意事项

- ⚠️ **恢复操作是不可逆的**，请确保备份文件正确
- ⚠️ **恢复会覆盖所有现有数据**，建议在操作前先创建备份
- ⚠️ **恢复过程会清空表数据**，请确保数据库连接正常

## 数据同步流程

如果您需要将生产环境的数据同步到预览环境（使用不同的数据库实例）：

### 方法 1: 使用备份恢复

```bash
# 1. 在生产环境创建备份
npx tsx scripts/backup-database.ts

# 2. 将备份文件复制到预览环境
scp .backups/backup-*.json user@preview-server:/path/to/project/.backups/

# 3. 在预览环境恢复数据
npx tsx scripts/restore-database.ts .backups/backup-2026-03-30T02-06-26-778Z.json
```

### 方法 2: 使用环境变量

如果您需要在预览环境中使用生产环境的数据库，可以配置相同的环境变量：

```bash
# 在预览环境中设置生产环境的 Supabase 凭证
export COZE_SUPABASE_URL="https://br-droll-loon-a9aa2d19.supabase2.aidap-global.cn-beijing.volces.com"
export COZE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTI2Mjg3MTEsInJvbGUiOiJhbm9uIn0.giKwYBLK65xVAttyvL4cmAneYdTpc1UN5zjGp14HP8o"
```

## 当前环境信息

- **Supabase URL**: `https://br-droll-loon-a9aa2d19.supabase2.aidap-global.cn-beijing.volces.com`
- **数据库实例**: 已配置并运行
- **最新备份**: `.backups/backup-2026-03-30T02-06-26-778Z.json`
- **备份数据统计**:
  - regions: 476 条记录
  - visits: 1 条记录
  - photos: 9 条记录
  - videos: 9 条记录
  - tools: 4 条记录

## 故障排查

### 问题：无法连接到数据库

**解决方案**：
1. 检查环境变量是否正确配置
2. 确认 Supabase 实例是否运行正常
3. 检查网络连接

### 问题：备份失败

**解决方案**：
1. 检查数据库表是否存在
2. 确认数据库权限是否足够
3. 查看错误日志

### 问题：恢复失败

**解决方案**：
1. 检查备份文件是否损坏
2. 确认目标数据库表结构是否匹配
3. 查看错误日志中的详细信息

## 最佳实践

1. **定期备份**：建议每天自动创建备份
2. **备份验证**：定期验证备份文件的完整性
3. **备份存储**：将备份文件存储在安全的位置
4. **恢复测试**：定期测试恢复流程

## 联系支持

如果遇到任何问题，请联系技术支持团队。
