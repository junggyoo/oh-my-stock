import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/settings - Update email settings
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { userId, enabled, sendTime, timezone } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const settings = await prisma.emailSettings.upsert({
    where: { userId },
    update: {
      enabled: enabled ?? undefined,
      sendTime: sendTime ?? undefined,
      timezone: timezone ?? undefined,
    },
    create: {
      userId,
      enabled: enabled ?? true,
      sendTime: sendTime ?? '08:00',
      timezone: timezone ?? 'Asia/Seoul',
    },
  })

  return NextResponse.json(settings)
}
