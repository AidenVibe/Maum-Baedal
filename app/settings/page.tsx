'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Heart, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* 페이지 헤더 */}
        <div className="text-center py-4">
          <h1 className="text-xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-600 mt-1">계정 및 서비스 설정을 관리하세요</p>
        </div>

        {/* 프로필 카드 */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">사용자</h3>
              <p className="text-sm text-gray-600">카카오 로그인</p>
            </div>
          </div>
        </Card>

        {/* 가족 연결 카드 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-gray-900">가족 연결</h3>
                <p className="text-sm text-gray-600">연결된 가족이 없습니다</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              연결하기
            </Button>
          </div>
        </Card>

        {/* 설정 메뉴 */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">일반 설정</span>
          </div>
          
          <div className="space-y-3 pl-8">
            <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900">
              알림 설정
            </button>
            <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900">
              개인정보 처리방침
            </button>
            <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900">
              서비스 이용약관
            </button>
          </div>
        </Card>

        {/* 로그아웃 버튼 */}
        <Card className="p-6">
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            로그아웃
          </Button>
        </Card>
      </div>
    </div>
  )
}