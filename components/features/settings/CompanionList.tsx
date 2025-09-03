'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Loader, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { CompanionCard, CompanionData } from './CompanionCard'
import { InviteModal } from './InviteModal'

interface CompanionListProps {
  className?: string
  isLoadingMode?: boolean
  isSoloMode?: boolean
}

export function CompanionList({ 
  className,
  isLoadingMode = false,
  isSoloMode = false 
}: CompanionListProps) {
  const [companions, setCompanions] = useState<CompanionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [maxCompanions] = useState(4) // 4명까지 지원 (6명 → 4명 제한 반영)

  // 동반자 목록 로드
  const fetchCompanions = async (showRefreshLoader = false) => {
    // 혼자모드인 경우 API 호출하지 않음
    if (isSoloMode) {
      setIsLoading(false)
      setIsRefreshing(false)
      setCompanions([])
      return
    }

    try {
      if (showRefreshLoader) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch('/api/settings/companions')
      if (response.ok) {
        const data = await response.json()
        setCompanions(data.companions || [])
      } else {
        console.error('동반자 목록 로드 실패')
      }
    } catch (error) {
      console.error('동반자 목록 로드 오류:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 별명 수정
  const handleUpdateLabel = async (companionId: string, newLabel: string) => {
    try {
      const response = await fetch('/api/settings/companions/label', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId, label: newLabel })
      })

      if (response.ok) {
        const data = await response.json()
        setCompanions(prev => 
          prev.map(companion => 
            companion.id === companionId 
              ? { ...companion, label: data.label }
              : companion
          )
        )
      } else {
        throw new Error('별명 수정 실패')
      }
    } catch (error) {
      console.error('별명 수정 오류:', error)
      throw error // 컴포넌트에서 에러 처리
    }
  }

  // 알림 설정 토글
  const handleToggleNotifications = async (companionId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/settings/companions/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId, enabled })
      })

      if (response.ok) {
        setCompanions(prev => 
          prev.map(companion => 
            companion.id === companionId 
              ? { ...companion, notificationsEnabled: enabled }
              : companion
          )
        )
      } else {
        throw new Error('알림 설정 변경 실패')
      }
    } catch (error) {
      console.error('알림 설정 변경 오류:', error)
      alert('알림 설정 변경에 실패했습니다.')
    }
  }

  // 동반자 제거/해제
  const handleRemoveCompanion = async (companionId: string) => {
    const confirmMessage = '이 동반자와의 연결을 해제하시겠습니까? 기존 대화는 유지되지만 새로운 질문이 생성되지 않습니다.'

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch('/api/settings/companions/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId })
      })

      if (response.ok) {
        setCompanions(prev => prev.filter(c => c.id !== companionId))
        alert('동반자 연결이 해제되었습니다.')
      } else {
        throw new Error('제거 처리 실패')
      }
    } catch (error) {
      console.error('제거 처리 오류:', error)
      alert('처리에 실패했습니다.')
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 모드 로딩 중이 아닐 때만 실행
    if (!isLoadingMode) {
      fetchCompanions()
    }
  }, [isSoloMode, isLoadingMode])

  const activeCompanions = companions.filter(c => c.isActive)
  const canAddMore = companions.length < 3 // 본인 제외 최대 3명까지 초대 가능

  if (isLoadingMode || isLoading) {
    return (
      <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
            <Users className="w-5 h-5 text-violet-600" />
            <span>동반자 관리</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader className="w-8 h-8 mx-auto text-violet-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600">
              {isLoadingMode ? '현재 모드를 확인하는 중...' : '동반자 목록을 불러오는 중...'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 혼자모드 전용 UI
  if (isSoloMode) {
    return (
      <>
        <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200 ${className}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
                <Users className="w-5 h-5 text-violet-600" />
                <span>동반자 관리</span>
                <span className="text-sm font-normal text-gray-500">(혼자모드)</span>
              </CardTitle>
              
              <Button
                size="sm"
                onClick={() => setShowInviteModal(true)}
                className="bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-sm"
                style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 mr-1" />
                초대
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">아직 동반자가 없습니다</h4>
              <p className="text-sm text-gray-500 mb-4">
                현재 혼자모드로 마음배달을 이용하고 계세요.<br/>
                가족이나 친구를 초대해서 함께 대화를 나눠보세요.
              </p>
              <Button 
                onClick={() => setShowInviteModal(true)}
                className="bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 동반자 초대하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 초대 모달 */}
        <InviteModal 
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      </>
    )
  }

  // 함께모드 UI (기존 코드)
  return (
    <>
      <Card className={`rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
              <Users className="w-5 h-5 text-violet-600" />
              <span>동반자 관리</span>
              <span className="text-sm font-normal text-gray-500">(함께모드 · {companions.length}/3)</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchCompanions(true)}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {canAddMore && (
                <Button
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-sm"
                  style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  초대
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 최대 동반자 수 도달 안내 */}
          {!canAddMore && (
            <Alert>
              <Users className="w-4 h-4" />
              <div>
                <p className="font-medium">최대 동반자 수에 도달했습니다</p>
                <p className="text-sm text-gray-600 mt-1">
                  더 많은 동반자를 추가하려면 기존 연결을 해제해 주세요.
                </p>
              </div>
            </Alert>
          )}

          {/* 활성 동반자 목록 */}
          {activeCompanions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span>연결된 동반자</span>
                <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {activeCompanions.length}명
                </span>
              </h4>
              <div className="grid gap-3">
                {activeCompanions.map((companion) => (
                  <CompanionCard
                    key={companion.id}
                    companion={companion}
                    onUpdateLabel={handleUpdateLabel}
                    onToggleNotifications={handleToggleNotifications}
                    onRemoveCompanion={handleRemoveCompanion}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">연결된 동반자가 없습니다</h4>
              <p className="text-sm text-gray-500 mb-4">
                가족이나 친구를 초대해서 함께 마음배달을 시작해보세요
              </p>
              <Button 
                onClick={() => setShowInviteModal(true)}
                className="bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 동반자 초대하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 초대 모달 */}
      <InviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </>
  )
}