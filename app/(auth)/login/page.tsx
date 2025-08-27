import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            마음배달 v2
          </CardTitle>
          <CardDescription className="text-gray-600">
            매일 한 질문으로 가족과 따뜻하게 연결됩니다
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              카카오로 간편 시작
            </h3>
            <p className="text-sm text-gray-600">
              1클릭으로 가족과의 따뜻한 대화를 시작해보세요
            </p>
          </div>

          <Button 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 h-12"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            카카오로 시작하기
          </Button>

          <div className="text-xs text-center text-gray-500 leading-relaxed">
            로그인 시{" "}
            <a href="/terms" className="underline hover:text-gray-700">
              서비스 이용약관
            </a>{" "}
            및{" "}
            <a href="/privacy" className="underline hover:text-gray-700">
              개인정보 처리방침
            </a>에 동의하는 것으로 간주됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}