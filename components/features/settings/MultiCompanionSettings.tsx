'use client'

import { CompanionList } from './CompanionList'

interface MultiCompanionSettingsProps {
  className?: string
  isLoadingMode?: boolean
  isSoloMode?: boolean
}

export function MultiCompanionSettings({ 
  className, 
  isLoadingMode = false,
  isSoloMode = false 
}: MultiCompanionSettingsProps) {
  return (
    <div className={className}>
      <CompanionList 
        isLoadingMode={isLoadingMode}
        isSoloMode={isSoloMode}
      />
    </div>
  )
}