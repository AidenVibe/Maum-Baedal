// Authentication utilities and session management
export interface User {
  id: string
  kakaoId: string
  nickname: string
  createdAt: string
  settings: {
    notificationTime: string
    reminderEnabled: boolean
    preferredCategories: string[]
  }
}

export interface OnboardingData {
  startMode: "alone" | "family"
  notificationTime: "09:00" | "19:00" | "none"
  selectedTopics: string[]
  completedAt: string
}

// Mock authentication functions for development
export const mockLogin = async (provider: "kakao" = "kakao"): Promise<User> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user: User = {
    id: "user_123",
    kakaoId: "kakao_456",
    nickname: "김민지",
    createdAt: new Date().toISOString(),
    settings: {
      notificationTime: "19:00",
      reminderEnabled: true,
      preferredCategories: ["일상·하루", "가족·관계", "감사·행복"],
    },
  }

  // Store in localStorage for persistence
  localStorage.setItem("user", JSON.stringify(user))
  return user
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export const logout = (): void => {
  localStorage.removeItem("user")
  localStorage.removeItem("onboarding")
}

export const isOnboardingComplete = (): boolean => {
  if (typeof window === "undefined") return false

  const onboardingStr = localStorage.getItem("onboarding")
  return !!onboardingStr
}

export const getOnboardingData = (): OnboardingData | null => {
  if (typeof window === "undefined") return null

  const onboardingStr = localStorage.getItem("onboarding")
  return onboardingStr ? JSON.parse(onboardingStr) : null
}
