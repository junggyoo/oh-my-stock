import Anthropic from '@anthropic-ai/sdk'
import { StockDigest } from '@/types'

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

interface NewsItem {
  title: string
  summary: string
  source: string
  url: string
}

interface SingleNewsAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  keyPoints: string[]
  investorAction: string
  confidence: number
}

export async function analyzeNews(
  stockSymbol: string,
  stockName: string,
  newsItems: NewsItem[]
): Promise<SingleNewsAnalysis[]> {
  if (newsItems.length === 0) return []

  const client = getClient()

  const newsText = newsItems
    .map((item, i) => `[${i + 1}] ${item.title}\nSource: ${item.source}\nSummary: ${item.summary}`)
    .join('\n\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a professional stock market analyst. Analyze the following news articles about ${stockName} (${stockSymbol}) and provide your analysis for each article.

News Articles:
${newsText}

For EACH article, respond with a JSON array. Each element should have:
- "sentiment": "positive", "negative", or "neutral"
- "impact": "high", "medium", or "low" (impact on stock price)
- "keyPoints": array of 2-3 key takeaways (in Korean)
- "investorAction": a brief recommendation for investors (in Korean)
- "confidence": 0.0 to 1.0

Respond ONLY with a valid JSON array, no other text.`,
      },
    ],
  })

  try {
    const content = message.content[0]
    if (content.type !== 'text') return []

    let text = content.text.trim()
    // Strip markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      text = jsonMatch[1].trim()
    }
    // Find the JSON array in the text
    const arrayStart = text.indexOf('[')
    const arrayEnd = text.lastIndexOf(']')
    if (arrayStart !== -1 && arrayEnd !== -1) {
      text = text.slice(arrayStart, arrayEnd + 1)
    }

    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to parse analysis response:', e)
    return []
  }
}

export async function generateDailyBriefing(
  stockSymbol: string,
  stockName: string,
  newsItems: NewsItem[],
  analyses: SingleNewsAnalysis[]
): Promise<string> {
  if (newsItems.length === 0) return `${stockName}(${stockSymbol})에 대한 최신 뉴스가 없습니다.`

  const client = getClient()

  const combined = newsItems.map((item, i) => ({
    ...item,
    analysis: analyses[i] || null,
  }))

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are a professional Korean stock market analyst writing a morning briefing.

Based on the following news and analyses for ${stockName} (${stockSymbol}), write a concise Korean morning briefing (3-5 sentences) that summarizes the key developments and provides an overall outlook.

News and Analyses:
${JSON.stringify(combined, null, 2)}

Write the briefing in Korean. Be concise and actionable. Start directly with the content, no greeting or title needed.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') return ''
  return content.text
}

export async function generateFullDigest(
  stocks: StockDigest[]
): Promise<string> {
  if (stocks.length === 0) return ''

  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are a professional Korean stock market analyst. Write a brief overall market summary (2-3 sentences in Korean) based on the following stock briefings:

${stocks.map(s => `${s.name}(${s.symbol}): ${s.briefing}`).join('\n\n')}

Provide a concise overall sentiment and key themes to watch today. Write in Korean.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') return ''
  return content.text
}
