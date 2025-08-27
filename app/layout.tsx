import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileBottomNavigation } from "@/components/navigation/MobileBottomNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "마음배달 v2 - 매일 한 질문으로 가족과 따뜻하게 연결됩니다",
  description: "한국 가족을 위한 일일 대화 플랫폼. 게이트 공개 시스템을 통해 진정성 있는 가족 간 대화를 촉진합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          {/* 메인 콘텐츠 영역 - 하단 네비게이션 공간 확보 */}
          <main className="flex-1 pb-16">
            {children}
          </main>
          {/* 전역 하단 네비게이션 */}
          <MobileBottomNavigation />
        </div>
      </body>
    </html>
  );
}
