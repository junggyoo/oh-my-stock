import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const userWithSettings = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailSettings: true,
      },
    })

    return NextResponse.json(userWithSettings)
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
