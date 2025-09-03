'use client'

import { useState } from 'react'
import { User, MoreVertical, Edit3, BellOff, Trash2, Calendar, MessageSquare, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface CompanionData {
  id: string
  nickname: string
  label?: string
  connectedAt: string
  isActive: boolean
  notificationsEnabled: boolean
  stats: {
    totalConversations: number
    completedConversations: number
    lastActivityAt?: string
  }
}

interface CompanionCardProps {
  companion: CompanionData
  onUpdateLabel: (companionId: string, newLabel: string) => Promise<void>
  onToggleNotifications: (companionId: string, enabled: boolean) => Promise<void>
  onRemoveCompanion: (companionId: string) => Promise<void>
}

export function CompanionCard({ 
  companion, 
  onUpdateLabel,
  onToggleNotifications,
  onRemoveCompanion
}: CompanionCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [editedLabel, setEditedLabel] = useState(companion.label || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return '오늘 연결됨'
    if (diffInDays === 1) return '어제 연결됨'
    if (diffInDays < 7) return `${diffInDays}일 전 연결됨`
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + '에 연결됨'
  }

  const getCompletionRate = () => {
    if (companion.stats.totalConversations === 0) return 0
    return Math.round(
      (companion.stats.completedConversations / companion.stats.totalConversations) * 100
    )
  }

  const handleSaveLabel = async () => {
    if (editedLabel.trim() === companion.label) {
      setIsEditingLabel(false)
      return
    }

    setIsUpdating(true)
    try {
      await onUpdateLabel(companion.id, editedLabel.trim())
      setIsEditingLabel(false)
    } catch (error) {
      console.error('별명 수정 오류:', error)
      setEditedLabel(companion.label || '') // 원래 값으로 복원
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedLabel(companion.label || '')
    setIsEditingLabel(false)
  }

  return (
    <div className={`
      bg-white rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md
      ${companion.isActive ? 'border-amber-200' : 'border-gray-200'}
    `}>
      <div className="p-4">
        {/* 헤더: 아바타, 이름, 액션 메뉴 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* 아바타 */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
              ${companion.isActive ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : 
                'bg-gray-400'}
            `}>
              <User className="w-6 h-6" />
            </div>
            
            {/* 이름과 별명 */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{companion.nickname}</h3>
                {!companion.notificationsEnabled && (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
              
              {/* 별명 수정 */}
              <div className="mt-1">
                {isEditingLabel ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editedLabel}
                      onChange={(e) => setEditedLabel(e.target.value)}
                      placeholder="별명 입력 (예: 엄마, 아빠)"
                      className="h-7 text-sm max-w-32"
                      maxLength={10}
                      disabled={isUpdating}
                    />
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={handleSaveLabel}
                        disabled={isUpdating}
                        className="h-7 px-2"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="h-7 px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingLabel(true)}
                    className="text-sm cursor-pointer inline-flex items-center space-x-1 text-violet-600 hover:text-violet-700"
                  >
                    <span>{companion.label || '별명 없음'}</span>
                    <Edit3 className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 액션 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditingLabel(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                별명 수정
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onToggleNotifications(companion.id, !companion.notificationsEnabled)}
              >
                <BellOff className="w-4 h-4 mr-2" />
                {companion.notificationsEnabled ? '알림 끄기' : '알림 켜기'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onRemoveCompanion(companion.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                연결 해제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {companion.stats.completedConversations}
            </div>
            <div className="text-xs text-gray-500">완료 대화</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {companion.stats.totalConversations}
            </div>
            <div className="text-xs text-gray-500">총 질문</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-violet-600">
              {getCompletionRate()}%
            </div>
            <div className="text-xs text-gray-500">완료율</div>
          </div>
        </div>

        {/* 연결 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(companion.connectedAt)}</span>
          </div>
          {companion.stats.lastActivityAt && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>최근 활동: {formatDate(companion.stats.lastActivityAt)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}