import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stocks?userId=xxx - Get user's stocks
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const stocks = await prisma.userStock.findMany({
    where: { userId },
    include: {
      stock: {
        include: {
          news: {
            orderBy: { publishedAt: 'desc' },
            take: 5,
            include: { analysis: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(stocks.map(us => us.stock))
}

// POST /api/stocks - Add stock to watchlist
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, symbol, name, market } = body

  if (!userId || !symbol || !name) {
    return NextResponse.json(
      { error: 'userId, symbol, and name are required' },
      { status: 400 }
    )
  }

  // Create stock if it doesn't exist
  const stock = await prisma.stock.upsert({
    where: { symbol },
    update: {},
    create: { symbol, name, market: market || 'US' },
  })

  // Add to user's watchlist
  const userStock = await prisma.userStock.upsert({
    where: {
      userId_stockId: { userId, stockId: stock.id },
    },
    update: {},
    create: { userId, stockId: stock.id },
  })

  return NextResponse.json({ stock, userStock })
}

// DELETE /api/stocks - Remove stock from watchlist
export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { userId, stockId } = body

  if (!userId || !stockId) {
    return NextResponse.json(
      { error: 'userId and stockId are required' },
      { status: 400 }
    )
  }

  await prisma.userStock.deleteMany({
    where: { userId, stockId },
  })

  return NextResponse.json({ success: true })
}
