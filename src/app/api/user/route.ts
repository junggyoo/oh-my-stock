import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user?email=xxx - Get user by email
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      stocks: { include: { stock: true } },
      emailSettings: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

// POST /api/user - Create or get user
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, name } = body

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: {
      email,
      name,
      emailSettings: {
        create: {
          enabled: true,
          sendTime: '08:00',
          timezone: 'Asia/Seoul',
        },
      },
    },
    include: {
      stocks: { include: { stock: true } },
      emailSettings: true,
    },
  })

  return NextResponse.json(user)
}
