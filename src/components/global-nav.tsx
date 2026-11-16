'use client';

import { usePathname } from 'next/navigation';

/**
 * 全局毛玻璃导航栏
 * 在 layout 中全局渲染，路由切换时不会重新渲染。
 * 根据当前路径自动高亮对应导航项。
 */
export function GlobalNav() {
  const pathname = usePathname();

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
        </div>
      </div>
    </nav>
  );
}
