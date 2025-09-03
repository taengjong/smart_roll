import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // 출석 이력 조회
    const { data: attendanceHistory, error: historyError } = await supabaseAdmin
      .from('classes')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        attended_at,
        notes,
        subscription:subscriptions!inner(
          user_id,
          course:courses(
            name,
            description
          )
        )
      `)
      .eq('subscription.user_id', userId)
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (historyError) {
      console.error('Failed to fetch attendance history:', historyError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendance history' },
        { status: 500 }
      )
    }

    // 출석 통계 계산
    const { data: statsData, error: statsError } = await supabaseAdmin
      .from('classes')
      .select(`
        status,
        subscription:subscriptions!inner(
          user_id,
          course:courses(name)
        )
      `)
      .eq('subscription.user_id', userId)

    if (statsError) {
      console.error('Failed to fetch attendance stats:', statsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendance stats' },
        { status: 500 }
      )
    }

    // 통계 계산
    const totalClasses = statsData?.length || 0
    const attendedClasses = statsData?.filter(c => c.status === 'attended').length || 0
    const missedClasses = statsData?.filter(c => c.status === 'missed').length || 0
    const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0

    // 코스별 통계
    const courseStats = statsData?.reduce((acc: any, curr: any) => {
      const courseName = curr.subscription?.course?.name
      if (!courseName) return acc
      
      if (!acc[courseName]) {
        acc[courseName] = { total: 0, attended: 0, missed: 0 }
      }
      
      acc[courseName].total++
      if (curr.status === 'attended') acc[courseName].attended++
      if (curr.status === 'missed') acc[courseName].missed++
      
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      data: {
        history: attendanceHistory?.map(record => ({
          classId: record.id,
          courseName: record.subscription?.course?.name,
          courseDescription: record.subscription?.course?.description,
          scheduledDate: record.scheduled_date,
          scheduledTime: record.scheduled_time,
          status: record.status,
          attendedAt: record.attended_at,
          notes: record.notes
        })) || [],
        stats: {
          totalClasses,
          attendedClasses,
          missedClasses,
          attendanceRate,
          courseStats
        },
        pagination: {
          limit,
          offset,
          hasMore: (attendanceHistory?.length || 0) === limit
        }
      }
    })

  } catch (error) {
    console.error('Attendance history error:', error)
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