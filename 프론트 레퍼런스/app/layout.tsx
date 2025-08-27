import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "마음배달 - 매일 하나의 질문으로 가족의 마음을 배달합니다",
  description: "카카오톡 기반으로 앱 설치 없이 가족과 매일 소통하세요",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <main className="mobile-nav-spacing">{children}</main>
        <MobileNav />
      </body>
    </html>
  )
}
