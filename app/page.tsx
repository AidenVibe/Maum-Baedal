import { redirect } from 'next/navigation'

export default function Home() {
  // 홈 접속 시 /today로 리다이렉트
  redirect('/today')
}

