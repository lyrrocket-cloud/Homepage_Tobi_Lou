import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

let envLoaded = false;
let envLoadPromise: Promise<void> | null = null;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

// Supabase 客户端单例缓存
let supabaseClient: SupabaseClient | null = null;

// 带缓存的环境变量加载
function loadEnv(): void {
  if (envLoaded || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)) {
    return;
  }

  try {
    try {
      require('dotenv').config();
      if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
        envLoaded = true;
        return;
      }
    } catch {
      // dotenv not available
    }

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
      timeout: 5000, // 缩短超时从 10s 到 5s
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

    envLoaded = true;
  } catch (error) {
    console.error('[Supabase Client] Failed to load env:', error);
    // 标记为已加载，避免重复尝试
    envLoaded = true;
  }
}

// 异步环境变量加载（用于初始化）
async function loadEnvAsync(): Promise<void> {
  if (envLoadPromise) {
    return envLoadPromise;
  }

  envLoadPromise = (async () => {
    loadEnv();
  })();

  return envLoadPromise;
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('COZE_SUPABASE_URL is not set');
  }
  if (!anonKey) {
    throw new Error('COZE_SUPABASE_ANON_KEY is not set');
  }

  return { url, anonKey };
}

function getSupabaseClient(token?: string): SupabaseClient {
  // 使用单例模式，避免重复创建客户端
  if (supabaseClient && !token) {
    return supabaseClient;
  }

  const { url, anonKey } = getSupabaseCredentials();

  const clientConfig: any = {
    db: {
      timeout: 8000, // 缩短超时时间从 10s 到 8s
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url: string | Request, options?: RequestInit) => {
        // 添加请求超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      },
    },
  };

  if (token) {
    clientConfig.global.headers = { Authorization: `Bearer ${token}` };
  }

  const client = createClient(url, anonKey, clientConfig);

  // 缓存无 token 的客户端实例
  if (!token) {
    supabaseClient = client;
  }

  return client;
}

// 初始化函数 - 在应用启动时调用
export async function initSupabase(): Promise<void> {
  await loadEnvAsync();
  // 预创建客户端以触发连接初始化
  getSupabaseClient();
}

export { loadEnv, getSupabaseCredentials, getSupabaseClient };
