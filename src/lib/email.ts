import { Resend } from 'resend'
import { EmailDigest, StockDigest } from '@/types'
import { formatDate } from './utils'

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  return new Resend(apiKey)
}

function getSentimentEmoji(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return '🟢'
    case 'negative': return '🔴'
    default: return '🟡'
  }
}

function getImpactLabel(impact: string): string {
  switch (impact) {
    case 'high': return '⚡ 높음'
    case 'medium': return '📊 보통'
    default: return '📋 낮음'
  }
}

function buildEmailHtml(digest: EmailDigest, overallSummary: string): string {
  const stockSections = digest.stocks.map(stock => `
    <div style="margin-bottom: 32px; background: #f8fafc; border-radius: 12px; padding: 24px;">
      <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">
        ${stock.name} <span style="color: #64748b; font-weight: normal;">${stock.symbol}</span>
      </h2>
      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
        ${stock.briefing}
      </p>
      <div style="margin: 0 0 16px; padding: 12px 16px; background: white; border-radius: 8px; border-left: 4px solid ${
        stock.overallSentiment === 'positive' ? '#22c55e' : stock.overallSentiment === 'negative' ? '#ef4444' : '#eab308'
      };">
        <strong>종합 전망:</strong> ${getSentimentEmoji(stock.overallSentiment)} ${
          stock.overallSentiment === 'positive' ? '긍정적' : stock.overallSentiment === 'negative' ? '부정적' : '중립'
        }
      </div>
      ${stock.news.map(newsItem => `
        <div style="margin-bottom: 16px; padding: 16px; background: white; border-radius: 8px;">
          <h3 style="margin: 0 0 8px; font-size: 15px;">
            <a href="${newsItem.url}" style="color: #2563eb; text-decoration: none;">${newsItem.title}</a>
          </h3>
          <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">${newsItem.source}</p>
          <div style="display: flex; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 13px;">${getSentimentEmoji(newsItem.sentiment)} ${newsItem.sentiment === 'positive' ? '긍정' : newsItem.sentiment === 'negative' ? '부정' : '중립'}</span>
            <span style="font-size: 13px;">${getImpactLabel(newsItem.impact)}</span>
          </div>
          <ul style="margin: 8px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
            ${newsItem.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
          <p style="margin: 8px 0 0; padding: 8px 12px; background: #f0f9ff; border-radius: 6px; font-size: 13px; color: #0369a1;">
            💡 ${newsItem.investorAction}
          </p>
        </div>
      `).join('')}
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 28px; color: #0f172a;">📈 Oh My Stock</h1>
          <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${digest.date} 모닝 브리핑</p>
        </div>

        <div style="margin-bottom: 32px; padding: 20px; background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 12px;">
          <h2 style="margin: 0 0 12px; font-size: 16px; color: #94a3b8;">📋 오늘의 종합</h2>
          <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #e2e8f0;">${overallSummary}</p>
        </div>

        ${stockSections}

        <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
          <p>이 이메일은 Oh My Stock에서 자동으로 발송되었습니다.</p>
          <p>뉴스 분석은 AI에 의해 생성되었으며, 투자 조언이 아닙니다.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function sendDailyDigest(
  email: string,
  digest: EmailDigest,
  overallSummary: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend()
    const html = buildEmailHtml(digest, overallSummary)

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Oh My Stock <onboarding@resend.dev>',
      to: email,
      subject: `📈 [Oh My Stock] ${digest.date} 모닝 브리핑 - ${digest.stocks.map(s => s.symbol).join(', ')}`,
      html,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function sendTestEmail(
  email: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend()
    const now = new Date()
    const dateStr = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(now)

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 28px; color: #0f172a;">📈 Oh My Stock</h1>
            <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">테스트 이메일</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 20px;">이메일 설정이 완료되었습니다!</h2>
            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
              안녕하세요, ${userName}님!<br>
              Oh My Stock 이메일 브리핑이 정상적으로 설정되었습니다.<br>
              매일 아침 AI가 분석한 주식 뉴스를 받아보실 수 있습니다.
            </p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #475569; font-size: 14px;">
                📅 ${dateStr}<br>
                🕐 발송 시간: 매일 오전 설정 시간<br>
                📧 수신 이메일: ${email}
              </p>
            </div>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
              관심 종목을 추가하면 해당 종목의 뉴스 분석을 받아보실 수 있습니다.
            </p>
          </div>

          <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
            <p>이 이메일은 Oh My Stock에서 발송되었습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Oh My Stock <onboarding@resend.dev>',
      to: email,
      subject: '📈 [Oh My Stock] 테스트 이메일 - 설정 완료!',
      html,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
