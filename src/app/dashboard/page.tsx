'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Stock {
  id: string
  symbol: string
  name: string
  market: string
  news: NewsItem[]
}

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  analysis: {
    sentiment: string
    impact: string
    keyPoints: string
    investorAction: string
    confidence: number
  } | null
}

interface SearchResult {
  symbol: string
  description: string
}

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyzingStock, setAnalyzingStock] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const { showToast, ToastComponent } = useToast()

  // Initialize user
  useEffect(() => {
    async function initUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const user = await res.json()
          setUserId(user.id)
        } else {
          window.location.href = '/login'
        }
      } catch {
        window.location.href = '/login'
      }
    }
    initUser()
  }, [])

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/stocks?userId=${userId}`)
      const data = await res.json()
      setStocks(data)
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) fetchStocks()
  }, [userId, fetchStocks])

  // Search stocks
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Add stock
  async function addStock(symbol: string, name: string) {
    try {
      const res = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol, name }),
      })
      if (res.ok) {
        showToast('종목이 추가되었습니다', 'success')
      } else {
        showToast('종목 추가에 실패했습니다', 'error')
      }
      setSearchQuery('')
      setSearchResults([])
      fetchStocks()
    } catch (error) {
      console.error('Failed to add stock:', error)
      showToast('종목 추가 중 오류가 발생했습니다', 'error')
    }
  }

  // Remove stock
  async function removeStock(stockId: string) {
    try {
      const res = await fetch('/api/stocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stockId }),
      })
      if (res.ok) {
        showToast('종목이 삭제되었습니다', 'success')
      } else {
        showToast('종목 삭제에 실패했습니다', 'error')
      }
      fetchStocks()
    } catch (error) {
      console.error('Failed to remove stock:', error)
      showToast('종목 삭제 중 오류가 발생했습니다', 'error')
    }
  }

  // Analyze news
  async function analyzeStockNews(stockId: string) {
    setAnalyzingStock(stockId)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockId }),
      })
      if (res.ok) {
        showToast('뉴스 분석이 완료되었습니다', 'success')
      } else {
        showToast('뉴스 분석에 실패했습니다', 'error')
      }
      fetchStocks()
    } catch (error) {
      console.error('Failed to analyze:', error)
      showToast('뉴스 분석 중 오류가 발생했습니다', 'error')
    } finally {
      setAnalyzingStock(null)
    }
  }

  function getSentimentIcon(sentiment: string) {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  function getSentimentBg(sentiment: string) {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-200'
      case 'negative': return 'bg-red-50 border-red-200'
      default: return 'bg-yellow-50 border-yellow-200'
    }
  }

  function getImpactBadge(impact: string) {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading && userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="mt-1 text-gray-600">관심 종목을 추가하고 AI 뉴스 분석을 확인하세요.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="종목 검색 (예: AAPL, TSLA, NVDA...)"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-shadow focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
            {searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => addStock(result.symbol, result.description)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium">{result.symbol}</span>
                  <span className="ml-2 text-sm text-gray-500">{result.description}</span>
                </div>
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stock Cards */}
      {stocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="mb-4 text-4xl">📊</div>
          <h3 className="mb-2 text-lg font-medium">관심 종목이 없습니다</h3>
          <p className="text-sm text-gray-500">위 검색창에서 종목을 검색하여 추가해보세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stocks.map((stock) => (
            <div key={stock.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Stock Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold">{stock.name}</h2>
                  <span className="text-sm text-gray-500">{stock.symbol} · {stock.market}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => analyzeStockNews(stock.id)}
                    disabled={analyzingStock === stock.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {analyzingStock === stock.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    뉴스 분석
                  </button>
                  <button
                    onClick={() => removeStock(stock.id)}
                    className="inline-flex items-center rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* News List */}
              {stock.news.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {stock.news.map((newsItem) => (
                    <div key={newsItem.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <a
                            href={newsItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {newsItem.title}
                          </a>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>{newsItem.source}</span>
                            <span>{new Date(newsItem.publishedAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                      </div>

                      {newsItem.analysis && (
                        <div className={`mt-3 rounded-lg border p-3 ${getSentimentBg(newsItem.analysis.sentiment)}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {getSentimentIcon(newsItem.analysis.sentiment)}
                              <span className="text-xs font-medium">
                                {newsItem.analysis.sentiment === 'positive' ? '긍정' : newsItem.analysis.sentiment === 'negative' ? '부정' : '중립'}
                              </span>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getImpactBadge(newsItem.analysis.impact)}`}>
                              영향: {newsItem.analysis.impact === 'high' ? '높음' : newsItem.analysis.impact === 'medium' ? '보통' : '낮음'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{newsItem.analysis.investorAction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  <p>&ldquo;뉴스 분석&rdquo; 버튼을 눌러 최신 뉴스를 가져오세요.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
