import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function TodayPage() {
  // TODO: 실제 데이터는 API에서 가져와야 함
  const mockData = {
    question: "어릴 때 가장 좋아했던 놀이나 게임은 무엇이었나요? 왜 그것을 좋아했는지도 함께 이야기해주세요.",
    myAnswer: "",
    partnerAnswer: null,
    gateStatus: "waiting", // waiting, waiting_partner, need_my_answer, opened
    timeLeft: "8시간 30분",
    swapCount: 0
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* 헤더 - 카운트다운 */}
        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-sm opacity-90">오늘 질문 마감까지</div>
            <div className="text-2xl font-bold">{mockData.timeLeft}</div>
            <div className="text-xs opacity-75">내일 오전 5시에 새로운 질문이 도착해요</div>
          </CardContent>
        </Card>

        {/* 오늘의 질문 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">오늘의 질문</CardTitle>
              {mockData.swapCount === 0 && (
                <Button variant="outline" size="sm" className="text-xs">
                  질문 바꾸기
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {mockData.question}
            </p>
          </CardContent>
        </Card>

        {/* 내 답변 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              내 답변
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="이곳에 답변을 작성해주세요... 
              
한 줄이어도 좋고, 길어도 좋아요. 
진솔한 마음을 나눠보세요 💝"
              rows={4}
              className="resize-none"
              value={mockData.myAnswer}
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              답변 제출하기
            </Button>
          </CardContent>
        </Card>

        {/* 게이트 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              상대방 답변
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m11-4V9a7 7 0 00-14 0v6m14 0H5" />
                </svg>
              </div>
              <p className="font-medium text-gray-600">상대방 답변 기다리는 중...</p>
              <p className="text-sm text-gray-500 mt-1">
                서로 답변하면 바로 공개됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 하단 네비게이션 힌트 */}
        <div className="text-center text-sm text-gray-500 py-4">
          오늘의 대화가 완료되면 기록에서 다시 볼 수 있어요
        </div>
      </div>
    </div>
  )
}