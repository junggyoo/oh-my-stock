import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchStockNews } from '@/lib/news'
import { analyzeNews, generateDailyBriefing, generateFullDigest } from '@/lib/analyzer'
import { sendDailyDigest } from '@/lib/email'
import { formatDate } from '@/lib/utils'
import { StockDigest, EmailDigest } from '@/types'

// POST /api/cron/daily-digest - Triggered by cron to send daily digests
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    include: {
      stocks: { include: { stock: true } },
      emailSettings: true,
    },
  })

  const results: { email: string; success: boolean; error?: string }[] = []

  for (const user of users) {
    if (!user.emailSettings?.enabled) continue

    const stockDigests: StockDigest[] = []

    for (const userStock of user.stocks) {
      const stock = userStock.stock

      // Fetch fresh news
      const newsItems = await fetchStockNews(stock.symbol, 1)
      if (newsItems.length === 0) continue

      const newsForAnalysis = newsItems.slice(0, 5).map(item => ({
        title: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
      }))

      // Analyze
      const analyses = await analyzeNews(stock.symbol, stock.name, newsForAnalysis)

      // Generate briefing
      const briefing = await generateDailyBriefing(
        stock.symbol,
        stock.name,
        newsForAnalysis,
        analyses
      )

      // Determine overall sentiment
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
      analyses.forEach(a => {
        if (a.sentiment in sentimentCounts) {
          sentimentCounts[a.sentiment as keyof typeof sentimentCounts]++
        }
      })
      const overallSentiment = Object.entries(sentimentCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral'

      stockDigests.push({
        symbol: stock.symbol,
        name: stock.name,
        news: newsForAnalysis.map((item, i) => ({
          ...item,
          sentiment: analyses[i]?.sentiment || 'neutral',
          impact: analyses[i]?.impact || 'low',
          keyPoints: analyses[i]?.keyPoints || [],
          investorAction: analyses[i]?.investorAction || '추가 분석 필요',
        })),
        overallSentiment,
        briefing,
      })

      // Save to DB
      for (const item of newsItems.slice(0, 5)) {
        await prisma.stockNews.upsert({
          where: { id: `${stock.id}-${item.id}` },
          update: {},
          create: {
            id: `${stock.id}-${item.id}`,
            stockId: stock.id,
            title: item.headline,
            summary: item.summary,
            url: item.url,
            source: item.source,
            imageUrl: item.image || null,
            publishedAt: new Date(item.datetime * 1000),
          },
        })
      }
    }

    if (stockDigests.length === 0) continue

    // Generate overall summary
    const overallSummary = await generateFullDigest(stockDigests)

    const digest: EmailDigest = {
      userName: user.name || user.email,
      stocks: stockDigests,
      date: formatDate(new Date()),
    }

    // Send email
    const result = await sendDailyDigest(user.email, digest, overallSummary)
    results.push({ email: user.email, ...result })

    // Log
    await prisma.emailLog.create({
      data: {
        userId: user.id,
        subject: `Daily Digest - ${formatDate(new Date())}`,
        status: result.success ? 'sent' : 'failed',
        error: result.error,
      },
    })
  }

  return NextResponse.json({ results })
}
