'use client'

import { useState, useEffect } from 'react'
import type { ConversationNavigationResponse, NavigationItem } from '@/lib/types'

interface UseConversationNavigationState {
  navigation: ConversationNavigationResponse['navigation'] | null
  loading: boolean
  error: string | null
}

interface UseConversationNavigationReturn extends UseConversationNavigationState {
  refresh: () => Promise<void>
  navigateTo: (conversationId: string) => void
}

export function useConversationNavigation(
  conversationId: string
): UseConversationNavigationReturn {
  const [state, setState] = useState<UseConversationNavigationState>({
    navigation: null,
    loading: true,
    error: null
  })

  const fetchNavigation = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/conversation/${conversationId}/navigation`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '네비게이션 정보를 가져올 수 없습니다')
      }
      
      const data: ConversationNavigationResponse = await response.json()
      
      setState({
        navigation: data.navigation,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Navigation fetch error:', error)
      setState({
        navigation: null,
        loading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      })
    }
  }

  const navigateTo = (targetConversationId: string) => {
    // Next.js navigation 사용
    window.location.href = `/conversation/${targetConversationId}`
  }

  useEffect(() => {
    if (conversationId) {
      fetchNavigation()
    }
  }, [conversationId])

  return {
    ...state,
    refresh: fetchNavigation,
    navigateTo
  }
}

// 네비게이션 단축키 지원을 위한 추가 Hook
export function useConversationKeyboardNavigation(
  navigation: ConversationNavigationResponse['navigation'] | null,
  navigateTo: (conversationId: string) => void
) {
  useEffect(() => {
    if (!navigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 왼쪽 화살표: 이전 대화
      if (event.altKey && event.key === 'ArrowLeft' && navigation.previous) {
        event.preventDefault()
        navigateTo(navigation.previous.id)
      }
      
      // Alt + 오른쪽 화살표: 다음 대화
      if (event.altKey && event.key === 'ArrowRight' && navigation.next) {
        event.preventDefault()
        navigateTo(navigation.next.id)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigation, navigateTo])
}

// 간단한 유틸리티 함수들
export const formatServiceDay = (serviceDay: string): string => {
  const date = new Date(serviceDay + 'T00:00:00+09:00') // KST 기준
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

export const getRelativeDateText = (serviceDay: string): string => {
  const today = new Date()
  const targetDate = new Date(serviceDay + 'T00:00:00+09:00')
  
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === -1) return '어제'
  if (diffDays === 1) return '내일'
  if (diffDays > 0) return `${diffDays}일 후`
  return `${Math.abs(diffDays)}일 전`
}