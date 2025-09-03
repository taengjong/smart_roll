import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { classId, userId } = await request.json()

    if (!classId || !userId) {
      return NextResponse.json(
        { success: false, error: 'classId and userId are required' },
        { status: 400 }
      )
    }

    // 1. 수업 정보 조회 및 검증
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select(`
        *,
        subscription:subscriptions(
          user_id,
          remaining_classes,
          course:courses(name)
        )
      `)
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // 2. 권한 확인 - 해당 학생의 수업인지 검증
    if (classData.subscription?.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not your class' },
        { status: 403 }
      )
    }

    // 3. 이미 출석했는지 확인
    if (classData.status === 'attended') {
      return NextResponse.json(
        { success: false, error: 'Already attended this class' },
        { status: 400 }
      )
    }

    // 4. 수업 날짜/시간 검증 (출석 체크는 수업 당일만 가능)
    const classDate = new Date(classData.scheduled_date)
    const today = new Date()
    const isToday = classDate.toDateString() === today.toDateString()

    if (!isToday) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Attendance can only be marked on the class date',
          classDate: classDate.toISOString(),
          today: today.toISOString()
        },
        { status: 400 }
      )
    }

    // 5. 출석 체크 처리
    const { data: updatedClass, error: updateError } = await supabaseAdmin
      .from('classes')
      .update({
        status: 'attended',
        attended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', classId)
      .select(`
        *,
        subscription:subscriptions(
          user_id,
          remaining_classes,
          course:courses(name)
        )
      `)
      .single()

    if (updateError) {
      console.error('Failed to update attendance:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to mark attendance' },
        { status: 500 }
      )
    }

    // 6. 수강권의 남은 수업 수 감소는 트리거에서 자동 처리됨

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        classId: updatedClass.id,
        courseName: updatedClass.subscription?.course?.name,
        attendedAt: updatedClass.attended_at,
        scheduledDate: updatedClass.scheduled_date,
        scheduledTime: updatedClass.scheduled_time
      }
    })

  } catch (error) {
    console.error('Attendance check error:', error)
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