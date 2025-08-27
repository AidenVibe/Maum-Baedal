"use client"

import Link from "next/link"
import { useNavigation } from "@/hooks/useNavigation"
import { cn } from "@/lib/utils"

export function MobileBottomNavigation() {
  const { getVisibleNavItems, isActive, showNavigation } = useNavigation()

  // 네비게이션이 표시되지 않는 페이지에서는 렌더링하지 않음
  if (!showNavigation) {
    return null
  }

  const navItems = getVisibleNavItems()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      {/* 모바일 안전 영역 대응 */}
      <div 
        className="flex items-center justify-around px-2 py-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isCurrentActive = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-colors",
                // 활성 상태: primary 색상 + 배경 하이라이트
                isCurrentActive && "text-primary bg-primary/10",
                // 비활성 상태: 회색 + 호버 효과
                !isCurrentActive && "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              // 접근성: 현재 페이지 표시
              aria-current={isCurrentActive ? "page" : undefined}
              // 접근성: 스크린 리더용 라벨
              aria-label={`${item.label} 페이지${isCurrentActive ? ' (현재 페이지)' : ''}`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* 배지 표시 (향후 알림 기능용) */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}