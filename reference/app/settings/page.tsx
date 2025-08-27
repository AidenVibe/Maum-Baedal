"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { getCurrentUser, logout, getOnboardingData } from "@/lib/auth"

const NOTIFICATION_TIMES = [
  { value: "09:00", label: "오전 9시", icon: "🌅" },
  { value: "19:00", label: "저녁 7시", icon: "🌆" },
  { value: "none", label: "알림 받지 않기", icon: "🔕" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [notificationTime, setNotificationTime] = useState("19:00")
  const [tempNotificationTime, setTempNotificationTime] = useState("19:00")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [tempNickname, setTempNickname] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const onboardingData = getOnboardingData()
    if (onboardingData) {
      setNotificationTime(onboardingData.notificationTime)
      setTempNotificationTime(onboardingData.notificationTime)
    }

    setReminderEnabled(user.settings?.reminderEnabled ?? true)
    setTempNickname(user.nickname || user.name || "사용자")
  }, [user, router])

  const handleNotificationTimeChange = (time: string) => {
    setTempNotificationTime(time)
    setHasUnsavedChanges(time !== notificationTime)
  }

  const handleSaveNotificationSettings = () => {
    setNotificationTime(tempNotificationTime)
    setHasUnsavedChanges(false)
    console.log("Notification time saved:", tempNotificationTime)
    alert("알림 설정이 저장되었습니다.")
  }

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled)
    console.log("Reminder enabled:", enabled)
  }

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠어요?")) {
      logout()
      router.push("/")
    }
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2)
    } else {
      console.log("Account deletion requested")
      logout()
      alert("계정이 삭제되었습니다. 30일 내 복구 가능합니다.")
      router.push("/")
    }
  }

  const handleSaveNickname = () => {
    if (tempNickname.trim().length < 2) {
      alert("닉네임은 2글자 이상 입력해주세요.")
      return
    }

    const updatedUser = { ...user, nickname: tempNickname.trim(), name: tempNickname.trim() }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setShowNicknameModal(false)
    alert("닉네임이 변경되었습니다.")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">설정</h1>
          <div className="w-8" />
        </div>

        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{user.nickname || "사용자"}</h3>
                <p className="text-sm text-gray-600">가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-100 bg-transparent"
                onClick={() => {
                  setTempNickname(user.nickname || user.name || "사용자")
                  setShowNicknameModal(true)
                }}
              >
                수정
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">알림 시간 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">질문 받을 시간을 선택해주세요</p>
              <div className="space-y-2">
                {NOTIFICATION_TIMES.map((time) => (
                  <div
                    key={time.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      tempNotificationTime === time.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                    onClick={() => handleNotificationTimeChange(time.value)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{time.icon}</span>
                      <span className="font-medium text-gray-900">{time.label}</span>
                      {tempNotificationTime === time.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSaveNotificationSettings}
              disabled={!hasUnsavedChanges}
              className={`w-full h-12 ${
                hasUnsavedChanges
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {hasUnsavedChanges ? "설정 저장하기" : "저장됨"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">리마인더 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">답변 리마인더</p>
                <p className="text-sm text-gray-600">답변하지 않은 질문에 대한 알림을 받습니다</p>
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={handleReminderToggle} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">가족 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full h-12 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              onClick={() => router.push("/labels")}
            >
              가족 정보 관리
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">앱 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push("/privacy")}
            >
              개인정보처리방침
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push("/terms")}
            >
              서비스 이용약관
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                alert("마음배달 v1.0.0\n\n문의: support@maeum-baedal.com")
              }}
            >
              버전 정보
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">계정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 border-gray-600 text-gray-600 hover:bg-gray-50 bg-transparent"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
              onClick={() => setShowDeleteModal(true)}
            >
              회원 탈퇴
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">💬</span>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">도움이 필요하세요?</p>
                <p className="text-xs text-blue-600 mb-2">문의사항이나 건의사항이 있으시면 언제든 연락해주세요.</p>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    window.open("mailto:support@maeum-baedal.com", "_blank")
                  }}
                >
                  문의하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-sm mx-4 bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {deleteConfirmStep === 1 ? "회원 탈퇴" : "정말로 탈퇴하시겠어요?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {deleteConfirmStep === 1 ? (
              <>
                <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="text-5xl mb-4">😢</div>
                  <p className="text-lg font-semibold text-gray-900 mb-3">정말 떠나시는 건가요?</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    탈퇴 시 모든 대화 기록이 삭제되며,
                    <br />
                    <span className="font-semibold text-red-600">30일 내에만 복구할 수 있어요.</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirmStep(1)
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                    onClick={handleDeleteAccount}
                  >
                    탈퇴하기
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center bg-red-50 p-6 rounded-lg border-2 border-red-200">
                  <div className="text-5xl mb-4">⚠️</div>
                  <p className="text-lg font-bold text-red-800 mb-3">최종 확인</p>
                  <p className="text-sm text-red-700 leading-relaxed">
                    <span className="font-semibold">이 작업은 되돌릴 수 없습니다.</span>
                    <br />
                    정말로 계정을 삭제하시겠어요?
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    onClick={() => setDeleteConfirmStep(1)}
                  >
                    이전
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                    onClick={handleDeleteAccount}
                  >
                    삭제하기
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNicknameModal} onOpenChange={setShowNicknameModal}>
        <DialogContent className="max-w-sm mx-4 bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">닉네임 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">새 닉네임</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="닉네임을 입력해주세요"
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg bg-white"
                maxLength={10}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">2글자 이상 입력해주세요</span>
                <span className="text-gray-500">{tempNickname.length}/10</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                onClick={() => setShowNicknameModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={handleSaveNickname}
                disabled={tempNickname.trim().length < 2}
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
