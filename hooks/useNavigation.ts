"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"
import { mainNavigation, shouldShowNavigation } from "@/lib/navigation"
import type { NavItem } from "@/lib/navigation"

export function useNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const getVisibleNavItems = useCallback((): NavItem[] => {
    return mainNavigation.filter(item => {
      // TODO: 향후 인증 상태 체크 로직 추가
      // if (item.requiresAuth && !session) return false
      // if (item.adminOnly && !isAdmin(session)) return false
      return true
    })
  }, [])

  const isActive = useCallback((href: string): boolean => {
    if (href === '/today') {
      // 루트 경로 (/) 또는 /today 둘 다 today 탭 활성화
      return pathname === '/' || pathname === '/today'
    }
    
    // 정확한 경로 매칭 또는 하위 경로 매칭
    return pathname === href || pathname.startsWith(href + '/')
  }, [pathname])

  const navigate = useCallback((href: string) => {
    router.push(href)
  }, [router])

  const showNavigation = shouldShowNavigation(pathname)

  return {
    currentPath: pathname,
    getVisibleNavItems,
    isActive,
    navigate,
    showNavigation
  }
}