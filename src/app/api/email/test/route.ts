import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTestEmail } from '@/lib/email'

// POST /api/email/test - Send a test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { emailSettings: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.emailSettings?.enabled) {
      return NextResponse.json({ error: '이메일 브리핑이 비활성화되어 있습니다.' }, { status: 400 })
    }

    const result = await sendTestEmail(user.email, user.name || user.email)

    if (result.success) {
      return NextResponse.json({ success: true, message: '테스트 이메일이 발송되었습니다.' })
    } else {
      return NextResponse.json({ success: false, error: result.error || '이메일 발송에 실패했습니다.' }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: '이메일 발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
