import { FinnhubNewsItem } from '@/types'

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

const POPULAR_STOCKS: { symbol: string; description: string }[] = [
  { symbol: 'AAPL', description: 'Apple Inc' },
  { symbol: 'MSFT', description: 'Microsoft Corporation' },
  { symbol: 'GOOGL', description: 'Alphabet Inc' },
  { symbol: 'AMZN', description: 'Amazon.com Inc' },
  { symbol: 'NVDA', description: 'NVIDIA Corporation' },
  { symbol: 'META', description: 'Meta Platforms Inc' },
  { symbol: 'TSLA', description: 'Tesla Inc' },
  { symbol: 'BRK.B', description: 'Berkshire Hathaway Inc' },
  { symbol: 'JPM', description: 'JPMorgan Chase & Co' },
  { symbol: 'V', description: 'Visa Inc' },
  { symbol: 'JNJ', description: 'Johnson & Johnson' },
  { symbol: 'WMT', description: 'Walmart Inc' },
  { symbol: 'PG', description: 'Procter & Gamble Co' },
  { symbol: 'MA', description: 'Mastercard Inc' },
  { symbol: 'UNH', description: 'UnitedHealth Group Inc' },
  { symbol: 'HD', description: 'Home Depot Inc' },
  { symbol: 'DIS', description: 'Walt Disney Co' },
  { symbol: 'BAC', description: 'Bank of America Corp' },
  { symbol: 'ADBE', description: 'Adobe Inc' },
  { symbol: 'CRM', description: 'Salesforce Inc' },
  { symbol: 'NFLX', description: 'Netflix Inc' },
  { symbol: 'AMD', description: 'Advanced Micro Devices Inc' },
  { symbol: 'INTC', description: 'Intel Corporation' },
  { symbol: 'CSCO', description: 'Cisco Systems Inc' },
  { symbol: 'PEP', description: 'PepsiCo Inc' },
  { symbol: 'COST', description: 'Costco Wholesale Corp' },
  { symbol: 'AVGO', description: 'Broadcom Inc' },
  { symbol: 'QCOM', description: 'Qualcomm Inc' },
  { symbol: 'PLTR', description: 'Palantir Technologies Inc' },
  { symbol: 'COIN', description: 'Coinbase Global Inc' },
]

export async function fetchStockNews(symbol: string, daysBack: number = 2): Promise<FinnhubNewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    console.error('FINNHUB_API_KEY is not set')
    return []
  }

  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - daysBack)

  const fromStr = from.toISOString().split('T')[0]
  const toStr = to.toISOString().split('T')[0]

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${fromStr}&to=${toStr}&token=${apiKey}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error(`Failed to fetch news for ${symbol}: ${response.statusText}`)
      return []
    }

    const data: FinnhubNewsItem[] = await response.json()
    // Return top 10 most recent news items
    return data.slice(0, 10)
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error)
    return []
  }
}

export async function fetchMultipleStockNews(
  symbols: string[]
): Promise<Map<string, FinnhubNewsItem[]>> {
  const results = new Map<string, FinnhubNewsItem[]>()

  // Fetch in parallel with rate limiting (Finnhub free: 60 calls/min)
  const batchSize = 5
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    const promises = batch.map(async (symbol) => {
      const news = await fetchStockNews(symbol)
      results.set(symbol, news)
    })
    await Promise.all(promises)

    // Rate limit: wait 1 second between batches
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}

export async function searchStock(query: string): Promise<{ symbol: string; description: string }[]> {
  const apiKey = process.env.FINNHUB_API_KEY

  // Try Finnhub API first if key is available
  if (apiKey) {
    try {
      const response = await fetch(
        `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${apiKey}`
      )
      if (response.ok) {
        const data = await response.json()
        const results = (data.result || []).slice(0, 10).map((item: { symbol: string; description: string }) => ({
          symbol: item.symbol,
          description: item.description,
        }))
        if (results.length > 0) return results
      }
    } catch (error) {
      console.error('Finnhub search failed, using fallback:', error)
    }
  }

  // Fallback: search popular stocks locally
  const q = query.toLowerCase()
  return POPULAR_STOCKS.filter(
    stock => stock.symbol.toLowerCase().includes(q) || stock.description.toLowerCase().includes(q)
  ).slice(0, 10)
}
