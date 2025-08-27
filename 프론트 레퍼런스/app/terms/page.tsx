import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" size="sm" className="text-gray-600">
            <Link href="/settings">← 뒤로</Link>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">서비스 이용약관</h1>
          <div className="w-8" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-orange-600">마음배달 서비스 이용약관</CardTitle>
            <p className="text-sm text-gray-600">최종 수정일: 2025년 8월 25일</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제1조 (목적)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                본 약관은 마음배달 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을
                목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제2조 (서비스의 내용)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                마음배달은 가족 간 소통을 위한 일일 질문 서비스를 제공합니다:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                <li>• 매일 새로운 질문 제공</li>
                <li>• 가족 간 답변 공유</li>
                <li>• 대화 기록 보관</li>
                <li>• 주간 하이라이트 생성</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제3조 (이용자의 의무)</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• 타인의 권리나 명예를 손상시키는 행위 금지</li>
                <li>• 허위 정보 입력 금지</li>
                <li>• 서비스의 안정적 운영을 방해하는 행위 금지</li>
                <li>• 관련 법령 및 본 약관 준수</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제4조 (서비스 이용제한)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을 제한하거나
                계약을 해지할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제5조 (면책조항)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                회사는 천재지변, 전쟁, 기타 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다. 또한 이용자
                간의 분쟁에 대해서는 개입하지 않습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">제6조 (문의처)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                서비스 이용 관련 문의사항이 있으시면 아래로 연락해주세요:
              </p>
              <p className="text-sm text-gray-700 mt-2">
                이메일: support@maeum-baedal.com
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
