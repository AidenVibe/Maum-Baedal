import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation'
import SessionProviderWrapper from '@/components/auth/SessionProviderWrapper'
import { KakaoProvider } from '@/components/providers/KakaoProvider'
import { ErrorSuppressor } from '@/components/providers/ErrorSuppressor'
import { ToastProvider, ToastContainer } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '마음배달 - 매일 한 질문으로 마음을 나눠요',
  description: '공평한 공개 방식으로 가족과 진솔한 대화를 나누는 일상 질문 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ErrorSuppressor />
        <SessionProviderWrapper>
          <KakaoProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1 pb-16">{children}</main>
                <MobileBottomNavigation />
              </div>
              <ToastContainer />
            </ToastProvider>
          </KakaoProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

