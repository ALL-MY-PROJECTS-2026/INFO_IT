// 발행 글(draft=false)의 date 가 '미래'면 빌드를 실패시킨다.
// → 실수로 미래 시각을 넣어 '미래 발행'되는 사고를 배포 전에 차단한다.
// build 체인 맨 앞에서 실행(package.json). 예약 발행 기능은 현재 없음.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const postsDir = join(root, 'src/content/posts')

const GRACE_MS = 5 * 60 * 1000 // 시계 오차 여유 5분

function frontmatter(text) {
  const m = text.match(/^---\s*([\s\S]*?)\s*---/)
  const fm = { draft: false, date: '' }
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const d = line.match(/^\s*draft:\s*(true|false)\s*$/)
    if (d) fm.draft = d[1] === 'true'
    const dt = line.match(/^\s*date:\s*(.+?)\s*$/)
    if (dt) fm.date = dt[1].replace(/^["']|["']$/g, '')
  }
  return fm
}

// 글 날짜는 KST(Asia/Seoul, +09:00) 기준으로 작성된다고 간주하고 파싱한다.
// (빌드는 GitHub 러너=UTC 에서 도는데, 로컬 파싱을 쓰면 KST 오전 시각이 UTC 기준
//  '미래'로 잡혀 배포가 잘못 차단된다. +09:00 을 명시해 러너 TZ 와 무관하게 비교.)
// "YYYY-MM-DD" → KST 자정, "YYYY-MM-DDTHH:MM" → 그 시각(KST).
function toDate(s) {
  const hasTime = /[T ]\d{2}:\d{2}/.test(s)
  const iso = hasTime ? s.replace(' ', 'T') : s + 'T00:00:00'
  return new Date(iso + '+09:00')
}

if (!existsSync(postsDir)) {
  console.log('✓ 글 날짜 검증: posts 폴더 없음(건너뜀)')
  process.exit(0)
}

const now = Date.now()
const future = []
const invalid = []

for (const f of readdirSync(postsDir).filter((f) => f.endsWith('.mdx'))) {
  const fm = frontmatter(readFileSync(join(postsDir, f), 'utf-8'))
  if (fm.draft) continue // 초안은 검사 제외(어차피 배포 제외)
  if (!fm.date) { invalid.push(`${f}: date 없음`); continue }
  const t = toDate(fm.date).getTime()
  if (Number.isNaN(t)) { invalid.push(`${f}: date 파싱 불가 ("${fm.date}")`); continue }
  if (t > now + GRACE_MS) {
    future.push(`${f}: ${fm.date} (현재보다 미래)`)
  }
}

if (future.length || invalid.length) {
  console.error('\n✗ 글 날짜 검증 실패 — 배포를 중단합니다.')
  if (future.length) {
    console.error('\n[미래 날짜] 발행 글의 date 가 현재 시각보다 미래입니다:')
    for (const x of future) console.error('  - ' + x)
    console.error('  → 실제 게시 시각으로 고치거나, 준비 중이면 frontmatter 에 draft: true 를 넣으세요.')
  }
  if (invalid.length) {
    console.error('\n[날짜 오류]')
    for (const x of invalid) console.error('  - ' + x)
  }
  console.error(`\n(기준 현재: ${new Date(now).toISOString()}, 여유 ${GRACE_MS / 60000}분)\n`)
  process.exit(1)
}

console.log('✓ 글 날짜 검증 통과 (미래 발행 없음)')
