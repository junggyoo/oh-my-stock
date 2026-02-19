# 📈 Oh My Stock

매일 아침, AI가 분석한 주식 뉴스를 이메일로 받아보세요.

## 기능

- **실시간 뉴스 수집**: Finnhub API를 통한 관심 종목 뉴스 수집
- **AI 뉴스 분석**: Claude AI가 뉴스의 감성, 영향도, 핵심 포인트를 분석
- **모닝 브리핑**: 매일 아침 맞춤형 주식 뉴스 브리핑 이메일 발송
- **대시보드**: 종목 관리 및 뉴스/분석 결과 확인

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: Prisma + SQLite
- **AI**: Claude API (Anthropic)
- **뉴스**: Finnhub API
- **이메일**: Resend
- **스케줄링**: node-cron

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 API 키를 설정하세요:

```bash
cp .env.example .env
```

필요한 API 키:
- **FINNHUB_API_KEY**: [Finnhub](https://finnhub.io/)에서 무료 발급
- **ANTHROPIC_API_KEY**: [Anthropic](https://console.anthropic.com/)에서 발급
- **RESEND_API_KEY**: [Resend](https://resend.com/)에서 무료 발급

### 3. 데이터베이스 초기화

```bash
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 접속할 수 있습니다.

### 5. 스케줄러 실행 (선택사항)

매일 아침 자동 이메일 발송을 위해:

```bash
npx tsx scripts/start-scheduler.ts
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/user | 사용자 생성/조회 |
| GET | /api/stocks | 관심 종목 목록 |
| POST | /api/stocks | 종목 추가 |
| DELETE | /api/stocks | 종목 삭제 |
| GET | /api/stocks/search | 종목 검색 |
| POST | /api/news | 뉴스 수집 및 분석 |
| GET | /api/news | 캐시된 뉴스 조회 |
| PUT | /api/settings | 이메일 설정 변경 |
| POST | /api/cron/daily-digest | 데일리 다이제스트 발송 |

## 라이선스

MIT
