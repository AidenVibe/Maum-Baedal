"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, MessageCircle, Clock, User } from "lucide-react"

const navItems = [
  {
    href: "/home",
    icon: Home,
    label: "홈",
  },
  {
    href: "/conversation",
    icon: MessageCircle,
    label: "오늘",
  },
  {
    href: "/history",
    icon: Clock,
    label: "지난대화",
  },
  {
    href: "/weekly",
    icon: User,
    label: "하이라이트",
  },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show nav on login/onboarding pages
  if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-colors ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
