import { redirect } from 'next/navigation'

export default function Home() {
  // 홈페이지 접속시 /today로 리다이렉트
  redirect('/today')
}
