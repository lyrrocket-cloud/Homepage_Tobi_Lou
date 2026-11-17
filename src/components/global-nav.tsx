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
 * 工具箱支持下拉菜单，实现苹果风格的丝滑展开/收起动画。
 */
export function GlobalNav() {
  const pathname = usePathname();
  const [tools, setTools] = useState<Tool[]>([]);
  const [showTools, setShowTools] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 获取工具列表（优先保留旅行工具箱/视频工作流，过滤后为空则显示全部）
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          // 优先过滤指定工具，没有则显示全部
          const filtered = result.data.filter(
            (tool: Tool) => tool.name === '旅行工具箱' || tool.name === '视频工作流'
          );
          setTools(filtered.length > 0 ? filtered : result.data);
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

  // 鼠标进入时清除定时器
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTools(true);
    setIsAnimating(true);
  };

  // 鼠标离开时延迟关闭，给用户移动到菜单上的时间
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTools(false);
      setIsAnimating(false);
    }, 150);
  };

  // 菜单项鼠标进入
  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 菜单项鼠标离开
  const handleMenuMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTools(false);
      setIsAnimating(false);
    }, 150);
  };

  const links = [
    { href: '/', label: '首页', external: false },
    { href: '/photos', label: '照片集', external: false },
    { href: 'https://lyrrocket.quickconnect.cn/mo/sharing/7xLwl056X', label: '视频集', external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧占位 */}
          <div className="w-10"></div>

          {/* 中间导航链接 */}
          <div className="flex items-center gap-8">
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

          {/* 工具箱下拉菜单 - 苹果风格动画 */}
          <div
            className="relative"
            ref={toolsRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="text-[#FFFFFF]/80 hover:text-[#CEA472] transition-colors text-sm font-medium flex items-center gap-1"
            >
              工具箱
              {/* 下拉箭头 */}
              <svg
                className={`w-3 h-3 transition-transform duration-300 ${
                  showTools ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 下拉菜单容器 - 使用 CSS Grid 实现高度动画 */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[220px] overflow-hidden transition-all duration-300 ease-out ${
                showTools
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2'
              }`}
              style={{
                transitionProperty: 'opacity, visibility, transform',
              }}
            >
              {/* 背景模糊层 */}
              <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl rounded-lg shadow-xl" />

              {/* 内容层 */}
              <div className="relative">
                {tools.length > 0 ? (
                  tools.map((tool, index) => (
                    <a
                      key={tool.id}
                      href={tool.url || '#'}
                      target={tool.url ? '_blank' : undefined}
                      rel={tool.url ? 'noopener noreferrer' : undefined}
                      onClick={!tool.url ? (e) => e.preventDefault() : undefined}
                      className={`block px-4 py-3 transition-all duration-200 ${
                        tool.isEmpty || !tool.url
                          ? 'opacity-50 cursor-default'
                          : 'hover:bg-[#CEA472]/10 hover:pl-5'
                      } ${isAnimating ? 'animate-fadeIn' : ''}`}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'backwards',
                      }}
                      onMouseEnter={handleMenuMouseEnter}
                      onMouseLeave={handleMenuMouseLeave}
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
            </div>
          </div>
          </div>

          {/* 右侧同步按钮 */}
          <button
            onClick={() => window.open('/admin/sync', '_blank')}
            className="p-2 rounded-lg bg-black/40 backdrop-blur-md hover:bg-[#CEA472]/20 transition-all duration-300 group"
            title="同步数据"
          >
            <svg
              className="w-4 h-4 text-[#CEA472] transition-transform duration-500 group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
