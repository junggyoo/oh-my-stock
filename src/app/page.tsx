export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="mb-6 text-6xl">📈</div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Oh My Stock
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
          매일 아침, AI가 분석한 주식 뉴스를 이메일로 받아보세요.<br />
          관심 종목의 최신 뉴스와 투자 인사이트를 한눈에 확인할 수 있습니다.
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="/signup"
            className="inline-flex items-center rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl"
          >
            무료로 시작하기 →
          </a>
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            이미 계정이 있으신가요? 로그인
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid w-full max-w-4xl gap-6 pb-20 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-3xl">🔍</div>
          <h3 className="mb-2 text-lg font-semibold">실시간 뉴스 수집</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            관심 종목의 최신 뉴스를 실시간으로 수집하고 정리합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-3xl">🤖</div>
          <h3 className="mb-2 text-lg font-semibold">AI 뉴스 분석</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Claude AI가 뉴스를 분석하여 투자 인사이트를 제공합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-3xl">📧</div>
          <h3 className="mb-2 text-lg font-semibold">모닝 브리핑</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            매일 아침 맞춤형 주식 뉴스 브리핑을 이메일로 전달합니다.
          </p>
        </div>
      </section>
    </div>
  )
}
