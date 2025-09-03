import axios, { AxiosInstance } from 'axios'
import CryptoJS from 'crypto-js'

// 솔라피 메시지 타입 정의
export interface SolapiMessage {
  to: string                    // 수신번호
  from: string                  // 발신번호
  text: string                  // SMS 내용 (알림톡 대체발송용)
  kakaoOptions?: {
    pfId: string               // 카카오톡 채널 ID
    templateId: string         // 알림톡 템플릿 ID
    variables?: Record<string, string>  // 템플릿 변수
  }
}

export interface SolapiResponse {
  statusCode: string
  statusMessage: string
  messageId: string
}

export interface SolapiErrorResponse {
  statusCode: string
  statusMessage: string
  errorCode?: string
  errorMessage?: string
}

class SolapiClient {
  private client: AxiosInstance
  private apiKey: string
  private apiSecret: string
  private senderPhone: string
  private kakaoChannel: string

  constructor() {
    this.apiKey = process.env.SOLAPI_API_KEY!
    this.apiSecret = process.env.SOLAPI_API_SECRET!
    this.senderPhone = process.env.SOLAPI_SENDER_PHONE!
    this.kakaoChannel = process.env.SOLAPI_KAKAO_CHANNEL!

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('솔라피 API 키가 설정되지 않았습니다.')
    }

    this.client = axios.create({
      baseURL: 'https://api.solapi.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 인증 인터셉터 설정
    this.client.interceptors.request.use((config) => {
      const timestamp = Date.now().toString()
      const signature = this.generateSignature(timestamp)

      config.headers['Authorization'] = `HMAC-SHA256 apiKey=${this.apiKey}, date=${timestamp}, salt=${signature.salt}, signature=${signature.signature}`

      return config
    })
  }

  // HMAC-SHA256 서명 생성
  private generateSignature(timestamp: string) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString()
    const data = timestamp + salt
    const signature = CryptoJS.HmacSHA256(data, this.apiSecret).toString()

    return { salt, signature }
  }

  // 단건 메시지 발송
  async sendMessage(message: SolapiMessage): Promise<SolapiResponse> {
    try {
      const requestData = {
        message: {
          to: message.to,
          from: message.from || this.senderPhone,
          text: message.text,
          type: message.kakaoOptions ? 'ATA' : 'SMS', // ATA: 알림톡, SMS: 문자
          ...(message.kakaoOptions && {
            kakaoOptions: {
              pfId: message.kakaoOptions.pfId || this.kakaoChannel,
              templateId: message.kakaoOptions.templateId,
              variables: message.kakaoOptions.variables || {},
            },
          }),
        },
      }

      const response = await this.client.post('/messages/v4/send', requestData)
      return response.data
    } catch (error: any) {
      console.error('솔라피 메시지 발송 실패:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.errorMessage || 
        '메시지 발송에 실패했습니다.'
      )
    }
  }

  // 그룹 메시지 발송 (여러 수신자)
  async sendGroupMessages(messages: SolapiMessage[]): Promise<SolapiResponse[]> {
    try {
      const requestData = {
        messages: messages.map((message) => ({
          to: message.to,
          from: message.from || this.senderPhone,
          text: message.text,
          type: message.kakaoOptions ? 'ATA' : 'SMS',
          ...(message.kakaoOptions && {
            kakaoOptions: {
              pfId: message.kakaoOptions.pfId || this.kakaoChannel,
              templateId: message.kakaoOptions.templateId,
              variables: message.kakaoOptions.variables || {},
            },
          }),
        })),
      }

      const response = await this.client.post('/messages/v4/send-many', requestData)
      return response.data.results || []
    } catch (error: any) {
      console.error('솔라피 그룹 메시지 발송 실패:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.errorMessage || 
        '그룹 메시지 발송에 실패했습니다.'
      )
    }
  }

  // 메시지 발송 상태 조회
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await this.client.get(`/messages/v4/list/${messageId}`)
      return response.data
    } catch (error: any) {
      console.error('메시지 상태 조회 실패:', error.response?.data || error.message)
      throw new Error('메시지 상태 조회에 실패했습니다.')
    }
  }

  // 잔액 조회
  async getBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const response = await this.client.get('/cash/v1/balance')
      return response.data
    } catch (error: any) {
      console.error('잔액 조회 실패:', error.response?.data || error.message)
      throw new Error('잔액 조회에 실패했습니다.')
    }
  }
}

// 싱글톤 인스턴스
let solapiClient: SolapiClient | null = null

export function getSolapiClient(): SolapiClient {
  if (!solapiClient) {
    solapiClient = new SolapiClient()
  }
  return solapiClient
}

// 알림톡 템플릿 ID 상수
export const ALIMTALK_TEMPLATES = {
  DAILY_QUESTION: 'daily_question_001',      // 일일 질문 알림
  ANSWER_REMINDER: 'answer_reminder_001',    // 답변 리마인드
  GATE_OPENED: 'gate_opened_001',            // 게이트 공개 알림
  COMPANION_JOINED: 'companion_joined_001',  // 동반자 참여 알림
} as const

export type AlimtalkTemplateId = typeof ALIMTALK_TEMPLATES[keyof typeof ALIMTALK_TEMPLATES]