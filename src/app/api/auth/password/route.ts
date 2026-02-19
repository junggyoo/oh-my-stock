import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth'

// PUT /api/auth/password - Change password
export async function PUT(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
  }

  // Get full user with password
  const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!fullUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // If user has existing password, verify current password
  if (fullUser.password) {
    if (!currentPassword) {
      return NextResponse.json({ error: '현재 비밀번호를 입력해주세요.' }, { status: 400 })
    }
    const valid = await verifyPassword(currentPassword, fullUser.password)
    if (!valid) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
    }
  }

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' })
}
