import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-4xl">💝</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">안전한 대화를 위해 로그인이 필요해요</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-center">왜 로그인이 필요한가요?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">🔒</span>
              <p className="text-sm text-gray-700">가족과의 소중한 대화를 안전하게 보호합니다</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">💾</span>
              <p className="text-sm text-gray-700">대화 기록과 추억을 안전하게 저장합니다</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">👨‍👩‍👧‍👦</span>
              <p className="text-sm text-gray-700">가족 구성원과 연결할 수 있습니다</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button asChild className="w-full h-14 text-lg hover:bg-orange-700 bg-[rgba(246,222,0,1)]">
            <Link href="/onboarding">카카오 로그인</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-14 text-lg border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
          >
            <Link href="/onboarding">[임시진입]</Link>
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            로그인 시{" "}
            <Link href="/privacy" className="underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
