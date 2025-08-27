// Dummy data for development and testing
export const DUMMY_QUESTIONS = [
  {
    id: "q_20250825_1",
    category: "일상·하루",
    text: "최근 웃음이 났던 순간은 언제였나요?",
    date: "2025-08-25",
  },
  {
    id: "q_20250825_2",
    category: "추억·과거",
    text: "어린 시절 집 하면 떠오르는 냄새는 무엇인가요?",
    date: "2025-08-25",
  },
  {
    id: "q_20250825_3",
    category: "가족·관계",
    text: "우리가 닮았다고 느끼는 점 한 가지는요?",
    date: "2025-08-25",
  },
]

export const DUMMY_USER = {
  id: "user_123",
  kakaoId: "kakao_456",
  nickname: "김민지",
  createdAt: "2025-08-25T09:00:00Z",
  settings: {
    notificationTime: "19:00",
    reminderEnabled: true,
    preferredCategories: ["일상·하루", "가족·관계", "감사·행복"],
  },
}

export const DUMMY_LABELS = [
  {
    id: "label_1",
    name: "엄마",
    isBlocked: false,
    lastUsed: "2025-08-24T19:30:00Z",
    useCount: 5,
  },
  {
    id: "label_2",
    name: "아빠",
    isBlocked: false,
    lastUsed: "2025-08-20T20:15:00Z",
    useCount: 3,
  },
  {
    id: "label_3",
    name: "할머니",
    isBlocked: false,
    lastUsed: null,
    useCount: 0,
  },
]

export const DUMMY_CONVERSATIONS = [
  {
    id: "conv_1",
    questionId: "q_20250824_1",
    questionText: "오늘 가장 감사했던 순간은 무엇인가요?",
    senderAnswer: "오늘 회사에서 동료가 도와줘서 프로젝트를 무사히 마칠 수 있었어요. 정말 고마웠습니다.",
    receiverAnswer: "아침에 일어나서 창문을 열었을 때 시원한 바람이 불어와서 기분이 좋았어요.",
    labelName: "엄마",
    createdAt: "2025-08-24T19:30:00Z",
    completedAt: "2025-08-24T21:15:00Z",
  },
  {
    id: "conv_2",
    questionId: "q_20250823_1",
    questionText: "최근 새로 배운 것이 있다면 무엇인가요?",
    senderAnswer: "유튜브에서 간단한 요리법을 배웠어요. 생각보다 쉽더라고요!",
    receiverAnswer: "스마트폰으로 QR코드 스캔하는 방법을 배웠어요. 편리하네요.",
    labelName: "아빠",
    createdAt: "2025-08-23T20:00:00Z",
    completedAt: "2025-08-23T22:30:00Z",
  },
]

export const DUMMY_WEEKLY_HIGHLIGHT = {
  id: "weekly_1",
  weekStart: "2025-08-19",
  weekEnd: "2025-08-25",
  conversationCount: 7,
  responseRate: 100,
  highlights: [
    {
      labelName: "엄마",
      bestConversations: [
        { day: "월요일", topic: "어린 시절 추억의 간식" },
        { day: "수요일", topic: "요즘 관심 있는 취미" },
        { day: "금요일", topic: "가족과 함께하고 싶은 여행" },
      ],
    },
    {
      labelName: "아빠",
      bestConversations: [
        { day: "화요일", topic: "최근 새로 배운 것" },
        { day: "목요일", topic: "오늘 가장 감사했던 순간" },
        { day: "토요일", topic: "요즘 마음에 남은 말" },
      ],
    },
  ],
  shareCount: 0,
  createdAt: "2025-08-25T18:00:00Z",
}
