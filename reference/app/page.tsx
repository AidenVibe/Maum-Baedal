import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-4xl">💝</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">마음배달</h1>
          <p className="text-lg text-gray-700 mb-8">
            매일 하나의 질문으로
            <br />
            가족의 마음을 배달합니다
          </p>
        </div>

        {/* Sample Cards */}
        <div className="space-y-4 mb-12">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-600">오늘의 질문</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">"최근 웃음이 났던 순간은 언제였나요?"</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-600">가족과 연결</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                카카오톡으로 간편하게
                <br />앱 설치 없이 바로 시작
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-600">추억 쌓기</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                주간 하이라이트로
                <br />
                소중한 대화를 기록
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full h-14 text-lg hover:bg-orange-700 bg-[rgba(246,222,0,1)]">
            <Link href="/login">카카오로 시작하기</Link>
          </Button>

          {/* Temporary entry button for testing onboarding */}
          <Button
            asChild
            variant="outline"
            className="w-full h-14 text-lg border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
          >
            <Link href="/onboarding">[임시진입]</Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            <Link href="/privacy" className="underline">
              개인정보처리방침
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
