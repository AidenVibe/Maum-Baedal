import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, NotificationStatus, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/notifications/stats - 알림 통계 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. 기간별 발송 통계
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        type,
        status,
        COUNT(*) as count
      FROM notification_logs 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at), type, status
      ORDER BY date DESC, type, status
    `

    // 2. 전체 통계
    const overallStats = await prisma.notificationLog.groupBy({
      by: ['type', 'status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // 3. 성공률 계산
    const successRates = await prisma.notificationLog.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    const successRateDetails = await Promise.all(
      Object.values(NotificationType).map(async (type) => {
        const total = await prisma.notificationLog.count({
          where: {
            type,
            createdAt: { gte: startDate }
          }
        })

        const successful = await prisma.notificationLog.count({
          where: {
            type,
            status: {
              in: [NotificationStatus.SENT, NotificationStatus.DELIVERED]
            },
            createdAt: { gte: startDate }
          }
        })

        return {
          type,
          total,
          successful,
          successRate: total > 0 ? Math.round((successful / total) * 100) : 0
        }
      })
    )

    // 4. 최근 실패 로그
    const recentFailures = await prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.FAILED,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // 5. 사용자 알림 설정 통계
    const settingsStats = await prisma.notificationSetting.groupBy({
      by: ['enableDailyQuestion', 'enableAnswerReminder', 'enableGateOpened', 'enableCompanionJoined', 'isActive'],
      _count: {
        id: true
      }
    })

    const activeUsersCount = await prisma.notificationSetting.count({
      where: { isActive: true }
    })

    const totalUsersCount = await prisma.user.count()

    return NextResponse.json({
      period: `${days}일`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      
      // 일별 통계
      dailyStats,
      
      // 전체 통계
      overallStats,
      
      // 타입별 성공률
      successRates: successRateDetails,
      
      // 최근 실패 로그
      recentFailures: recentFailures.map(log => ({
        id: log.id,
        type: log.type,
        userId: log.userId,
        userNickname: log.user.nickname || log.user.name,
        phoneNumber: log.phoneNumber,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
        retryCount: log.retryCount
      })),
      
      // 사용자 설정 통계
      userSettings: {
        totalUsers: totalUsersCount,
        activeNotificationUsers: activeUsersCount,
        notificationEnabledRate: totalUsersCount > 0 
          ? Math.round((activeUsersCount / totalUsersCount) * 100) 
          : 0,
        settingsBreakdown: settingsStats
      },

      // 요약 정보
      summary: {
        totalNotifications: overallStats.reduce((sum, stat) => sum + stat._count.id, 0),
        successfulNotifications: overallStats
          .filter(stat => stat.status === NotificationStatus.SENT || stat.status === NotificationStatus.DELIVERED)
          .reduce((sum, stat) => sum + stat._count.id, 0),
        failedNotifications: overallStats
          .filter(stat => stat.status === NotificationStatus.FAILED)
          .reduce((sum, stat) => sum + stat._count.id, 0),
        overallSuccessRate: (() => {
          const total = overallStats.reduce((sum, stat) => sum + stat._count.id, 0)
          const successful = overallStats
            .filter(stat => stat.status === NotificationStatus.SENT || stat.status === NotificationStatus.DELIVERED)
            .reduce((sum, stat) => sum + stat._count.id, 0)
          return total > 0 ? Math.round((successful / total) * 100) : 0
        })()
      }
    })

  } catch (error: any) {
    console.error('알림 통계 조회 오류:', error)
    return NextResponse.json({ 
      error: '통계 조회에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}