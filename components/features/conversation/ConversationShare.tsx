'use client'

import { ConversationShareData } from '@/lib/share'
import { ShareDialog } from './ShareDialog'

interface ConversationShareProps {
  conversation: ConversationShareData
  trigger?: React.ReactNode
}

/**
 * 대화 공유 컴포넌트
 * 
 * 사용 예:
 * <ConversationShare 
 *   conversation={conversationData}
 *   trigger={<Button>공유</Button>}
 * />
 */
export function ConversationShare({ conversation, trigger }: ConversationShareProps) {
  return (
    <ShareDialog 
      conversation={conversation} 
      trigger={trigger}
    />
  )
}

export default ConversationShare