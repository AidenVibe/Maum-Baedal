import { Home, MessageCircle, Clock, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  id: string
  href: string
  icon: LucideIcon
  label: string
  badge?: number | boolean
  requiresAuth?: boolean
  adminOnly?: boolean
}

export const mainNavigation: NavItem[] = [
  {
    id: 'today',
    href: '/today',
    icon: Home,
    label: '오늘',
    requiresAuth: true
  },
  {
    id: 'history',
    href: '/history',
    icon: Clock,
    label: '기록',
    requiresAuth: true
  },
  {
    id: 'settings',
    href: '/settings',
    icon: User,
    label: '설정',
    requiresAuth: true
  }
]

// 네비게이션이 표시되지 않는 페이지들
export const hiddenNavRoutes = [
  '/',
  '/login',
  '/onboarding',
  '/admin',
  '/test/login-hybrid'  // 테스트 페이지도 네비게이션 숨김
]

export function shouldShowNavigation(pathname: string): boolean {
  // 정확히 일치하는 숨겨진 경로들
  if (hiddenNavRoutes.includes(pathname)) {
    return false
  }
  
  // /admin으로 시작하는 모든 경로는 숨김
  if (pathname.startsWith('/admin/')) {
    return false
  }
  
  return true
}