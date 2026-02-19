import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// PUT /api/auth/profile - Update profile
export async function PUT(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email } = body

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name !== undefined ? name : undefined,
      email: email !== undefined ? email : undefined,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  return NextResponse.json(updated)
}
