'use client'

import { SessionProvider } from "next-auth/react"

interface SessionProviderWrapperProps {
  children: React.ReactNode
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // 5분마다 세션 새로고침
      refetchOnWindowFocus={true} // 창 포커스 시 세션 새로고침
    >
      {children}
    </SessionProvider>
  )
}