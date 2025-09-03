/**
 * NextAuth 타입 확장
 */

import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    nickname: string
    label?: string | null
    kakaoSub?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      nickname: string
      label?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nickname: string
    label?: string | null
  }
}