import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" size="sm" className="text-gray-600">
            <Link href="/settings">← 뒤로</Link>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">개인정보처리방침</h1>
          <div className="w-8" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-orange-600">마음배달 개인정보처리방침</CardTitle>
            <p className="text-sm text-gray-600">최종 수정일: 2025년 8월 25일</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">1. 수집하는 개인정보</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                마음배달은 서비스 제공을 위해 최소한의 개인정보만을 수집합니다:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                <li>• 카카오 계정 정보 (ID, 닉네임)</li>
                <li>• 서비스 이용 기록</li>
                <li>• 대화 내용 (암호화 저장)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">2. 개인정보 이용 목적</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• 서비스 제공 및 운영</li>
                <li>• 사용자 인증 및 보안</li>
                <li>• 고객 지원 및 문의 응답</li>
                <li>• 서비스 개선 및 통계 분석</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">3. 개인정보 보관 및 삭제</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                개인정보는 수집 목적 달성 시까지 보관하며, 회원 탈퇴 시 30일 내 완전 삭제됩니다. 대화 내용은 AES-256
                암호화로 안전하게 보호됩니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">4. 개인정보 제3자 제공</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                마음배달은 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요구가 있는 경우는
                예외입니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">5. 사용자 권리</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                사용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있으며, 처리 정지를 요구할 권리가 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">6. 문의처</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                개인정보 관련 문의사항이 있으시면 아래로 연락해주세요:
              </p>
              <p className="text-sm text-gray-700 mt-2">
                이메일: privacy@maeum-baedal.com
                <br />
                전화: 1588-0000
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
