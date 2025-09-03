'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User, Users, Shield, LogOut, Share2, Trash2, Loader, CheckCircle, AlertCircle, Settings as SettingsIcon, Bell, BellOff, Smartphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { InviteModal } from '@/components/features/settings/InviteModal'
import { MultiCompanionSettings } from '@/components/features/settings/MultiCompanionSettings'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TestScenarioDropdown from '@/components/dev/TestScenarioDropdown'
import CurrentScenarioStatus from '@/components/dev/CurrentScenarioStatus'
import { isTestModeParam, getDevMockData } from '@/lib/dev-mock'

interface PairInfo {
  id: string
  status: string
  connectedAt: string | null
  partner: {
    id: string
    nickname: string
    label?: string
  } | null
  stats: {
    totalConversations: number
    completedConversations: number
  }
}

interface NotificationSettings {
  phoneNumber?: string
  enableDailyQuestion: boolean
  enableAnswerReminder: boolean
  enableGateOpened: boolean
  enableCompanionJoined: boolean
  dailyQuestionTime: string
  reminderTime: string
  isActive: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [nickname, setNickname] = useState('')
  const [originalNickname, setOriginalNickname] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [pairInfo, setPairInfo] = useState<PairInfo | null>(null)
  const [canInvite, setCanInvite] = useState(true)
  const [isLoadingPair, setIsLoadingPair] = useState(true)
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  
  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableDailyQuestion: true,
    enableAnswerReminder: true,
    enableGateOpened: true,
    enableCompanionJoined: true,
    dailyQuestionTime: '08:00',
    reminderTime: '19:00',
    isActive: true
  })
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  // 프로필 정보 로드
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/settings/profile')
      if (response.ok) {
        const data = await response.json()
        setNickname(data.user.nickname || '')
        setOriginalNickname(data.user.nickname || '')
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error)
    }
  }

  // 쌍 정보 로드
  const fetchPairInfo = async () => {
    try {
      setIsLoadingPair(true)
      
      // 테스트 모드인 경우 mock 데이터 사용
      if (isTestModeParam()) {
        await new Promise(resolve => setTimeout(resolve, 800)) // 로딩 시뮬레이션
        
        const mockData = getDevMockData()
        
        if (mockData.hasCompanion) {
          // 동반자가 있는 경우
          setPairInfo({
            id: 'companion_test_123',
            status: 'active',
            connectedAt: '2025-01-20T10:30:00Z',
            partner: {
              id: 'partner_test_123',
              nickname: '김마음',
              label: '가족'
            },
            stats: {
              totalConversations: mockData.conversationCount || 5,
              completedConversations: mockData.conversationCount || 3
            }
          })
          setCanInvite(false)
        } else {
          // 혼자모드인 경우
          setPairInfo(null)
          setCanInvite(true)
        }
        return
      }
      
      const response = await fetch('/api/settings/pair')
      if (response.ok) {
        const data = await response.json()
        setPairInfo(data.pair)
        setCanInvite(data.canInvite)
      }
    } catch (error) {
      console.error('쌍 정보 로드 오류:', error)
    } finally {
      setIsLoadingPair(false)
    }
  }

  // 알림 설정 로드
  const fetchNotificationSettings = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await fetch('/api/notifications/settings')
      if (response.ok) {
        const data = await response.json()
        setNotificationSettings(data.settings)
        setPhoneNumber(data.settings.phoneNumber || '')
      }
    } catch (error) {
      console.error('알림 설정 로드 오류:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // 알림 설정 업데이트
  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      setIsUpdatingNotifications(true)
      const response = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        setNotificationSettings(data.settings)
        return true
      } else {
        console.error('알림 설정 업데이트 실패')
        return false
      }
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error)
      return false
    } finally {
      setIsUpdatingNotifications(false)
    }
  }


  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 테스트 모드 감지
    setShowTestDropdown(isTestModeParam())
    
    if (session?.user || isTestModeParam()) {
      fetchProfile()
      fetchPairInfo()
      // 실제 세션이 있을 때만 알림 설정 로드
      if (session?.user) {
        fetchNotificationSettings()
      }
    }
  }, [session])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      setIsLoggingOut(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!nickname.trim()) {
      setUpdateStatus('error')
      return
    }

    // 변경사항이 없으면 건너뛰기
    if (nickname.trim() === originalNickname) {
      return
    }

    setIsUpdatingProfile(true)
    setUpdateStatus('idle')

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setOriginalNickname(data.user.nickname)
        setUpdateStatus('success')
        // 3초 후 상태 초기화
        setTimeout(() => setUpdateStatus('idle'), 3000)
      } else {
        const error = await response.json()
        console.error('프로필 업데이트 실패:', error)
        setUpdateStatus('error')
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      setUpdateStatus('error')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('정말로 회원탈퇴를 하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) {
      alert('회원탈퇴 기능은 곧 추가될 예정입니다.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 테스트 시나리오 상태 표시 (우상단 고정) */}
      {showTestDropdown && <CurrentScenarioStatus />}
      
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* 테스트 시나리오 드롭다운 (상단) */}
          {showTestDropdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center">
                <TestScenarioDropdown currentPage="settings" />
              </div>
            </div>
          )}
          
          {/* 헤더 */}
          <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 rounded-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-700" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}>설정</h1>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>프로필 및 앱 설정을 관리하세요</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 내 프로필 */}
          <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
                <User className="w-5 h-5 text-violet-600" />
                <span>내 프로필</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>닉네임</label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleProfileUpdate}
                  size="sm"
                  className="bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-sm transition-all duration-200"
                  style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
                  disabled={isUpdatingProfile || nickname.trim() === originalNickname || !nickname.trim()}
                >
                  {isUpdatingProfile && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  프로필 업데이트
                </Button>
                {updateStatus === 'success' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>저장됨</span>
                  </div>
                )}
                {updateStatus === 'error' && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>오류</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 동반자 관리 */}
          <MultiCompanionSettings 
            isLoadingMode={isLoadingPair}
            isSoloMode={!pairInfo}
          />

          {/* 알림 설정 */}
          <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
                <Bell className="w-5 h-5 text-violet-600" />
                <span>알림 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingNotifications ? (
                <div className="text-center py-4">
                  <Loader className="w-6 h-6 mx-auto text-violet-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">알림 설정을 불러오는 중...</p>
                </div>
              ) : (
                <>
                  {/* 휴대폰 번호 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
                      휴대폰 번호 수정 (알림톡 수신용)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="온보딩에서 입력한 번호"
                        maxLength={11}
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        onClick={() => updateNotificationSettings({ phoneNumber })}
                        disabled={isUpdatingNotifications || !phoneNumber.trim()}
                      >
                        수정
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      온보딩에서 입력한 번호를 수정할 수 있습니다
                    </p>
                  </div>

                  {/* 전체 알림 활성화/비활성화 */}
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center space-x-3">
                      {notificationSettings.isActive ? (
                        <Bell className="w-5 h-5 text-green-500" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">전체 알림</h4>
                        <p className="text-sm text-gray-500">모든 알림을 한 번에 관리</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.isActive}
                      onCheckedChange={(checked) => updateNotificationSettings({ isActive: checked })}
                      disabled={isUpdatingNotifications}
                    />
                  </div>

                  {/* 개별 알림 설정들 */}
                  {notificationSettings.isActive && (
                    <div className="space-y-3 pl-2">
                      {/* 일일 질문 알림 */}
                      <div className="py-2">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">일일 질문 알림</h4>
                            <p className="text-sm text-gray-500">매일 새로운 질문 발송</p>
                          </div>
                          <Switch
                            checked={notificationSettings.enableDailyQuestion}
                            onCheckedChange={(checked) => updateNotificationSettings({ enableDailyQuestion: checked })}
                            disabled={isUpdatingNotifications}
                          />
                        </div>
                        {notificationSettings.enableDailyQuestion && (
                          <div className="ml-4 mt-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 min-w-[60px]">발송 시간:</span>
                              <Select 
                                value={notificationSettings.dailyQuestionTime} 
                                onValueChange={(value) => updateNotificationSettings({ dailyQuestionTime: value })}
                                disabled={isUpdatingNotifications}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="08:00">오전 8시</SelectItem>
                                  <SelectItem value="10:00">오전 10시</SelectItem>
                                  <SelectItem value="12:00">점심 12시</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-[75px]">
                              가족의 생활 패턴에 맞는 시간을 선택하세요
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 답변 리마인드 */}
                      <div className="py-2">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">답변 리마인드</h4>
                            <p className="text-sm text-gray-500">답변하지 않은 경우 독려 메시지</p>
                          </div>
                          <Switch
                            checked={notificationSettings.enableAnswerReminder}
                            onCheckedChange={(checked) => updateNotificationSettings({ enableAnswerReminder: checked })}
                            disabled={isUpdatingNotifications}
                          />
                        </div>
                        {notificationSettings.enableAnswerReminder && (
                          <div className="ml-4 mt-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 min-w-[60px]">발송 시간:</span>
                              <Select 
                                value={notificationSettings.reminderTime} 
                                onValueChange={(value) => updateNotificationSettings({ reminderTime: value })}
                                disabled={isUpdatingNotifications}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="17:00">오후 5시</SelectItem>
                                  <SelectItem value="19:00">저녁 7시</SelectItem>
                                  <SelectItem value="21:00">저녁 9시</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-[75px]">
                              가족 식사 시간을 피한 시간을 권장합니다
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 게이트 공개 알림 */}
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="font-medium text-gray-900">대화 공개 알림</h4>
                          <p className="text-sm text-gray-500">두 분 답변 완료 시 즉시</p>
                        </div>
                        <Switch
                          checked={notificationSettings.enableGateOpened}
                          onCheckedChange={(checked) => updateNotificationSettings({ enableGateOpened: checked })}
                          disabled={isUpdatingNotifications}
                        />
                      </div>


                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 고지사항 */}
          <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
                <Shield className="w-5 h-5 text-gray-600" />
                <span>고지사항</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start text-gray-700">
                이용약관
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-gray-700">
                개인정보처리방침
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-gray-700">
                서비스 정책
              </Button>
            </CardContent>
          </Card>

          {/* 계정 관리 */}
          <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
                <LogOut className="w-5 h-5 text-red-600" />
                <span>계정 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-700 border-gray-300"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                회원탈퇴
              </Button>
            </CardContent>
          </Card>

          {/* 테스트 시나리오 드롭다운 (하단) */}
          {showTestDropdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center">
                <TestScenarioDropdown currentPage="settings" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 초대 모달 */}
      <InviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  )
}