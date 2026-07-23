// GA4 Data API 로 "오늘 방문자(activeUsers)"와 "누적 방문자(totalUsers)"를 조회해
// public/stats.json 으로 저장한다. GitHub Actions(.github/workflows/stats.yml) 크론에서 실행.
//
// 필요한 환경변수(레포 Secrets):
//   GA4_PROPERTY_ID  GA4 속성 ID(숫자, 예: 123456789 — 측정 ID G-XXXX 아님)
//   GA4_SA_KEY       서비스 계정 JSON 키 전체(문자열). 해당 계정은 GA4 속성에 '뷰어' 권한 필요.
//
// 서비스 계정 키는 Secrets 에만 두며 사이트(프론트)로는 절대 노출되지 않는다.

import { GoogleAuth } from 'google-auth-library'
import { writeFileSync } from 'node:fs'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID
const SA_KEY = process.env.GA4_SA_KEY

if (!PROPERTY_ID || !SA_KEY) {
  console.error('❌ GA4_PROPERTY_ID / GA4_SA_KEY 환경변수가 필요합니다.')
  process.exit(1)
}

const credentials = JSON.parse(SA_KEY)
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
})
const accessToken = (await (await auth.getClient()).getAccessToken()).token

async function runReport(body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) throw new Error(`GA4 API ${res.status}: ${await res.text()}`)
  return res.json()
}

const firstMetric = (json) => {
  const v = json?.rows?.[0]?.metricValues?.[0]?.value
  return v == null ? 0 : Number(v)
}

// 오늘 방문자(고유 활성 사용자). 기간은 GA4 속성에 설정된 시간대 기준의 'today'.
const daily = firstMetric(
  await runReport({
    dateRanges: [{ startDate: 'today', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
  }),
)

// 누적 방문자(전체 기간 고유 사용자).
const total = firstMetric(
  await runReport({
    dateRanges: [{ startDate: '2020-01-01', endDate: 'today' }],
    metrics: [{ name: 'totalUsers' }],
  }),
)

const out = { daily, total, updated: new Date().toISOString() }
writeFileSync('public/stats.json', JSON.stringify(out, null, 2) + '\n')
console.log('✅ public/stats.json 갱신:', out)
