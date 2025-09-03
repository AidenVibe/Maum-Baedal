'use client'

import { useState, useEffect } from 'react'
import { BarChart, Calendar, MessageSquare, Target, TrendingUp, Users, Loader } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CompanionStatsData {
  totalCompanions: number
  activeCompanions: number
  totalConversations: number
  completedConversations: number
  weeklyStats: {
    thisWeek: number
    lastWeek: number
  }
  topCompanions: Array<{
    id: string
    nickname: string
    label?: string
    completedConversations: number
    totalConversations: number
    completionRate: number
  }>
  monthlyTrend: Array<{
    month: string
    conversations: number
    completions: number
  }>
}

interface CompanionStatsProps {
  className?: string
}

export function CompanionStats({ className }: CompanionStatsProps) {
  const [stats, setStats] = useState<CompanionStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 통계 데이터 로드
  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/companions/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error('통계 데이터 로드 실패')
      }
    } catch (error) {
      console.error('통계 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getCompletionRate = () => {
    if (!stats || stats.totalConversations === 0) return 0
    return Math.round((stats.completedConversations / stats.totalConversations) * 100)
  }

  const getWeeklyTrend = () => {
    if (!stats || stats.weeklyStats.lastWeek === 0) return 0
    const change = stats.weeklyStats.thisWeek - stats.weeklyStats.lastWeek
    return Math.round((change / stats.weeklyStats.lastWeek) * 100)
  }

  if (isLoading) {
    return (
      <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-white border-blue-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
            <BarChart className="w-5 h-5 text-blue-600" />
            <span>동반자 통계</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader className="w-8 h-8 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600">통계 데이터를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-white border-blue-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
            <BarChart className="w-5 h-5 text-blue-600" />
            <span>동반자 통계</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500 py-4">
            통계 데이터를 불러올 수 없습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-white border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
          <BarChart className="w-5 h-5 text-blue-600" />
          <span>동반자 통계</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 전체 요약 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">연결된 동반자</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeCompanions}
            </div>
            <div className="text-xs text-gray-500">
              총 {stats.totalCompanions}명 중
            </div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">완료율</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {getCompletionRate()}%
            </div>
            <div className="text-xs text-gray-500">
              {stats.completedConversations}/{stats.totalConversations} 대화
            </div>
          </div>
        </div>

        {/* 주간 트렌드 */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
              주간 활동
            </h4>
            <div className="flex items-center space-x-1">
              {getWeeklyTrend() > 0 ? (
                <Badge className="bg-green-100 text-green-700">
                  +{getWeeklyTrend()}%
                </Badge>
              ) : getWeeklyTrend() < 0 ? (
                <Badge className="bg-red-100 text-red-700">
                  {getWeeklyTrend()}%
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700">
                  변동없음
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">이번 주</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.weeklyStats.thisWeek}건
              </div>
            </div>
            <div>
              <div className="text-gray-600">지난 주</div>
              <div className="text-lg font-semibold text-gray-500">
                {stats.weeklyStats.lastWeek}건
              </div>
            </div>
          </div>
        </div>

        {/* 가장 활발한 동반자 TOP 3 */}
        {stats.topCompanions.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-orange-600" />
              가장 활발한 동반자
            </h4>
            
            <div className="space-y-3">
              {stats.topCompanions.slice(0, 3).map((companion, index) => (
                <div key={companion.id} className="flex items-center space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                    ${index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 'bg-orange-400'}
                  `}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">
                        {companion.nickname}
                      </span>
                      {companion.label && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {companion.label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {companion.completedConversations}개 완료 · {companion.completionRate}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {companion.completionRate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 월별 트렌드 (최근 3개월) */}
        {stats.monthlyTrend.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
              최근 활동 추이
            </h4>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              {stats.monthlyTrend.slice(-3).map((month, index) => (
                <div key={month.month} className="text-center">
                  <div className="text-gray-600 mb-1">{month.month}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {month.completions}
                  </div>
                  <div className="text-xs text-gray-500">
                    {month.conversations}건 중
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-blue-800 text-center">
            💡 <strong>팁:</strong> 동반자와의 대화 완료율을 높이려면 적절한 시간에 리마인드 알림을 설정해보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}