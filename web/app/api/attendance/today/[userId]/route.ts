import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식

    // 오늘 예정된 수업들 조회
    const { data: todayClasses, error: classesError } = await supabaseAdmin
      .from('classes')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        attended_at,
        notes,
        subscription:subscriptions!inner(
          id,
          user_id,
          remaining_classes,
          total_classes,
          course:courses(
            id,
            name,
            description,
            duration_weeks
          )
        )
      `)
      .eq('subscription.user_id', userId)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true })

    if (classesError) {
      console.error('Failed to fetch today classes:', classesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch today classes' },
        { status: 500 }
      )
    }

    // 활성 수강권 정보 조회
    const { data: activeSubscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        remaining_classes,
        total_classes,
        expiry_date,
        status,
        course:courses(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (subscriptionsError) {
      console.error('Failed to fetch subscriptions:', subscriptionsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    // 이번 주 출석 통계
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // 이번 주 일요일
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // 이번 주 토요일

    const { data: weeklyStats, error: weeklyError } = await supabaseAdmin
      .from('classes')
      .select(`
        status,
        subscription:subscriptions!inner(user_id)
      `)
      .eq('subscription.user_id', userId)
      .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
      .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])

    if (weeklyError) {
      console.error('Failed to fetch weekly stats:', weeklyError)
    }

    const weeklyAttended = weeklyStats?.filter(c => c.status === 'attended').length || 0
    const weeklyTotal = weeklyStats?.length || 0

    return NextResponse.json({
      success: true,
      data: {
        todayClasses: todayClasses?.map(cls => ({
          classId: cls.id,
          courseId: cls.subscription?.course?.id,
          courseName: cls.subscription?.course?.name,
          courseDescription: cls.subscription?.course?.description,
          scheduledDate: cls.scheduled_date,
          scheduledTime: cls.scheduled_time,
          status: cls.status,
          attendedAt: cls.attended_at,
          notes: cls.notes,
          subscription: {
            id: cls.subscription?.id,
            remainingClasses: cls.subscription?.remaining_classes,
            totalClasses: cls.subscription?.total_classes
          }
        })) || [],
        activeSubscriptions: activeSubscriptions?.map(sub => ({
          id: sub.id,
          courseName: sub.course?.name,
          courseDescription: sub.course?.description,
          remainingClasses: sub.remaining_classes,
          totalClasses: sub.total_classes,
          expiryDate: sub.expiry_date,
          status: sub.status
        })) || [],
        weeklyStats: {
          attended: weeklyAttended,
          total: weeklyTotal,
          attendanceRate: weeklyTotal > 0 ? Math.round((weeklyAttended / weeklyTotal) * 100) : 0
        },
        today: today
      }
    })

  } catch (error) {
    console.error('Today attendance error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}