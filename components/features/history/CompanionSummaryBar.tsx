'use client'

import { companionColors } from './CompanionConversationBlock'
import type { CompanionInfo } from './CompanionFilter'

interface CompanionSummaryBarProps {
  companions: CompanionInfo[]
  selectedCompanion?: string | null
}

export default function CompanionSummaryBar({ companions, selectedCompanion }: CompanionSummaryBarProps) {
  if (companions.length === 0) {
    return null
  }
  
  // 선택된 동반자가 있으면 해당 동반자만, 없으면 전체 표시
  const displayCompanions = selectedCompanion 
    ? companions.filter(c => c.id === selectedCompanion)
    : companions
  
  return (
    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
      {displayCompanions.map(companion => {
        const colorConfig = companionColors[companion.color]
        const completionRate = companion.stats.total > 0 
          ? Math.round((companion.stats.completed / companion.stats.total) * 100) 
          : 0
        
        return (
          <div 
            key={companion.id} 
            className="flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"
          >
            {/* 동반자 색상 표시점 */}
            <div className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot}`} />
            
            {/* 동반자 정보 */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-slate-700">
                {companion.label || companion.nickname}
              </span>
              <span className="text-xs text-slate-500">
                ({companion.stats.completed}/{companion.stats.total})
              </span>
            </div>
            
            {/* 완료율 표시 */}
            <div className="flex items-center space-x-1">
              <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full
                    ${completionRate >= 80 ? 'bg-green-400' : 
                      completionRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className={`text-xs font-medium
                ${completionRate >= 80 ? 'text-green-600' : 
                  completionRate >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {completionRate}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}