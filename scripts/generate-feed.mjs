// 빌드 후 dist/feed.xml (RSS 2.0) 생성. 준비 중(draft) 글은 제외, 최신순.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf-8'))
const SITE_URL = site.siteUrl // 커스텀 도메인 연결 시 site.json 만 바꾸면 됨

function xml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function frontmatter(text) {
  const m = text.match(/^---\s*([\s\S]*?)\s*---/)
  const fm = { draft: false, title: '', date: '', description: '' }
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const d = line.match(/^\s*draft:\s*(true|false)\s*$/)
    if (d) fm.draft = d[1] === 'true'
    const t = line.match(/^\s*title:\s*(.+?)\s*$/)
    if (t) fm.title = t[1].replace(/^["']|["']$/g, '')
    const dt = line.match(/^\s*date:\s*(.+?)\s*$/)
    if (dt) fm.date = dt[1].replace(/^["']|["']$/g, '')
    const ds = line.match(/^\s*description:\s*(.+?)\s*$/)
    if (ds) fm.description = ds[1].replace(/^["']|["']$/g, '')
  }
  return fm
}

const postsDir = join(root, 'src/content/posts')
const items = existsSync(postsDir)
  ? readdirSync(postsDir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => ({ slug: f.replace(/\.mdx$/, ''), ...frontmatter(readFileSync(join(postsDir, f), 'utf-8')) }))
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  : []

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(site.title)}</title>
    <link>${SITE_URL}/</link>
    <description>${xml(site.description)}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map((p) => {
    const url = `${SITE_URL}/posts/${p.slug}`
    const pub = p.date ? new Date(p.date + 'T00:00:00Z').toUTCString() : ''
    return `    <item>
      <title>${xml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${pub ? `<pubDate>${pub}</pubDate>` : ''}
      <description>${xml(p.description)}</description>
    </item>`
  })
  .join('\n')}
  </channel>
</rss>
`

const outDir = join(root, 'dist')
if (existsSync(outDir)) {
  writeFileSync(join(outDir, 'feed.xml'), feed, 'utf-8')
  console.log(`✓ feed.xml 생성 완료 (${items.length} items)`)
} else {
  console.warn('⚠ dist 없음 — 먼저 빌드하세요.')
}
