// 빌드 후 dist/sitemap.xml 생성.
// src/content/posts 의 mdx frontmatter 를 파싱해 준비 중(draft) 글은 제외한다.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// 배포 도메인 (src/site.config.ts 의 siteUrl 과 일치). 커스텀 도메인 연결 시 교체.
const SITE_URL = 'https://all-my-projects-2026.github.io/INFO_IT'

const staticPaths = ['/', '/posts', '/about', '/contact', '/privacy', '/terms', '/stats']

/** 아주 단순한 frontmatter 파서 (draft, category 만 추출) */
function readFrontmatter(text) {
  const m = text.match(/^---\s*([\s\S]*?)\s*---/)
  const fm = { draft: false, category: '' }
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const dm = line.match(/^\s*draft:\s*(true|false)\s*$/)
    if (dm) fm.draft = dm[1] === 'true'
    const cm = line.match(/^\s*category:\s*(.+?)\s*$/)
    if (cm) fm.category = cm[1].replace(/^["']|["']$/g, '')
  }
  return fm
}

const postsDir = join(root, 'src', 'content', 'posts')
const liveCategories = new Set()
const postPaths = []

if (existsSync(postsDir)) {
  for (const f of readdirSync(postsDir).filter((f) => f.endsWith('.mdx'))) {
    const fm = readFrontmatter(readFileSync(join(postsDir, f), 'utf-8'))
    if (fm.draft) continue // 준비 중 글은 사이트맵 제외
    postPaths.push(`/posts/${f.replace(/\.mdx$/, '')}`)
    if (fm.category) liveCategories.add(fm.category)
  }
}

// 실제 글이 하나라도 있는 카테고리만 사이트맵에 포함
const categoryPaths = [...liveCategories].map((c) => `/category/${encodeURIComponent(c)}`)

const allPaths = [...staticPaths, ...postPaths, ...categoryPaths]
const today = new Date().toISOString().split('T')[0]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const outDir = join(root, 'dist')
if (existsSync(outDir)) {
  writeFileSync(join(outDir, 'sitemap.xml'), xml, 'utf-8')
  console.log(`✓ sitemap.xml 생성 완료 (${allPaths.length} URLs, 초안 제외)`)
} else {
  console.warn('⚠ dist 디렉터리가 없어 사이트맵을 건너뜁니다. 먼저 빌드하세요.')
}
