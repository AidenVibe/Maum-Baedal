'use client'

import { useState } from 'react'
import { Filter, ChevronDown, Users } from 'lucide-react'
import { companionColors, type CompanionColor } from './CompanionConversationBlock'

export interface CompanionInfo {
  id: string
  label?: string
  nickname: string
  color: CompanionColor
  conversationCount: number
  stats: {
    completed: number
    total: number
    waiting: number
    incomplete: number
  }
}

interface CompanionFilterProps {
  companions: CompanionInfo[]
  selectedCompanion: string | null
  onFilter: (companionId: string | null) => void
}

export default function CompanionFilter({ companions, selectedCompanion, onFilter }: CompanionFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedCompanionInfo = companions.find(c => c.id === selectedCompanion)
  const totalConversations = companions.reduce((sum, c) => sum + c.conversationCount, 0)
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-white border border-violet-200 text-violet-600 rounded-lg hover:bg-violet-50 transition-colors shadow-sm"
        aria-label="동반자 필터 선택"
        aria-expanded={isOpen}
      >
        <Filter className="w-3 h-3" />
        <span className="font-medium">
          {selectedCompanionInfo 
            ? selectedCompanionInfo.label || selectedCompanionInfo.nickname
            : `전체 (${totalConversations})`
          }
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-20 overflow-hidden">
            <div className="p-2 space-y-1">
              {/* 전체 옵션 */}
              <button 
                onClick={() => {
                  onFilter(null)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between
                  ${!selectedCompanion 
                    ? 'bg-violet-50 text-violet-600 font-medium' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>전체 대화</span>
                </div>
                <span className="text-xs text-gray-500">
                  {totalConversations}개
                </span>
              </button>
              
              {/* 구분선 */}
              {companions.length > 0 && (
                <div className="h-px bg-gray-200 my-1" />
              )}
              
              {/* 동반자별 옵션 */}
              {companions.map(companion => {
                const colorConfig = companionColors[companion.color]
                const completionRate = companion.stats.total > 0 
                  ? Math.round((companion.stats.completed / companion.stats.total) * 100) 
                  : 0
                
                return (
                  <button 
                    key={companion.id}
                    onClick={() => {
                      onFilter(companion.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors
                      ${selectedCompanion === companion.id 
                        ? 'bg-violet-50 text-violet-600 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-3 h-3 rounded-full ${colorConfig.dot}`} />
                        <div>
                          <div className="font-medium">
                            {companion.label || companion.nickname}
                          </div>
                          {companion.label && companion.label !== companion.nickname && (
                            <div className="text-xs text-gray-500">
                              {companion.nickname}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {companion.conversationCount}개
                        </div>
                        <div className="text-xs">
                          <span className={`font-medium ${completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {completionRate}%
                          </span>
                          <span className="text-gray-400 ml-1">완료</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 상태 요약 바 */}
                    <div className="mt-1.5 flex space-x-1">
                      <div 
                        className="h-1 bg-green-200 rounded-full" 
                        style={{ width: `${(companion.stats.completed / companion.stats.total) * 100}%` }}
                      />
                      <div 
                        className="h-1 bg-yellow-200 rounded-full" 
                        style={{ width: `${(companion.stats.waiting / companion.stats.total) * 100}%` }}
                      />
                      <div 
                        className="h-1 bg-red-200 rounded-full" 
                        style={{ width: `${(companion.stats.incomplete / companion.stats.total) * 100}%` }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}