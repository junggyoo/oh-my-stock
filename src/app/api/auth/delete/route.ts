import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, clearAuthCookie } from '@/lib/auth'

// DELETE /api/auth/delete - Delete account
export async function DELETE() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete user (cascade will handle related records due to Prisma schema)
  await prisma.user.delete({ where: { id: user.id } })
  await clearAuthCookie()

  return NextResponse.json({ success: true, message: '계정이 삭제되었습니다.' })
}
