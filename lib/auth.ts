/**
 * NextAuth 설정 - 마음배달 v2
 * 카카오 OAuth 인증 설정
 */

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import KakaoProvider from 'next-auth/providers/kakao'
import { prisma } from './prisma'
import './auth-types' // 타입 확장 로드

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // 타입 호환성을 위한 단언
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH DEBUG] signIn callback:', { 
        provider: account?.provider, 
        email: user.email,
        providerAccountId: account?.providerAccountId,
        account_fields: account ? Object.keys(account) : []
      })

      if (account?.provider === "kakao") {
        try {
          const kakaoProfile = profile as any
          
          // 기존 계정 확인 및 처리
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true }
          })

          if (existingUser) {
            // 기존 사용자에 카카오 계정이 연결되어 있는지 확인
            const existingKakaoAccount = existingUser.accounts.find(
              acc => acc.provider === 'kakao' && acc.providerAccountId === account.providerAccountId
            )

            if (!existingKakaoAccount) {
              // 카카오 계정이 연결되어 있지 않다면 계정 연결
              // 카카오 OAuth 응답에서 지원되는 필드만 필터링
              const accountData: any = {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              }

              // 선택적 필드들을 안전하게 추가
              if (account.access_token) accountData.access_token = account.access_token
              if (account.token_type) accountData.token_type = account.token_type
              if (account.scope) accountData.scope = account.scope
              if (account.expires_at) accountData.expires_at = account.expires_at
              if (account.refresh_token) accountData.refresh_token = account.refresh_token
              if ('refresh_token_expires_in' in account && account.refresh_token_expires_in) {
                accountData.refresh_token_expires_in = account.refresh_token_expires_in
              }

              await prisma.account.create({ data: accountData })
              console.log('[AUTH DEBUG] 기존 사용자에 카카오 계정 연결 완료')
            }

            // 카카오 전용 필드 업데이트
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                kakaoSub: account.providerAccountId,
                nickname: kakaoProfile.nickname || user.name || "사용자",
              }
            })
          }
          
          return true
        } catch (error) {
          console.error("[AUTH ERROR] 카카오 로그인 처리 중 오류:", error)
          return true // 로그인 자체는 허용하되 에러 로깅
        }
      }
      return true
    },
    async session({ session, user }) {
      // PrismaAdapter 사용 시 user 파라미터에서 DB 사용자 정보 가져옴
      if (session.user && user) {
        session.user.id = user.id
        session.user.nickname = user.nickname || session.user.name || '사용자'
        session.user.label = user.label
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 로그인 성공 후 /today로 리다이렉트
      console.log('[AUTH DEBUG] Redirect callback:', { url, baseUrl })
      
      // callbackUrl이 있으면 사용, 없으면 /today
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/today'
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}