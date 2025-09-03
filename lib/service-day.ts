/**
 * Service Day 로직 - 마음배달 v2 핵심 비즈니스 로직
 * KST 05:00를 하루의 시작으로 정의
 * 예: 2025-08-27 04:30 → serviceDay: "2025-08-26"
 *     2025-08-27 05:00 → serviceDay: "2025-08-27"
 */

/**
 * 현재 서비스 데이를 KST 기준으로 계산
 * @returns string "YYYY-MM-DD" 형식의 서비스 데이
 */
export function getServiceDay(): string {
  const now = new Date()
  
  // KST 시간으로 변환 (UTC+9)
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  
  // 05시 이전이면 전날로 처리
  if (kstTime.getHours() < 5) {
    kstTime.setDate(kstTime.getDate() - 1)
  }
  
  // YYYY-MM-DD 형식으로 반환
  return kstTime.toISOString().split('T')[0]
}

/**
 * 특정 날짜의 서비스 데이 종료 시점을 계산
 * @param serviceDay "YYYY-MM-DD" 형식의 서비스 데이
 * @returns Date 해당 서비스 데이가 끝나는 KST 05:00 시점
 */
export function getServiceDayEnd(serviceDay: string): Date {
  const [year, month, day] = serviceDay.split('-').map(Number)
  
  // 다음날 05:00 KST를 UTC로 변환
  const nextDay = new Date(year, month - 1, day + 1, 5, 0, 0) // 로컬 시간
  
  // KST가 UTC+9이므로 9시간을 빼서 UTC로 변환
  return new Date(nextDay.getTime() - 9 * 60 * 60 * 1000)
}

/**
 * 현재 서비스 데이 종료까지 남은 시간을 계산
 * @returns object { hours: number, minutes: number, totalMinutes: number }
 */
export function getTimeLeftInServiceDay(): {
  hours: number
  minutes: number
  totalMinutes: number
  isExpired: boolean
} {
  const serviceDay = getServiceDay()
  const endTime = getServiceDayEnd(serviceDay)
  const now = new Date()
  
  const diffMs = endTime.getTime() - now.getTime()
  
  // 이미 지났거나 음수면 만료
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, totalMinutes: 0, isExpired: true }
  }
  
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return {
    hours,
    minutes,
    totalMinutes,
    isExpired: false
  }
}

/**
 * 시간 표시를 위한 포맷팅 함수
 * @param hours 시간
 * @param minutes 분
 * @returns string "8시간 30분" 형식
 */
export function formatTimeLeft(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) {
    return "마감됨"
  }
  
  if (hours === 0) {
    return `${minutes}분 남음`
  }
  
  if (minutes === 0) {
    return `${hours}시간 남음`
  }
  
  return `${hours}시간 ${minutes}분 남음`
}

/**
 * 특정 Date가 어느 서비스 데이에 속하는지 계산
 * @param date 확인할 날짜
 * @returns string "YYYY-MM-DD" 형식의 서비스 데이
 */
export function getServiceDayForDate(date: Date): string {
  // KST로 변환
  const kstTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  
  // 05시 이전이면 전날로 처리
  if (kstTime.getHours() < 5) {
    kstTime.setDate(kstTime.getDate() - 1)
  }
  
  return kstTime.toISOString().split('T')[0]
}

/**
 * 서비스 데이가 유효한 형식인지 검증
 * @param serviceDay 검증할 서비스 데이
 * @returns boolean
 */
export function isValidServiceDay(serviceDay: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(serviceDay)) {
    return false
  }
  
  const date = new Date(serviceDay)
  return date.toISOString().split('T')[0] === serviceDay
}

/**
 * 개발/테스트용: 특정 시간을 기준으로 서비스 데이 계산
 * @param customTime 기준 시간
 * @returns string "YYYY-MM-DD" 형식의 서비스 데이
 */
export function getServiceDayAt(customTime: Date): string {
  // KST로 변환
  const kstTime = new Date(customTime.getTime() + 9 * 60 * 60 * 1000)
  
  // 05시 이전이면 전날로 처리
  if (kstTime.getHours() < 5) {
    kstTime.setDate(kstTime.getDate() - 1)
  }
  
  return kstTime.toISOString().split('T')[0]
}