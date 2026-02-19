export interface StockWithNews {
  id: string
  symbol: string
  name: string
  market: string
  news: NewsWithAnalysis[]
}

export interface NewsWithAnalysis {
  id: string
  title: string
  summary: string
  url: string
  source: string
  imageUrl: string | null
  publishedAt: Date
  analysis: AnalysisResult | null
}

export interface AnalysisResult {
  id: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  keyPoints: string
  investorAction: string
  confidence: number
}

export interface FinnhubNewsItem {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface EmailDigest {
  userName: string
  stocks: StockDigest[]
  date: string
}

export interface StockDigest {
  symbol: string
  name: string
  news: {
    title: string
    summary: string
    url: string
    source: string
    sentiment: string
    impact: string
    keyPoints: string[]
    investorAction: string
  }[]
  overallSentiment: string
  briefing: string
}
