// Toast 시스템 타입 정의
export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'gate-opened'
  message: string
  duration?: number // ms, undefined면 수동으로만 닫기
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean // true면 자동으로 안 닫힘
  // 게이트 공개 토스트 전용 데이터
  conversationId?: string
}

export interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
  // 게이트 공개 전용 헬퍼
  showGateOpened: (conversationId: string) => void
}