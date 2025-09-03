"use client"

import { useNavigation } from "@/hooks/useNavigation"
import { cn } from "@/lib/utils"

export function MobileBottomNavigation() {
  const { getVisibleNavItems, isActive, showNavigation, navigate } = useNavigation()

  // 네비게이션이 표시되지 않는 페이지에서는 렌더링하지 않음
  if (!showNavigation) {
    return null
  }

  const navItems = getVisibleNavItems()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-violet-200 shadow-lg">
      {/* 모바일 안전 영역 대응 */}
      <div 
        className="flex items-center justify-around px-3 py-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isCurrentActive = isActive(item.href)
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] py-3 px-2 rounded-xl transition-all duration-200",
                // 활성 상태: 바이올렛 색상 + 연한 배경
                isCurrentActive && "text-violet-600 bg-violet-100 shadow-sm",
                // 비활성 상태: 회색 + 터치 효과  
                !isCurrentActive && "text-slate-500 active:text-violet-500 active:bg-violet-50"
              )}
              // 접근성: 현재 페이지 표시
              aria-current={isCurrentActive ? "page" : undefined}
              // 접근성: 스크린 리더용 라벨
              aria-label={`${item.label} 페이지${isCurrentActive ? ' (현재 페이지)' : ''}`}
            >
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-transform duration-200",
                isCurrentActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                isCurrentActive && "font-semibold"
              )}>
                {item.label}
              </span>
              
              {/* 배지 표시 (향후 알림 기능용) */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-violet-500 border-2 border-white rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}