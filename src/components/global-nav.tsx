'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface Tool {
  id: number;
  name: string;
  description: string;
  icon: string;
  url: string;
  order: number;
  isEmpty?: boolean;
}

/**
 * 全局毛玻璃导航栏
 * 在 layout 中全局渲染，路由切换时不会重新渲染。
 * 根据当前路径自动高亮对应导航项。
 * 工具箱支持下拉菜单，悬停显示工具列表。
 */
export function GlobalNav() {
  const pathname = usePathname();
  const [tools, setTools] = useState<Tool[]>([]);
  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // 获取工具列表
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const result = await response.json();
        if (result.tools && result.tools.length > 0) {
          setTools(result.tools);
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      }
    };
    fetchTools();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { href: '/', label: '首页', external: false },
    { href: '/photos', label: '照片集', external: false },
    { href: 'https://lyrrocket.quickconnect.cn/mo/sharing/7xLwl056X', label: '视频集', external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-8">
          {links.map((link) => {
            const isActive =
              !link.external &&
              (link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href));

            const className = isActive
              ? 'text-[#CEA472] text-sm font-medium transition-colors'
              : 'text-[#FFFFFF]/80 hover:text-[#CEA472] transition-colors text-sm font-medium';

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <a key={link.href} href={link.href} className={className}>
                {link.label}
              </a>
            );
          })}

          {/* 工具箱下拉菜单 */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setShowTools(!showTools)}
              onMouseEnter={() => setShowTools(true)}
              className="text-[#FFFFFF]/80 hover:text-[#CEA472] transition-colors text-sm font-medium"
            >
              工具箱
            </button>

            {/* 下拉菜单 */}
            {showTools && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] bg-[#0a0a0f]/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
                onMouseLeave={() => setShowTools(false)}
              >
                {tools.length > 0 ? (
                  tools.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url || '#'}
                      target={tool.url ? '_blank' : undefined}
                      rel={tool.url ? 'noopener noreferrer' : undefined}
                      onClick={!tool.url ? (e) => e.preventDefault() : undefined}
                      className={`block px-4 py-3 transition-colors ${
                        tool.isEmpty || !tool.url
                          ? 'opacity-50 cursor-default'
                          : 'hover:bg-[#CEA472]/10'
                      }`}
                    >
                      <div className="text-[#FFFFFF] text-sm font-medium">
                        {tool.name}
                      </div>
                      <div className="text-[#FFFFFF]/50 text-xs mt-0.5">
                        {tool.description}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#FFFFFF]/50 text-sm">
                    加载中...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
